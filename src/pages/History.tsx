import { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import type { Transaction } from '../types';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';
import toast from 'react-hot-toast';

export default function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [viewReceiptTx, setViewReceiptTx] = useState<Transaction | null>(null);

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

  const loadData = async () => {
    try {
      setIsLoading(true);
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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const toggleExpand = (id: string) => {
    if (selectedTx === id) setSelectedTx(null);
    else setSelectedTx(id);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Transaction History</h2>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <Calendar size={18} color="var(--text-secondary)" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ border: 'none', color: 'var(--text-primary)' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ border: 'none', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr .5fr', padding: '1rem', backgroundColor: '#F7FAFC', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <div>Date/ID</div>
          <div>Cashier</div>
          <div>Method</div>
          <div style={{ textAlign: 'right' }}>Total</div>
          <div></div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found in this period.</div>
        ) : (
          <div>
             {transactions.map(tx => (
               <div key={tx.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                 <div
                    onClick={() => tx.id && toggleExpand(tx.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr .5fr',
                      padding: '1rem',
                      cursor: 'pointer',
                      backgroundColor: selectedTx === tx.id ? '#FFF5F2' : 'white',
                      transition: 'background-color 0.2s'
                    }}
                 >
                    <div>
                      <div style={{ fontWeight: '500' }}>{tx.created_at?.toLocaleDateString()} {tx.created_at?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.id?.slice(0,8)}...</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>{tx.username}</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                        backgroundColor: tx.payment_method === 'CASH' ? '#E6FFFA' : '#EBF8FF',
                        color: tx.payment_method === 'CASH' ? '#2C7A7B' : '#2B6CB0'
                      }}>
                        {tx.payment_method}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: '600' }}>
                      Rp {tx.total_amount.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedTx === tx.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                 </div>

                 {/* Expanded Details */}
                 {selectedTx === tx.id && (
                   <div style={{ backgroundColor: '#FAFAFA', padding: '1rem 2rem', borderTop: '1px solid #EDF2F7' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Items Purchased</h4>
                      <ul style={{ listStyle: 'none', marginBottom: '1rem' }}>
                        {tx.items.map((item, idx) => (
                          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            <span>{item.quantity}x {item.name}</span>
                            <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setViewReceiptTx(tx)}
                          style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Reprint Receipt
                        </button>
                      </div>
                   </div>
                 )}
               </div>
             ))}
          </div>
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
