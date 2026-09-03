import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X, 
  HelpCircle 
} from 'lucide-react';
import { useTheme } from './ThemeContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextType {
  toast: {
    success: (message: string, description?: string, duration?: number) => void;
    error: (message: string, description?: string, duration?: number) => void;
    info: (message: string, description?: string, duration?: number) => void;
    warning: (message: string, description?: string, duration?: number) => void;
  };
  confirmModal: (options: ConfirmDialogOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const addToast = useCallback((type: ToastType, message: string, description?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, description, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirmModal = useCallback((options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    try {
      setConfirmLoading(true);
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelAction = () => {
    if (confirmDialog?.onCancel) {
      confirmDialog.onCancel();
    }
    setConfirmDialog(null);
  };

  const toastMethods = {
    success: (msg: string, desc?: string, dur?: number) => addToast('success', msg, desc, dur),
    error: (msg: string, desc?: string, dur?: number) => addToast('error', msg, desc, dur),
    info: (msg: string, desc?: string, dur?: number) => addToast('info', msg, desc, dur),
    warning: (msg: string, desc?: string, dur?: number) => addToast('warning', msg, desc, dur),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods, confirmModal }}>
      {children}

      {/* FLOATING TOASTS CONTAINER (Top Right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
        <AnimatePresence>
          {toasts.map((t) => {
            const isSuccess = t.type === 'success';
            const isError = t.type === 'error';
            const isWarning = t.type === 'warning';

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`pointer-events-auto rounded-2xl p-4 shadow-2xl backdrop-blur-xl border flex items-start gap-3 relative overflow-hidden transition-all ${
                  isDark
                    ? 'bg-[#131b2a]/95 border-slate-800/90 text-white shadow-black/60'
                    : 'bg-white/95 border-stone-200 text-stone-900 shadow-stone-400/40'
                } ${
                  isSuccess ? 'border-emerald-500/40' :
                  isError ? 'border-rose-500/40' :
                  isWarning ? 'border-amber-500/40' : 'border-sky-500/40'
                }`}
              >
                {/* Type Icon */}
                <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                  isSuccess ? 'bg-emerald-500/15 text-emerald-400' :
                  isError ? 'bg-rose-500/15 text-rose-400' :
                  isWarning ? 'bg-amber-500/15 text-amber-400' : 'bg-sky-500/15 text-sky-400'
                }`}>
                  {isSuccess && <CheckCircle2 className="w-5 h-5" />}
                  {isError && <AlertCircle className="w-5 h-5" />}
                  {isWarning && <AlertTriangle className="w-5 h-5" />}
                  {t.type === 'info' && <Info className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 pr-4">
                  <h4 className="text-xs font-bold leading-tight">{t.message}</h4>
                  {t.description && (
                    <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                      {t.description}
                    </p>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className={`p-1 rounded-lg transition hover:bg-slate-700/30 ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-stone-400 hover:text-stone-800'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Bottom Auto-Dismiss Progress Bar */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: (t.duration || 4000) / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[2.5px] ${
                    isSuccess ? 'bg-emerald-500' :
                    isError ? 'bg-rose-500' :
                    isWarning ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* CONFIRMATION DIALOG MODAL (Clean, Modern Glassmorphism) */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`max-w-md w-full rounded-3xl p-6 shadow-2xl border ${
                isDark ? 'bg-[#121824] border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmDialog.type === 'danger'
                    ? 'bg-rose-500/15 text-rose-500'
                    : confirmDialog.type === 'warning'
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-indigo-500/15 text-indigo-500'
                }`}>
                  {confirmDialog.type === 'danger' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : confirmDialog.type === 'warning' ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : (
                    <HelpCircle className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold font-editorial">{confirmDialog.title}</h3>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                    Xác nhận hành động hệ thống
                  </span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed mb-6 whitespace-pre-line ${
                isDark ? 'text-slate-300' : 'text-stone-600'
              }`}>
                {confirmDialog.message}
              </p>

              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  disabled={confirmLoading}
                  onClick={handleCancelAction}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {confirmDialog.cancelText || 'Hủy Bỏ'}
                </button>

                <button
                  type="button"
                  disabled={confirmLoading}
                  onClick={handleConfirmAction}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5 ${
                    confirmDialog.type === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                      : confirmDialog.type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  }`}
                >
                  {confirmLoading ? 'Đang xử lý...' : confirmDialog.confirmText || 'Xác Nhận'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
