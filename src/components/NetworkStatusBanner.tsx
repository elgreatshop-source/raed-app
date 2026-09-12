import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface NetworkStatusBannerProps {
  onRetryConnection?: () => Promise<boolean> | void;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ onRetryConnection }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      const timer = setTimeout(() => setShowRestoredNotice(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      if (onRetryConnection) {
        await onRetryConnection();
      } else {
        // Quick ping to health API or lightweight endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          setIsOnline(true);
          setShowRestoredNotice(true);
          setTimeout(() => setShowRestoredNotice(false), 3500);
        }
      }
    } catch (e) {
      setIsOnline(navigator.onLine);
    } finally {
      setIsChecking(false);
    }
  };

  if (showRestoredNotice) {
    return (
      <div
        id="network-restored-banner"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-auto sm:min-w-[340px] max-w-lg bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-400 flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300"
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>تم استعادة الاتصال بالإنترنت بنجاح! التطبيق جاهز للمزامنة.</span>
        </div>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div
      id="network-offline-banner"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-auto sm:min-w-[380px] max-w-xl bg-amber-950/95 backdrop-blur-md text-amber-100 px-4 py-3 rounded-2xl shadow-2xl border border-amber-600/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300"
      dir="rtl"
    >
      <div className="flex items-center gap-2.5 text-right w-full sm:w-auto">
        <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div>
          <div className="text-white text-xs font-black">لا يوجد اتصال بالإنترنت</div>
          <div className="text-[11px] text-amber-200/90 font-medium">
            تحقق من الاتصال وحاول مرة أخرى. (محتواك وتعديلاتك محفوظة محلياً)
          </div>
        </div>
      </div>

      <button
        type="button"
        id="btn-retry-network"
        onClick={handleManualCheck}
        disabled={isChecking}
        className="w-full sm:w-auto px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-amber-950 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
        <span>{isChecking ? 'جاري التحقق...' : 'إعادة المحاولة'}</span>
      </button>
    </div>
  );
};
