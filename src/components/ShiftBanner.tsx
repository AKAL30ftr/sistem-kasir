
import React from 'react';
import { Clock, Key } from 'lucide-react';
import type { Shift } from '../types';

interface ShiftBannerProps {
  shift: Shift | null;
  onOpenPettyCash: () => void;
  onEndShift: () => void;
}

export const ShiftBanner: React.FC<ShiftBannerProps> = ({ shift, onOpenPettyCash, onEndShift }) => {
  if (!shift) return null;

  const startTime = new Date(shift.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock size={20} />
          <span className="font-medium">Shift Aktif sejak {startTime}</span>
        </div>
        <span className="bg-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
          Modal: Rp {shift.start_cash.toLocaleString('id-ID')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenPettyCash}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 rounded-md text-sm font-medium transition-colors"
        >
          Kas Kecil (Masuk/Keluar)
        </button>
        <button
          onClick={onEndShift}
          className="px-3 py-1.5 bg-red-500 hover:bg-red-400 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Key size={16} />
          Akhiri Shift
        </button>
      </div>
    </div>
  );
};
