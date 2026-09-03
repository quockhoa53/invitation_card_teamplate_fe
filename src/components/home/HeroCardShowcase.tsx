import React, { useState, useMemo } from 'react';
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
  'ky-niem-ngay-yeu-vinyl-player': {
    id: 'fallback-3',
    title: 'Kỷ Niệm Ngày Yêu Vinyl Player',
    slug: 'ky-niem-ngay-yeu-vinyl-player',
    category: 'LOVE_ANNIVERSARY',
    templateType: 'BUILT_IN',
    defaultConfig: JSON.stringify({
      coupleNames: 'Khoa & Đan',
      startDate: '2023-05-20',
      loveMessage: 'Cảm ơn em vì đã đến và đồng hành cùng anh qua từng khoảnh khắc ngọt ngào nhất.',
      musicTrack: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3',
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

export const HeroCardShowcase: React.FC<HeroCardShowcaseProps> = ({ templates, isDark }) => {
  const [activeTabId, setActiveTabId] = useState<string>('sinh-nhat-nguoi-yeu-3d-cake');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');

  const showcaseTabs = [
    {
      id: 'sinh-nhat-nguoi-yeu-3d-cake',
      category: 'BIRTHDAY_LOVER',
      label: 'Người Yêu',
      icon: Gift,
    },
    {
      id: 'sinh-nhat-ban-be-disco-neon',
      category: 'BIRTHDAY_FRIENDS',
      label: 'Bạn Bè',
      icon: Flame,
    },
    {
      id: 'ky-niem-ngay-yeu-vinyl-player',
      category: 'LOVE_ANNIVERSARY',
      label: 'Kỷ Niệm',
      icon: Heart,
    },
    {
      id: 'thu-moi-su-kien-royal-wax-seal',
      category: 'EVENT_INVITATION',
      label: 'Thư Mời',
      icon: Calendar,
    },
  ];

  // Match template from backend first; if loading or not found, fall back instantly to built-in template
  const activeTemplate = useMemo(() => {
    const currentTab = showcaseTabs.find((t) => t.id === activeTabId) || showcaseTabs[0];

    if (templates && templates.length > 0) {
      let match = templates.find((t) => t.slug === currentTab.id);
      if (match) return match;

      match = templates.find((t) => t.category === currentTab.category && t.templateType !== 'CUSTOM_CODE');
      if (match) return match;

      match = templates.find((t) => t.category === currentTab.category);
      if (match) return match;
    }

    return FALLBACK_TEMPLATES[currentTab.id] || FALLBACK_TEMPLATES['sinh-nhat-nguoi-yeu-3d-cake'];
  }, [templates, activeTabId]);

  return (
    <div className="w-full max-w-[540px] mx-auto space-y-3">
      {/* Top Controls: Category Tabs & Device Mode Toggle */}
      <div className={`p-1.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors ${
        isDark ? 'bg-[#121824]/90 border-slate-800' : 'bg-white/95 border-stone-200 shadow-sm'
      }`}>
        {/* Category Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {showcaseTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Device Switcher (Mobile 📱 vs Desktop 💻) */}
        <div className={`flex items-center p-0.5 rounded-xl border shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-100 border-stone-200'
        }`}>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all ${
              deviceMode === 'mobile'
                ? 'bg-rose-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile</span>
          </button>

          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all ${
              deviceMode === 'desktop'
                ? 'bg-rose-500 text-white shadow-sm'
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

      {/* Frame Container */}
      <div className="relative flex justify-center items-center">
        {/* Glow ambient background */}
        <div className={`absolute -inset-2 rounded-[44px] blur-2xl opacity-25 pointer-events-none ${
          isDark ? 'bg-gradient-to-tr from-rose-500 via-amber-500 to-pink-600' : 'bg-rose-300'
        }`} />

        {deviceMode === 'mobile' ? (
          /* ================= MOBILE PHONE FRAME ================= */
          <div className={`relative w-full max-w-[310px] sm:max-w-[330px] xl:max-w-[350px] h-[450px] sm:h-[480px] xl:h-[500px] rounded-[36px] border-[6px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
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

            {/* Template Render Container */}
            <div className="flex-1 overflow-y-auto bg-slate-950 text-white relative">
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
                  wishes={[]}
                  isPreview={true}
                />
              )}
            </div>

            {/* Hint Badge */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/10 text-[9px] text-rose-300 font-semibold flex items-center gap-1 shadow pointer-events-none">
              <Sparkles className="w-2.5 h-2.5 text-rose-400" /> Chạm thử trực tiếp vào thiệp
            </div>
          </div>
        ) : (
          /* ================= LAPTOP / DESKTOP FRAME ================= */
          <div className="w-full flex flex-col items-center animate-fade">
            {/* Laptop Screen Bezel */}
            <div className={`relative w-full aspect-[16/10] max-h-[380px] rounded-t-2xl border-[6px] shadow-2xl overflow-hidden flex flex-col transition-all ${
              isDark
                ? 'border-slate-800 bg-slate-950 ring-1 ring-slate-700'
                : 'border-stone-800 bg-white ring-1 ring-stone-300 shadow-stone-400/40'
            }`}>
              {/* Web Browser Top Bar */}
              <div className="h-5 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">kdcard.vn/c/{activeTemplate?.slug}</span>
                <div className="w-5" />
              </div>

              {/* Template Render Container */}
              <div className="flex-1 overflow-y-auto bg-slate-950 text-white relative">
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
                    wishes={[]}
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
          </div>
        )}
      </div>
    </div>
  );
};
