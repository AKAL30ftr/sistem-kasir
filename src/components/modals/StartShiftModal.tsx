import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { shiftService } from '../../services/shiftService';
import { useAuth } from '../../context/AuthContext';

interface StartShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export const StartShiftModal: React.FC<StartShiftModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [startCash, setStartCash] = useState('');
  const [lastShiftCash, setLastShiftCash] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      shiftService.getLastClosedShift(user.id).then(shift => {
        if (shift) setLastShiftCash(shift.end_cash_actual || 0);
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(startCash);
    if (isNaN(amount) || amount < 0) {
      toast.error('Masukkan jumlah uang yang valid');
      return;
    }
    onConfirm(amount);
    setStartCash('');
  };

  const isMismatch = lastShiftCash !== null && parseFloat(startCash || '0') !== lastShiftCash;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mulai Shift Baru</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modal Awal (Uang di Laci)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">Rp</span>
              </div>
              <input
                type="number"
                value={startCash}
                onChange={(e) => setStartCash(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                required
              />
            </div>
            
            {lastShiftCash !== null && (
              <div className={`mt-3 p-3 rounded-md text-sm ${isMismatch ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                <p className="font-medium">
                   Saldo Akhir Kemarin: Rp {lastShiftCash.toLocaleString('id-ID')}
                </p>
                {isMismatch && (
                   <div className="flex items-start gap-2 mt-1">
                      <span>⚠️</span>
                      <p>Jumlah tidak match. Pastikan uang fisik sesuai!</p>
                   </div>
                )}
              </div>
            )}

            <p className="mt-2 text-sm text-gray-500">
              Hitung uang fisik yang ada di laci kasir saat ini.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <DollarSign size={18} />
              Mulai Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
