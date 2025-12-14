export interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  stock_quantity: number;
  daily_capacity: number;
  image_url: string;
  deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CartItem extends Product {
  quantity: number; // Quantity in cart
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted'>;

export interface Transaction {
  id?: string;
  user_id: string; // cashier
  username: string; // cashier name snapshot
  shift_id?: string; // LINKED TO SHIFT
  total_amount: number;
  payment_method: 'CASH' | 'QRIS';
  cash_received: number;
  change_amount: number;
  items: CartItem[]; // Snapshot of items
  created_at: any; // Timestamp
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'cashier';
  pin?: string;
  created_at?: string;
}

export interface Shift {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  start_cash: number;
  end_cash_system?: number;
  end_cash_actual?: number;
  variance?: number;
  status: 'OPEN' | 'CLOSED';
  note?: string;
  created_at?: string;
}

export interface PettyCash {
  id: string;
  shift_id: string;
  user_id: string;
  amount: number;
  type: 'CASH_IN' | 'CASH_OUT';
  reason: string;
  created_at?: string;
}

export interface KeyboardShortcut {
  id: string;
  user_id?: string;
  key_code: string;
  product_id: string;
  created_at?: string;
}


