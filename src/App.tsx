import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Eager load Login (needed immediately)
import Login from './pages/Login';

// Lazy load other pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const POS = lazy(() => import('./pages/POS'));
const History = lazy(() => import('./pages/History'));
const Reports = lazy(() => import('./pages/Reports'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/pos" element={<POS />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/reports" element={<Reports />} />
                </Route>
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
