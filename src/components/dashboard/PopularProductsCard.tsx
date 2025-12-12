
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { reportService } from '../../services/reportService';

export function PopularProductsCard() {
  const [popularItems, setPopularItems] = useState<{name: string, count: number, category: string}[]>([]);

  useEffect(() => {
    // Calculate from last 7 days for better data density
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    reportService.getTransactions(start, end).then(txs => {
        const counts: Record<string, {count: number, category: string}> = {};
        
        txs.forEach(tx => {
            tx.items.forEach(item => {
                if (!counts[item.name]) counts[item.name] = { count: 0, category: item.category };
                counts[item.name].count += item.quantity;
            });
        });

        const sorted = Object.entries(counts)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
            
        setPopularItems(sorted);
    });
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
       <div className="flex justify-between items-center mb-4">
         <h3 className="font-bold text-gray-800">Popular Products</h3>
       </div>
       
       <div className="space-y-4">
           {popularItems.map((item, idx) => (
             <div key={idx} className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                     <ShoppingBag size={20} />
                 </div>
                 <div className="flex-1">
                     <h4 className="font-semibold text-gray-800">{item.name}</h4>
                     <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{item.category}</span>
                 </div>
                 <div className="text-right">
                     <p className="font-bold text-gray-900">{item.count} Sales</p>
                 </div>
             </div>
           ))}
           {popularItems.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No data available</p>}
       </div>
    </div>
  );
}
