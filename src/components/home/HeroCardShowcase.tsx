import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Template } from '../../types';
import { TemplateRenderer } from '../../templates/TemplateRenderer';
import {
  Smartphone,
  Laptop,
  Sparkles,
  Gift,
  Flame,
  Heart,
  Calendar,
  ChevronDown,
  Check,
} from 'lucide-react';

interface HeroCardShowcaseProps {
  templates: Template[];
  isDark: boolean;
}

// Built-in fallback mock templates for instant hero rendering without waiting for backend
const FALLBACK_TEMPLATES: Record<string, Template> = {
  'sinh-nhat-nguoi-yeu-3d-cake': {
    id: 'fallback-1',
    title: 'Sinh Nhật Người Yêu 3D Cake',
    slug: 'sinh-nhat-nguoi-yeu-3d-cake',
    category: 'BIRTHDAY_LOVER',
    templateType: 'BUILT_IN',
    defaultConfig: JSON.stringify({
      recipientName: 'Em Yêu 💖',
      message: 'Chúc mừng sinh nhật cô gái ngọt ngào nhất thế gian! Chúc em luôn rạng rỡ và hạnh phúc bên anh.',
      candleCount: 20,
      musicTrack: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
    }),
    isPremium: false,
    price: 0,
    viewCount: 120,
    usageCount: 45,
    isPublished: true,
  } as unknown as Template,
  'sinh-nhat-ban-be-disco-neon': {
    id: 'fallback-2',
    title: 'Sinh Nhật Bạn Bè Disco Neon',
    slug: 'sinh-nhat-ban-be-disco-neon',
    category: 'BIRTHDAY_FRIENDS',
    templateType: 'BUILT_IN',
    defaultConfig: JSON.stringify({
      friendName: 'Chiến Hữu 🎉',
      message: 'Happy Birthday bạn hiền! Tuổi mới bùng nổ, thành công rực rỡ và luôn cháy hết mình nhé!',
      musicTrack: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    }),
    isPremium: false,
    price: 0,
    viewCount: 88,
    usageCount: 30,
    isPublished: true,
  } as unknown as Template,
  'ky-niem-ngay-yeu-falling-hearts': {
    id: 'fallback-3',
    title: 'Kỷ Niệm Ngày Yêu Mưa Chữ Neon',
    slug: 'ky-niem-ngay-yeu-falling-hearts',
    category: 'LOVE_ANNIVERSARY',
    templateType: 'BUILT_IN',
    defaultConfig: JSON.stringify({
      recipientName: 'Đức Huy 💖',
      senderName: 'Quỳnh Anh',
      anniversaryStartDate: '2023-06-08',
      greetingTitle: 'Mừng Kỷ Niệm 1000 Ngày Yêu Nhau ✨',
      greetingMessage: 'Mỗi ngày trôi qua được ở bên anh đều là một ngày tuyệt vời nhất. Cảm ơn anh vì đã luôn yêu thương và là chỗ dựa vững vàng của em!',
      musicUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3',
      fallingWords: [
        'Em yêu anh',
        'thành công',
        'vững vàng',
        'Chúc anh luôn vui vẻ',
        'Quỳnh Anh',
        'Đức Huy',
        'Happy Anniversary',
        '1000 Days',
        'Yêu anh nhiều lắm',
        'Mãi bên nhau',
      ],
    }),
    isPremium: false,
    price: 0,
    viewCount: 150,
    usageCount: 62,
    isPublished: true,
  } as unknown as Template,
  'thu-moi-su-kien-royal-wax-seal': {
    id: 'fallback-4',
    title: 'Thư Mời Sự Kiện Royal Wax Seal',
    slug: 'thu-moi-su-kien-royal-wax-seal',
    category: 'EVENT_INVITATION',
    templateType: 'BUILT_IN',
    defaultConfig: JSON.stringify({
      eventName: 'Dạ Tiệc Tri Ân & Giao Lưu',
      eventDate: '2026-10-20',
      location: 'The Reverie Saigon',
      invitationBody: 'Trân trọng kính mời quý khách đến tham dự buổi dạ tiệc thân mật của chúng tôi.',
    }),
    isPremium: false,
    price: 0,
    viewCount: 95,
    usageCount: 28,
    isPublished: true,
  } as unknown as Template,
};

// Empty constant array to prevent re-rendering child template renderers
const EMPTY_WISHES: any[] = [];

interface HeroPreviewFrameProps {
  deviceMode: 'mobile' | 'desktop';
  activeTemplate: Template | null;
  isDark: boolean;
}

