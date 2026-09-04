import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Mail, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

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
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (!isOpen) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, tempToken]);

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
      setError(err.response?.data?.message || err.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setError('');
    setResending(true);
    setResendSuccess(false);

    try {
      await api.resend2FAEmailOtp(tempToken);
      setResendSuccess(true);
      setCountdown(60);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`max-w-md w-full border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative transition-colors ${
        isDark ? 'bg-[#121824] border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-800'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-orange-500 text-lg font-bold"
        >
          ✕
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 text-orange-500 border border-orange-500/30 flex items-center justify-center mx-auto shadow-inner">
            <Mail className="w-7 h-7" />
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold">Xác Thực 2 Bước (2FA)</h3>
          <p className={`text-xs max-w-xs mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Nhập mã xác thực 6 số gửi về <strong>Gmail</strong> hoặc từ ứng dụng <strong>Google Authenticator</strong> của bạn.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Mã xác thực mới đã được gửi tới Gmail của bạn!</span>
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
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className={`w-full text-center text-3xl tracking-[0.35em] font-mono py-3.5 rounded-2xl border focus:outline-none transition ${
                isDark
                  ? 'bg-slate-900 border-orange-500/40 text-orange-300 focus:border-orange-400'
                  : 'bg-orange-50/50 border-orange-300 text-stone-900 focus:border-orange-500'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length < 6}
            className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? 'Đang xác minh...' : 'Xác Nhận & Đăng Nhập'}
          </button>
        </form>

        {/* Resend OTP Action */}
        <div className="text-center pt-1 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>
            Chưa nhận được mã?
          </span>
          <button
            onClick={handleResendOtp}
            disabled={countdown > 0 || resending}
            className="font-bold text-orange-500 hover:text-orange-400 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-1 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {countdown > 0 ? `Gửi lại sau (${countdown}s)` : 'Gửi lại mã OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};
