import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Heart, Sparkles, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t transition-colors duration-200 mt-auto ${
      isDark
        ? 'bg-[#080b11] border-slate-800/80 text-slate-300'
        : 'bg-white border-slate-200 text-slate-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
                KD
              </div>
              <div className="flex flex-col">
                <span className={`font-editorial text-lg font-bold tracking-tight leading-none ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  KD Card Atelier
                </span>
                <span className="text-[10px] uppercase tracking-widest text-orange-500 font-semibold mt-0.5">
                  Interactive Greeting Platform
                </span>
              </div>
            </Link>

            <p className={`text-xs sm:text-sm leading-relaxed max-w-sm ${
              isDark ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Nền tảng thiệp mời tương tác và thư điện tử độc bản. Giúp bạn trao gửi trọn vẹn yêu thương và bất ngờ đến người thân yêu chỉ trong vài giây.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-medium border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 dark:text-slate-400">Hệ thống bảo mật hoạt động ổn định</span>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Column 1: Bộ Sưu Tập */}
            <div className="space-y-3">
              <h4 className={`text-xs uppercase font-bold tracking-wider ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Bộ Sưu Tập
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/templates" className="hover:text-orange-500 transition-colors">
                    Sinh Nhật Người Yêu
                  </Link>
                </li>
                <li>
                  <Link to="/templates" className="hover:text-orange-500 transition-colors">
                    Kỷ Niệm Tình Yêu
                  </Link>
                </li>
                <li>
                  <Link to="/templates" className="hover:text-orange-500 transition-colors">
                    Đại Tiệc Bạn Bè
                  </Link>
                </li>
                <li>
                  <Link to="/templates" className="hover:text-orange-500 transition-colors">
                    Thư Mời Sự Kiện & Cưới
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Tính Năng */}
            <div className="space-y-3">
              <h4 className={`text-xs uppercase font-bold tracking-wider ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Tính Năng
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="text-slate-400">Thổi nến 3D cảm ứng</span>
                </li>
                <li>
                  <span className="text-slate-400">Hộp quà mở nắp 3D</span>
                </li>
                <li>
                  <span className="text-slate-400">Mã QR động chuẩn in ấn</span>
                </li>
                <li>
                  <span className="text-slate-400">Khóa mật khẩu riêng tư</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Hỗ Trợ & Pháp Lý */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className={`text-xs uppercase font-bold tracking-wider ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Hỗ Trợ
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/templates" className="hover:text-orange-500 transition-colors inline-flex items-center gap-1">
                    <span>Hướng Dẫn Tạo Thiệp</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </Link>
                </li>
                <li>
                  <a href="mailto:nguyenquockhoa5549@gmail.com" className="hover:text-orange-500 transition-colors">
                    Liên Hệ Hỗ Trợ
                  </a>
                </li>
                <li>
                  <span className="text-slate-400">Chính Sách Bảo Mật</span>
                </li>
                <li>
                  <span className="text-slate-400">Điều Khoản Dịch Vụ</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDark ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}>
          <p>© 2026 KD Card Atelier. Mọi quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              Thiết kế độc quyền bởi <span className="font-semibold text-orange-500">KD Atelier</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
