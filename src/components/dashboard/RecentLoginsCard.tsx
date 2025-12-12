
import { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import type { LoginLog } from '../../types';

export function RecentLoginsCard() {
  const [logs, setLogs] = useState<LoginLog[]>([]);

  useEffect(() => {
    userService.getRecentLogins().then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
       <div className="flex justify-between items-center mb-4">
         <h3 className="font-bold text-gray-800">Recent Login Activity</h3>
         <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
       </div>
       
       <div className="space-y-4">
         {logs.map((log) => (
           <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {log.username ? log.username[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                 <p className="font-semibold text-gray-900 text-sm">{log.username || 'Unknown User'}</p>
                 <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>
              </div>
           </div>
         ))}
         {logs.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No recent activity</p>}
       </div>
    </div>
  );
}
