import { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { BarChart, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    count: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [productsCount, setProductsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todayData = await reportService.getTodayStats();
        setStats({
          totalSales: todayData.totalSales,
          count: todayData.count
        });

        const allProducts = await productService.getProducts();
        setProductsCount(allProducts.length);

        const lowStock = allProducts.filter(p => p.stock_quantity <= (p.daily_capacity * 0.2));
        setLowStockProducts(lowStock);

      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1.5rem' }}>Dashboard</h2>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Sales (Today)</p>
               <p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem', color: 'var(--primary)' }}>
                 Rp {stats.totalSales.toLocaleString()}
               </p>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#FFF5F2', borderRadius: '50%', color: 'var(--primary)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Transactions</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>{stats.count}</p>
             </div>
             <div style={{ padding: '0.75rem', backgroundColor: '#F0FFF4', borderRadius: '50%', color: '#38A169' }}>
               <BarChart size={24} />
             </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Products</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>{productsCount}</p>
             </div>
             <div style={{ padding: '0.75rem', backgroundColor: '#EBF8FF', borderRadius: '50%', color: '#3182CE' }}>
               <ShoppingBag size={24} />
             </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      {lowStockProducts.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFF5F5' }}>
            <AlertTriangle size={20} color="#E53E3E" />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#E53E3E' }}>Low Stock Alert</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ paddingBottom: '0.5rem' }}>Product</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Current Stock</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Capacity</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.75rem 0' }}>{p.name}</td>
                    <td style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>{p.stock_quantity}</td>
                    <td style={{ padding: '0.75rem 0' }}>{p.daily_capacity}</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <span style={{ backgroundColor: '#FED7D7', color: '#C53030', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                        Low
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
