import { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import type { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // A simple print approach: Hide everything else via CSS media query
    // But for simplicity in SPA, we can just call window.print()
    // and rely on a print stylesheet or specific print area logic.
    // For this demo, we'll suggest using browser's print behavior and styling.
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100 // Higher than payment modal
    }}>
      <div style={{
        backgroundColor: 'var(--bg-white)',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={onClose} style={{ border: 'none', background: 'none' }}><X /></button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="printable-area" style={{
          backgroundColor: 'white',
          padding: '1rem',
          border: '1px dashed #E2E8F0',
          fontFamily: "'Courier New', Courier, monospace", // Receipt font style
          color: 'black'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>POS SYSTEM</h2>
            <p style={{ fontSize: '0.875rem' }}>Jl. Contoh No. 123</p>
            <p style={{ fontSize: '0.875rem' }}>Jakarta, Indonesia</p>
          </div>

          <div style={{ borderBottom: '1px dashed black', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Time:</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cashier:</span>
              <span>{transaction.username}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ID:</span>
              <span>{transaction.id?.slice(0, 8)}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            {transaction.items.map((item, idx) => (
              <div key={idx} style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <div>{item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.quantity} x {item.price.toLocaleString()}</span>
                  <span>{(item.quantity * item.price).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed black', paddingTop: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>TOTAL</span>
              <span>Rp {transaction.total_amount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>{transaction.payment_method}</span>
              <span>Rp {transaction.cash_received.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>CHANGE</span>
              <span>Rp {transaction.change_amount.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
            <p>Thank You For Your Visit</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="no-print"
          style={{
            width: '100%',
            padding: '1rem',
            marginTop: '1.5rem',
            backgroundColor: 'var(--secondary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
          }}
        >
          <Printer size={20} />
          Print Receipt
        </button>
      </div>

      {/* Basic Print Styles Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
