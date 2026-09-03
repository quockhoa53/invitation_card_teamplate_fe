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
      className={`group relative rounded-2xl border p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-[#0f1522] border-slate-800 hover:border-rose-500/50 hover:shadow-xl hover:shadow-black/40'
          : 'bg-white border-slate-200 hover:border-rose-500/40 hover:shadow-lg hover:shadow-slate-200/50'
      } hover:-translate-y-1`}
    >
      {/* Top Image Preview Area */}
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 mb-3">
        <img
          src={template.thumbnailUrl}
          alt={template.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges: Category & Price / Ownership */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide border border-white/10 truncate max-w-[130px]">
            {getCategoryLabel(template.category)}
          </span>

          {template.isFree ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide backdrop-blur-md bg-rose-500/90 text-white">
              Miễn Phí
            </span>
          ) : isOwned ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide backdrop-blur-md bg-slate-800 text-white border border-slate-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-rose-400" /> Đã Có
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide backdrop-blur-md bg-rose-600 text-white">
              {template.price.toLocaleString('vi-VN')} đ
            </span>
          )}
        </div>

        {/* Hover Quick Preview Icon */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Content & Action Row */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-editorial text-sm sm:text-base font-bold tracking-tight line-clamp-1 group-hover:text-rose-500 transition-colors">
            {template.title}
          </h3>
          <p className={`text-xs line-clamp-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {template.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1 transition flex-1 active:scale-95 ${
              isDark
                ? 'bg-slate-900 border-slate-700/80 hover:bg-slate-850 text-slate-300'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            <span>Xem Thử</span>
          </button>

          {isOwned ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUse(template);
              }}
              className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm active:scale-95 transition flex items-center justify-center gap-1 flex-1"
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
              className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm active:scale-95 transition flex items-center justify-center gap-1 flex-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Sở Hữu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
