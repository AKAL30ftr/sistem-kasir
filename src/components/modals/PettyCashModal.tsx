
import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PettyCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, type: 'CASH_IN' | 'CASH_OUT', reason: string) => void;
}

export const PettyCashModal: React.FC<PettyCashModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_OUT');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('Jumlah harus lebih dari 0');
      return;
    }
    if (!reason.trim()) {
      toast.error('Wajib isi keterangan');
      return;
    }
    onConfirm(val, type, reason);
    setAmount('');
    setReason('');
    setType('CASH_OUT');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Kas Kecil (Petty Cash)</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('CASH_OUT')}
              className={`p-3 text-center rounded-lg border-2 ${
                type === 'CASH_OUT'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold">Uang Keluar</div>
              <div className="text-xs text-gray-500">Ambil dari Laci</div>
            </button>
            <button
              type="button"
              onClick={() => setType('CASH_IN')}
              className={`p-3 text-center rounded-lg border-2 ${
                type === 'CASH_IN'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold">Uang Masuk</div>
              <div className="text-xs text-gray-500">Tambah ke Laci</div>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Beli Es Batu / Tambah Modal"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
