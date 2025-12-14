
import { useEffect, useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, AlertCircle, Pause, Clock } from 'lucide-react';
import { productService } from '../services/productService';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import type { Product, Transaction } from '../types';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import { CategoryTabs } from '../components/pos/CategoryTabs';
import { SearchBar } from '../components/pos/SearchBar';
import { useHotkeys } from '../hooks/useHotkeys';
import { ParkedOrdersModal } from '../components/modals/ParkedOrdersModal';

import { shiftService } from '../services/shiftService';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [currentShiftId, setCurrentShiftId] = useState<string | undefined>(undefined);

  // States for Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isParkedOrdersOpen, setIsParkedOrdersOpen] = useState(false);
  
  // Order notes state
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const { cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart, parkOrder, getParkedOrders, resumeOrder, deleteParkedOrder, parkedOrderCount } = useCart();
  const { user } = useAuth();
  
  // Shortcuts
  useHotkeys([
    { key: 'F1', action: () => document.getElementById('search-input')?.focus() },
    { key: 'F2', action: () => { if (cartItems.length > 0) setIsPaymentOpen(true); } },
    { key: 'Escape', action: () => { setIsPaymentOpen(false); setLastTransaction(null); } }
  ]);

  useEffect(() => {
    loadProducts();
    if (user) loadShift();
  }, [user]);

  const loadShift = async () => {
    try {
        if (!user) return;
        const shift = await shiftService.getCurrentShift(user.id);
        if (shift) setCurrentShiftId(shift.id);
    } catch (e) {
        console.error("Error loading shift", e);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = products;
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  // Extract unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  const handlePaymentComplete = async (paymentMethod: 'CASH' | 'QRIS', cashReceived: number) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsProcessing(true);
      const transactionId = await transactionService.createTransaction(
        {
            user_id: user.id,
            shift_id: currentShiftId,
            username: user.username,
            total_amount: cartTotal,
            payment_method: paymentMethod,
            cash_received: cashReceived,
            change_amount: cashReceived - cartTotal,
            customer_name: customerName || undefined,
            notes: orderNotes || undefined
        },
        cartItems
      );

      const transaction: Transaction = {
        id: transactionId,
        user_id: user.id,
        username: user.username,
        total_amount: cartTotal,
        payment_method: paymentMethod,
        cash_received: cashReceived,
        change_amount: cashReceived - cartTotal,
        items: [...cartItems],
        created_at: new Date().toISOString(),
        customer_name: customerName || undefined,
        notes: orderNotes || undefined
      };

      setLastTransaction(transaction);
      setIsPaymentOpen(false);
      clearCart();
      setCustomerName('');
      setOrderNotes('');
      toast.success("Transaction successful!");
      loadProducts(); // Reload stock
    } catch (error) {
      toast.error("Transaction failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // SHIFT LOCK: Block POS if no active shift
  if (!isLoading && !currentShiftId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Shift Belum Dimulai</h2>
          <p className="text-gray-600 mb-6">
            Anda harus memulai shift terlebih dahulu sebelum dapat melayani transaksi.
            Silakan ke Dashboard untuk memulai shift.
          </p>
          <button
            onClick={() => window.location.hash = '#/'}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex h-[calc(100vh-4rem)] gap-6 overflow-hidden">
      {/* Modals */}
      {isPaymentOpen && (
        <PaymentModal
          total={cartTotal}
          onClose={() => setIsPaymentOpen(false)}
          onComplete={handlePaymentComplete}
          isLoading={isProcessing}
        />
      )}

      {lastTransaction && (
        <ReceiptModal
          transaction={lastTransaction}
          onClose={() => setLastTransaction(null)}
        />
      )}

      {/* LEFT COLUMN: Product Selector (65%) */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden w-[65%]">
        {/* Header / Filter */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="flex-none">
             {/* We can limit max categories shown or scroll */}
          </div>
        </div>
        
        <CategoryTabs 
            categories={categories} 
            activeCategory={selectedCategory} 
            onSelect={setSelectedCategory} 
        />

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-2">
          {isLoading ? (
             <div className="col-span-full text-center py-10 text-gray-500">Loading menu...</div>
          ) : filteredProducts.length === 0 ? (
             <div className="col-span-full text-center py-10 text-gray-500">No products found</div>
          ) : (
             filteredProducts.map(product => {
                const isOutOfStock = product.stock_quantity <= 0;
                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all active:scale-95 cursor-pointer ${
                        isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-md'
                    }`}
                  >
                     <div className="h-32 overflow-hidden relative">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-bold bg-red-600 px-3 py-1 rounded-full text-sm">HABIS</span>
                            </div>
                        )}
                        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-0.5 rounded text-xs font-bold text-gray-700">
                             Stok: {product.stock_quantity}
                        </div>
                     </div>
                     <div className="p-3 flex flex-col gap-1 flex-1">
                        <h3 className="font-semibold text-gray-800 line-clamp-1" title={product.name}>{product.name}</h3>
                        <p className="font-bold text-blue-600">Rp {product.price.toLocaleString()}</p>
                     </div>
                  </div>
                );
             })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Cart Panel (35%) */}
      <div className="w-[35%] bg-white rounded-lg shadow-md flex flex-col overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
            <ShoppingCart size={20} /> Current Order
          </h2>
          {parkedOrderCount > 0 && (
            <button
              onClick={() => setIsParkedOrdersOpen(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <Clock size={16} /> Parked ({parkedOrderCount})
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>Keranjang kosong</p>
              <p className="text-sm">Pilih menu di sebelah kiri</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 items-center bg-white p-2 rounded-lg border border-gray-50 hover:border-blue-100 transition-colors">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-14 h-14 rounded-md object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h4>
                  <p className="text-sm text-gray-500">Rp {item.price.toLocaleString()}</p>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => item.id && updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-md flex items-center justify-center bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => item.id && updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    disabled={item.quantity >= item.stock_quantity}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => item.id && removeFromCart(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
           {cartItems.length > 0 && cartItems.some(i => i.quantity >= i.stock_quantity) && (
               <div className="mb-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                   <AlertCircle size={14} />
                   Beberapa item mencapai batas stok
               </div>
           )}
        
          <div className="space-y-3 mb-4">
            {/* Customer Name */}
            <input
              type="text"
              placeholder="Nama customer (opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {/* Order Notes */}
            <input
              type="text"
              placeholder="Catatan order (opsional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
          <div className="flex justify-between mb-4 text-sm text-gray-600">
            <span>Subtotal</span>
            <span>Rp {cartTotal.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between mb-6 text-xl font-bold text-gray-800">
            <span>Total</span>
            <span>Rp {cartTotal.toLocaleString()}</span>
          </div>

          <div className="flex gap-2">
            {/* Hold Order Button */}
            <button
              disabled={cartItems.length === 0}
              onClick={() => parkOrder()}
              className={`flex-1 py-4 rounded-xl font-bold text-lg border-2 transition-transform transform active:scale-[0.98] ${
                  cartItems.length === 0 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-orange-500 text-orange-500 hover:bg-orange-50'
              }`}
            >
              <Pause size={18} className="inline mr-2" />Hold
            </button>
            
            {/* Pay Button */}
            <button
              disabled={cartItems.length === 0}
              onClick={() => setIsPaymentOpen(true)}
              className={`flex-[2] py-4 rounded-xl font-bold text-lg shadow-lg transition-transform transform active:scale-[0.98] ${
                  cartItems.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
              }`}
            >
              Bayar Rp {cartTotal.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Parked Orders Modal */}
    <ParkedOrdersModal
      isOpen={isParkedOrdersOpen}
      orders={getParkedOrders()}
      onClose={() => setIsParkedOrdersOpen(false)}
      onResume={(id) => { resumeOrder(id); setIsParkedOrdersOpen(false); }}
      onDelete={deleteParkedOrder}
    />
    </>
  );
}
