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

  // Display real templates from database (up to 8 templates, 2 rows of 4)
  const displayTemplates = useMemo(() => templates.slice(0, 8), [templates]);

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

      {/* 3D SHOWCASE STAGE: 8 CARDS ARRANGED IN 2 ROWS (4 PER ROW) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 py-6">
        {/* 3D Perspective Stage Horizon Glow & Grid Floor */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl">
          {/* Subtle 3D Perspective Grid Floor */}
          <div
            className="absolute inset-0 opacity-[0.2] dark:opacity-[0.15] [background-image:linear-gradient(to_right,#e11d48_1px,transparent_1px),linear-gradient(to_bottom,#e11d48_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_60%,transparent_100%)]"
            style={{
              transform: 'perspective(1000px) rotateX(28deg) scale(1.12)',
              transformOrigin: 'top center',
            }}
          />
          {/* Stage Center Ambient Spotlight */}
          <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[380px] rounded-full blur-[140px] pointer-events-none ${
            isDark ? 'bg-rose-600/15' : 'bg-rose-500/10'
          }`} />
        </div>

        {/* Section Header */}
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs uppercase font-bold tracking-widest text-rose-500">
            KD Showcase 3D Stage
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bộ Sưu Tập Thiệp Mời Tiêu Biểu
          </h2>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            8 ấn phẩm thiệp mời tương tác nổi bật nhất trên không gian hiển thị 3D sống động.
          </p>
        </div>

        {/* 8 Cards in 2 Rows (4 Cards Per Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayTemplates.map((tpl) => (
            <TemplateCardItem
              key={tpl.id}
              template={tpl}
              isDark={isDark}
              onPreview={(t) => setDemoTemplate(t)}
              onUse={(t) => handleUseTemplate(t)}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center pt-4 sm:pt-6">
          <Link
            to="/templates"
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold border transition active:scale-95 ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:border-rose-500 text-white'
                : 'bg-white border-slate-200 hover:border-rose-500 text-slate-900 shadow-sm'
            }`}
          >
            <span>Khám Phá Toàn Bộ Bộ Sưu Tập</span>
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
