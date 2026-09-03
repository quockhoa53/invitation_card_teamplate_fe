import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Template } from '../types';
import { api } from '../services/api';
import { HeroCardShowcase } from '../components/home/HeroCardShowcase';
import { TemplateCardItem } from '../components/home/TemplateCardItem';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { PurchaseTemplateModal } from '../components/templates/PurchaseTemplateModal';
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
  const { isAuthenticated, isTemplateOwned } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [demoTemplate, setDemoTemplate] = useState<Template | null>(null);
  const [purchasingTemplate, setPurchasingTemplate] = useState<Template | null>(null);
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
    if (!isTemplateOwned(tpl)) {
      setPurchasingTemplate(tpl);
      return;
    }
    navigate(`/editor?templateId=${tpl.id}`);
  };

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Filter templates for featured showcase
  const filteredFeaturedTemplates = useMemo(() => {
    if (activeCategory === 'ALL') return templates.slice(0, 6);
    return templates.filter((t) => t.category === activeCategory).slice(0, 6);
  }, [templates, activeCategory]);

  return (
    <div className="space-y-12 sm:space-y-20 pb-20 overflow-x-hidden">
      {/* 3D LIVE SPLIT HERO SECTION (OPTIMIZED FOR MOBILE & DESKTOP) */}
      <section className="relative pt-1 sm:pt-4 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center">
        {/* Subtle Ambient Glow */}
        <div
          className={`absolute top-1/4 left-1/4 w-[400px] sm:w-[500px] h-[260px] sm:h-[300px] rounded-full blur-[140px] pointer-events-none ${
            isDark ? 'bg-rose-500/15' : 'bg-rose-300/20'
          }`}
        />
        <div
          className={`absolute top-1/3 right-10 w-[300px] sm:w-[350px] h-[220px] sm:h-[260px] rounded-full blur-[120px] pointer-events-none ${
            isDark ? 'bg-amber-500/10' : 'bg-amber-300/20'
          }`}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center w-full my-auto">
          {/* Left Column: Brand Story & CTA (Punchy & Minimal Text for Mobile) */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-center lg:text-left">
            {/* Top Trendy Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wide transition-colors">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700'
              }`}>
                KD Card 2026
              </span>
              <span className={isDark ? 'text-slate-300' : 'text-stone-600'}>
                Thiệp Mời Động Thế Hệ Mới
              </span>
            </div>

            {/* Emotional Punchy Headline */}
            <h1 className="font-editorial text-2xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-bold tracking-tight leading-[1.18]">
              Tạo thiệp mời tương tác{' '}
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500">
                sống động & độc bản
              </span>
            </h1>

            {/* Quick Feature Tags with Emojis (Replaces Walls of Text) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 pt-0.5">
              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition ${
                isDark ? 'bg-slate-900/80 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                🎁 Mở Quà 3D
              </span>
              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition ${
                isDark ? 'bg-slate-900/80 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                🎂 Thổi Nến
              </span>
              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition ${
                isDark ? 'bg-slate-900/80 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                🎵 Tự Phát Nhạc
              </span>
              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition ${
                isDark ? 'bg-slate-900/80 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                📱 Quét Mã QR
              </span>
            </div>

            {/* One-sentence Subtitle for Desktop */}
            <p className={`hidden sm:block text-xs sm:text-sm font-sans leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-stone-600'
            }`}>
              Tự tay tạo thiệp sinh nhật, kỷ niệm tình yêu trong 30 giây. Gửi người thân qua Zalo, Messenger chỉ với 1 đường link riêng.
            </p>

            {/* Action Button: Single High-Converting CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                to="/templates"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white text-xs sm:text-sm shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt Đầu Tạo Thiệp Miễn Phí</span>
              </Link>

              <Link
                to="/templates"
                className={`hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-xs border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                    : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700 shadow-sm'
                }`}
              >
                <Eye className="w-4 h-4 text-rose-500" />
                <span>Xem Tất Cả Mẫu</span>
              </Link>
            </div>

            {/* Mini Trust Stats - Clean Minimalist Badges */}
            <div className={`hidden sm:grid pt-3 border-t grid-cols-3 gap-2 max-w-md mx-auto lg:mx-0 text-left ${
              isDark ? 'border-slate-800/80' : 'border-stone-200'
            }`}>
              <div>
                <span className="font-editorial text-sm sm:text-base font-bold text-rose-500 block">4+ Kịch Bản</span>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Tương tác độc quyền
                </span>
              </div>
              <div>
                <span className="font-editorial text-sm sm:text-base font-bold text-amber-500 block">Tự Động</span>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Mã QR & Link riêng
                </span>
              </div>
              <div>
                <span className="font-editorial text-sm sm:text-base font-bold text-emerald-500 block">Bảo Mật</span>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Khóa mật khẩu riêng tư
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Interactive Smartphone Preview */}
          <div className="lg:col-span-5 flex justify-center items-center pt-2 sm:pt-0">
            <HeroCardShowcase
              templates={templates}
              isDark={isDark}
            />
          </div>
        </div>
      </section>

      {/* FEATURED TEMPLATES SECTION (SWIPEABLE TOUCH CAROUSEL ON MOBILE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b pb-4 border-stone-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Gift className="w-4 h-4" /> Mẫu Thiệp Được Yêu Thích
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight">
              Tuyển Chọn Mẫu Hot Nhất
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'ALL', label: 'Tất Cả' },
              { id: 'BIRTHDAY_LOVER', label: '🎂 Người Yêu' },
              { id: 'BIRTHDAY_FRIENDS', label: '🎉 Bạn Bè' },
              { id: 'LOVE_ANNIVERSARY', label: '💖 Tình Yêu' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                    : isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-slate-400 px-1 -mb-2">
          <span className="flex items-center gap-1 text-rose-500 font-semibold">
            👉 Vuốt ngang để xem thêm mẫu
          </span>
          <Link to="/templates" className="font-bold underline text-rose-500">
            Xem tất cả
          </Link>
        </div>

        {/* Swipeable Snap Carousel on Mobile, Responsive Grid on Tablet/Desktop */}
        <div className="flex sm:grid overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none gap-4 pb-4 sm:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFeaturedTemplates.map((tpl) => (
            <div key={tpl.id} className="min-w-[270px] max-w-[285px] sm:min-w-0 sm:max-w-none snap-start shrink-0 sm:shrink">
              <TemplateCardItem
                template={tpl}
                isDark={isDark}
                onPreview={(t) => setDemoTemplate(t)}
                onUse={(t) => handleUseTemplate(t)}
              />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center pt-2">
          <Link
            to="/templates"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all active:scale-95 ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:border-rose-500 text-slate-200'
                : 'bg-white border-stone-200 hover:border-rose-300 text-stone-800 shadow-sm'
            }`}
          >
            <span>Khám Phá Toàn Bộ {templates.length} Mẫu Thiệp Mời</span>
            <ArrowRight className="w-4 h-4 text-rose-500" />
          </Link>
        </div>
      </section>

      {/* 4 SIGNATURE EXPERIENCES (VISUAL FIRST - NO CORPORATE FLUFF) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-1.5 mb-6 sm:mb-10">
          <span className="text-rose-500 font-bold text-xs uppercase tracking-widest">
            Trải Nghiệm Khác Biệt
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold">
            Chạm Vào Là Cảm Xúc Thật
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Không chỉ là một tấm ảnh tĩnh — mỗi thiệp là một trải nghiệm sống động
          </p>
        </div>

        {/* 4 Punchy Visual Cards (2 cols on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#121824] border-slate-800/80 hover:border-rose-500/40' : 'bg-white border-stone-200 hover:border-rose-300 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-pink-500/20 text-rose-500 flex items-center justify-center mb-3 text-lg shadow-inner">
              🎂
            </div>
            <h3 className="font-bold text-sm sm:text-base mb-1">Thổi Nến Thực Tế</h3>
            <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Chạm màn hình để thổi tắt nến lung linh như sinh nhật ngoài đời thật.
            </p>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#121824] border-slate-800/80 hover:border-amber-500/40' : 'bg-white border-stone-200 hover:border-amber-300 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 text-amber-500 flex items-center justify-center mb-3 text-lg shadow-inner">
              🎁
            </div>
            <h3 className="font-bold text-sm sm:text-base mb-1">Mở Hộp Quà 3D</h3>
            <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Bật nắp hộp quà hiệu ứng 3D kèm pháo hoa và lời nhắn bí mật.
            </p>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#121824] border-slate-800/80 hover:border-purple-500/40' : 'bg-white border-stone-200 hover:border-purple-300 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 text-purple-500 flex items-center justify-center mb-3 text-lg shadow-inner">
              🎵
            </div>
            <h3 className="font-bold text-sm sm:text-base mb-1">Giai Điệu Tình Yêu</h3>
            <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Bản nhạc yêu thích tự động phát du dương ngay khi mở thiệp.
            </p>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#121824] border-slate-800/80 hover:border-emerald-500/40' : 'bg-white border-stone-200 hover:border-emerald-300 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-500 flex items-center justify-center mb-3 text-lg shadow-inner">
              📱
            </div>
            <h3 className="font-bold text-sm sm:text-base mb-1">Mã QR & Link Riêng</h3>
            <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Gửi qua Zalo, Messenger chỉ 1 chạm. Khóa mật khẩu riêng tư bảo mật.
            </p>
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

      {/* Floating Mobile Bottom Action Pill */}
      <div className="sm:hidden fixed bottom-4 inset-x-4 z-40">
        <Link
          to="/templates"
          className="w-full py-3 px-5 rounded-2xl font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white text-xs shadow-2xl shadow-rose-950/50 border border-white/25 flex items-center justify-between backdrop-blur-md active:scale-98 transition"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>Tạo thiệp động miễn phí</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-[11px] bg-white/20 px-2.5 py-0.5 rounded-lg">
            Bắt đầu <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  );
};
