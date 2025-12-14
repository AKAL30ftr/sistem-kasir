import { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import type { Transaction } from '../types';
import { Calendar, ChevronDown, ChevronUp, Ban } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';
import { VoidModal } from '../components/modals/VoidModal';
import toast from 'react-hot-toast';

export default function History() {
  const { user } = useAuth();
  
  // Transaction State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewReceiptTx, setViewReceiptTx] = useState<Transaction | null>(null);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  // Void Modal State
  const [voidingTx, setVoidingTx] = useState<Transaction | null>(null);
  const [isVoiding, setIsVoiding] = useState(false);

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

  const handleVoid = async (reason: string) => {
    if (!voidingTx?.id || !user) return;
    
    setIsVoiding(true);
    try {
      await transactionService.voidTransaction(voidingTx.id, user.username, reason);
      toast.success('Transaction refunded successfully');
      setVoidingTx(null);
      loadData(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || 'Failed to refund transaction');
    } finally {
      setIsVoiding(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'VOIDED') {
      return <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">REFUNDED</span>;
    }
    if (status === 'REFUNDED') {
      return <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">REFUNDED</span>;
    }
    return null;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">History</h2>
        
        {/* Date Filter */}
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
                transactions.map(tx => {
                    const isVoided = tx.status === 'VOIDED';
                    return (
                    <div key={tx.id} className={`border-b border-gray-100 last:border-0 ${isVoided ? 'opacity-60' : ''}`}>
                        <div
                            onClick={() => tx.id && toggleExpand(tx.id)}
                            className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_0.5fr] p-4 cursor-pointer hover:bg-gray-50 transition ${selectedTx === tx.id ? 'bg-orange-50' : ''}`}
                        >
                            <div>
                                <div className="font-medium text-gray-900 flex items-center">
                                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    {getStatusBadge(tx.status)}
                                </div>
                                <div className="text-xs text-gray-500">{tx.id?.slice(0,8)}...</div>
                            </div>
                            <div className="flex items-center text-gray-700">{tx.username}</div>
                            <div className="flex items-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${tx.payment_method === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {tx.payment_method}
                                </span>
                            </div>
                            <div className={`flex items-center justify-end font-semibold ${isVoided ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
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
                                
                                {/* Void Reason if voided */}
                                {isVoided && tx.void_reason && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                                        <p className="text-red-800"><strong>Refund Reason:</strong> {tx.void_reason}</p>
                                        <p className="text-red-600 text-xs mt-1">
                                            Refunded by {tx.voided_by} at {tx.voided_at && new Date(tx.voided_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setViewReceiptTx(tx)}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Reprint Receipt
                                    </button>
                                    
                                    {/* Refund button - only for COMPLETED transactions */}
                                    {(!tx.status || tx.status === 'COMPLETED') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setVoidingTx(tx);
                                            }}
                                            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                                        >
                                            <Ban size={14} /> Refund
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    );
                })
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

      {voidingTx && (
        <VoidModal
          isOpen={!!voidingTx}
          transactionId={voidingTx.id || ''}
          transactionTotal={voidingTx.total_amount}
          onClose={() => setVoidingTx(null)}
          onConfirm={handleVoid}
          isLoading={isVoiding}
        />
      )}
    </div>
  );
}
