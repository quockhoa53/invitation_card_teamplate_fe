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
import { TemplatePreviewModal } from '../components/templates/TemplatePreviewModal';
import { TemplateCardSkeleton } from '../components/common/Skeleton';
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
  Mail,
  MessageCircle,
  Palette,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated, isTemplateOwned } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [demoTemplate, setDemoTemplate] = useState<Template | null>(null);
  const [purchasingTemplate, setPurchasingTemplate] = useState<Template | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const res = await api.getTemplates();
        if (res.success && res.data) {
          setTemplates(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch templates', err);
      } finally {
        setIsLoadingTemplates(false);
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
      <section className="relative pt-1 sm:pt-6 pb-2 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center">
        {/* Subtle Single Accent Ambient Glow */}
        <div
          className={`absolute top-1/4 left-1/4 w-[400px] sm:w-[500px] h-[260px] sm:h-[300px] rounded-full blur-[140px] pointer-events-none ${isDark ? 'bg-orange-500/10' : 'bg-orange-500/5'
            }`}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center w-full my-auto">
          {/* Left Column: Brand Story & CTA */}
          <div className="lg:col-span-7 space-y-2.5 sm:space-y-5 text-center lg:text-left">
            {/* Top Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-semibold tracking-wide ${isDark
              ? 'border-slate-800 bg-slate-900/80 text-slate-300'
              : 'border-slate-200 bg-slate-100/80 text-slate-700'
              }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>KD Card Atelier 2026 — Nền Tảng Thiệp Mời Độc Bản</span>
            </div>

            {/* Emotional Punchy Headline (High Contrast Guaranteed) */}
            <h1 className={`font-editorial text-2xl xs:text-3xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-bold tracking-tight leading-[1.18] sm:leading-[1.12] ${isDark ? 'text-white' : 'text-slate-900'
              }`}>
              Trao gửi yêu thương qua thiệp mời{' '}
              <span className="text-orange-500">
                tương tác sống động
              </span>
            </h1>

            {/* Modern Value Statement */}
            <p className={`text-xs sm:text-base max-w-xl font-sans leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
              <span className="sm:hidden">
                Tự tay tạo thiệp sinh nhật, kỷ niệm tình yêu & sự kiện tương tác 3D độc bản trong 30 giây với âm nhạc và mã QR tự động.
              </span>
              <span className="hidden sm:inline">
                Tự tay tạo và cá nhân hóa thiệp sinh nhật, kỷ niệm tình yêu và thư mời sự kiện độc bản trong 30 giây. Tích hợp hiệu ứng 3D, âm nhạc và mã QR tự động gửi riêng người thân.
              </span>
            </p>

            {/* Action Buttons (Desktop Only - Mobile uses floating action bar) */}
            <div className="pt-2 hidden sm:flex items-center justify-center lg:justify-start gap-3">
              <Link
                to="/templates"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sáng Tạo Thiệp Cho Riêng Bạn Ngay</span>
              </Link>

              <Link
                to="/templates"
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all active:scale-95 ${isDark
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
                  }`}
              >
                <Eye className="w-4 h-4 text-orange-500" />
                <span>Xem Bộ Sưu Tập</span>
              </Link>
            </div>

            {/* Minimalist Trust Stats (Bright, readable contrast in dark mode) */}
            <div className={`hidden sm:grid pt-4 border-t grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 text-left ${isDark ? 'border-slate-800/80' : 'border-slate-200'
              }`}>
              <div>
                <span className={`font-editorial text-base sm:text-lg font-bold block ${isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                  4+ Kịch Bản
                </span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tương tác 3D độc quyền
                </span>
              </div>
              <div>
                <span className={`font-editorial text-base sm:text-lg font-bold block ${isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                  100% Tự Động
                </span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Mã QR & Link riêng
                </span>
              </div>
              <div>
                <span className={`font-editorial text-base sm:text-lg font-bold block ${isDark ? 'text-white' : 'text-slate-900'
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
        <div className={`relative rounded-[32px] sm:rounded-[40px] border p-6 sm:p-10 lg:p-12 overflow-hidden transition-colors ${isDark
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
            <h2 className={`font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'
              }`}>
              Bộ Sưu Tập Thiệp Mời Tiêu Biểu
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Các ấn phẩm thiệp mời tương tác nổi bật nhất trên không gian hiển thị 3D sống động.
            </p>
          </div>

          {/* 8 Cards in 2 Rows (Desktop) / 4 Cards (Mobile) - Raised on 3D Stage */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {isLoadingTemplates
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className={idx >= 4 ? 'hidden sm:block' : ''}>
                    <TemplateCardSkeleton />
                  </div>
                ))
              : displayTemplates.map((tpl, idx) => (
                  <div
                    key={tpl.id}
                    className={`transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] drop-shadow-xl hover:drop-shadow-2xl ${
                      idx >= 4 ? 'hidden sm:block' : ''
                    }`}
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
              className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold border transition active:scale-95 shadow-md ${isDark
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

      {/* BESPOKE CUSTOM SERVICE SECTION (Chuẩn SEO, Đặt Thiết Kế Riêng Theo Ý Tưởng) */}
      <section
        id="thiet-ke-theo-yeu-cau"
        aria-labelledby="bespoke-section-title"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className={`relative rounded-[32px] sm:rounded-[40px] border p-6 sm:p-10 lg:p-12 overflow-hidden transition-all ${isDark
          ? 'bg-gradient-to-br from-slate-900/95 via-[#0d131f] to-slate-950 border-slate-800 shadow-2xl shadow-orange-950/20'
          : 'bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 border-orange-200/70 shadow-xl shadow-orange-100/50'
          }`}>
          {/* Ambient Warm Corner Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider border-orange-500/30 bg-orange-500/10 text-orange-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dịch Vụ Thiết Kế Độc Bản — Bespoke Atelier</span>
              </div>

              <h2
                id="bespoke-section-title"
                className={`font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                <span className="text-orange-500">Đặt Thiết Kế Riêng</span> Theo Ý Tưởng Của Bạn
              </h2>

              <p className={`text-xs sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                Mỗi câu chuyện tình yêu, cột mốc sinh nhật hay sự kiện trọng đại đều mang linh hồn độc nhất. Nếu các mẫu có sẵn chưa trọn vẹn mong đợi, hãy liên hệ trực tiếp với tác giả để cùng lên ý tưởng và hiện thực hóa mẫu thiệp tương tác độc bản chỉ dành riêng cho bạn.
              </p>
            </div>

            {/* 3 Core Value Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-10">
              {/* Pillar 1 */}
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${isDark
                ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                : 'bg-white/80 border-slate-200/80 hover:border-orange-300 shadow-sm'
                }`}>
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center mb-4">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className={`text-sm sm:text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Ý Tưởng & Kịch Bản Không Giới Hạn
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Tự do phối trộn hiệu ứng 3D, thổi nến, mở hộp quà, câu đố mini game, mưa chữ neon và âm nhạc theo đúng kỷ niệm của hai bạn.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${isDark
                ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                : 'bg-white/80 border-slate-200/80 hover:border-orange-300 shadow-sm'
                }`}>
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className={`text-sm sm:text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Trao Đổi 1:1 — Bàn Giao 24h Đến 48h
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Lắng nghe từng chi tiết, lên bản demo trực tiếp trên điện thoại để bạn trải nghiệm thử và chỉnh sửa đến khi hoàn toàn hài lòng.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${isDark
                ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                : 'bg-white/80 border-slate-200/80 hover:border-orange-300 shadow-sm'
                }`}>
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className={`text-sm sm:text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Bảo mật & Đa Dạng
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Hỗ trợ làm đa dạng mẫu theo yêu cầu riêng, có hỗ trợ nhiều loại QR cho mẫu. Ngoài ra, mỗi mẫu có thể cài mật khẩu riêng tư để bảo mật thông tin của bạn
                </p>
              </div>
            </div>

            {/* Direct Contact Action Cards (Zalo & Email) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
              {/* Zalo Card */}
              <a
                href="https://zalo.me/0969895549"
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between active:scale-98 ${isDark
                  ? 'bg-gradient-to-b from-blue-950/40 to-slate-900/80 border-blue-900/50 hover:border-blue-500'
                  : 'bg-gradient-to-b from-blue-50/80 to-white border-blue-200 hover:border-blue-400 shadow-md shadow-blue-500/10'
                  }`}
              >
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-[#0068FF] text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                      <MessageCircle className="w-5 h-5" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Phản hồi trong 15 phút
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Trò Chuyện Qua Zalo
                    </h3>
                    <p className="text-xs text-slate-400">
                      Zalo: <span className="font-semibold text-blue-500 dark:text-blue-400">0981 966 144</span> (Quốc Khoa)
                    </p>
                  </div>
                </div>

                <div className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#0068FF] group-hover:bg-[#0055d4] text-white flex items-center justify-center gap-2 shadow-md transition">
                  <MessageCircle className="w-4 h-4" />
                  <span>Nhắn Tin Zalo Trao Đổi Ngay</span>
                </div>
              </a>

              {/* Email Card */}
              <a
                href="mailto:nguyenquockhoa5549@gmail.com?subject=Y%C3%AAu%20c%E1%BA%A7u%20thi%E1%BA%BFt%20k%E1%BA%BF%20thi%E1%BB%87p%20m%E1%BB%9Di%20%C4%91%E1%BB%99c%20b%E1%BA%A3n%20KD%20Card&body=Ch%C3%A0o%20b%E1%BA%A1n%2C%20m%C3%ACnh%20mu%E1%BB%91n%20trao%20%C4%91%E1%BB%95i%20%C3%BD%20t%C6%B0%E1%BB%9Fng%20thi%E1%BA%BFt%20k%E1%BA%BF%20thi%E1%BB%87p%20m%E1%BB%9Di%20ri%C3%AAng%3A%0A-%20D%E1%BB%8Bp%20s%E1%BB%B1%20ki%E1%BB%87n%3A%20%0A-%20%C3%9D%20t%C6%B0%E1%BB%9Fng%20mong%20mu%E1%BB%91n%3A%20%0A-%20S%E1%BB%91%20%C4%91i%E1%BB%87n%20tho%E1%BA%A1i%20li%C3%AAn%20h%E1%BB%87%3A%20"
                className={`group p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between active:scale-98 ${isDark
                  ? 'bg-gradient-to-b from-orange-950/40 to-slate-900/80 border-orange-900/50 hover:border-orange-500'
                  : 'bg-gradient-to-b from-orange-50/80 to-white border-orange-200 hover:border-orange-400 shadow-md shadow-orange-500/10'
                  }`}
              >
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
                      <Mail className="w-5 h-5" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/15 text-orange-600 dark:text-orange-400">
                      Gửi kèm ảnh & kịch bản
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Gửi Yêu Cầu Qua Email
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      Email: <span className="font-semibold text-orange-500 dark:text-orange-400">nguyenquockhoa5549@gmail.com</span>
                    </p>
                  </div>
                </div>

                <div className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-orange-500 group-hover:bg-orange-600 text-white flex items-center justify-center gap-2 shadow-md transition">
                  <Mail className="w-4 h-4" />
                  <span>Gửi Email Ý Tưởng & Tài Liệu</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Preview Modal with Device Switcher (Mobile & Desktop) */}
      <TemplatePreviewModal
        template={demoTemplate}
        isOpen={!!demoTemplate}
        onClose={() => setDemoTemplate(null)}
        onUseTemplate={(tpl) => handleUseTemplate(tpl)}
      />

      {/* Floating Mobile Bottom Action Pill */}
      <div className="sm:hidden fixed bottom-4 inset-x-4 z-40">
        <Link
          to="/templates"
          className="w-full py-3.5 px-5 rounded-2xl font-semibold bg-orange-500 text-white text-xs shadow-xl shadow-orange-950/50 border border-white/20 flex items-center justify-between backdrop-blur-md active:scale-98 transition"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-200 shrink-0" />
            <span className="truncate">Sáng tạo thiệp cho riêng bạn ngay</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-[11px] bg-white/20 px-2.5 py-1 rounded-xl shrink-0 ml-2">
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
