import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface VoidModalProps {
  isOpen: boolean;
  transactionId: string;
  transactionTotal: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function VoidModal({ 
  isOpen, 
  transactionId, 
  transactionTotal, 
  onClose, 
  onConfirm, 
  isLoading 
}: VoidModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-bold">Refund Transaction</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">
            This action will cancel the transaction and <strong>restore all item stock</strong>. 
            This cannot be undone.
          </p>
        </div>

        {/* Transaction Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <p className="text-gray-600">Transaction ID: <span className="font-mono">{transactionId.slice(0, 8)}...</span></p>
          <p className="text-gray-600">Amount: <span className="font-bold text-gray-900">Rp {transactionTotal.toLocaleString()}</span></p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for refund *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Customer changed mind, Wrong order entry..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            rows={3}
            required
            disabled={isLoading}
          />

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Refunding...' : 'Confirm Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
