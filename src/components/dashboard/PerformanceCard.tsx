
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceCardProps {
  sales: number;
  yesterdaySales?: number;
  transactions: number;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({ sales, yesterdaySales = 0, transactions }) => {
  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  
  const growth = sales - yesterdaySales;
  const isPositive = growth >= 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium">Penjualan Hari Ini</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatRp(sales)}</h3>
          
          <div className="flex items-center gap-3 mt-2">
             <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} flex items-center gap-1`}>
                 {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                 {Math.abs(growth).toLocaleString()} vs Yesterday
             </span>
             <p className="text-xs text-gray-500 font-medium">
               {transactions} Tx
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
