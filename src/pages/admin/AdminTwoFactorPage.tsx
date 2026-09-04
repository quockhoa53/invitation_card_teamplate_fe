import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Setup2FAResponse } from '../../types';
import { Mail, CheckCircle, AlertCircle, Copy, Check, RefreshCw, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface AdminTwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminTwoFactorModal: React.FC<AdminTwoFactorModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();
  const isDark = theme === 'dark';

  const [setupData, setSetupData] = useState<Setup2FAResponse | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showTotpAdvanced, setShowTotpAdvanced] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(60);
    const fetchSetup = async () => {
      try {
        const res = await api.setup2FA();
        if (res.success && res.data) {
          setSetupData(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể khởi tạo mã xác thực');
      }
    };
    fetchSetup();

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);

    try {
      const res = await api.enable2FA(code.trim());
      if (res.success) {
        setSuccess(true);
        refreshUser();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (countdown > 0 || resending) return;
    setError('');
    setResending(true);
    setResendSuccess(false);

    try {
      await api.sendEmailOtp();
      setResendSuccess(true);
      setCountdown(60);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã OTP');
    } finally {
      setResending(false);
    }
  };

  const handleCopySecret = () => {
    if (setupData?.secretKey) {
      navigator.clipboard.writeText(setupData.secretKey);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`max-w-md w-full border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-[#121824] border-orange-500/30 text-slate-100' : 'bg-white border-orange-200 text-stone-800'
      }`}>
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-orange-500 font-bold">
          ✕
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 text-orange-500 border border-orange-500/30 flex items-center justify-center mx-auto shadow-inner">
            <Mail className="w-7 h-7" />
          </div>
          <h3 className="font-editorial text-2xl font-bold">Bảo Mật 2 Bước Qua Gmail</h3>
          <p className={`text-xs max-w-xs mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Mã OTP xác thực đã được gửi tới hòm thư <strong>{user?.email || 'Gmail của bạn'}</strong>.
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
            <Check className="w-4 h-4 shrink-0" />
            <span>Đã gửi mã OTP mới vào Gmail của bạn!</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="font-editorial text-2xl font-bold">Kích Hoạt Thành Công!</h4>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
              Từ bây giờ, mỗi lần đăng nhập hệ thống sẽ tự động gửi mã xác thực 6 số an toàn về Gmail của bạn.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Hoàn Tất
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleVerifyAndEnable} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-2 text-center ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                  Nhập mã xác thực 6 số từ hộp thư Gmail:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className={`w-full text-center text-3xl tracking-[0.35em] font-mono py-3 rounded-2xl border focus:outline-none transition ${
                    isDark
                      ? 'bg-slate-900 border-orange-500/40 text-orange-300 focus:border-orange-400'
                      : 'bg-orange-50/50 border-orange-300 text-stone-900 focus:border-orange-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.trim().length < 6}
                className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-50"
              >
                {loading ? 'Đang kích hoạt...' : 'Kích Hoạt Bảo Mật 2FA'}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
              <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>
                Chưa nhận được mã?
              </span>
              <button
                onClick={handleResendEmailOtp}
                disabled={countdown > 0 || resending}
                className="font-bold text-orange-500 hover:text-orange-400 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-1 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {countdown > 0 ? `Gửi lại sau (${countdown}s)` : 'Gửi lại mã OTP'}
              </button>
            </div>

            {/* Advanced Toggle: Google Authenticator */}
            {setupData && (
              <div className="pt-2 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setShowTotpAdvanced(!showTotpAdvanced)}
                  className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-between transition ${
                    isDark ? 'bg-slate-900/60 text-slate-400 hover:text-white' : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tùy chọn nâng cao: Quét mã QR app Google Authenticator</span>
                  </span>
                  {showTotpAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showTotpAdvanced && (
                  <div className={`mt-3 p-4 rounded-2xl border space-y-3 text-center animate-fadeIn ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="p-2.5 bg-white rounded-xl inline-block shadow border border-stone-200">
                      <img src={setupData.qrCodeBase64} alt="2FA QR" className="w-36 h-36 object-contain mx-auto" />
                    </div>

                    <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                      Khóa bí mật:
                      <div className={`mt-1 flex items-center justify-center gap-2 font-mono font-bold text-amber-500 px-3 py-1 rounded-lg border ${
                        isDark ? 'bg-slate-950 border-slate-700' : 'bg-white border-stone-200'
                      }`}>
                        <span>{setupData.secretKey}</span>
                        <button onClick={handleCopySecret} className="text-slate-400 hover:text-slate-200">
                          {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
