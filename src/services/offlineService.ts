// Offline Service - Queue transactions when offline, sync when online

import { supabase } from '../supabase';
import type { CartItem, Transaction } from '../types';

const OFFLINE_QUEUE_KEY = 'pos_offline_queue';

export interface QueuedTransaction {
  id: string;
  transactionData: Omit<Transaction, 'id' | 'created_at' | 'items'> & { shift_id?: string };
  cartItems: CartItem[];
  queuedAt: string;
}

export const offlineService = {
  // Check if browser is online
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  // Queue a transaction for later sync
  queueTransaction: (
    transactionData: Omit<Transaction, 'id' | 'created_at' | 'items'> & { shift_id?: string },
    cartItems: CartItem[]
  ): string => {
    const queueId = `offline_${Date.now()}`;
    const queuedTx: QueuedTransaction = {
      id: queueId,
      transactionData,
      cartItems,
      queuedAt: new Date().toISOString()
    };

    const queue = offlineService.getQueue();
    queue.push(queuedTx);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    
    return queueId;
  },

  // Get all queued transactions
  getQueue: (): QueuedTransaction[] => {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Get queue count
  getQueueCount: (): number => {
    return offlineService.getQueue().length;
  },

  // Sync all queued transactions to server
  syncQueue: async (): Promise<{ synced: number; failed: number }> => {
    const queue = offlineService.getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;
    const remainingQueue: QueuedTransaction[] = [];

    for (const queuedTx of queue) {
      try {
        // Insert transaction
        const { data: newTx, error: txError } = await supabase
          .from('transactions')
          .insert([{
            user_id: queuedTx.transactionData.user_id,
            shift_id: queuedTx.transactionData.shift_id,
            username: queuedTx.transactionData.username,
            total_amount: queuedTx.transactionData.total_amount,
            payment_method: queuedTx.transactionData.payment_method,
            cash_received: queuedTx.transactionData.cash_received,
            change_amount: queuedTx.transactionData.change_amount,
            items: queuedTx.cartItems,
            status: 'COMPLETED'
          }])
          .select()
          .single();

        if (txError) throw txError;

        // Update stocks (decrement)
        for (const item of queuedTx.cartItems) {
          const { error: stockError } = await supabase.rpc('decrement_stock', {
            row_id: item.id,
            amount: item.quantity
          });

          // Fallback if RPC not available
          if (stockError) {
            const { data: currentProd } = await supabase
              .from('products')
              .select('stock_quantity')
              .eq('id', item.id)
              .single();
            
            if (currentProd) {
              await supabase.from('products').update({
                stock_quantity: Math.max(0, currentProd.stock_quantity - item.quantity)
              }).eq('id', item.id);
            }
          }
        }

        synced++;
        console.log(`Synced offline transaction: ${newTx.id}`);
      } catch (error) {
        console.error(`Failed to sync transaction ${queuedTx.id}:`, error);
        remainingQueue.push(queuedTx);
        failed++;
      }
    }

    // Save remaining failed transactions
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));

    return { synced, failed };
  },

  // Clear the queue (use with caution)
  clearQueue: (): void => {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }
};
