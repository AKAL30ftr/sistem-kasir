
-- 1. Create PUBLIC storage bucket for product images
insert into storage.buckets (id, name, public) 
values ('products', 'products', true);

-- Policy to allow anyone to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- Policy to allow authenticated uploads (we'll allow anon for this demo ease)
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'products' );
  
-- 2. Create Users Table
create table public.users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password text not null, -- Plaintext for demo
  role text default 'cashier',
  employee_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Seed Admin User
insert into public.users (username, password, role, employee_id)
values ('admin', 'admin1', 'admin', 'MASTER01');

-- 3. Create Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  category text,
  stock_quantity integer default 0,
  daily_capacity integer default 100,
  image_url text,
  deleted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create Transactions Table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id text, -- Store user ID/Name
  username text,
  total_amount numeric not null,
  payment_method text check (payment_method in ('CASH', 'QRIS')),
  cash_received numeric default 0,
  change_amount numeric default 0,
  items jsonb, -- Store cart items as JSON
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Create Cash Balances Table (Reconciliation)
create table public.cash_balances (
  id uuid default gen_random_uuid() primary key,
  date date default checking_date(now()),
  opening_balance numeric default 0,
  closing_balance numeric default 0,
  actual_cash numeric default 0,
  variance numeric generated always as (actual_cash - closing_balance) stored,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
