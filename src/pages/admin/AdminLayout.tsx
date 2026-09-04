import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Shield,
  ArrowLeft,
  Sun,
  Moon,
  FolderTree,
  CreditCard,
  ArrowDownToLine,
  Tag,
  KeyRound,
} from 'lucide-react';
import { AdminTwoFactorModal } from './AdminTwoFactorPage';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const location = useLocation();
  const navigate = useNavigate();
  const [show2FAModal, setShow2FAModal] = useState(false);

  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 ${
        isDark ? 'bg-[#0b0f17] text-white' : 'bg-[#faf8f5] text-stone-800'
      }`}>
        <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="font-editorial text-3xl font-bold">Khu Vực Dành Riêng Cho Quản Trị Viên</h2>
        <p className={`text-xs max-w-sm ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
          Bạn cần đăng nhập bằng tài khoản Quản trị viên (Admin) và xác thực 2 bước để truy cập.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition"
        >
          Trở Về Trang Chủ
        </Link>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', label: 'Tổng Quan & Doanh Thu', icon: LayoutDashboard },
    { path: '/admin/transactions', label: 'Lịch Sử Giao Dịch', icon: CreditCard },
    { path: '/admin/withdrawals', label: 'Duyệt Rút Tiền', icon: ArrowDownToLine },
    { path: '/admin/promotions', label: 'Mã Khuyến Mãi', icon: Tag },
    { path: '/admin/templates', label: 'Quản Lý Template', icon: Layers },
    { path: '/admin/schema-keys', label: 'Quản Lý Schema Keys', icon: KeyRound },
    { path: '/admin/categories', label: 'Quản Lý Loại Template', icon: FolderTree },
    { path: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users },
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors ${
      isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#faf8f5] text-stone-800'
    }`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-64 border-r flex flex-col justify-between shrink-0 p-4 transition-colors ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'
      }`}>
        <div className="space-y-6">
          {/* Admin Brand */}
          <div className={`px-3 py-2 flex items-center justify-between border-b pb-4 ${
            isDark ? 'border-slate-800' : 'border-stone-100'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-editorial text-sm font-bold tracking-tight">Admin Portal</h3>
                <span className="text-[10px] text-amber-500 font-bold block -mt-0.5">2FA Protected</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg border transition ${
                  isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}
                title="Đổi giao diện sáng/tối"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <Link to="/" className="text-slate-400 hover:text-orange-500 p-1" title="Về trang chủ">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : isDark
                      ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}

            {/* 2FA Setup button in menu */}
            <button
              onClick={() => setShow2FAModal(true)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition border mt-2 ${
                isDark
                  ? 'text-amber-300 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
                  : 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Cài Đặt 2FA (Google Auth)</span>
            </button>
          </nav>
        </div>

        {/* Admin User Info & Logout */}
        <div className={`pt-4 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-stone-100'}`}>
          <div className="flex items-center gap-3 px-2">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt="Admin"
              className="w-8 h-8 rounded-xl border border-amber-500/40"
            />
            <div className="truncate">
              <p className="text-xs font-bold truncate">{user?.fullName}</p>
              <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-orange-500/20 text-orange-400'
                : 'bg-stone-50 border-stone-200 hover:bg-orange-50 text-orange-600'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-h-screen">
        <Outlet />
      </main>

      {/* 2FA Setup Modal */}
      <AdminTwoFactorModal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)} />
    </div>
  );
};
