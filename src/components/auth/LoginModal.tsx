import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { SetPasswordModal } from './SetPasswordModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onSuccess: (token?: string, require2FA?: boolean, tempToken?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onSuccess,
}) => {
  const { login, loginWithGoogle } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleAccountModal, setShowGoogleAccountModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);

  // Quick Google Account Prompt State
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  if (!isOpen && !showSetPasswordModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.require2FA) {
        onSuccess(undefined, true, res.tempToken);
      } else {
        onSuccess(res.accessToken, false, undefined);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRealGoogleLogin = () => {
    setError('');
    
    // Check if Google Identity Services is available
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
              console.error('Google token error:', tokenResponse);
              setShowGoogleAccountModal(true);
              return;
            }

            if (tokenResponse.access_token) {
              setGoogleLoading(true);
              try {
                // Fetch verified profile from official Google UserInfo API
                const resUser = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });
                const googleProfile = await resUser.json();

                if (!googleProfile.email) {
                  throw new Error('Không thể lấy email từ Google');
                }

                await handleGoogleAuthSubmit(
                  googleProfile.email,
                  googleProfile.name || googleProfile.email.split('@')[0],
                  googleProfile.picture,
                  googleProfile.sub
                );
              } catch (err: any) {
                setError(err.message || 'Không thể lấy thông tin tài khoản Google');
              } finally {
                setGoogleLoading(false);
              }
            }
          },
          error_callback: (error: any) => {
            console.warn('Google GIS error:', error);
            setShowGoogleAccountModal(true);
          },
        });

        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('Failed to launch Google Token Client, fallback to selector modal:', err);
      }
    }

    // Fallback if Google GIS script blocked by adblock or not loaded
    setShowGoogleAccountModal(true);
  };

  const handleGoogleAuthSubmit = async (
    gEmail: string,
    gName: string,
    gAvatar?: string,
    gSubId?: string
  ) => {
    setError('');
    setGoogleLoading(true);
    try {
      const payload = {
        email: gEmail.toLowerCase().trim(),
        fullName: gName.trim() || gEmail.split('@')[0],
        avatarUrl: gAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${gEmail}`,
        googleId: gSubId || `google_${Date.now()}`,
      };
      const res = await loginWithGoogle(payload);
      setShowGoogleAccountModal(false);

      // If user has never set a local password, prompt SetPasswordModal
      if (res.user && res.user.hasPassword === false) {
        setShowSetPasswordModal(true);
      } else {
        if (res.require2FA) {
          onSuccess(undefined, true, res.tempToken);
        } else {
          onSuccess(res.accessToken, false, undefined);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập Google thất bại');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`max-w-md w-full border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative transition-colors ${
            isDark ? 'bg-[#121824] border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-800'
          }`}>
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-orange-500 text-lg font-bold"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold">Đăng Nhập Tài Khoản</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Tùy biến thiệp mời và quản lý thiệp của bạn
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-in Button */}
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
              <span>{googleLoading ? 'Đang kết nối Google...' : 'Tiếp Tục Với Google'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`} />
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
                HOẶC EMAIL
              </span>
              <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
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
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
              </button>
            </form>

            <div className={`text-center text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={onOpenRegister}
                className="text-orange-500 hover:text-orange-600 font-bold ml-1"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Account Selector Dialog */}
      {showGoogleAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`max-w-sm w-full border rounded-3xl p-6 shadow-2xl space-y-5 relative ${
            isDark ? 'bg-[#121824] border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Đăng nhập bằng Google</span>
              </div>
              <button
                onClick={() => setShowGoogleAccountModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
              Chọn tài khoản Google nhanh hoặc nhập tài khoản Google của bạn:
            </p>

            {/* Quick Demo Google Accounts */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleGoogleAuthSubmit('anhkhoa.google@gmail.com', 'Anh Khoa Google')}
                className={`w-full p-3 rounded-xl border flex items-center gap-3 text-left transition active:scale-95 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 hover:border-orange-500 hover:bg-slate-800'
                    : 'bg-stone-50 border-stone-200 hover:border-orange-300 hover:bg-stone-100'
                }`}
              >
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">Anh Khoa Google</p>
                  <p className="text-[11px] text-slate-400 truncate">anhkhoa.google@gmail.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleAuthSubmit('linhdan.creative@gmail.com', 'Linh Đan')}
                className={`w-full p-3 rounded-xl border flex items-center gap-3 text-left transition active:scale-95 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 hover:border-orange-500 hover:bg-slate-800'
                    : 'bg-stone-50 border-stone-200 hover:border-orange-300 hover:bg-stone-100'
                }`}
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">Linh Đan</p>
                  <p className="text-[11px] text-slate-400 truncate">linhdan.creative@gmail.com</p>
                </div>
              </button>
            </div>

            {/* Custom Google Account Form */}
            <div className="pt-2 border-t dark:border-slate-800 space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 opacity-80">Hoặc nhập email Google khác</label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Họ và tên hiển thị..."
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              <button
                type="button"
                disabled={!googleEmailInput.trim()}
                onClick={() => handleGoogleAuthSubmit(googleEmailInput, googleNameInput)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow hover:brightness-105 active:scale-95 transition disabled:opacity-50"
              >
                Đăng Nhập Với Tài Khoản Này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Password Proposal Modal for Google Users */}
      <SetPasswordModal
        isOpen={showSetPasswordModal}
        onClose={() => {
          setShowSetPasswordModal(false);
          onSuccess(undefined, false, undefined);
        }}
        onSuccess={() => {
          setShowSetPasswordModal(false);
          onSuccess(undefined, false, undefined);
        }}
      />
    </>
  );
};

