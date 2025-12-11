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
  total_amount: number;
  payment_method: 'CASH' | 'QRIS';
  cash_received: number;
  change_amount: number;
  items: CartItem[]; // Snapshot of items
  created_at: any; // Timestamp
}
