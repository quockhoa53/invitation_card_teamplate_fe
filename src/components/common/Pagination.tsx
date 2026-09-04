import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  pageSizeOptions?: number[];
  labelItem?: string; // e.g. "bản nháp", "template", "thiệp mời"
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [6, 12, 24],
  labelItem = 'mục',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (totalItems <= 0) return null;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers window (e.g. 1 ... 4 5 6 ... 10)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t ${
      isDark ? 'border-slate-800/80 text-slate-300' : 'border-stone-200 text-stone-700'
    }`}>
      {/* Item Range Counter & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span>
          Hiển thị <strong>{startItem} - {endItem}</strong> trên tổng số <strong>{totalItems}</strong> {labelItem}
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] opacity-70">Số lượng / trang:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className={`px-2 py-1 rounded-lg border text-xs font-semibold focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-white border-stone-200 text-stone-800 shadow-sm'
              }`}
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            className={`p-1.5 rounded-xl border transition disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700 shadow-sm'
            }`}
            title="Trang đầu"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className={`p-1.5 rounded-xl border transition disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700 shadow-sm'
            }`}
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-xs opacity-50 select-none">
                    ...
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <button
                  key={`page-${p}`}
                  onClick={() => onPageChange(Number(p))}
                  className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    isCurrent
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : isDark
                      ? 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300'
                      : 'bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 shadow-sm'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className={`p-1.5 rounded-xl border transition disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700 shadow-sm'
            }`}
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className={`p-1.5 rounded-xl border transition disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700 shadow-sm'
            }`}
            title="Trang cuối"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
