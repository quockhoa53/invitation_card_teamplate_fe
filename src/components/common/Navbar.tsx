import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Shield,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
  CreditCard,
} from 'lucide-react';
import { LoginModal } from '../auth/LoginModal';
import { RegisterModal } from '../auth/RegisterModal';
import { TwoFactorModal } from '../auth/TwoFactorModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [temp2FAToken, setTemp2FAToken] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);

  const handleLoginSuccess = (token?: string, require2FA?: boolean, tempToken?: string) => {
    if (require2FA && tempToken) {
      setTemp2FAToken(tempToken);
      setShowLogin(false);
      setShow2FA(true);
    } else {
      setShowLogin(false);
    }
  };

  const isDark = theme === 'dark';

  // Navigation Active State Checker
  const isHomeActive = location.pathname === '/';
  const isTemplatesActive = location.pathname === '/templates' || location.pathname.startsWith('/templates');
  const isDashboardActive = location.pathname === '/dashboard';
  const isAdminActive = location.pathname.startsWith('/admin');

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-300 border-b ${
          isDark
            ? 'bg-[#0b0f17]/90 border-slate-800/80 text-slate-100'
            : 'bg-[#faf8f5]/90 border-[#e7e2d9] text-stone-800'
        } backdrop-blur-xl`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* KD Atelier Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 p-[2px] shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[14px] bg-[#12080a] flex items-center justify-center">
                <span className="font-editorial text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200">
                  KD
                </span>
              </div>
            </div>
            <div>
              <span className="font-editorial text-xl font-bold tracking-tight flex items-center gap-1.5">
                KD <span className="italic font-normal text-orange-500">Card</span>
              </span>
              <span className={`text-[9px] tracking-widest block -mt-1 font-bold uppercase ${
                isDark ? 'text-slate-400' : 'text-stone-500'
              }`}>
                Interactive Atelier
              </span>
            </div>
          </Link>

          {/* Navigation Links with Active Underline Indicator */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider">
            {/* Trang Chủ */}
            <Link
              to="/"
              className={`relative py-1.5 transition-colors ${
                isHomeActive
                  ? 'text-orange-500 font-bold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Trang Chủ</span>
              {isHomeActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-fade" />
              )}
            </Link>

            {/* Bộ Sưu Tập */}
            <Link
              to="/templates"
              className={`relative py-1.5 transition-colors ${
                isTemplatesActive
                  ? 'text-orange-500 font-bold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Bộ Sưu Tập</span>
              {isTemplatesActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-fade" />
              )}
            </Link>

            {/* Thiệp Của Tôi */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`relative py-1.5 flex items-center gap-1.5 transition-colors ${
                  isDashboardActive
                    ? 'text-orange-500 font-bold'
                    : isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Thiệp Của Tôi</span>
                {isDashboardActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-fade" />
                )}
              </Link>
            )}

            {/* Quản Trị */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`relative flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl transition border ${
                  isAdminActive
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-2 ring-amber-500/20'
                    : isDark
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Quản Trị</span>
                {isAdminActive && (
                  <span className="absolute -bottom-1 left-2 right-2 h-[2px] bg-amber-500 rounded-full" />
                )}
              </Link>
            )}
          </nav>

          {/* Right Action buttons & Theme Switcher */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-2xl border transition-all active:scale-90 flex items-center justify-center ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:border-slate-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300 shadow-sm'
              }`}
              title={isDark ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition active:scale-95 ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-orange-500/40 text-white'
                      : 'bg-white border-stone-200 hover:border-orange-300 text-stone-800 shadow-sm'
                  }`}
                >
                  <img
                    src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                    alt="avatar"
                    className="w-7 h-7 rounded-xl object-cover border border-orange-500/40"
                  />
                  <span className="text-xs font-semibold hidden sm:block max-w-[120px] truncate">
                    {user?.fullName || user?.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdown && (
                  <div
                    className={`absolute right-0 mt-2 w-60 rounded-2xl border shadow-xl py-2 z-50 animate-fade ${
                      isDark
                        ? 'bg-[#121824] border-slate-800 text-slate-200'
                        : 'bg-white border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className={`px-4 py-2.5 border-b ${isDark ? 'border-slate-800' : 'border-stone-100'}`}>
                      <p className="text-[11px] font-medium opacity-70 truncate">{user?.email}</p>
                      <p className="text-xs font-bold text-orange-500 mt-0.5">
                        Số dư Ví KD: {user?.creditsBalance?.toLocaleString('vi-VN')} đ
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdown(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition ${
                        isDark ? 'hover:bg-slate-800/80 text-slate-200' : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-orange-500" /> Quản lý thiệp mời
                    </Link>

                    <Link
                      to="/payment"
                      onClick={() => setUserDropdown(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition ${
                        isDark ? 'hover:bg-slate-800/80 text-emerald-400' : 'hover:bg-stone-50 text-emerald-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-500" /> Nạp tiền VietQR
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdown(false)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition ${
                          isDark ? 'hover:bg-slate-800/80 text-amber-400' : 'hover:bg-stone-50 text-amber-700'
                        }`}
                      >
                        <Shield className="w-4 h-4 text-amber-500" /> Trang Quản Trị (2FA)
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        logout();
                        navigate('/');
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-orange-500 hover:bg-orange-500/10 transition border-t mt-1 ${
                        isDark ? 'border-slate-800' : 'border-stone-100'
                      }`}
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLogin(true)}
                  className={`px-3.5 py-1.5 text-xs font-semibold transition ${
                    isDark ? 'text-slate-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 active:scale-95 transition"
                >
                  Đăng Ký
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onOpenRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        onSuccess={handleLoginSuccess}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onOpenLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
        onSuccess={() => setShowRegister(false)}
      />

      <TwoFactorModal
        isOpen={show2FA}
        tempToken={temp2FAToken}
        onClose={() => setShow2FA(false)}
        onSuccess={() => {
          setShow2FA(false);
          navigate(isAdmin ? '/admin' : '/dashboard');
        }}
      />
    </>
  );
};
