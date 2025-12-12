import { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { userService } from '../services/userService';
import type { Transaction, LoginLog } from '../types';
import { Calendar, ChevronDown, ChevronUp, History as HistoryIcon, User } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';
import toast from 'react-hot-toast';

export default function History() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'logins'>('transactions');
  
  // Transaction State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewReceiptTx, setViewReceiptTx] = useState<Transaction | null>(null);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  // Login Log State
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);

  // Shared State
  const [isLoading, setIsLoading] = useState(true);
  
  // Date Filter (Default to last 7 days)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'transactions') {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        
        const data = await reportService.getTransactions(start, end);
        setTransactions(data);
      } else {
        // Fetch Login Logs - ideally we filter by date too, but userService might need update.
        // For MVP, we fetch recent 50
        const logs = await userService.getRecentLogins(50);
        setLoginLogs(logs);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (selectedTx === id) setSelectedTx(null);
    else setSelectedTx(id);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">History & Logs</h2>
        
        {/* Date Filter (Only for transactions currently) */}
        {activeTab === 'transactions' && (
            <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm">
            <Calendar size={18} className="text-gray-400" />
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent outline-none text-sm"
            />
            <span className="text-gray-400">-</span>
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent outline-none text-sm"
            />
            </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-4 font-medium flex items-center gap-2 transition ${activeTab === 'transactions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
             <HistoryIcon size={18} /> Transactions
          </button>
          <button 
            onClick={() => setActiveTab('logins')}
            className={`pb-3 px-4 font-medium flex items-center gap-2 transition ${activeTab === 'logins' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
             <User size={18} /> Login Activity
          </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading data...</div>
        ) : activeTab === 'transactions' ? (
           <>
             {/* Transaction Table Header */}
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_0.5fr] p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 text-sm">
                <div>Date/ID</div>
                <div>Cashier</div>
                <div>Method</div>
                <div className="text-right">Total</div>
                <div></div>
            </div>
            
            {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No transactions found.</div>
            ) : (
                transactions.map(tx => (
                    <div key={tx.id} className="border-b border-gray-100 last:border-0">
                        <div
                            onClick={() => tx.id && toggleExpand(tx.id)}
                            className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_0.5fr] p-4 cursor-pointer hover:bg-gray-50 transition ${selectedTx === tx.id ? 'bg-orange-50' : ''}`}
                        >
                            <div>
                                <div className="font-medium text-gray-900">
                                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <div className="text-xs text-gray-500">{tx.id?.slice(0,8)}...</div>
                            </div>
                            <div className="flex items-center text-gray-700">{tx.username}</div>
                            <div className="flex items-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${tx.payment_method === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {tx.payment_method}
                                </span>
                            </div>
                            <div className="flex items-center justify-end font-semibold text-gray-900">
                                Rp {tx.total_amount.toLocaleString()}
                            </div>
                            <div className="flex items-center justify-center text-gray-400">
                                {selectedTx === tx.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                        </div>
                        
                        {/* Expanded Details */}
                        {selectedTx === tx.id && (
                            <div className="bg-gray-50 p-4 border-t border-gray-100">
                                <h4 className="text-sm font-semibold mb-2">Items Purchased</h4>
                                <ul className="space-y-1 mb-4">
                                    {tx.items.map((item, idx) => (
                                    <li key={idx} className="flex justify-between text-sm text-gray-700">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                                    </li>
                                    ))}
                                </ul>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setViewReceiptTx(tx)}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Reprint Receipt
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
           </>
        ) : (
            // Login Logs Table
            <>
             <div className="grid grid-cols-[1fr_2fr_2fr] p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 text-sm">
                <div>Time</div>
                <div>User</div>
                <div>Device</div>
            </div>
            
            {loginLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No login activity found.</div>
            ) : (
                loginLogs.map(log => (
                    <div key={log.id} className="grid grid-cols-[1fr_2fr_2fr] p-4 border-b border-gray-100 hover:bg-gray-50 items-center">
                         <div>
                             <div className="font-medium text-gray-900">{new Date(log.timestamp).toLocaleTimeString()}</div>
                             <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</div>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">
                                 {log.username?.[0] || 'U'}
                             </div>
                             <span className="text-gray-700 font-medium">{log.username || 'Unknown'}</span>
                         </div>
                         <div className="text-xs text-gray-500 truncate" title={log.device_info}>
                             {log.device_info || 'Unknown Device'}
                         </div>
                    </div>
                ))
            )}
            </>
        )}
      </div>

      {viewReceiptTx && (
        <ReceiptModal
          transaction={viewReceiptTx}
          onClose={() => setViewReceiptTx(null)}
        />
      )}
    </div>
  );
}
