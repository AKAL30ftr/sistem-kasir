import { useEffect, useState } from 'react';
import { WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { offlineService } from '../services/offlineService';
import toast from 'react-hot-toast';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(offlineService.getQueueCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      if (offlineService.getQueueCount() > 0) {
        setIsSyncing(true);
        try {
          const result = await offlineService.syncQueue();
          if (result.synced > 0) {
            toast.success(`Synced ${result.synced} offline transaction(s)`);
          }
          if (result.failed > 0) {
            toast.error(`Failed to sync ${result.failed} transaction(s)`);
          }
        } catch (error) {
          toast.error('Failed to sync offline transactions');
        } finally {
          setIsSyncing(false);
          setQueueCount(offlineService.getQueueCount());
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast('You are offline. Transactions will be queued.', { icon: '📴' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Refresh queue count periodically
    const interval = setInterval(() => {
      setQueueCount(offlineService.getQueueCount());
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Manual sync button handler
  const handleManualSync = async () => {
    if (!isOnline || queueCount === 0) return;
    
    setIsSyncing(true);
    try {
      const result = await offlineService.syncQueue();
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} transaction(s)`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} transaction(s)`);
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
      setQueueCount(offlineService.getQueueCount());
    }
  };

  // Don't show anything if online and no queue
  if (isOnline && queueCount === 0) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
      isOnline 
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
        : 'bg-red-100 text-red-800 border border-red-300'
    }`}>
      {isOnline ? (
        <>
          <CloudOff size={18} />
          <span className="text-sm font-medium">{queueCount} pending sync</span>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="ml-2 p-1 hover:bg-yellow-200 rounded transition"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          </button>
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span className="text-sm font-medium">
            Offline {queueCount > 0 && `• ${queueCount} queued`}
          </span>
        </>
      )}
    </div>
  );
}
