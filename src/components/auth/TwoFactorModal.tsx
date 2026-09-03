import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  tempToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  tempToken,
  onClose,
  onSuccess,
}) => {
  const { verify2FA } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);

    try {
      await verify2FA(tempToken, code.trim());
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Mã xác thực không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`max-w-md w-full border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative transition-colors ${
        isDark ? 'bg-[#121824] border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-800'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 text-lg font-bold"
        >
          ✕
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold">Xác Thực 2 Bước (2FA)</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Nhập mã 6 chữ số từ ứng dụng <strong>Google Authenticator</strong> hoặc mã khôi phục
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              autoFocus
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
              placeholder="••••••"
              className={`w-full text-center text-2xl tracking-[0.3em] font-mono py-3 rounded-xl border focus:outline-none ${
                isDark
                  ? 'bg-slate-900 border-amber-500/40 text-amber-300 focus:border-amber-400'
                  : 'bg-amber-50/50 border-amber-300 text-stone-900 focus:border-amber-500'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length < 6}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs sm:text-sm shadow-md hover:brightness-105 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? 'Đang xác minh...' : 'Xác Nhận & Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};
