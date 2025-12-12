
import { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';


interface ChartData {
  label: string;
  value: number;
  date: string;
}

export function SalesChartCard() {
  const [period, setPeriod] = useState<7 | 30>(7);
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const stats = await reportService.getSalesChart(period);
      setData(stats);
      setMaxValue(Math.max(...stats.map(d => d.value), 1000)); // Min max 1000 to avoid div/0
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Sales Analytics</h3>
          <p className="text-sm text-gray-500">Revenue overview</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
           <button 
             onClick={() => setPeriod(7)}
             className={`px-3 py-1 text-xs font-semibold rounded-md transition ${period === 7 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             7 Days
           </button>
           <button 
             onClick={() => setPeriod(30)}
             className={`px-3 py-1 text-xs font-semibold rounded-md transition ${period === 30 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             30 Days
           </button>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-2 md:gap-4 min-h-[200px] w-full relative">
         {/* Y-Axis Lines (Cosmetic) */}
         <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
             {[1, 0.75, 0.5, 0.25, 0].map(p => (
                 <div key={p} className="w-full border-t border-gray-50 flex items-center">
                    <span className="text-[10px] text-gray-300 -mt-5">Rp {(maxValue * p / 1000).toFixed(0)}k</span>
                 </div>
             ))}
         </div>

         {isLoading ? (
             <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Loading graph...</div>
         ) : data.length === 0 ? (
             <div className="w-full text-center text-gray-400 text-sm">No sales data</div>
         ) : (
            data.map((item, idx) => {
                const heightPercent = (item.value / maxValue) * 100;
                return (
                    <div key={idx} className="group relative flex-1 flex flex-col justify-end items-center h-full z-10 w-full">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-gray-800 text-white text-xs p-2 rounded transform transition pointer-events-none z-20 whitespace-nowrap">
                            <p className="font-bold">{item.date}</p>
                            <p>Rp {item.value.toLocaleString()}</p>
                            <div className="absolute bottom-0 left-1/2 -ml-1 -mb-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                        </div>
                        
                        {/* Bar */}
                        <div 
                           className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${heightPercent > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-100'}`}
                           style={{ height: `${heightPercent || 1}%`, minHeight: '4px' }}
                        ></div>
                        
                        {/* Label */}
                        <span className="text-[10px] text-gray-400 mt-2 rotate-0 truncate w-full text-center hidden md:block">{item.label}</span>
                    </div>
                );
            })
         )}
      </div>
    </div>
  );
}
