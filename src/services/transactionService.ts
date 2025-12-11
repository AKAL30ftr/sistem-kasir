
import { supabase } from '../supabase';
import type { CartItem, Transaction } from '../types';

export const transactionService = {
  createTransaction: async (
    transactionData: Omit<Transaction, 'id' | 'created_at' | 'items'>,
    cartItems: CartItem[]
  ): Promise<string> => {

    // Start a simplified flow since Supabase-js doesn't support complex transactions in client lib easily
    // We will do: 1. Create Transaction -> 2. Update Stocks loop (Optimistic)

    try {
      // 1. Insert Transaction
      const { data: newTx, error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: transactionData.user_id,
          username: transactionData.username,
          total_amount: transactionData.total_amount,
          payment_method: transactionData.payment_method,
          cash_received: transactionData.cash_received,
          change_amount: transactionData.change_amount,
          items: cartItems // Stores as JSONB
        }])
        .select()
        .single();

      if (txError) throw txError;

      // 2. Update Stocks (Decrement)
      for (const item of cartItems) {
        // We fetch current stock first to be safe or use a stored procedure (RPC)
        // For simplicity: simple update decrement
        const { error: stockError } = await supabase.rpc('decrement_stock', {
            row_id: item.id,
            amount: item.quantity
        });

        // Fallback if RPC not created, update manually (less safe but works for simple app)
        if (stockError) {
             // Manual method
             const { data: currentProd } = await supabase.from('products').select('stock_quantity').eq('id', item.id).single();
             if (currentProd) {
                 await supabase.from('products').update({
                     stock_quantity: Math.max(0, currentProd.stock_quantity - item.quantity)
                 }).eq('id', item.id);
             }
        }
      }

      return newTx.id;

    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  }
};
