
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

  // Helper helper to calculate stats
  calculateStats: (data: any[]) => {
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

    return reportService.calculateStats(data);
  },

  // Get Stats SPECIFIC to a Shift (for Cash Drawer)
  getShiftStats: async (shiftId: string) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('total_amount, payment_method')
        .eq('shift_id', shiftId);

    if (error) return { totalSales: 0, count: 0, cashTotal: 0, qrisTotal: 0 };

    return reportService.calculateStats(data);
  },

  // Get Sales Chart Data (Aggregated by Day)
  getSalesChart: async (days: number): Promise<{label: string, value: number, date: string}[]> => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const { data } = await supabase
      .from('transactions')
      .select('created_at, total_amount')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true });

    if (!data) return [];

    // Group by Date
    const grouped: Record<string, number> = {};
    
    // Initialize all dates with 0
    for(let i=0; i<days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        grouped[key] = 0;
    }

    data.forEach((t: any) => {
        const dateKey = new Date(t.created_at).toISOString().split('T')[0];
        if (grouped[dateKey] !== undefined) {
             grouped[dateKey] += t.total_amount;
        }
    });

    // Convert to Array
    return Object.entries(grouped)
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([date, value]) => ({
            label: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }), // "Sen", "Sel"
            date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), // "12 Dec"
            value
        }));
  },

  // Get Today vs Yesterday
  getDailyComparison: async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const startToday = new Date(today.setHours(0,0,0,0)).toISOString();
      const endToday = new Date(today.setHours(23,59,59,999)).toISOString();
      
      const startYesterday = new Date(yesterday.setHours(0,0,0,0)).toISOString();
      const endYesterday = new Date(yesterday.setHours(23,59,59,999)).toISOString();

      const { data: todayData } = await supabase.from('transactions').select('total_amount').gte('created_at', startToday).lte('created_at', endToday);
      const { data: yesterdayData } = await supabase.from('transactions').select('total_amount').gte('created_at', startYesterday).lte('created_at', endYesterday);

      const todaySales = todayData?.reduce((acc, t) => acc + t.total_amount, 0) || 0;
      const yesterdaySales = yesterdayData?.reduce((acc, t) => acc + t.total_amount, 0) || 0;

      return { todaySales, yesterdaySales };
  }
};
