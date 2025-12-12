
import { supabase } from '../supabase';
import type { Shift, PettyCash } from '../types';

export const shiftService = {
  // --- Shift Operations ---

  async startShift(userId: string, startCash: number): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        user_id: userId,
        start_cash: startCash,
        status: 'OPEN',
        start_time: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
       console.error('Supabase Insert Error:', error);
       throw error;
    }
    return data;
  },

  async endShift(shiftId: string, endCashActual: number, note?: string): Promise<Shift> {
    // 1. Calculate system expected cash
    // This is complex: Start Cash + (Transactions Cash) + (Petty Cash IN) - (Petty Cash OUT)
    // For now, we rely on the Backend/Database Trigger or calculate it client-side temporarily.
    // Let's assume we pass the system value from the UI for now or fetch it.
    
    // Fetch transaction totals
    const { data: transactions } = await supabase
      .from('transactions')
      .select('total_amount, payment_method')
      .eq('shift_id', shiftId);

    const cashSales = transactions
      ?.filter(t => t.payment_method === 'CASH')
      .reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

    // Fetch petty cash
    const { data: pettyCash } = await supabase
      .from('petty_cash')
      .select('amount, type')
      .eq('shift_id', shiftId);
      
    const pettyIn = pettyCash?.filter(p => p.type === 'CASH_IN').reduce((sum, p) => sum + p.amount, 0) || 0;
    const pettyOut = pettyCash?.filter(p => p.type === 'CASH_OUT').reduce((sum, p) => sum + p.amount, 0) || 0;

    // Get Start Cash
    const { data: currentShift } = await supabase.from('shifts').select('start_cash').eq('id', shiftId).single();
    const startCash = currentShift?.start_cash || 0;

    const endCashSystem = startCash + cashSales + pettyIn - pettyOut;

    const { data, error } = await supabase
      .from('shifts')
      .update({
        end_time: new Date().toISOString(),
        status: 'CLOSED',
        end_cash_actual: endCashActual,
        end_cash_system: endCashSystem,
        note
      })
      .eq('id', shiftId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCurrentShift(userId: string): Promise<Shift | null> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'OPEN')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // --- Petty Cash Operations ---

  async addPettyCash(shiftId: string, userId: string, amount: number, type: 'CASH_IN' | 'CASH_OUT', reason: string): Promise<PettyCash> {
    const { data, error } = await supabase
      .from('petty_cash')
      .insert({
        shift_id: shiftId,
        user_id: userId,
        amount,
        type,
        reason
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLastClosedShift(userId: string): Promise<Shift | null> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'CLOSED')
      .order('end_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
