
import { supabase } from '../supabase';
import type { Transaction } from '../types';

export const reportService = {
  // Get transactions by date range
  getTransactions: async (startDate: Date, endDate: Date): Promise<Transaction[]> => {
    // Supabase needs ISO strings for comparison
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startIso)
      .lte('created_at', endIso)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }

    return data.map(t => ({
      ...t,
      created_at: new Date(t.created_at)
    })) as Transaction[];
  },

  getTodayStats: async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const { data, error } = await supabase
        .from('transactions')
        .select('total_amount, payment_method')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

    if (error) return { totalSales: 0, count: 0, cashTotal: 0, qrisTotal: 0 };

    const stats = {
        totalSales: 0,
        count: data.length,
        cashTotal: 0,
        qrisTotal: 0
    };

    data.forEach((t: any) => {
        const amount = Number(t.total_amount);
        stats.totalSales += amount;
        if (t.payment_method === 'CASH') stats.cashTotal += amount;
        if (t.payment_method === 'QRIS') stats.qrisTotal += amount;
    });

    return stats;
  },

  // Simulate reconciliation save (since we don't have a table UI for it yet)
  saveReconciliation: async (data: any) => {
      const { error } = await supabase
        .from('cash_balances')
        .insert([data]);
      if (error) throw error;
  }
};
