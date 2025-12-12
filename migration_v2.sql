-- Migration V2: Shifts, Petty Cash, and Keyboard Shortcuts

-- 1. Create SHIFTS table
-- Captures the lifecycle of a cashier's shift
create table public.shifts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  
  -- Money tracking
  start_cash numeric default 0 not null, -- Modal awal
  end_cash_system numeric, -- Hitungan sistem (Start + Income - Expense)
  end_cash_actual numeric, -- Hitungan fisik (Input kasir)
  variance numeric generated always as (end_cash_actual - end_cash_system) stored, -- Selisih
  
  status text check (status in ('OPEN', 'CLOSED')) default 'OPEN',
  note text, -- Catatan saat closing (misal: "Selisih karena kembalian kurang")
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create PETTY_CASH table
-- Tracks money taken out of/put into the drawer during a shift (e.g. buying ice, paying trash)
create table public.petty_cash (
  id uuid default gen_random_uuid() primary key,
  shift_id uuid references public.shifts(id) not null,
  user_id uuid references public.users(id) not null,
  
  amount numeric not null,
  type text check (type in ('CASH_IN', 'CASH_OUT')) not null,
  reason text not null, -- "Beli Es Batu", "Uang Kembalian", etc.
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2.5. Create LOGIN_LOGS table
-- Tracks user login attempts
CREATE TABLE IF NOT EXISTS login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    device_info TEXT,
    ip_address TEXT
);

-- Policy (Optional for MVP, but good practice)
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/insert for authenticated" ON login_logs FOR ALL USING (auth.role() = 'authenticated');

-- 3. Create KEYBOARD_SHORTCUTS table
-- Maps physical keys to products for quick checkout
create table public.keyboard_shortcuts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id), -- Nullable if global, or specific per user
  
  key_code text not null, -- "F1", "F2", "Enter", etc.
  product_id uuid references public.products(id) not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Update TRANSACTIONS table
-- Link every transaction to a specific shift
alter table public.transactions 
add column shift_id uuid references public.shifts(id);

-- 5. Update USERS table for Role-Based Access
-- Ensure role column exists and add pin for future use
alter table public.users 
add column if not exists pin text; -- Simple 4-6 digit numeric pin

-- 6. Policies (Row Level Security) - Optional but Good Practice
-- Allow authenticated users to read/write their own shifts (or simplified for this app)
alter table public.shifts enable row level security;
create policy "Enable access for authenticated users" on public.shifts for all using (true);

alter table public.petty_cash enable row level security;
create policy "Enable access for authenticated users" on public.petty_cash for all using (true);

alter table public.keyboard_shortcuts enable row level security;
create policy "Enable access for authenticated users" on public.keyboard_shortcuts for all using (true);
