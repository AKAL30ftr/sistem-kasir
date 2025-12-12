
import { supabase } from '../supabase';
import type { LoginLog } from '../types';

export const userService = {
  // Log a user login event
  logLogin: async (userId: string) => {
    try {
      await supabase.from('login_logs').insert([{
        user_id: userId,
        timestamp: new Date().toISOString(),
        device_info: navigator.userAgent
      }]);
    } catch (error) {
      console.error("Failed to log login:", error);
    }
  },

  // Get recent logins (for Dashboard/History)
  getRecentLogins: async (limit: number = 5): Promise<LoginLog[]> => {
    const { data, error } = await supabase
      .from('login_logs')
      .select(`
        id,
        timestamp,
        device_info,
        user_id,
        users:user_id ( username )
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Map to flatten structure if needed, or keep as is.
    // Supabase returns joined data as an object/array.
    return data.map((log: any) => ({
      id: log.id,
      user_id: log.user_id,
      username: log.users?.username || 'Unknown',
      timestamp: log.timestamp,
      device_info: log.device_info
    }));
  }
};
