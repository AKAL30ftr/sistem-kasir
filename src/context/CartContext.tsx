import { createContext, useContext, useState, type ReactNode, useMemo, useCallback } from 'react';
import type { Product, CartItem, ParkedOrder } from '../types';
import toast from 'react-hot-toast';

const PARKED_ORDERS_KEY = 'pos_parked_orders';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (itemsKw: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  totalItems: number;
  // Park/Resume functions
  parkOrder: () => string | null;
  getParkedOrders: () => ParkedOrder[];
  resumeOrder: (parkId: string) => void;
  deleteParkedOrder: (parkId: string) => void;
  parkedOrderCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [parkedOrderCount, setParkedOrderCount] = useState(() => {
    try {
      const stored = localStorage.getItem(PARKED_ORDERS_KEY);
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  });

  const addToCart = (product: Product) => {
    if (!product.id) return;
    if (product.stock_quantity <= 0) {
      toast.error('Item is out of stock!');
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);

      if (existing) {
        if (existing.quantity + 1 > product.stock_quantity) {
          toast.error(`Only ${product.stock_quantity} available in stock!`);
          return prev;
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      toast.success('Added to cart');
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return { ...item, quantity: 0 };
          if (newQty > item.stock_quantity) {
            toast.error(`Cannot exceed stock (${item.stock_quantity})`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // === PARK/RESUME FUNCTIONS ===

  const getParkedOrders = useCallback((): ParkedOrder[] => {
    try {
      const stored = localStorage.getItem(PARKED_ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const parkOrder = useCallback((): string | null => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return null;
    }

    const parkId = `park_${Date.now()}`;
    const parkedOrder: ParkedOrder = {
      id: parkId,
      items: [...cartItems],
      total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      parkedAt: new Date().toISOString()
    };

    const existing = getParkedOrders();
    const updated = [...existing, parkedOrder];
    localStorage.setItem(PARKED_ORDERS_KEY, JSON.stringify(updated));
    
    setCartItems([]);
    setParkedOrderCount(updated.length);
    toast.success('Order parked');
    return parkId;
  }, [cartItems, getParkedOrders]);

  const resumeOrder = useCallback((parkId: string) => {
    const orders = getParkedOrders();
    const order = orders.find(o => o.id === parkId);
    
    if (!order) {
      toast.error('Parked order not found');
      return;
    }

    // If cart has items, ask to merge or replace (for now, replace)
    if (cartItems.length > 0) {
      // Simple replace for MVP
      toast('Replacing current cart with parked order', { icon: '🔄' });
    }

    setCartItems(order.items);
    
    // Remove from parked
    const remaining = orders.filter(o => o.id !== parkId);
    localStorage.setItem(PARKED_ORDERS_KEY, JSON.stringify(remaining));
    setParkedOrderCount(remaining.length);
    toast.success('Order resumed');
  }, [cartItems, getParkedOrders]);

  const deleteParkedOrder = useCallback((parkId: string) => {
    const orders = getParkedOrders();
    const remaining = orders.filter(o => o.id !== parkId);
    localStorage.setItem(PARKED_ORDERS_KEY, JSON.stringify(remaining));
    setParkedOrderCount(remaining.length);
    toast.success('Parked order deleted');
  }, [getParkedOrders]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      totalItems,
      parkOrder,
      getParkedOrders,
      resumeOrder,
      deleteParkedOrder,
      parkedOrderCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
