import React from 'react';
import { Template } from '../../types';
import { Eye, ChevronRight, Play, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TemplateCardItemProps {
  template: Template;
  isDark: boolean;
  onPreview: (tpl: Template) => void;
  onUse: (tpl: Template) => void;
}

export const TemplateCardItem: React.FC<TemplateCardItemProps> = ({
  template,
  isDark,
  onPreview,
  onUse,
}) => {
  const { isTemplateOwned } = useAuth();
  const isOwned = isTemplateOwned(template);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'BIRTHDAY_LOVER':
        return 'Sinh Nhật Người Yêu';
      case 'BIRTHDAY_FRIENDS':
        return 'Sinh Nhật Bạn Bè';
      case 'LOVE_ANNIVERSARY':
        return 'Kỷ Niệm Tình Yêu';
      case 'EVENT_INVITATION':
        return 'Thư Mời Sự Kiện & Cưới';
      default:
        return 'Mẫu Thiệp Mời';
    }
  };

  return (
    <div
      onClick={() => onPreview(template)}
      className={`group relative rounded-[22px] border p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-[#0e1422] border-slate-800/90 hover:border-orange-500/70 hover:shadow-2xl hover:shadow-orange-950/20'
          : 'bg-white border-slate-200 hover:border-orange-500/60 hover:shadow-xl hover:shadow-orange-500/10'
      } hover:-translate-y-1.5`}
    >
      {/* Top Image Preview Area (Taller & More Impactful) */}
      <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-slate-900 mb-3.5 shadow-sm">
        <img
          src={template.thumbnailUrl}
          alt={template.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

        {/* Top Badges: Category & Price / Ownership */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[10px] font-medium tracking-wide border border-white/15 truncate max-w-[140px]">
            {getCategoryLabel(template.category)}
          </span>

          {template.isFree ? (
            <span className="px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide backdrop-blur-md bg-orange-500 text-white shadow-md shadow-orange-500/30">
              Miễn Phí
            </span>
          ) : isOwned ? (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide backdrop-blur-md bg-emerald-500/90 text-white border border-emerald-400/30 flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-white" /> Đã Có
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide backdrop-blur-md bg-orange-500 text-white shadow-md shadow-orange-500/30">
              {template.price.toLocaleString('vi-VN')} đ
            </span>
          )}
        </div>

        {/* Hover Quick Preview Play Button */}
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Content & Action Row */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Full Template Title with 2-line height guarantee */}
          <h3
            title={template.title}
            className={`font-editorial text-base sm:text-[17px] font-bold tracking-tight leading-snug line-clamp-2 min-h-[46px] group-hover:text-orange-500 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {template.title}
          </h3>

          {/* Description */}
          <p className={`text-xs line-clamp-2 mt-1 leading-relaxed min-h-[34px] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            {template.description || 'Ấn phẩm thiệp mời tương tác độc bản tích hợp hiệu ứng 3D và âm nhạc sinh động.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition active:scale-95 flex-1 ${
              isDark
                ? 'bg-slate-900 border-slate-700/80 hover:bg-slate-800 text-slate-200 hover:text-white'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-orange-500" />
            <span>Xem Thử</span>
          </button>

          {isOwned ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUse(template);
              }}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 active:scale-95 transition flex items-center justify-center gap-1 flex-1 whitespace-nowrap"
            >
              <span>Tạo Thiệp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUse(template);
              }}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 active:scale-95 transition flex items-center justify-center gap-1.5 flex-1 whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Sở Hữu Ngay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
