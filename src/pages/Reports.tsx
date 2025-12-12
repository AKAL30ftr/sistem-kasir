
import { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { BarChart, DollarSign, Wallet, CreditCard, Download, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Transaction } from '../types';
import ReceiptModal from '../components/ReceiptModal';

export default function Reports() {
  const [stats, setStats] = useState({
    totalSales: 0,
    count: 0,
    cashTotal: 0,
    qrisTotal: 0
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Date State - Default to Today
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Load Stats (Should ideally respect date range, but currently getTodayStats is hardcoded to today in service. 
      //    We might need to update service if we want multi-day stats, but for now let's assume 'Today' or just use the transaction sum)
      //    Actually, let's calculate stats from the fetched transactions for accuracy with the date filter.
      
      const start = new Date(dateRange.start);
      start.setHours(0,0,0,0);
      const end = new Date(dateRange.end);
      end.setHours(23,59,59,999);

      const txs = await reportService.getTransactions(start, end);
      setTransactions(txs);

      // Calculate stats client-side for the filtered range
      const newStats = txs.reduce((acc, t) => ({
        totalSales: acc.totalSales + t.total_amount,
        count: acc.count + 1,
        cashTotal: acc.cashTotal + (t.payment_method === 'CASH' ? t.total_amount : 0),
        qrisTotal: acc.qrisTotal + (t.payment_method === 'QRIS' ? t.total_amount : 0)
      }), { totalSales: 0, count: 0, cashTotal: 0, qrisTotal: 0 });
      
      setStats(newStats);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const headers = ["Date", "Time", "Transaction ID", "Total Amount", "Payment Method", "Items"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => {
        const date = new Date(t.created_at).toLocaleDateString('id-ID');
        const time = new Date(t.created_at).toLocaleTimeString('id-ID');
        const items = t.items.map(i => `${i.quantity}x ${i.name}`).join("; ");
        return `${date},${time},${t.id},${t.total_amount},${t.payment_method},"${items}"`;
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${dateRange.start}_${dateRange.end}.csv`;
    link.click();
    toast.success("Report downloaded");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>
          <p className="text-gray-500">Monitor daily sales and transaction history</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-lg shadow-sm">
                <Calendar size={18} className="text-gray-400 ml-2" />
                <input 
                    type="date" 
                    value={dateRange.start}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                    className="outline-none text-sm text-gray-600 bg-transparent"
                />
                <span className="text-gray-400">-</span>
                <input 
                    type="date" 
                    value={dateRange.end}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                    className="outline-none text-sm text-gray-600 bg-transparent"
                />
            </div>

            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
            >
                <Download size={18} /> Export CSV
            </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
               <p className="text-gray-500 text-sm font-medium mb-1">Total Sales</p>
               <h3 className="text-2xl font-bold text-gray-900">
                 Rp {stats.totalSales.toLocaleString()}
               </h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <DollarSign size={24} />
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
               <p className="text-gray-500 text-sm font-medium mb-1">Transactions</p>
               <h3 className="text-2xl font-bold text-gray-900">
                 {stats.count}
               </h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <BarChart size={24} />
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
               <p className="text-gray-500 text-sm font-medium mb-1">Cash</p>
               <h3 className="text-2xl font-bold text-gray-900">
                 Rp {stats.cashTotal.toLocaleString()}
               </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Wallet size={24} />
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
               <p className="text-gray-500 text-sm font-medium mb-1">QRIS</p>
               <h3 className="text-2xl font-bold text-gray-900">
                 Rp {stats.qrisTotal.toLocaleString()}
               </h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <CreditCard size={24} />
            </div>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h3 className="font-bold text-lg text-gray-800">Transaction History</h3>
        </div>
        
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 font-medium">
               <tr>
                 <th className="px-6 py-4">Time</th>
                 <th className="px-6 py-4">Order ID</th>
                 <th className="px-6 py-4">Items</th>
                 <th className="px-6 py-4">Amount</th>
                 <th className="px-6 py-4">Payment</th>
                 <th className="px-6 py-4 text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {isLoading ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading data...</td></tr>
               ) : transactions.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found for this period</td></tr>
               ) : (
                   transactions.map((t) => (
                     <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 text-gray-600">
                         {new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                       </td>
                       <td className="px-6 py-4 font-mono text-xs text-gray-500">
                         {t.id?.slice(0, 8)}...
                       </td>
                       <td className="px-6 py-4 text-gray-800 max-w-xs truncate">
                         {t.items.map(i => `${i.quantity} ${i.name}`).join(', ')}
                       </td>
                       <td className="px-6 py-4 font-medium text-gray-900">
                         Rp {t.total_amount.toLocaleString()}
                       </td>
                       <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${
                             t.payment_method === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                         }`}>
                             {t.payment_method}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button 
                            onClick={() => setSelectedTransaction(t)}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center justify-end gap-1"
                         >
                            <FileText size={14} /> Receipt
                         </button>
                       </td>
                     </tr>
                   ))
               )}
             </tbody>
           </table>
        </div>
      </div>
      
      {/* Receipt Modal */}
      {selectedTransaction && (
          <ReceiptModal 
            transaction={selectedTransaction} 
            onClose={() => setSelectedTransaction(null)} 
          />
      )}
    </div>
  );
}

