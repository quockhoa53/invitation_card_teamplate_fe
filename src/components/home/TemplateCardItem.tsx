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
      className={`group relative rounded-3xl border p-3.5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-[#121824] border-slate-800/80 hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-950/20'
          : 'bg-white border-stone-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10'
      } hover:-translate-y-1.5`}
    >
      {/* Top Image Preview Area */}
      <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-slate-950 mb-3.5">
        <img
          src={template.thumbnailUrl}
          alt={template.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Top Badges: Category & Price / Ownership */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide border border-white/10 shadow-sm truncate max-w-[130px]">
            {getCategoryLabel(template.category)}
          </span>

          {template.isFree ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm backdrop-blur-md border bg-emerald-500/90 text-white border-emerald-400/50">
              Miễn Phí
            </span>
          ) : isOwned ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm backdrop-blur-md border bg-emerald-600 text-white border-emerald-400/50 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Đã Sở Hữu
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide shadow-sm backdrop-blur-md border bg-amber-400 text-stone-950 border-amber-300">
              {template.price.toLocaleString('vi-VN')} đ
            </span>
          )}
        </div>

        {/* Hover Quick Preview Icon */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Content & Action Row */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-editorial text-base font-bold tracking-tight line-clamp-1 group-hover:text-rose-500 transition-colors">
            {template.title}
          </h3>
          <p className={`text-xs line-clamp-1 mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
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
            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition flex-1 active:scale-95 ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
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
              className="py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20 hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-1 flex-1"
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
              className="py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-1.5 flex-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mua Ngay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
