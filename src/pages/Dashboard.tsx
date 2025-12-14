
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { shiftService } from '../services/shiftService';
import { reportService } from '../services/reportService';
import { productService } from '../services/productService';
import type { Shift } from '../types';
import toast from 'react-hot-toast';
import { PlusCircle, Package, FileBarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Components
import { ShiftBanner } from '../components/ShiftBanner';
import { NoShiftView } from '../components/dashboard/NoShiftView';
import { CashDrawerCard } from '../components/dashboard/CashDrawerCard';
import { PerformanceCard } from '../components/dashboard/PerformanceCard';
import { AlertCard } from '../components/dashboard/AlertCard';

import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { PopularProductsCard } from '../components/dashboard/PopularProductsCard';
import { SalesChartCard } from '../components/dashboard/SalesChartCard';

// Modals
import { StartShiftModal } from '../components/modals/StartShiftModal';
import { EndShiftModal } from '../components/modals/EndShiftModal';
import { PettyCashModal } from '../components/modals/PettyCashModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { parkedOrderCount } = useCart();
  const navigate = useNavigate();
  
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ModalsState
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPettyModal, setShowPettyModal] = useState(false);

  // Data State
  const [todayStats, setTodayStats] = useState({ totalSales: 0, count: 0 });
  const [shiftStats, setShiftStats] = useState({ totalSales: 0, count: 0, cashTotal: 0 }); // NEW STATE
  const [yesterdaySales, setYesterdaySales] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Effect 1: Core Data & Initial Shift Check
  useEffect(() => {
    const fetchGlobalData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // 1. Get Shift
        const shift = await shiftService.getCurrentShift(user.id);
        setCurrentShift(shift);
  
        // 2. Fetch Global Data Parallel
        const [stats, comparison, products] = await Promise.all([
             reportService.getTodayStats(),
             reportService.getDailyComparison(),
             productService.getProducts()
        ]);

        setTodayStats(stats);
        setYesterdaySales(comparison.yesterdaySales);
        
        const lowStock = products.filter(p => p.stock_quantity <= (p.daily_capacity * 0.2));
        setLowStockCount(lowStock.length);
  
      } catch (error) {
         console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGlobalData();
  }, [user]);

  // Effect 2: Shift Specific Stats (Runs whenever currentShift changes)
  useEffect(() => {
    const fetchShiftStats = async () => {
        if (currentShift) {
            try {
                const sStats = await reportService.getShiftStats(currentShift.id);
                setShiftStats(sStats);
            } catch (error) {
                console.error("Failed to fetch shift stats", error);
            }
        } else {
            // Reset if no shift
            setShiftStats({ totalSales: 0, count: 0, cashTotal: 0 });
        }
    };
    
    fetchShiftStats();
  }, [currentShift]);

  const handleStartShift = async (amount: number) => {
    if (!user) return;
    try {
      const newShift = await shiftService.startShift(user.id, amount);
      setCurrentShift(newShift);
      setShowStartModal(false);
      toast.success('Shift berhasil dimulai!');
    } catch (error: any) {
      toast.error('Gagal: ' + (error.message || 'Unknown error'));
      console.error('Start Shift Error:', error);
    }
  };

  const handleEndShift = async (actualCash: number, note: string) => {
    if (!currentShift) return;
    try {
      await shiftService.endShift(currentShift.id, actualCash, note);
      setCurrentShift(null);
      setShowEndModal(false);
      toast.success('Shift berakhir.');
    } catch (error) {
      toast.error('Gagal mengakhiri shift');
      console.error(error);
    }
  };

  const handlePettyCash = async (amount: number, type: 'CASH_IN' | 'CASH_OUT', reason: string) => {
    if (!currentShift || !user) return;
    try {
      await shiftService.addPettyCash(currentShift.id, user.id, amount, type, reason);
      setShowPettyModal(false);
      toast.success('Kas kecil tercatat');
    } catch (error) {
      toast.error('Gagal mencatat kas kecil');
      console.error(error);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header & Banner */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 pt-6 mb-4">
             <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
             
             {/* Quick Actions (Only if shift open) */}
             {currentShift && (
                 <div className="flex gap-3 mt-4 md:mt-0">
                     <button onClick={() => navigate('/pos')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm font-medium">
                         <PlusCircle size={18} /> New Order
                     </button>
                     <button onClick={() => navigate('/products')} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
                         <Package size={18} /> Manage Stock
                     </button>
                     <button onClick={() => navigate('/reports')} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
                         <FileBarChart size={18} /> Reports
                     </button>
                 </div>
             )}
        </div>

        <ShiftBanner 
          shift={currentShift} 
          onOpenPettyCash={() => setShowPettyModal(true)}
          onEndShift={() => {
            // Check for parked orders before allowing end shift
            if (parkedOrderCount > 0) {
              toast.error(`Masih ada ${parkedOrderCount} order yang di-hold. Selesaikan atau hapus terlebih dahulu.`);
              return;
            }
            setShowEndModal(true);
          }}
        />
      </div>

      <div className="px-6 max-w-[1600px] mx-auto">
        {/* 2. Main Content */}
        {!currentShift ? (
          <NoShiftView onStartShift={() => setShowStartModal(true)} />
        ) : (
          <div className="space-y-6">
            {/* ROW 1: Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PerformanceCard 
                  sales={todayStats.totalSales}
                  yesterdaySales={yesterdaySales}
                  transactions={todayStats.count} 
                />
                <CashDrawerCard 
                  startCash={currentShift.start_cash} 
                  expectedCash={currentShift.start_cash + shiftStats.cashTotal} // CORRECTED: Uses Shift Cash Sales only
                />
                <AlertCard 
                  lowStockCount={lowStockCount} 
                />
            </div>

            {/* ROW 2: Chart (Full Width) */}
            <div className="w-full h-[300px]">
                <SalesChartCard />
            </div>

            {/* ROW 3: Dense Data Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-auto items-stretch">
                {/* Main: Recent Transactions (Takes up more space if needed, or equal) */}
                <div className="xl:col-span-1 h-full">
                     <RecentTransactionsCard />
                </div>

                {/* Middle: Popular Products */}
                <div className="xl:col-span-1 h-full">
                     <PopularProductsCard />
                </div>


            </div>
          </div>
        )}
      </div>

      {/* 3. Modals */}
      <StartShiftModal 
        isOpen={showStartModal} 
        onClose={() => setShowStartModal(false)} 
        onConfirm={handleStartShift} 
      />
      
      {currentShift && (
        <EndShiftModal 
          isOpen={showEndModal} 
          onClose={() => setShowEndModal(false)} 
          onConfirm={handleEndShift}
          expectedCash={currentShift.start_cash + shiftStats.cashTotal}
        />
      )}

      <PettyCashModal 
        isOpen={showPettyModal} 
        onClose={() => setShowPettyModal(false)} 
        onConfirm={handlePettyCash} 
      />
    </div>
  );
}
