
import { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import type { Transaction } from '../../types';

export function RecentTransactionsCard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Hack: Get last 24 hours transactions and slice typical recent count
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 1);
    
    reportService.getTransactions(start, end)
        .then(data => setTransactions(data.slice(0, 5)))
        .catch(console.error);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
       <div className="flex justify-between items-center mb-4">
         <h3 className="font-bold text-gray-800">Recent Sales</h3>
         <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
       </div>
       
       <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="text-gray-400 font-medium border-b border-gray-100">
                <tr>
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Items</th>
                    <th className="pb-2 text-right">Amount</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {transactions.map(tx => (
                    <tr key={tx.id}>
                        <td className="py-3 font-mono text-xs text-gray-500">{tx.id?.slice(0,6)}</td>
                        <td className="py-3 text-gray-800 max-w-[100px] truncate">
                            {tx.items.length} items
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-900">
                            Rp {tx.total_amount.toLocaleString()}
                        </td>
                    </tr>
                ))}
             </tbody>
          </table>
          {transactions.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No sales today</p>}
       </div>
    </div>
  );
}
