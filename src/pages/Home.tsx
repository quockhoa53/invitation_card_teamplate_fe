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
            isDark ? 'bg-orange-500/10' : 'bg-orange-500/5'
          }`}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center w-full my-auto">
          {/* Left Column: Brand Story & CTA */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
            {/* Top Badge */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${
              isDark
                ? 'border-slate-800 bg-slate-900/80 text-slate-200'
                : 'border-slate-200 bg-slate-100/80 text-slate-800'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>KD Card Atelier 2026 — Nền Tảng Thiệp Mời Độc Bản</span>
            </div>

            {/* Emotional Punchy Headline (High Contrast Guaranteed) */}
            <h1 className={`font-editorial text-3xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-bold tracking-tight leading-[1.12] ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Trao gửi yêu thương qua thiệp mời{' '}
              <span className="text-orange-500">
                tương tác sống động
              </span>
            </h1>

            {/* Modern Value Statement */}
            <p className={`text-xs sm:text-base max-w-xl font-sans leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Tự tay tạo và cá nhân hóa thiệp sinh nhật, kỷ niệm tình yêu và thư mời sự kiện độc bản trong 30 giây. Tích hợp hiệu ứng 3D, âm nhạc và mã QR tự động gửi riêng người thân.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                to="/templates"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
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
                <Eye className="w-4 h-4 text-orange-500" />
                <span>Xem Bộ Sưu Tập</span>
              </Link>
            </div>

            {/* Minimalist Trust Stats (Bright, readable contrast in dark mode) */}
            <div className={`hidden sm:grid pt-4 border-t grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 text-left ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}>
              <div>
                <span className={`font-editorial text-base sm:text-lg font-bold block ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  4+ Kịch Bản
                </span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tương tác 3D độc quyền
                </span>
              </div>
              <div>
                <span className={`font-editorial text-base sm:text-lg font-bold block ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  100% Tự Động
                </span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Mã QR & Link riêng
                </span>
              </div>
              <div>
                <span className={`font-editorial text-base sm:text-lg font-bold block ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Bảo Mật Cao
                </span>
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

      {/* 3D SHOWCASE STAGE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3D Stage Exhibition Container */}
        <div className={`relative rounded-[32px] sm:rounded-[40px] border p-6 sm:p-10 lg:p-12 overflow-hidden transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#0e1422] via-[#090d16] to-[#06090e] border-slate-800 shadow-2xl shadow-black/80'
            : 'bg-gradient-to-b from-slate-100/90 via-slate-50 to-white border-slate-200/90 shadow-2xl shadow-slate-200/60'
        }`}>
          {/* 3D Stage Top Rim Illumination */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80" />

          {/* 3D Stage Overhead Spotlight Beam */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-b from-orange-500/20 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />

          {/* 3D Perspective Grid Floor (Crisp Orange Perspective) */}
          <div
            className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none opacity-45 dark:opacity-30"
            style={{
              backgroundImage: 'linear-gradient(to right, #f97316 1px, transparent 1px), linear-gradient(to bottom, #f97316 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              transform: 'perspective(450px) rotateX(55deg)',
              transformOrigin: 'bottom center',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* 3D Horizon Line */}
          <div className="absolute top-[40%] inset-x-8 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 space-y-2 mb-8 sm:mb-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] sm:text-xs font-bold uppercase tracking-wider border-orange-500/30 bg-orange-500/10 text-orange-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sân Khấu Trưng Bày 3D</span>
            </div>
            <h2 className={`font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Bộ Sưu Tập Thiệp Mời Tiêu Biểu
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              8 ấn phẩm thiệp mời tương tác nổi bật nhất trên không gian hiển thị 3D sống động.
            </p>
          </div>

          {/* 8 Cards in 2 Rows (4 Cards Per Row) - Raised on 3D Stage */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {displayTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] drop-shadow-xl hover:drop-shadow-2xl"
              >
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
          <div className="relative z-10 text-center pt-8 sm:pt-10">
            <Link
              to="/templates"
              className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold border transition active:scale-95 shadow-md ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700 hover:border-orange-500 hover:bg-slate-800 text-white'
                  : 'bg-white border-slate-200 hover:border-orange-500 hover:bg-slate-50 text-slate-900'
              }`}
            >
              <span>Khám Phá Toàn Bộ Bộ Sưu Tập</span>
              <ArrowRight className="w-4 h-4 text-orange-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Modal if clicked preview from homepage card */}
      {demoTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-md w-full h-[88vh] bg-slate-950 border border-slate-800 rounded-[38px] shadow-2xl overflow-hidden flex flex-col">
            <div className="h-9 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg active:scale-95 transition flex items-center gap-1.5"
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
          className="w-full py-3.5 px-5 rounded-2xl font-semibold bg-orange-500 text-white text-xs shadow-xl shadow-orange-950/50 border border-white/20 flex items-center justify-between backdrop-blur-md active:scale-98 transition"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-200" />
            <span>Tạo thiệp tương tác độc bản</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-[11px] bg-white/20 px-2.5 py-1 rounded-xl">
            Bắt đầu <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Modal Purchase & Unlock Template */}
      <PurchaseTemplateModal
        template={purchasingTemplate}
        isOpen={!!purchasingTemplate}
        onClose={() => setPurchasingTemplate(null)}
        onSuccess={(tpl) => {
          setPurchasingTemplate(null);
          navigate(`/editor?templateId=${tpl.id}`);
        }}
      />
    </div>
  );
};
