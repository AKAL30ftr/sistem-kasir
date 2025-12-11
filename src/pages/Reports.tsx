import { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { BarChart, DollarSign, Wallet, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const [stats, setStats] = useState({
    totalSales: 0,
    count: 0,
    cashTotal: 0,
    qrisTotal: 0
  });

  // Reconciliation State
  const [openingBalance, setOpeningBalance] = useState(0);
  const [actualClosing, setActualClosing] = useState(0);
  const [isReconciling, setIsReconciling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await reportService.getTodayStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const expectedClosing = openingBalance + stats.cashTotal;
  const variance = actualClosing - expectedClosing;

  const handleReconcile = async () => {
    try {
      if (actualClosing <= 0) {
        toast.error("Enter actual closing balance");
        return;
      }
      setIsReconciling(true);
      await reportService.saveReconciliation({
        opening_balance: openingBalance,
        closing_balance: expectedClosing,
        actual_cash: actualClosing,
        note: `Variance: ${variance}`,
        created_at: new Date().toISOString()
      });
      toast.success("Cash balance saved!");
      // Reset form or lock it
      setOpeningBalance(0);
      setActualClosing(0);
    } catch (error) {
      toast.error("Failed to save report");
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Daily Reports & Reconciliation</h2>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Sales (Today)</p>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem', color: 'var(--primary)' }}>
                 Rp {stats.totalSales.toLocaleString()}
               </h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFF5F2', borderRadius: '50%', color: 'var(--primary)' }}>
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Transactions</p>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                 {stats.count}
               </h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#F0FFF4', borderRadius: '50%', color: '#38A169' }}>
              <BarChart size={20} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Cash Sales</p>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem', color: '#2B6CB0' }}>
                 Rp {stats.cashTotal.toLocaleString()}
               </h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#EBF8FF', borderRadius: '50%', color: '#2B6CB0' }}>
              <Wallet size={20} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>QRIS Sales</p>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem', color: '#805AD5' }}>
                 Rp {stats.qrisTotal.toLocaleString()}
               </h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FAF5FF', borderRadius: '50%', color: '#805AD5' }}>
              <CreditCard size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* CASH RECONCILIATION FORM */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>End of Day Cash Reconciliation</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Opening Balance (Start of Day)</label>
              <input
                type="number"
                value={openingBalance || ''}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                placeholder="Enter amount (e.g., 500000)"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>System Calculated Cash</label>
              <div style={{ padding: '0.75rem', backgroundColor: '#F7FAFC', border: '1px dashed #E2E8F0', borderRadius: '8px', fontWeight: '600' }}>
                 Rp {stats.cashTotal.toLocaleString()}
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Expected Closing Balance</label>
              <div style={{ padding: '0.75rem', backgroundColor: '#E6FFFA', border: '1px solid #B2F5EA', borderRadius: '8px', fontWeight: '700', color: '#285E61' }}>
                 Rp {expectedClosing.toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Actual Closing Balance (Counted)</label>
              <input
                type="number"
                value={actualClosing || ''}
                onChange={(e) => setActualClosing(Number(e.target.value))}
                placeholder="Count money in drawer"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1.1rem', fontWeight: '600' }}
              />
            </div>

            <div style={{
               padding: '1.5rem',
               borderRadius: '8px',
               backgroundColor: variance < 0 ? '#FFF5F5' : variance > 0 ? '#F0FFF4' : '#F7FAFC',
               border: `1px solid ${variance < 0 ? '#FEB2B2' : variance > 0 ? '#9AE6B4' : '#E2E8F0'}`,
               textAlign: 'center'
            }}>
               <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Variance</p>
               <h2 style={{
                 fontSize: '2rem',
                 fontWeight: '700',
                 color: variance < 0 ? '#E53E3E' : variance > 0 ? '#38A169' : 'var(--text-secondary)'
               }}>
                 {variance > 0 ? '+' : ''} Rp {variance.toLocaleString()}
               </h2>
               <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                 {variance === 0 ? "Perfect match!" : variance < 0 ? "Missing cash!" : "Surplus cash!"}
               </p>
            </div>

            <button
              onClick={handleReconcile}
              disabled={isReconciling || actualClosing <= 0}
              style={{
                width: '100%',
                padding: '1rem',
                marginTop: '1.5rem',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                opacity: (isReconciling || actualClosing <= 0) ? 0.6 : 1,
                cursor: (isReconciling || actualClosing <= 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {isReconciling ? 'Saving...' : 'Submit End of Day Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
