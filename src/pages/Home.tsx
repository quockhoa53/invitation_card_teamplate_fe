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
  Play,
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

  // Top 4 curated templates for the spotlight showcase
  const featuredTemplates = useMemo(() => templates.slice(0, 4), [templates]);

  return (
    <div className="space-y-12 sm:space-y-20 pb-20 overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-2 sm:pt-6 pb-4 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center">
        {/* Subtle Single Accent Ambient Glow */}
        <div
          className={`absolute top-1/4 left-1/4 w-[400px] sm:w-[500px] h-[260px] sm:h-[300px] rounded-full blur-[140px] pointer-events-none ${
            isDark ? 'bg-rose-500/10' : 'bg-rose-500/5'
          }`}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center w-full my-auto">
          {/* Left Column: Brand Story & CTA */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>KD Card Atelier 2026 — Nền Tảng Thiệp Mời Độc Bản</span>
            </div>

            {/* Emotional Punchy Headline */}
            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-bold tracking-tight leading-[1.12] text-slate-900 dark:text-white">
              Trao gửi yêu thương qua thiệp mời{' '}
              <span className="text-rose-600 dark:text-rose-500">
                tương tác sống động
              </span>
            </h1>

            {/* Modern Value Statement */}
            <p className={`text-xs sm:text-base max-w-xl font-sans leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Tự tay tạo và cá nhân hóa thiệp sinh nhật, kỷ niệm tình yêu và thư mời sự kiện độc bản trong 30 giây. Tích hợp hiệu ứng 3D, âm nhạc và mã QR tự động gửi riêng người thân.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                to="/templates"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt Đầu Tạo Thiệp Miễn Phí</span>
              </Link>

              <Link
                to="/templates"
                className={`hidden sm:inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
                }`}
              >
                <Eye className="w-4 h-4 text-rose-500" />
                <span>Xem Bộ Sưu Tập</span>
              </Link>
            </div>

            {/* Minimalist Trust Stats */}
            <div className={`hidden sm:grid pt-4 border-t grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 text-left ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}>
              <div>
                <span className="font-editorial text-base sm:text-lg font-bold text-slate-900 dark:text-white block">4+ Kịch Bản</span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tương tác 3D độc quyền
                </span>
              </div>
              <div>
                <span className="font-editorial text-base sm:text-lg font-bold text-slate-900 dark:text-white block">100% Tự Động</span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Mã QR & Link riêng
                </span>
              </div>
              <div>
                <span className="font-editorial text-base sm:text-lg font-bold text-slate-900 dark:text-white block">Bảo Mật 2FA</span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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

      {/* FEATURED TEMPLATES - ASYMMETRICAL SPOTLIGHT BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-rose-500">
            KD Collection
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Thiệp Mời Tiêu Biểu
          </h2>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Khám phá 4 ấn phẩm thiệp mời tương tác nổi bật nhất do đội ngũ KD Atelier thiết kế.
          </p>
        </div>

        {/* Bento Grid: 1 Large Spotlight (Left) + 3 Editorial Cards (Right) */}
        {featuredTemplates.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Spotlight Card 1 (Left 7 Cols) */}
            {featuredTemplates[0] && (
              <div
                onClick={() => setDemoTemplate(featuredTemplates[0])}
                className={`lg:col-span-7 group relative rounded-2xl border overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                  isDark
                    ? 'bg-[#0f1522] border-slate-800 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-black'
                    : 'bg-white border-slate-200 hover:border-rose-500/40 hover:shadow-xl hover:shadow-slate-200/60'
                }`}
              >
                {/* Spotlight Image Container */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <img
                    src={featuredTemplates[0].thumbnailUrl}
                    alt={featuredTemplates[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-black/30 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-semibold tracking-wide shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Spotlight Nổi Bật Nhất
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10">
                      {featuredTemplates[0].isFree ? 'Miễn Phí' : `${featuredTemplates[0].price.toLocaleString('vi-VN')} đ`}
                    </span>
                  </div>

                  {/* Play Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-black/20">
                    <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Overlay Bottom Content */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-white space-y-1">
                    <h3 className="font-editorial text-lg sm:text-2xl font-bold leading-snug text-white">
                      {featuredTemplates[0].title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-1 max-w-lg hidden sm:block">
                      {featuredTemplates[0].description}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className={`p-3.5 flex items-center justify-between gap-3 border-t ${
                  isDark ? 'border-slate-800/80 bg-[#0c111a]' : 'border-slate-100 bg-slate-50/60'
                }`}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDemoTemplate(featuredTemplates[0]);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition active:scale-95 ${
                      isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-200 hover:bg-white text-slate-800'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-rose-500" />
                    <span>Xem Thử</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(featuredTemplates[0]);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm active:scale-95 transition flex items-center gap-1"
                  >
                    <span>Tạo Thiệp Này</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Right Stack: 3 Editorial Horizontal Cards (Right 5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3">
              {featuredTemplates.slice(1, 4).map((tpl, idx) => (
                <div
                  key={tpl.id}
                  onClick={() => setDemoTemplate(tpl)}
                  className={`group rounded-2xl border p-3 flex items-center gap-3.5 cursor-pointer transition-all duration-200 ${
                    isDark
                      ? 'bg-[#0f1522] border-slate-800 hover:border-rose-500/40 hover:bg-[#121a2a]'
                      : 'bg-white border-slate-200 hover:border-rose-500/40 hover:shadow-md hover:bg-slate-50/50'
                  }`}
                >
                  {/* Thumbnail Left */}
                  <div className="relative w-24 sm:w-28 aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={tpl.thumbnailUrl}
                      alt={tpl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
                      0{idx + 2}
                    </div>
                  </div>

                  {/* Info Right */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 truncate">
                        {tpl.category.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        tpl.isFree
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}>
                        {tpl.isFree ? 'Miễn Phí' : `${tpl.price.toLocaleString('vi-VN')} đ`}
                      </span>
                    </div>

                    <h4 className="font-editorial text-sm font-bold truncate text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                      {tpl.title}
                    </h4>
                    <p className={`text-xs line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {tpl.description}
                    </p>

                    <div className="pt-0.5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-rose-500 group-hover:underline inline-flex items-center gap-1">
                        Xem chi tiết <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center pt-2 sm:pt-4">
          <Link
            to="/templates"
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold border transition active:scale-95 ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:border-rose-500 text-white'
                : 'bg-white border-slate-200 hover:border-rose-500 text-slate-900 shadow-sm'
            }`}
          >
            <span>Khám Phá Toàn Bộ {templates.length} Mẫu Thiệp Mời</span>
            <ArrowRight className="w-4 h-4 text-rose-500" />
          </Link>
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
          className="w-full py-3.5 px-5 rounded-2xl font-semibold bg-rose-600 text-white text-xs shadow-xl shadow-rose-950/50 border border-white/20 flex items-center justify-between backdrop-blur-md active:scale-98 transition"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-200" />
            <span>Tạo thiệp tương tác độc bản</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-[11px] bg-white/20 px-2.5 py-1 rounded-xl">
            Bắt đầu <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  );
};
