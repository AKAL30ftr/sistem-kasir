
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface EndShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actualAmount: number, note: string) => void;
  expectedCash: number; // This should be passed from parent (calculated system cash)
}

export const EndShiftModal: React.FC<EndShiftModalProps> = ({ isOpen, onClose, onConfirm, expectedCash }) => {
  const [actualCash, setActualCash] = useState('');
  const [note, setNote] = useState('');
  
  const variance = (parseFloat(actualCash) || 0) - expectedCash;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(actualCash);
    if (isNaN(amount) || amount < 0) {
      toast.error('Masukkan jumlah uang yang valid');
      return;
    }

    if (Math.abs(variance) > 10000 && !note.trim()) {
      toast.error('Wajib isi catatan karena ada selisih > Rp 10.000');
      return;
    }

    onConfirm(amount, note);
    setActualCash('');
    setNote('');
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Akhiri Shift</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Seharusnya (Sistem):</span>
              <span className="font-semibold">{formatRp(expectedCash)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Uang Fisik (Hitung Manual)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">Rp</span>
              </div>
              <input
                type="number"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Variance Display */}
          <div className={`p-3 rounded-md border ${variance === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Selisih:</span>
              <span className={`font-bold ${variance < 0 ? 'text-red-600' : variance > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                {formatRp(variance)}
              </span>
            </div>
            {variance !== 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {variance < 0 ? 'Uang fisik KURANG dari sistem.' : 'Uang fisik LEBIH dari sistem.'}
              </p>
            )}
          </div>

          {/* Note Section (Required if Variance > 10k) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan / Penjelasan {Math.abs(variance) > 10000 && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contoh: Ada uang kembalian yang belum terinput..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <Save size={18} />
              Simpan & Akhiri Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
