import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onSuccess: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
  onSuccess,
}) => {
  const { register, loginWithGoogle } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleRealGoogleLogin = () => {
    setError('');

    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const googleClientId =
          import.meta.env.VITE_GOOGLE_CLIENT_ID ||
          '371691965576-9m2i9u6p6e0o0m7s7p6v2e0p6q0r7s8t.apps.googleusercontent.com';

        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              onOpenLogin();
              return;
            }

            if (tokenResponse.access_token) {
              setGoogleLoading(true);
              try {
                const resUser = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });
                const googleProfile = await resUser.json();

                if (!googleProfile.email) {
                  throw new Error('Không thể lấy email từ Google');
                }

                const payload = {
                  email: googleProfile.email.toLowerCase().trim(),
                  fullName: googleProfile.name || googleProfile.email.split('@')[0],
                  avatarUrl: googleProfile.picture,
                  googleId: googleProfile.sub,
                  idToken: tokenResponse.access_token,
                };
                await loginWithGoogle(payload);
                onSuccess();
              } catch (err: any) {
                setError(err.message || 'Không thể lấy thông tin tài khoản Google');
              } finally {
                setGoogleLoading(false);
              }
            }
          },
          error_callback: () => {
            onOpenLogin();
          },
        });

        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('Google client error:', err);
      }
    }

    onOpenLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, fullName);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onOpenLogin();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
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
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold">Tạo Tài Khoản Mới</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Đăng ký để lưu trữ và quản lý thiệp mời của riêng bạn
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-editorial text-lg font-bold">Đăng Ký Thành Công!</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Đang chuyển hướng sang đăng nhập...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google Sign-up Trigger */}
            <button
              type="button"
              onClick={handleRealGoogleLogin}
              disabled={googleLoading}
              className={`w-full py-2.5 px-4 rounded-2xl border flex items-center justify-center gap-3 text-xs font-bold transition shadow-sm hover:brightness-105 active:scale-95 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Đăng Ký Nhanh Bằng Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`} />
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
                HOẶC ĐĂNG KÝ EMAIL
              </span>
              <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                Họ và Tên
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white text-xs sm:text-sm shadow-md shadow-rose-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
            </button>
            </form>
          </div>
        )}

        <div className={`text-center text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={onOpenLogin}
            className="text-rose-500 hover:text-rose-600 font-bold ml-1"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};
