import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Template } from '../types';
import { api } from '../services/api';
import { HeroCardShowcase } from '../components/home/HeroCardShowcase';
import { TemplateCardItem } from '../components/home/TemplateCardItem';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import {
  Sparkles,
  QrCode,
  Eye,
  ShieldCheck,
  Flame,
  ArrowRight,
  Gift,
  ChevronRight,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [demoTemplate, setDemoTemplate] = useState<Template | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.getTemplates();
        if (res.success && res.data) {
          setTemplates(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch templates', err);
      }
    };
    fetchTemplates();
  }, []);

  const handleUseTemplate = (tpl: Template) => {
    if (!isAuthenticated) {
      toast.warning('Yêu cầu Đăng Nhập', 'Vui lòng Đăng Nhập hoặc Đăng Ký để bắt đầu tùy chỉnh tấm thiệp của bạn!');
      return;
    }
    navigate(`/editor?templateId=${tpl.id}`);
  };

  // Top 4 curated showcase templates
  const featuredTemplates = templates.slice(0, 4);

  return (
    <div className="space-y-24 pb-24 overflow-x-hidden">
      {/* 3D LIVE SPLIT HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle Ambient Glow */}
        <div
          className={`absolute top-1/3 left-1/4 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none ${
            isDark ? 'bg-rose-500/15' : 'bg-rose-300/20'
          }`}
        />
        <div
          className={`absolute top-1/4 right-10 w-[400px] h-[300px] rounded-full blur-[120px] pointer-events-none ${
            isDark ? 'bg-amber-500/10' : 'bg-amber-300/20'
          }`}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Brand Story & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-colors">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700'
              }`}>
                KD Card 2026
              </span>
              <span className={isDark ? 'text-slate-300' : 'text-stone-600'}>
                Nền Tảng Thiệp Mời Tương Tác Sống Động
              </span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-[66px] font-bold tracking-tight leading-[1.12]">
              Trao gửi yêu thương qua những tấm{' '}
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500">
                thiệp sống động
              </span>
            </h1>

            <p className={`text-sm sm:text-base lg:text-lg max-w-xl font-sans leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-stone-600'
            }`}>
              Tự tay tạo và cá nhân hóa thiệp sinh nhật, kỷ niệm tình yêu và thư mời độc bản: mở hộp quà, thổi nến bánh kem, đếm ngày yêu và âm nhạc lãng mạn. Tự động sinh mã QR và link riêng gửi người thân.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start items-center gap-4">
              <Link
                to="/templates"
                className="px-7 py-3.5 rounded-full font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white text-xs sm:text-sm shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-102 active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Khám Phá Bộ Sưu Tập Ngay
              </Link>

              <Link
                to="/templates"
                className={`px-6 py-3.5 rounded-full font-semibold text-xs sm:text-sm border transition-all active:scale-95 flex items-center gap-2 ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                    : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700 shadow-sm'
                }`}
              >
                <Eye className="w-4 h-4 text-rose-500" /> Xem Tất Cả Mẫu Thiệp
              </Link>
            </div>

            {/* Trust Badges */}
            <div className={`pt-6 border-t grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-left ${
              isDark ? 'border-slate-800/80' : 'border-stone-200'
            }`}>
              <div>
                <span className="font-editorial text-lg font-bold text-rose-500 block">4+ Kịch Bản</span>
                <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Tương tác độc quyền
                </span>
              </div>

              <div>
                <span className="font-editorial text-lg font-bold text-amber-500 block">Tự Động</span>
                <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Mã QR & Link riêng
                </span>
              </div>

              <div>
                <span className="font-editorial text-lg font-bold text-emerald-500 block">Bảo Mật</span>
                <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Khóa mật khẩu riêng tư
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Interactive Smartphone / Desktop Preview Showcase */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <HeroCardShowcase
              templates={templates}
              isDark={isDark}
            />
          </div>
        </div>
      </section>

      {/* FEATURED TEMPLATES PREVIEW SECTION (CLEAN & MINIMALIST) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6 border-stone-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Gift className="w-4 h-4" /> Mẫu Thiệp Tiêu Biểu
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight">
              Tuyển Chọn Mẫu Được Yêu Thích
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Những ấn phẩm thiệp mời tương tác nổi bật nhất do đội ngũ KD Atelier thiết kế
            </p>
          </div>

          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-xs font-bold transition active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <span>Xem Tất Cả Trong Bộ Sưu Tập</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTemplates.map((tpl) => (
            <TemplateCardItem
              key={tpl.id}
              template={tpl}
              isDark={isDark}
              onPreview={(t) => setDemoTemplate(t)}
              onUse={(t) => handleUseTemplate(t)}
            />
          ))}
        </div>

        {/* Call-to-action Banner to navigate to /templates */}
        <div className={`p-8 sm:p-10 rounded-3xl border text-center space-y-4 transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#151c2c] to-[#0f1420] border-slate-800'
            : 'bg-gradient-to-b from-stone-50 to-white border-stone-200 shadow-sm'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold">
              Muốn Khám Phá Thêm Nhiều Mẫu & Bộ Lọc Nâng Cao?
            </h3>
            <p className={`text-xs sm:text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Truy cập trang Bộ Sưu Tập để tìm kiếm theo từ khóa, lọc theo mức giá, danh mục chủ đề và công nghệ hiển thị.
            </p>
          </div>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white text-xs sm:text-sm shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-102 active:scale-95 transition-all"
          >
            <Eye className="w-4 h-4" /> Mở Toàn Bộ Danh Mục Thiệp Mời
          </Link>
        </div>
      </section>

      {/* WHY CHOOSE KD CARDS (FEATURE SHOWCASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-14 rounded-3xl border transition-colors ${
          isDark
            ? 'bg-[#121824] border-slate-800/80 text-slate-100'
            : 'bg-white border-stone-200/90 text-stone-800 shadow-sm'
        }`}>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-rose-500 font-bold text-xs uppercase tracking-widest">
              Đặc Quyền Công Nghệ KD Card
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold">
              Trải nghiệm thiệp mời thế hệ mới
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Khác biệt hoàn toàn với những file ảnh hay PDF tĩnh truyền thống
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto sm:mx-0">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-lg font-bold">Kịch Bản Tương Tác Sống Động</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Mở hộp quà 3D, tự thổi nến bánh sinh nhật bằng cảm ứng, máy tính đếm ngày yêu nhau theo từng giây và âm nhạc du dương.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto sm:mx-0">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-lg font-bold">Mã QR Động & Chia Sẻ Tức Thì</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Hệ thống tự tạo mã QR sắc nét chuẩn in ấn và link xem trực tuyến để gửi qua Messenger, Zalo hay in lên thiệp giấy vật lý.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto sm:mx-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-lg font-bold">Bảo Mật Riêng Tư & Lưu Bút</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Tùy chọn đặt mật khẩu bảo vệ nội dung bí mật. Bạn bè và người thân có thể gửi lời chúc lưu bút và thả tim trực tiếp trên thiệp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal if clicked preview from homepage card */}
      {demoTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-md w-full h-[88vh] bg-slate-950 border border-slate-800 rounded-[38px] shadow-2xl overflow-hidden flex flex-col">
            <div className="h-9 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                {demoTemplate.title}
              </span>
              <button
                onClick={() => setDemoTemplate(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950">
              <TemplateRenderer
                slug={demoTemplate.slug}
                category={demoTemplate.category}
                templateType={demoTemplate.templateType}
                customHtml={demoTemplate.customHtml}
                customCss={demoTemplate.customCss}
                customJs={demoTemplate.customJs}
                customData={demoTemplate.defaultConfig}
                title={demoTemplate.title}
                wishes={[]}
                isPreview={true}
              />
            </div>

            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setDemoTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  const tpl = demoTemplate;
                  setDemoTemplate(null);
                  handleUseTemplate(tpl);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg active:scale-95 transition flex items-center gap-1.5"
              >
                Sử Dụng Mẫu Này <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
