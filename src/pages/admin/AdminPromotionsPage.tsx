import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { PromotionItem } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import {
  Tag,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Percent,
  DollarSign,
  Calendar,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

export const AdminPromotionsPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal Create/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromotionItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(undefined);
  const [maxUsage, setMaxUsage] = useState<number>(100);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const activeParam = statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE';
      const res = await api.getAdminPromotions({
        search,
        isActive: activeParam,
        page: page - 1,
        size: pageSize,
      });

      if (res.success && res.data) {
        setPromotions(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải danh sách mã khuyến mãi', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [search, statusFilter, page, pageSize]);

  const openCreateModal = () => {
    setEditingPromo(null);
    setCode('');
    setDescription('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(20);
    setMinOrderAmount(0);
    setMaxDiscountAmount(undefined);
    setMaxUsage(100);
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (promo: PromotionItem) => {
    setEditingPromo(promo);
    setCode(promo.code);
    setDescription(promo.description || '');
    setDiscountType(promo.discountType);
    setDiscountValue(promo.discountValue);
    setMinOrderAmount(promo.minOrderAmount || 0);
    setMaxDiscountAmount(promo.maxDiscountAmount);
    setMaxUsage(promo.maxUsage || 100);
    setStartDate(promo.startDate ? promo.startDate.substring(0, 16) : '');
    setEndDate(promo.endDate ? promo.endDate.substring(0, 16) : '');
    setIsActive(promo.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã khuyến mãi');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        maxUsage: Number(maxUsage) || 100,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        isActive,
      };

      if (editingPromo) {
        await api.updateAdminPromotion(editingPromo.id, payload);
        toast.success(`Đã cập nhật mã ${code}!`);
      } else {
        await api.createAdminPromotion(payload);
        toast.success(`Đã tạo mã khuyến mãi ${code} thành công!`);
      }

      setIsModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      toast.error('Không thể lưu mã khuyến mãi', err.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promo: PromotionItem) => {
    try {
      await api.toggleAdminPromotion(promo.id);
      toast.success(promo.isActive ? `Đã tạm khóa mã ${promo.code}` : `Đã kích hoạt mã ${promo.code}`);
      fetchPromotions();
    } catch (err: any) {
      toast.error('Không thể đổi trạng thái mã', err.response?.data?.message);
    }
  };

  const handleDelete = (promo: PromotionItem) => {
    confirmModal({
      title: 'Xóa Mã Khuyến Mãi',
      message: `Bạn có chắc chắn muốn xóa mã "${promo.code}" không?\nMã này sẽ không thể sử dụng được nữa.`,
      confirmText: 'Xóa Mã',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAdminPromotion(promo.id);
          toast.success(`Đã xóa mã ${promo.code}!`);
          fetchPromotions();
        } catch (err: any) {
          toast.error('Không thể xóa mã', err.response?.data?.message);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Tag className="w-7 h-7 text-amber-500" /> Quản Lý Mã Khuyến Mãi
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Tạo và cấu hình voucher giảm giá theo phần trăm (%) hoặc số tiền cố định (VNĐ).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Thêm Mã Khuyến Mãi Mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-center ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => {
                setStatusFilter(filterKey);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === filterKey
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {filterKey === 'ALL' ? 'Tất Cả' : filterKey === 'ACTIVE' ? 'Đang Hoạt Động' : 'Đang Khóa'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo Mã code, mô tả..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-500'
                : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-500'
            }`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
              <tr>
                <th className="py-3.5 px-4 font-semibold">Mã Code</th>
                <th className="py-3.5 px-4 font-semibold">Mức Giảm Giá</th>
                <th className="py-3.5 px-4 font-semibold">Đơn Tối Thiểu</th>
                <th className="py-3.5 px-4 font-semibold">Tiến Độ Sử Dụng</th>
                <th className="py-3.5 px-4 font-semibold">Thời Hạn</th>
                <th className="py-3.5 px-4 font-semibold">Trạng Thái</th>
                <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            {loading ? (
              <TableRowSkeleton rows={5} cols={7} />
            ) : (
              <tbody className="divide-y divide-slate-800/40">
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      Chưa có mã khuyến mãi nào. Hãy bấm "Thêm Mã Khuyến Mãi Mới"!
                    </td>
                  </tr>
                ) : (
                promotions.map((promo) => {
                  const usagePercent = promo.maxUsage ? Math.min(100, Math.round((promo.usedCount / promo.maxUsage) * 100)) : 0;
                  return (
                    <tr key={promo.id} className={`transition hover:${isDark ? 'bg-slate-850/40' : 'bg-stone-50/80'}`}>
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-black text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg inline-block">
                            {promo.code}
                          </span>
                          {promo.description && (
                            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>{promo.description}</p>
                          )}
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm text-emerald-400">
                          {promo.discountType === 'PERCENTAGE'
                            ? `Giảm ${promo.discountValue}%`
                            : `Giảm ${promo.discountValue.toLocaleString('vi-VN')} đ`}
                        </span>
                        {promo.maxDiscountAmount && promo.discountType === 'PERCENTAGE' && (
                          <p className="text-[10px] text-slate-400">Tối đa {promo.maxDiscountAmount.toLocaleString('vi-VN')} đ</p>
                        )}
                      </td>

                      {/* Min order */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {promo.minOrderAmount && promo.minOrderAmount > 0
                          ? `${promo.minOrderAmount.toLocaleString('vi-VN')} đ`
                          : '0 đ (Không giới hạn)'}
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[120px]">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-orange-400">{promo.usedCount}</span>
                            <span className="text-slate-400">/ {promo.maxUsage || '∞'}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        {promo.endDate ? (
                          <span>Đến {new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                        ) : (
                          <span className="text-emerald-400">Vĩnh viễn</span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggle(promo)}
                          className="flex items-center gap-1.5 focus:outline-none"
                        >
                          {promo.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Đang Chạy
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              <XCircle className="w-3 h-3" /> Đã Khóa
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(promo)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(promo)}
                            className="p-1.5 rounded-lg hover:bg-orange-500/15 text-slate-400 hover:text-orange-400 transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          )}
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800/40">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalElements}
              itemsPerPage={pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`max-w-lg w-full rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-editorial text-xl font-bold flex items-center gap-2 text-amber-500">
                <Tag className="w-5 h-5" /> {editingPromo ? 'Chỉnh Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="block font-bold mb-1">Mã Khuyến Mãi (Code)*</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: CHAOMUNG2026, LOVE20"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold uppercase focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-amber-400 focus:border-amber-500' : 'bg-stone-50 border-stone-200 focus:border-amber-500'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold mb-1">Mô tả chương trình</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Giảm 20% tối đa 30.000 đ cho khách hàng mới"
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500' : 'bg-stone-50 border-stone-200'
                  }`}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Hình thức giảm*</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <option value="PERCENTAGE">Theo Phần Trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số Tiền Cố Định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">
                    {discountType === 'PERCENTAGE' ? 'Giá trị giảm (%)*' : 'Số tiền giảm (VNĐ)*'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none font-bold text-emerald-400 ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>
              </div>

              {/* Min Order & Max Cap */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    placeholder="0"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Giảm tối đa (VNĐ, cho mã %)</label>
                  <input
                    type="number"
                    min={0}
                    value={maxDiscountAmount || ''}
                    onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Không giới hạn"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>
              </div>

              {/* Max Usage & Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Số lượt dùng tối đa</label>
                  <input
                    type="number"
                    min={1}
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(Number(e.target.value))}
                    placeholder="100"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Ngày hết hạn</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="font-semibold cursor-pointer">
                  Kích hoạt mã này ngay lập tức
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-lg shadow-amber-500/25 flex items-center gap-2"
                >
                  {saving ? 'Đang lưu...' : editingPromo ? 'Cập Nhật Mã' : 'Tạo Mã Khuyến Mãi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
