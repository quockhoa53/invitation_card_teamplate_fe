import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SetPasswordModal: React.FC<SetPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, setPassword } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    try {
      await setPassword(newPassword);
      setSuccess('Thiết lập mật khẩu thành công! Bạn có thể dùng mật khẩu này để đăng nhập trực tiếp.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Không thể thiết lập mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-6 transition-all ${
          isDark
            ? 'bg-[#121824] border-slate-800 text-white'
            : 'bg-white border-stone-200 text-stone-900 shadow-xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 dark:hover:text-white transition"
          title="Để sau"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-500/25">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h3 className="font-editorial text-2xl font-bold tracking-tight">
            Đăng Nhập Google Thành Công! 🎉
          </h3>

          <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
            Tài khoản <strong className="text-rose-500 font-semibold">{user?.email}</strong> chưa có mật khẩu trực tiếp. Bạn có muốn tạo mật khẩu để có thể đăng nhập bằng cả 2 cách trong tương lai không?
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Password Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1.5 opacity-90">Mật Khẩu Mới</label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500 shadow-sm'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1.5 opacity-90">Xác Nhận Mật Khẩu</label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500 shadow-sm'
                }`}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Đang thiết lập...' : 'Thiết Lập Mật Khẩu Ngay'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`w-full py-2.5 rounded-2xl border text-xs font-semibold transition ${
                isDark
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  : 'border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Để Sau, Tiếp Tục Đăng Nhập Với Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
