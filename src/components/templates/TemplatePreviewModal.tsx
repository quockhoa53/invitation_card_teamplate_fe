import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Template } from '../../types';
import { TemplateRenderer } from '../../templates/TemplateRenderer';
import {
  X,
  Smartphone,
  Monitor,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: Template) => void;
  actionText?: string;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate,
  actionText = 'Sử Dụng Mẫu Này',
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');

  // Lock body & documentElement scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        margin: 0,
      }}
      onClick={onClose}
    >
      <div
        className={`relative w-full h-[90vh] max-h-[880px] bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          deviceMode === 'mobile'
            ? 'max-w-[430px] rounded-[38px] ring-1 ring-white/10'
            : 'max-w-5xl rounded-3xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Header */}
        <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-white shrink-0 gap-2 select-none">
          {/* Left: macOS dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition active:scale-95"
              title="Đóng"
            />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          {/* Center: Device Switcher (Mobile vs Desktop) */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                deviceMode === 'mobile'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Điện thoại</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                deviceMode === 'desktop'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Máy tính</span>
            </button>
          </div>

          {/* Right: Title & Close Button */}
          <div className="flex items-center gap-2 shrink-0 max-w-[160px] sm:max-w-[240px]">
            <span
              className="text-xs font-medium text-slate-300 truncate hidden sm:inline"
              title={template.title}
            >
              {template.title}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Đóng cửa sổ xem thử"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Template Interactive Preview Body */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-950">
          <TemplateRenderer
            slug={template.slug}
            category={template.category}
            templateType={template.templateType}
            customHtml={template.customHtml}
            customCss={template.customCss}
            customJs={template.customJs}
            customData={template.defaultConfig}
            title={template.title}
            wishes={[]}
            isPreview={true}
          />
        </div>

        {/* Bottom Modal Actions */}
        <div className="p-3 sm:p-3.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Đóng
            </button>

            {/* Template badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {template.price && template.price > 0
                ? `${template.price.toLocaleString('vi-VN')} đ`
                : 'Miễn phí'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onUseTemplate(template);
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 active:scale-95 transition flex items-center gap-1.5"
          >
            <span>{actionText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
