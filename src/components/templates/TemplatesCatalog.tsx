import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Template, TemplateCategory } from '../../types';
import { api } from '../../services/api';
import { TemplateCardItem } from '../home/TemplateCardItem';
import { TemplateRenderer } from '../../templates/TemplateRenderer';
import { Pagination } from '../common/Pagination';
import {
  Search,
  Sparkles,
  ChevronRight,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface FilterState {
  searchQuery: string;
  category: string;
  priceFilter: 'ALL' | 'FREE' | 'PAID';
  sortBy: 'POPULAR' | 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC';
}

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  category: 'ALL',
  priceFilter: 'ALL',
  sortBy: 'POPULAR',
};

export const TemplatesCatalog: React.FC<{ isStandalonePage?: boolean }> = ({ isStandalonePage = false }) => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categoriesList, setCategoriesList] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Live Preview Modal
  const [demoTemplate, setDemoTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tplRes, catRes] = await Promise.all([
          api.getTemplates(),
          api.getCategories(),
        ]);
        if (tplRes.success && tplRes.data) {
          setTemplates(tplRes.data);
        }
        if (catRes.success && catRes.data) {
          setCategoriesList(catRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch templates/categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryTabs = useMemo(() => {
    const allTab = { id: 'ALL', label: 'Tất Cả Mẫu', emoji: '✨' };
    const dynamicTabs = categoriesList.map((c) => ({
      id: c.code,
      label: c.name,
      emoji: c.emoji || '📂',
    }));
    return [allTab, ...dynamicTabs];
  }, [categoriesList]);

  // Filtering & Sorting
  const filteredTemplates = useMemo(() => {
    if (!templates || templates.length === 0) return [];

    const query = filters.searchQuery.trim().toLowerCase();

    return templates
      .filter((tpl) => {
        // 1. Search Query
        if (query) {
          const matchTitle = tpl.title?.toLowerCase().includes(query);
          const matchDesc = tpl.description?.toLowerCase().includes(query);
          const matchSlug = tpl.slug?.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchSlug) return false;
        }

        // 2. Category
        if (filters.category !== 'ALL' && tpl.category !== filters.category) {
          return false;
        }

        // 3. Price Filter
        if (filters.priceFilter === 'FREE' && !tpl.isFree) return false;
        if (filters.priceFilter === 'PAID' && tpl.isFree) return false;

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'POPULAR':
            return (b.usageCount || 0) - (a.usageCount || 0);
          case 'NEWEST':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'PRICE_ASC':
            return (a.isFree ? 0 : a.price) - (b.isFree ? 0 : b.price);
          case 'PRICE_DESC':
            return (b.isFree ? 0 : b.price) - (a.isFree ? 0 : a.price);
          default:
            return 0;
        }
      });
  }, [templates, filters]);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.category !== 'ALL' ||
    filters.priceFilter !== 'ALL' ||
    filters.sortBy !== 'POPULAR';

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handleUseTemplate = (tpl: Template) => {
    if (!isAuthenticated) {
      toast.warning('Yêu cầu Đăng Nhập', 'Vui lòng Đăng Nhập hoặc Đăng Ký để bắt đầu tạo thiệp của bạn!');
      return;
    }
    navigate(`/editor?templateId=${tpl.id}`);
  };

  const totalPages = Math.ceil(filteredTemplates.length / pageSize) || 1;
  const pagedTemplates = filteredTemplates.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8">
      {/* 1. Sleek Minimalist Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> Bộ Sưu Tập Thiệp Mời Độc Quyền
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Khám Phá & Tuyển Chọn Mẫu Thiệp
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Tuyển chọn những ấn phẩm thiệp mời 3D, sinh nhật và sự kiện tương tác độc bản
          </p>
        </div>

        {/* Minimal Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
              setPage(1);
            }}
            placeholder="Tìm kiếm mẫu thiệp..."
            className={`w-full pl-10 pr-9 py-2.5 rounded-2xl border text-xs focus:outline-none transition-all ${
              isDark
                ? 'bg-[#121824] border-slate-800 text-white focus:border-rose-500'
                : 'bg-white border-stone-200 text-stone-900 focus:border-rose-500 shadow-sm'
            }`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, searchQuery: '' }));
                setPage(1);
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-rose-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Unified Category Pills & Filter Bar */}
      <div className={`p-2 rounded-2xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
        isDark ? 'bg-[#121824]/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categoryTabs.map((cat) => {
            const isActive = filters.category === cat.id;
            const count =
              cat.id === 'ALL'
                ? templates.length
                : templates.filter((t) => t.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, category: cat.id }));
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-slate-800 opacity-80'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls (Price & Sort) */}
        <div className="flex items-center gap-2 self-end lg:self-auto border-t lg:border-t-0 pt-2 lg:pt-0 border-stone-200 dark:border-slate-800">
          {/* Price Quick Pill */}
          <select
            value={filters.priceFilter}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, priceFilter: e.target.value as any }));
              setPage(1);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-300'
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <option value="ALL">Mọi mức giá</option>
            <option value="FREE">Miễn phí</option>
            <option value="PAID">Có phí</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }));
              setPage(1);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-300'
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <option value="POPULAR">Phổ biến nhất</option>
            <option value="NEWEST">Mới nhất</option>
            <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
            <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              title="Đặt lại bộ lọc"
              className="p-1.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Modern Template Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={`aspect-[3/4] rounded-3xl animate-pulse ${
                isDark ? 'bg-slate-900/60' : 'bg-stone-200/70'
              }`}
            />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className={`text-center py-16 px-4 rounded-3xl border space-y-3 ${
          isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-xl font-bold">Không tìm thấy mẫu thiệp phù hợp</h3>
          <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Không có kết quả nào khớp với bộ lọc. Hãy thử tìm từ khóa khác hoặc đặt lại bộ lọc.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow transition"
          >
            Hiển Thị Tất Cả
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pagedTemplates.map((tpl) => (
              <TemplateCardItem
                key={tpl.id}
                template={tpl}
                isDark={isDark}
                onPreview={(t) => setDemoTemplate(t)}
                onUse={(t) => handleUseTemplate(t)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredTemplates.length}
            itemsPerPage={pageSize}
            onPageChange={(p) => setPage(p)}
            onItemsPerPageChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
            pageSizeOptions={[8, 16, 24, 32]}
            labelItem="mẫu thiệp"
          />
        </div>
      )}

      {/* 4. Interactive Live Preview Modal */}
      {demoTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full h-[88vh] bg-slate-950 border border-slate-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col">
            {/* Top Phone Mockup Bar */}
            <div className="h-10 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">
                {demoTemplate.title}
              </span>

              <button
                onClick={() => setDemoTemplate(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Template Interactive Preview Body */}
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

            {/* Bottom Modal Actions */}
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
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg active:scale-95 transition flex items-center gap-1.5"
              >
                Sử Dụng Mẫu Này <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
