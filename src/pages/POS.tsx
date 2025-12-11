import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { productService } from '../services/productService';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import type { Product, Transaction } from '../types';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // States for Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const { cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

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
            username: user.username,
            total_amount: cartTotal,
            payment_method: paymentMethod,
            cash_received: cashReceived,
            change_amount: cashReceived - cartTotal
        },
        cartItems
      );

      // Create transaction object for receipt
      const transaction: Transaction = {
        id: transactionId,
        user_id: user.id,
        username: user.username,
        total_amount: cartTotal,
        payment_method: paymentMethod,
        cash_received: cashReceived,
        change_amount: cashReceived - cartTotal,
        items: [...cartItems],
        created_at: new Date()
      };

      setLastTransaction(transaction);
      setIsPaymentOpen(false);
      clearCart();
      toast.success("Transaction successful!");

      // Reload products to reflect stock changes
      const data = await productService.getProducts();
      setProducts(data);

    } catch (error) {
      toast.error("Transaction failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = ['All', 'Makan', 'Minum', 'Snack'];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 4rem)', gap: '1.5rem', overflow: 'hidden' }}>
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
      <div style={{ flex: '65%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
        {/* Header / Filter */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                borderRadius: 'var(--border-radius)',
                border: '1px solid #E2E8F0',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'white',
                  color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                  border: '1px solid #E2E8F0',
                  fontWeight: '500'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid - Scrollable */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
          overflowY: 'auto',
          paddingBottom: '1rem',
          paddingRight: '0.5rem' // space for scrollbar
        }}>
          {isLoading ? <p>Loading menu...</p> : filteredProducts.map(product => {
            const isOutOfStock = product.stock_quantity <= 0;
            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.1s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseDown={(e) => {
                   // Adding a gentle active state effect manually since pseudo-class :active is tricky in inline styles
                   e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                   e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                 <div style={{ height: '120px', overflow: 'hidden' }}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                 </div>
                 <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>{product.name}</h3>
                    <p style={{ fontWeight: '700', color: 'var(--primary)' }}>Rp {product.price.toLocaleString()}</p>
                    <p style={{ fontSize: '0.75rem', color: isOutOfStock ? '#E53E3E' : 'var(--text-secondary)' }}>
                       {isOutOfStock ? 'Out of Stock' : `Stock: ${product.stock_quantity}`}
                    </p>
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Cart Panel (35%) */}
      <div style={{
        flex: '35%',
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart /> Current Order
          </h2>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
              <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Cart is empty</p>
              <p style={{ fontSize: '0.875rem' }}>Select items from the left to start</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Rp {item.price.toLocaleString()}</p>
                  </div>

                  {/* Qty Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => item.id && updateQuantity(item.id, -1)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #E2E8F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7FAFC'
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => item.id && updateQuantity(item.id, 1)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #E2E8F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary)', color: 'white'
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => item.id && removeFromCart(item.id)}
                    style={{ background: 'none', border: 'none', color: '#E53E3E', marginLeft: '0.5rem' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Totals */}
        <div style={{ padding: '1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span>Rp {cartTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span>Tax (10%)</span>
            {/* Hardcoded 0 for now as tax logic not explicitly requested, or maybe include logic later */}
            <span>Rp 0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
            <span>Total</span>
            <span>Rp {cartTotal.toLocaleString()}</span>
          </div>

          <button
            disabled={cartItems.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--border-radius)',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: cartItems.length === 0 ? 0.5 : 1,
              cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Charge Rp {cartTotal.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
