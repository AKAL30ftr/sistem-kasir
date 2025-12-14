import { X, Play, Trash2, Clock, ShoppingBag } from 'lucide-react';
import type { ParkedOrder } from '../../types';

interface ParkedOrdersModalProps {
  isOpen: boolean;
  orders: ParkedOrder[];
  onClose: () => void;
  onResume: (parkId: string) => void;
  onDelete: (parkId: string) => void;
}

export function ParkedOrdersModal({ 
  isOpen, 
  orders, 
  onClose, 
  onResume, 
  onDelete 
}: ParkedOrdersModalProps) {
  if (!isOpen) return null;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Parked Orders</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Order List */}
        <div className="flex-1 overflow-y-auto p-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <ShoppingBag size={48} className="mb-4 opacity-30" />
              <p>No parked orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-blue-200 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        Parked at {formatTime(order.parkedAt)}
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        Rp {order.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onResume(order.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        <Play size={14} /> Resume
                      </button>
                      <button
                        onClick={() => onDelete(order.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Items preview */}
                  <div className="text-sm text-gray-600">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span key={idx}>
                        {item.quantity}x {item.name}
                        {idx < Math.min(order.items.length, 3) - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-gray-400"> +{order.items.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
