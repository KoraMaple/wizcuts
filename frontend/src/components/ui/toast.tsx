'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'info' | 'success' | 'warning' | 'destructive';

export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastContextType = {
  toasts: ToastItem[];
  show: (toast: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <Toaster />');
  return ctx;
}

export function toast(toast: Omit<ToastItem, 'id'>) {
  // This is a no-op placeholder for SSR safety; consumers should call useToast().show in components.
  console.warn(
    'toast() called outside of a client component; use useToast().show instead.'
  );
  return '';
}

const variantClasses: Record<ToastVariant, string> = {
  info: 'border-primary-600/40 bg-primary-600/10 text-primary-100',
  success: 'border-success-600/40 bg-success-600/10 text-success-100',
  warning: 'border-warning-600/40 bg-warning-600/10 text-warning-100',
  destructive: 'border-error-600/40 bg-error-600/10 text-error-100',
};

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = React.useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID();
      const duration = t.duration ?? 4000;
      setToasts(prev => [...prev, { id, variant: 'info', ...t }]);
      if (duration > 0 && typeof window !== 'undefined') {
        window.setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = React.useMemo<ToastContextType>(
    () => ({ toasts, show, dismiss }),
    [toasts, show, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 p-4">
        <div className="ml-auto flex w-full max-w-sm flex-col gap-2">
          {toasts.map(t => (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto overflow-hidden rounded-md border p-3 shadow-lg backdrop-blur',
                variantClasses[t.variant ?? 'info']
              )}
              role="status"
            >
              {t.title ? (
                <div className="mb-1 text-sm font-semibold">{t.title}</div>
              ) : null}
              {t.description ? (
                <div className="text-sm opacity-90">{t.description}</div>
              ) : null}
              <button
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="mt-2 text-xs underline-offset-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
