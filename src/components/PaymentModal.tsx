import { useState, useEffect } from 'react';
import { X, Banknote, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onComplete: (paymentMethod: 'CASH' | 'QRIS', cashReceived: number) => Promise<void>;
  isLoading: boolean;
}

export default function PaymentModal({ total, onClose, onComplete, isLoading }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [cashReceived, setCashReceived] = useState<string>(''); // string input for better UX
  const [change, setChange] = useState(0);

  useEffect(() => {
    const cash = Number(cashReceived);
    if (!isNaN(cash)) {
      setChange(cash - total);
    } else {
      setChange(0);
    }
  }, [cashReceived, total]);

  const handleSubmit = async () => {
    const cash = Number(cashReceived);

    if (paymentMethod === 'CASH') {
      if (cash < total) {
        toast.error('Insufficient cash!');
        return;
      }
    }

    // For QRIS, we assume exact payment for now (or set cashReceived = total)
    const finalCashReceived = paymentMethod === 'CASH' ? cash : total;

    await onComplete(paymentMethod, finalCashReceived);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Payment</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none' }}><X /></button>
        </div>

        {/* Amount Display */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Amount</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>
            Rp {total.toLocaleString()}
          </h1>
        </div>

        {/* Method Toggle */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setPaymentMethod('CASH')}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '8px',
              border: paymentMethod === 'CASH' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
              backgroundColor: paymentMethod === 'CASH' ? '#FFF5F2' : 'white',
              color: paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <Banknote size={24} />
            Cash
          </button>
          <button
            onClick={() => setPaymentMethod('QRIS')}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '8px',
              border: paymentMethod === 'QRIS' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
              backgroundColor: paymentMethod === 'QRIS' ? '#FFF5F2' : 'white',
              color: paymentMethod === 'QRIS' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <QrCode size={24} />
            QRIS
          </button>
        </div>

        {/* Input Area */}
        <div style={{ minHeight: '120px' }}>
          {paymentMethod === 'CASH' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cash Received</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0"
                autoFocus
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  marginBottom: '1rem'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '600' }}>
                <span>Change:</span>
                <span style={{ color: change >= 0 ? '#38A169' : '#E53E3E' }}>
                  Rp {change.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '150px', height: '150px', margin: '0 auto',
                backgroundColor: '#EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px'
              }}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ExampleQRISCode" alt="QRIS" />
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Scan to pay</p>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem',
            marginTop: '2rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '700',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Processing...' : paymentMethod === 'CASH' ? 'Pay Cash' : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
}