// Memoized preview frame: NEVER re-renders when dropdown opens or closes
const HeroPreviewFrame = React.memo<HeroPreviewFrameProps>(({ deviceMode, activeTemplate, isDark }) => {
  return (
    <div className="relative flex justify-center items-center">
      {/* Glow ambient background */}
      <div className={`absolute -inset-2 rounded-[44px] blur-2xl pointer-events-none ${
        isDark ? 'bg-orange-500/15' : 'bg-orange-500/10'
      }`} />

      <AnimatePresence mode="wait">
        {deviceMode === 'mobile' ? (
          /* ================= SLEEK SMARTPHONE FRAME ================= */
          <motion.div
            key="mobile-frame"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full flex justify-center items-center"
          >
            <div className={`relative w-[260px] xs:w-[280px] sm:w-[305px] h-[350px] xs:h-[390px] sm:h-[540px] rounded-[28px] sm:rounded-[40px] border-[5px] sm:border-[7px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isDark
                ? 'border-slate-800 bg-slate-950 ring-1 ring-slate-700/60 shadow-black'
                : 'border-stone-800 bg-white ring-1 ring-stone-300 shadow-stone-400/40'
            }`}>
              {/* Dynamic Island Notch */}
              <div className="h-4 bg-slate-950 flex items-center justify-center relative z-20 shrink-0">
                <div className="w-14 h-2.5 rounded-full bg-black flex items-center justify-between px-1.5">
                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700/60" />
                </div>
              </div>

              {/* Template Render Container (Full Native Smooth Scroll Enabled) */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 text-white relative scroll-smooth overscroll-contain touch-pan-y [scrollbar-width:thin] [scrollbar-color:rgba(249,115,22,0.3)_transparent]">
                {activeTemplate && (
                  <TemplateRenderer
                    slug={activeTemplate.slug}
                    category={activeTemplate.category}
                    templateType={activeTemplate.templateType}
                    customHtml={activeTemplate.customHtml}
                    customCss={activeTemplate.customCss}
                    customJs={activeTemplate.customJs}
                    customData={activeTemplate.defaultConfig}
                    title={activeTemplate.title}
                    wishes={EMPTY_WISHES}
                    isPreview={true}
                  />
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ================= LAPTOP / DESKTOP FRAME ================= */
          <motion.div
            key="desktop-frame"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full flex flex-col items-center"
          >
            {/* Laptop Screen Bezel */}
            <div className={`relative w-full aspect-[16/10] max-h-[380px] rounded-t-2xl border-[6px] shadow-2xl overflow-hidden flex flex-col transition-all ${
              isDark
                ? 'border-slate-800 bg-slate-950 ring-1 ring-slate-700'
                : 'border-stone-800 bg-white ring-1 ring-stone-300 shadow-stone-400/40'
            }`}>
              {/* Web Browser Top Bar */}
              <div className="h-5 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">kdcard.vn/c/{activeTemplate?.slug}</span>
                <div className="w-5" />
              </div>

              {/* Template Render Container (Full Native Smooth Scroll Enabled) */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 text-white relative scroll-smooth overscroll-contain touch-pan-y [scrollbar-width:thin] [scrollbar-color:rgba(249,115,22,0.3)_transparent]">
                {activeTemplate && (
                  <TemplateRenderer
                    slug={activeTemplate.slug}
                    category={activeTemplate.category}
                    templateType={activeTemplate.templateType}
                    customHtml={activeTemplate.customHtml}
                    customCss={activeTemplate.customCss}
                    customJs={activeTemplate.customJs}
                    customData={activeTemplate.defaultConfig}
                    title={activeTemplate.title}
                    wishes={EMPTY_WISHES}
                    isPreview={true}
                  />
                )}
              </div>
            </div>

            {/* Laptop Base Stand */}
            <div className={`w-[106%] h-2.5 rounded-b-xl border-t shadow-md ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-stone-300 border-stone-400'
            }`}>
              <div className="w-12 h-0.5 rounded-full bg-slate-600/40 mx-auto mt-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export const HeroCardShowcase: React.FC<HeroCardShowcaseProps> = ({ templates, isDark }) => {
  const [activeTabId, setActiveTabId] = useState<string>('sinh-nhat-nguoi-yeu-3d-cake');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showcaseTabs = [
    {
      id: 'sinh-nhat-nguoi-yeu-3d-cake',
      category: 'BIRTHDAY_LOVER',
      label: 'Sinh Nhật',
      fullName: 'Sinh Nhật Người Yêu',
      desc: 'Bánh kem 3D & Thổi nến tương tác',
      icon: Sparkles,
    },
    {
      id: 'ky-niem-ngay-yeu-falling-hearts',
      category: 'LOVE_ANNIVERSARY',
      label: 'Kỷ Niệm',
      fullName: 'Kỷ Niệm Ngày Yêu',
      desc: 'Mưa chữ neon & Đếm ngày yêu',
      icon: Heart,
    },
    {
      id: 'sinh-nhat-ban-be-disco-neon',
      category: 'BIRTHDAY_FRIENDS',
      label: 'Bạn Bè',
      fullName: 'Đại Tiệc Bạn Bè',
      desc: 'Giai điệu Disco Neon sôi động',
      icon: Flame,
    },
    {
      id: 'thu-moi-su-kien-royal-wax-seal',
      category: 'EVENT_INVITATION',
      label: 'Sự Kiện',
      fullName: 'Thư Mời Sự Kiện',
      desc: 'Dấu sáp hoàng gia & Quét QR',
      icon: Calendar,
    },
  ];

  // Efficient outside click & touch listener - only attached when dropdown is actually open
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const currentTab = showcaseTabs.find((t) => t.id === activeTabId) || showcaseTabs[0];

  // Match template from backend first; if loading or not found, fall back instantly to built-in template
  const activeTemplate = useMemo(() => {
    if (templates && templates.length > 0) {
      let match = templates.find((t) => t.slug === currentTab.id);
      if (match) return match;

      match = templates.find((t) => t.category === currentTab.category && t.templateType !== 'CUSTOM_CODE');
      if (match) return match;

      match = templates.find((t) => t.category === currentTab.category);
      if (match) return match;
    }

    return FALLBACK_TEMPLATES[currentTab.id] || FALLBACK_TEMPLATES['sinh-nhat-nguoi-yeu-3d-cake'];
  }, [templates, currentTab]);

  return (
    <div className="w-full max-w-[500px] mx-auto space-y-3">
      {/* Top Controls: Sleek Dropdown & Device Switcher */}
      <div className={`p-2 rounded-2xl border flex items-center justify-between gap-2.5 transition-colors relative z-30 ${
        isDark ? 'bg-[#0f1522]/95 border-slate-800/80 shadow-xl' : 'bg-white/95 border-slate-200/80 shadow-sm'
      }`}>
        {/* Modern Elegant Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`touch-manipulation flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-95 ${
              isDark
                ? 'bg-slate-900 border-slate-700/80 text-white hover:border-orange-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-orange-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/60 shrink-0 animate-pulse" />
            <span className="truncate max-w-[125px] xs:max-w-[155px] sm:max-w-[175px]">{currentTab.fullName}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${
              isDropdownOpen ? 'rotate-180 text-orange-500' : ''
            }`} />
          </button>

          {/* Floating Dropdown Menu - High Performance (No GPU-heavy backdrop-blur lag on mobile) */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className={`absolute top-full left-0 mt-2 w-64 sm:w-72 p-2 rounded-2xl border shadow-2xl z-50 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white shadow-black/80'
                    : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/60'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 text-slate-400">
                  Bộ sưu tập thiệp tương tác
                </div>
                <div className="space-y-1">
                  {showcaseTabs.map((tab, idx) => {
                    const isSelected = activeTabId === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTabId(tab.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`touch-manipulation w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30'
                              : 'bg-orange-50 text-orange-600 font-semibold border border-orange-200'
                            : isDark
                            ? 'hover:bg-slate-800/60 text-slate-300'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                              : isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            0{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate leading-snug">{tab.fullName}</p>
                            <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {tab.desc}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-500 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Device Switcher (Mobile 📱 vs Desktop 💻) - High Performance & Always Visible */}
        <div className={`flex items-center p-0.5 rounded-xl border shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-100 border-stone-200'
        }`}>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`touch-manipulation px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all ${
              deviceMode === 'mobile'
                ? 'bg-orange-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`touch-manipulation px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all ${
              deviceMode === 'desktop'
                ? 'bg-orange-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Laptop className="w-3 h-3" />
            <span>Desktop</span>
          </button>
        </div>
      </div>

      {/* Interactive Prompt Hint */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-400 py-0.5">
        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
        <span>Trải nghiệm tương tác trực tiếp trên màn hình</span>
      </div>

      {/* Frame Container (Rendered by Memoized Component) */}
      <HeroPreviewFrame
        deviceMode={deviceMode}
        activeTemplate={activeTemplate}
        isDark={isDark}
      />
    </div>
  );
};
