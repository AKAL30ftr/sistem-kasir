
import React from 'react';
import { Play } from 'lucide-react';

interface NoShiftViewProps {
  onStartShift: () => void;
}

export const NoShiftView: React.FC<NoShiftViewProps> = ({ onStartShift }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="bg-white p-4 rounded-full shadow-md mb-4">
        <Play size={48} className="text-blue-500 ml-1" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Belum Ada Shift Aktif</h2>
      <p className="text-gray-500 max-w-md mb-6">
        Silakan mulai shift baru untuk melakukan transaksi dan mengelola kasir.
      </p>
      <button
        onClick={onStartShift}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2"
      >
        <Play size={20} fill="currentColor" />
        Mulai Shift Baru
      </button>
    </div>
  );
};
