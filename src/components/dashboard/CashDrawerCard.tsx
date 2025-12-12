
import React from 'react';
import { Wallet } from 'lucide-react';

interface CashDrawerCardProps {
  startCash: number;
  expectedCash: number; // System calculated
}

export const CashDrawerCard: React.FC<CashDrawerCardProps> = ({ startCash, expectedCash }) => {
  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium">Uang di Laci (Estimasi Sistem)</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatRp(expectedCash)}</h3>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
          <Wallet size={24} />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Modal Awal</span>
          <span className="font-semibold text-gray-700">{formatRp(startCash)}</span>
        </div>
        {/* We can add more details here later like "Cash In" and "Cash Out" totals */}
      </div>
    </div>
  );
};
