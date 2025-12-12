
import React from 'react';
import { Package } from 'lucide-react';

interface AlertCardProps {
  lowStockCount: number;
}

export const AlertCard: React.FC<AlertCardProps> = ({ lowStockCount }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-gray-500 text-sm font-medium mb-3">Status Stock</h3>
      
      <div className="space-y-3">
        <div className={`p-3 rounded-md flex items-center gap-3 ${lowStockCount > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <Package size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold">{lowStockCount} Produk Menipis</p>
            {lowStockCount > 0 && <p className="text-xs opacity-75">Segera restock!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
