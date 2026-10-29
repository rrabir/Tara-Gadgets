import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  CheckCircle2,
  ShoppingBag,
  Truck,
  Heart,
  SlidersHorizontal,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'cart' | 'order' | 'wishlist';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  imageUrl?: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number; // ms, defaults to 4000
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, options?: Partial<ToastItem>) => string;
  cart: (title: string, message?: string, imageUrl?: string, onAction?: () => void) => string;
  order: (title: string, message?: string, onAction?: () => void) => string;
  info: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { ...toast, id };

      setToasts((prev) => {
        // Limit max concurrent toasts to 4
        const updated = [...prev, newToast];
        if (updated.length > 4) {
          return updated.slice(updated.length - 4);
        }
        return updated;
      });

      const duration = toast.duration ?? 4500;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string, options?: Partial<ToastItem>) => {
      return showToast({ type: 'success', title, message, ...options });
    },
    [showToast]
  );

  const cart = useCallback(
    (title: string, message?: string, imageUrl?: string, onAction?: () => void) => {
      return showToast({
        type: 'cart',
        title,
        message,
        imageUrl,
        actionText: 'View Cart',
        onAction
      });
    },
    [showToast]
  );

  const order = useCallback(
    (title: string, message?: string, onAction?: () => void) => {
      return showToast({
        type: 'order',
        title,
        message,
        actionText: 'Track Status',
        onAction,
        duration: 6000
      });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      return showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      return showToast({ type: 'error', title, message, duration: 6000 });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        cart,
        order,
        info,
        error
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Internal Toast Container Component
interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed bottom-4 right-4 z-60 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onRemove: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'cart':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'order':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'wishlist':
        return <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="pointer-events-auto bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-2 duration-200">
      {/* Thumbnail or Icon */}
      {toast.imageUrl ? (
        <img
          src={toast.imageUrl}
          alt="Product thumbnail"
          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0 mt-0.5"
        />
      ) : (
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
          {getIcon()}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
          {toast.title}
        </div>
        {toast.message && (
          <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
            {toast.message}
          </div>
        )}

        {/* Action button if any */}
        {toast.actionText && toast.onAction && (
          <button
            onClick={() => {
              toast.onAction?.();
              onRemove();
            }}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2 mt-1.5 inline-block cursor-pointer"
          >
            {toast.actionText} →
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={onRemove}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
