
import { supabase } from '../supabase';
import type { CartItem, Transaction } from '../types';
import { offlineService } from './offlineService';

export const transactionService = {
  createTransaction: async (
    transactionData: Omit<Transaction, 'id' | 'created_at' | 'items'> & { shift_id?: string },
    cartItems: CartItem[]
  ): Promise<string> => {

    // Check if offline - queue transaction instead
    if (!offlineService.isOnline()) {
      const queueId = offlineService.queueTransaction(transactionData, cartItems);
      return queueId; // Return queue ID as "transaction ID" for receipt
    }

    // Online flow - proceed normally

    try {
      // 1. Insert Transaction
      const { data: newTx, error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: transactionData.user_id,
          shift_id: transactionData.shift_id,
          username: transactionData.username,
          total_amount: transactionData.total_amount,
          payment_method: transactionData.payment_method,
          cash_received: transactionData.cash_received,
          change_amount: transactionData.change_amount,
          items: cartItems, // Stores as JSONB
          status: 'COMPLETED',
          customer_name: transactionData.customer_name || null,
          notes: transactionData.notes || null
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
  },

  // Refund a transaction (no stock restoration - most refunds are for defective products)
  voidTransaction: async (
    transactionId: string,
    voidedBy: string,
    reason: string
  ): Promise<void> => {
    try {
      // 1. Get the transaction to check status
      const { data: tx, error: fetchError } = await supabase
        .from('transactions')
        .select('status')
        .eq('id', transactionId)
        .single();

      if (fetchError) throw fetchError;
      if (!tx) throw new Error('Transaction not found');
      if (tx.status === 'VOIDED') throw new Error('Transaction already refunded');

      // 2. Update transaction status to VOIDED
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'VOIDED',
          voided_by: voidedBy,
          void_reason: reason,
          voided_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // Note: Stock is NOT restored - refunds are typically for defective/consumed products

    } catch (error) {
      console.error("Refund transaction failed:", error);
      throw error;
    }
  }
};
