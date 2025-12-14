import { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import type { Transaction } from '../types';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';
import toast from 'react-hot-toast';

export default function History() {

  
  // Transaction State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewReceiptTx, setViewReceiptTx] = useState<Transaction | null>(null);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);



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
  }, [startDate, endDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        
        const data = await reportService.getTransactions(start, end);
        setTransactions(data);
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
        <h2 className="text-2xl font-bold text-gray-800">History</h2>
        
        {/* Date Filter (Only for transactions currently) */}
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
      </div>

      {/* Tabs */}


      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading data...</div>
        ) : (
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
