import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Setup2FAResponse } from '../../types';
import { ShieldCheck, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';

interface AdminTwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminTwoFactorModal: React.FC<AdminTwoFactorModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [setupData, setSetupData] = useState<Setup2FAResponse | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchSetup = async () => {
      try {
        const res = await api.setup2FA();
        if (res.success && res.data) {
          setSetupData(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể khởi tạo 2FA');
      }
    };
    fetchSetup();
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
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác thực không hợp lệ. Vui lòng kiểm tra lại Google Authenticator.');
    } finally {
      setLoading(false);
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
      <div className={`max-w-lg w-full border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-[#121824] border-amber-500/40 text-slate-100' : 'bg-white border-amber-300 text-stone-800'
      }`}>
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 font-bold">
          ✕
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-2xl font-bold">Thiết Lập Google Authenticator (2FA)</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Tăng cường bảo mật tối đa cho tài khoản quản trị và chống truy cập trái phép
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="font-editorial text-2xl font-bold">2FA Đã Được Kích Hoạt Thành Công!</h4>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
              Mỗi lần đăng nhập vào trang Admin, hệ thống sẽ yêu cầu nhập mã OTP từ ứng dụng Google Authenticator.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Hoàn Tất
            </button>
          </div>
        ) : (
          setupData && (
            <div className="space-y-5">
              {/* Step 1: Scan QR */}
              <div className={`p-4 rounded-2xl border space-y-3 text-center ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <span className="text-xs font-bold text-amber-500 block">
                  Bước 1: Mở app Google Authenticator và quét mã QR này
                </span>

                <div className="p-3 bg-white rounded-xl inline-block shadow-md border border-stone-200">
                  <img src={setupData.qrCodeBase64} alt="2FA QR" className="w-44 h-44 object-contain mx-auto" />
                </div>

                <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Hoặc nhập khóa bí mật (Secret Key) bằng tay:
                  <div className={`mt-1 flex items-center justify-center gap-2 font-mono font-bold text-amber-500 px-3 py-1.5 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-700' : 'bg-white border-stone-200'
                  }`}>
                    <span>{setupData.secretKey}</span>
                    <button onClick={handleCopySecret} className="text-slate-400 hover:text-slate-700">
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Backup Codes */}
              {setupData.backupCodes && (
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <span className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                    Bước 2: Lưu mã khôi phục khẩn cấp (Backup Codes)
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px] text-amber-500">
                    {setupData.backupCodes.map((bc, i) => (
                      <span key={i} className={`p-1 rounded border ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-stone-200'
                      }`}>
                        {bc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Verify OTP */}
              <form onSubmit={handleVerifyAndEnable} className="space-y-3">
                <label className={`block text-xs font-semibold text-center ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                  Bước 3: Nhập mã 6 chữ số từ Google Authenticator để kích hoạt:
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className={`w-full text-center text-xl tracking-[0.4em] font-mono py-2.5 rounded-xl border focus:outline-none ${
                    isDark
                      ? 'bg-slate-900 border-amber-500/50 text-amber-300 focus:border-amber-400'
                      : 'bg-amber-50/50 border-amber-300 text-stone-900 focus:border-amber-500'
                  }`}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs shadow-md hover:brightness-105 active:scale-95 transition disabled:opacity-50"
                >
                  {loading ? 'Đang kích hoạt...' : 'Xác Minh & Kích Hoạt 2FA'}
                </button>
              </form>
            </div>
          )
        )}
      </div>
    </div>
  );
};
