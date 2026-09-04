import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { TemplateCategory } from '../../types';
import { api } from '../../services/api';
import { Pagination } from '../../components/common/Pagination';
import {
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TemplateCategory | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.getAdminCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
      toast.error('Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setCode('');
    setName('');
    setEmoji('✨');
    setDescription('');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (cat: TemplateCategory) => {
    setEditingCategory(cat);
    setCode(cat.code);
    setName(cat.name);
    setEmoji(cat.emoji || '✨');
    setDescription(cat.description || '');
    setDisplayOrder(cat.displayOrder || 0);
    setIsActive(cat.isActive);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload: Partial<TemplateCategory> = {
        code: code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
        name: name.trim(),
        emoji: emoji.trim() || '✨',
        description: description.trim(),
        displayOrder: Number(displayOrder) || 0,
        isActive,
      };

      if (editingCategory) {
        await api.updateAdminCategory(editingCategory.id, payload);
        toast.success('Cập nhật loại template thành công!');
      } else {
        await api.createAdminCategory(payload);
        toast.success('Tạo loại template mới thành công!');
      }

      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi khi lưu loại template';
      setError(errMsg);
      toast.error('Lỗi khi lưu loại template', errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.toggleAdminCategoryStatus(id);
      fetchCategories();
      toast.success('Đã cập nhật trạng thái danh mục!');
    } catch (err: any) {
      toast.error('Lỗi cập nhật', err.response?.data?.message || 'Không thể đổi trạng thái loại template');
    }
  };

  const handleDelete = (id: string, name: string) => {
    confirmModal({
      title: 'Xóa Loại Template',
      message: `Bạn có chắc chắn muốn xóa loại template "${name}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa Vĩnh Viễn',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAdminCategory(id);
          setCategories((prev) => prev.filter((c) => c.id !== id));
          toast.success('Đã xóa loại template!');
        } catch (err: any) {
          toast.error('Lỗi xóa', err.response?.data?.message || 'Không thể xóa loại template này');
        }
      }
    });
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const pagedCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-bold flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-orange-500" /> Quản Lý Loại Template
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Phân loại danh mục thiệp mời, thứ tự hiển thị và quản lý nhãn dán
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative w-64">
            <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên, mã code..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                  : 'bg-white border-stone-200 text-stone-900 focus:border-orange-500 shadow-sm'
              }`}
            />
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Thêm Loại Mới
          </button>
        </div>
      </div>

      {/* Categories Grid / Table View */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        {loading ? (
          <div className={`text-center py-10 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Đang tải danh sách loại template...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
              <FolderTree className="w-7 h-7" />
            </div>
            <h4 className="font-editorial text-lg font-bold">Chưa Có Loại Template Nào</h4>
            <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Hãy tạo danh mục đầu tiên để phân loại các mẫu thiệp mời trên hệ thống.
            </p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow transition"
            >
              Tạo Loại Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pagedCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group ${
                    isDark
                      ? 'bg-slate-900/70 border-slate-800 hover:border-orange-500/50 hover:bg-slate-900'
                      : 'bg-stone-50 border-stone-200 hover:border-orange-300 hover:bg-white shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl p-2 rounded-xl bg-black/10 dark:bg-white/5 border border-white/5 inline-block">
                        {cat.emoji || '✨'}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.isActive
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                            : 'bg-orange-500/15 text-orange-500 border border-orange-500/30'
                        }`}>
                          {cat.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                          isDark ? 'bg-slate-800 text-slate-400' : 'bg-stone-200 text-stone-600'
                        }`}>
                          #{cat.displayOrder}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-editorial text-base font-bold group-hover:text-orange-500 transition">
                        {cat.name}
                      </h4>
                      <p className="font-mono text-[10px] opacity-70 tracking-wider text-orange-400 mt-0.5">
                        {cat.code}
                      </p>
                    </div>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-stone-500'
                    }`}>
                      {cat.description || 'Chưa có mô tả cho loại template này.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${
                    isDark ? 'border-slate-800' : 'border-stone-200'
                  }`}>
                    <button
                      onClick={() => handleToggleStatus(cat.id)}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                        cat.isActive
                          ? 'text-slate-400 hover:text-amber-400'
                          : 'text-emerald-500 hover:text-emerald-400'
                      }`}
                      title={cat.isActive ? 'Tạm ẩn danh mục' : 'Hiện danh mục'}
                    >
                      {cat.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(cat)}
                        className={`p-1.5 rounded-lg text-xs font-semibold border transition ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                          isDark
                            ? 'bg-slate-800 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400'
                            : 'bg-white hover:bg-orange-50 text-stone-400 hover:text-orange-600 border border-stone-200'
                        }`}
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredCategories.length}
              itemsPerPage={pageSize}
              onPageChange={(p) => setPage(p)}
              onItemsPerPageChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
              pageSizeOptions={[4, 8, 16]}
              labelItem="loại template"
            />
          </div>
        )}
      </div>

      {/* Create / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`max-w-lg w-full rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-6 ${
            isDark ? 'bg-[#121824] border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <h3 className="font-editorial text-xl font-bold flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-orange-500" />
                {editingCategory ? 'Chỉnh Sửa Loại Template' : 'Thêm Loại Template Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block font-bold mb-1.5 opacity-80">Biểu Tượng</label>
                  <input
                    type="text"
                    required
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="✨"
                    className={`w-full text-center py-2.5 rounded-xl border text-base focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>

                <div className="col-span-3">
                  <label className="block font-bold mb-1.5 opacity-80">Tên Loại Template</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Sinh Nhật Người Yêu"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1.5 opacity-80">
                  Mã Code Duy Nhất (UPPERCASE_SNAKE)
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="BIRTHDAY_LOVER"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1.5 opacity-80">Mô Tả Danh Mục</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn gọn về đối tượng và phong cách của loại template này..."
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none resize-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-2">
                <div>
                  <label className="block font-bold mb-1.5 opacity-80">Thứ Tự Ưu Tiên (STT)</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Kích Hoạt Sử Dụng</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t flex items-center justify-end gap-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold shadow-lg hover:brightness-105 active:scale-95 transition disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editingCategory ? 'Cập Nhật' : 'Tạo Loại Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
