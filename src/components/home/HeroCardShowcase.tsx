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

export const HeroCardShowcase: React.FC<HeroCardShowcaseProps> = ({ templates, isDark }) => {
  const [activeTabId, setActiveTabId] = useState<string>('sinh-nhat-nguoi-yeu-3d-cake');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');

  const showcaseTabs = [
    {
      id: 'sinh-nhat-nguoi-yeu-3d-cake',
      category: 'BIRTHDAY_LOVER',
      label: 'Người Yêu',
      fullName: 'Sinh Nhật Người Yêu 💖',
      icon: Gift,
      color: 'text-rose-500',
    },
    {
      id: 'sinh-nhat-ban-be-disco-neon',
      category: 'BIRTHDAY_FRIENDS',
      label: 'Bạn Bè',
      fullName: 'Đại Tiệc Bạn Bè 🎉',
      icon: Flame,
      color: 'text-amber-500',
    },
    {
      id: 'ky-niem-ngay-yeu-vinyl-player',
      category: 'LOVE_ANNIVERSARY',
      label: 'Kỷ Niệm',
      fullName: 'Kỷ Niệm Ngày Yêu 💍',
      icon: Heart,
      color: 'text-pink-500',
    },
    {
      id: 'thu-moi-su-kien-royal-wax-seal',
      category: 'EVENT_INVITATION',
      label: 'Thư Mời',
      fullName: 'Thư Mời Sự Kiện 💌',
      icon: Calendar,
      color: 'text-emerald-500',
    },
  ];

  // Match template strictly by slug first, then by official category
  const activeTemplate = useMemo(() => {
    if (!templates || templates.length === 0) return null;
    const currentTab = showcaseTabs.find((t) => t.id === activeTabId) || showcaseTabs[0];

    // Priority 1: Match by exact slug
    let match = templates.find((t) => t.slug === currentTab.id);
    if (match) return match;

    // Priority 2: Match by category and built-in template
    match = templates.find((t) => t.category === currentTab.category && t.templateType !== 'CUSTOM_CODE');
    if (match) return match;

    // Priority 3: Match by category
    match = templates.find((t) => t.category === currentTab.category);
    return match || templates[0];
  }, [templates, activeTabId]);

  return (
    <div className="w-full max-w-[620px] mx-auto space-y-4">
      {/* Top Controls: Category Tabs & Device Mode Toggle */}
      <div className={`p-2 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-md'
      }`}>
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {showcaseTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Device Switcher (Mobile 📱 vs Desktop 💻) */}
        <div className={`flex items-center p-1 rounded-2xl border shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-100 border-stone-200'
        }`}>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              deviceMode === 'mobile'
                ? 'bg-rose-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Chế độ Điện Thoại"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>

          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              deviceMode === 'desktop'
                ? 'bg-rose-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Chế độ Máy Tính / Laptop"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative flex justify-center items-center">
        {/* Glow ambient background */}
        <div className={`absolute -inset-3 rounded-[52px] blur-3xl opacity-35 pointer-events-none ${
          isDark ? 'bg-gradient-to-tr from-rose-500 via-amber-500 to-pink-600' : 'bg-rose-300'
        }`} />

        {deviceMode === 'mobile' ? (
          /* ================= MOBILE PHONE FRAME ================= */
          <div className={`relative w-full max-w-[380px] h-[580px] rounded-[44px] border-[8px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            isDark
              ? 'border-slate-800 bg-slate-950 ring-1 ring-slate-700/60 shadow-black'
              : 'border-stone-800 bg-white ring-1 ring-stone-300 shadow-stone-400/40'
          }`}>
            {/* Dynamic Island Notch */}
            <div className="h-5 bg-slate-950 flex items-center justify-center relative z-20 shrink-0">
              <div className="w-16 h-3 rounded-full bg-black flex items-center justify-between px-2">
                <div className="w-1 h-1 rounded-full bg-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700/60" />
              </div>
            </div>

            {/* Template Render Container */}
            <div className="flex-1 overflow-y-auto bg-slate-950 text-white relative">
              {activeTemplate ? (
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
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Đang tải mẫu thiệp...
                </div>
              )}
            </div>

            {/* Hint Badge */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/10 text-[10px] text-rose-300 font-semibold flex items-center gap-1 shadow pointer-events-none">
              <Sparkles className="w-3 h-3 text-rose-400" /> Chạm thử trực tiếp vào thiệp
            </div>
          </div>
        ) : (
          /* ================= LAPTOP / DESKTOP FRAME ================= */
          <div className="w-full flex flex-col items-center animate-fade">
            {/* Laptop Screen Bezel */}
            <div className={`relative w-full aspect-[16/10] max-h-[460px] rounded-t-2xl border-[8px] shadow-2xl overflow-hidden flex flex-col transition-all ${
              isDark
                ? 'border-slate-800 bg-slate-950 ring-1 ring-slate-700'
                : 'border-stone-800 bg-white ring-1 ring-stone-300 shadow-stone-400/40'
            }`}>
              {/* Web Browser Top Bar */}
              <div className="h-6 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">kdcard.vn/c/{activeTemplate?.slug}</span>
                <div className="w-6" />
              </div>

              {/* Template Render Container */}
              <div className="flex-1 overflow-y-auto bg-slate-950 text-white relative">
                {activeTemplate ? (
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
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Đang tải mẫu thiệp...
                  </div>
                )}
              </div>
            </div>

            {/* Laptop Base Stand */}
            <div className={`w-[110%] h-3 rounded-b-xl border-t shadow-md ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-stone-300 border-stone-400'
            }`}>
              <div className="w-16 h-1 rounded-full bg-slate-600/40 mx-auto mt-1" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
