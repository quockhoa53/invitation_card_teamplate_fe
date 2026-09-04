import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { TemplateSchemaKey, FieldType } from '../../types';
import {
  KeyRound,
  Plus,
  Edit2,
  Trash2,
  Search,
  Copy,
  Check,
  RotateCcw,
  Layers,
  Type,
  AlignLeft,
  Calendar,
  Hash,
  Image,
  Music,
  Tag,
  Palette,
  CheckCircle2,
  X,
  HelpCircle,
  FolderTree,
} from 'lucide-react';

const FIELD_TYPE_CONFIG: Record<FieldType, { label: string; icon: any; color: string }> = {
  text: { label: 'Văn bản ngắn', icon: Type, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  textarea: { label: 'Đoạn văn dài', icon: AlignLeft, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  date: { label: 'Ngày tháng', icon: Calendar, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  datetime: { label: 'Ngày & Giờ', icon: Calendar, color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  number: { label: 'Số / Khoảng cách', icon: Hash, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  image: { label: 'Ảnh đơn URL', icon: Image, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  gallery: { label: 'Album ảnh', icon: Image, color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' },
  music: { label: 'Nhạc nền', icon: Music, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  keywords: { label: 'Từ khóa rơi', icon: Tag, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  color: { label: 'Mã màu', icon: Palette, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  select: { label: 'Lựa chọn', icon: FolderTree, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const COMMON_SECTIONS = [
  'Nội Dung Lời Chúc',
  'Thời Gian & Địa Điểm',
  'Hình Ảnh',
  'Album Ảnh Kỷ Niệm',
  'Nhạc Nền Thiệp Mời',
  'Bản Đồ & Khoảng Cách',
  'Hiệu Ứng Từ Khóa Rơi',
  'Tùy Chỉnh Nâng Cao',
];

export const AdminSchemaKeysPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [keys, setKeys] = useState<TemplateSchemaKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState<TemplateSchemaKey | null>(null);
  const [formKeyName, setFormKeyName] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formFieldType, setFormFieldType] = useState<FieldType>('text');
  const [formSectionName, setFormSectionName] = useState('Nội Dung Lời Chúc');
  const [formPlaceholder, setFormPlaceholder] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDefaultValue, setFormDefaultValue] = useState('');
  const [formIsRequired, setFormIsRequired] = useState(false);
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminSchemaKeys();
      if (res.success && res.data) {
        setKeys(res.data);
      }
    } catch (err: any) {
      toast.error('Không thể tải danh sách Schema Keys', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCopy = (keyName: string) => {
    navigator.clipboard.writeText(`"${keyName}": ""`);
    setCopiedKey(keyName);
    toast.success('Đã sao chép cấu trúc key', `"${keyName}": ""`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openCreateModal = () => {
    setEditingKey(null);
    setFormKeyName('');
    setFormLabel('');
    setFormFieldType('text');
    setFormSectionName('Nội Dung Lời Chúc');
    setFormPlaceholder('');
    setFormDescription('');
    setFormDefaultValue('');
    setFormIsRequired(false);
    setFormDisplayOrder(keys.length + 1);
    setShowModal(true);
  };

  const openEditModal = (item: TemplateSchemaKey) => {
    setEditingKey(item);
    setFormKeyName(item.keyName);
    setFormLabel(item.label);
    setFormFieldType(item.fieldType);
    setFormSectionName(item.sectionName);
    setFormPlaceholder(item.placeholder || '');
    setFormDescription(item.description || '');
    setFormDefaultValue(item.defaultValue || '');
    setFormIsRequired(item.isRequired || false);
    setFormDisplayOrder(item.displayOrder || 0);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      keyName: formKeyName.trim(),
      label: formLabel.trim(),
      fieldType: formFieldType,
      sectionName: formSectionName.trim(),
      placeholder: formPlaceholder.trim(),
      description: formDescription.trim(),
      defaultValue: formDefaultValue.trim(),
      isRequired: formIsRequired,
      displayOrder: formDisplayOrder,
      isActive: true,
    };

    try {
      if (editingKey) {
        await api.updateAdminSchemaKey(editingKey.id, payload);
        toast.success('Cập nhật Schema Key thành công!');
      } else {
        await api.createAdminSchemaKey(payload);
        toast.success('Thêm Schema Key mới thành công!');
      }
      setShowModal(false);
      fetchKeys();
    } catch (err: any) {
      toast.error('Lỗi khi lưu key', err.response?.data?.message || err.message);
    }
  };

  const handleDelete = (item: TemplateSchemaKey) => {
    confirmModal({
      title: 'Xóa Schema Key',
      message: `Bạn có chắc muốn xóa key "${item.keyName}" (${item.label})? Các template đang sử dụng key này sẽ không còn trường nhập liệu tương ứng!`,
      onConfirm: async () => {
        try {
          await api.deleteAdminSchemaKey(item.id);
          toast.success('Đã xóa Schema Key');
          fetchKeys();
        } catch (err: any) {
          toast.error('Không thể xóa key', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.toggleAdminSchemaKeyStatus(id);
      fetchKeys();
    } catch (err: any) {
      toast.error('Lỗi khi đổi trạng thái', err.message);
    }
  };

  const handleSeedDefaults = () => {
    confirmModal({
      title: 'Khôi Phục Danh Sách Keys Chuẩn',
      message: 'Hệ thống sẽ nạp lại các key tiêu chuẩn (recipientName, senderName, photos, musicUrl...) vào từ điển. Bạn có muốn tiếp tục?',
      onConfirm: async () => {
        try {
          await api.seedAdminSchemaKeys();
          toast.success('Khôi phục danh sách key chuẩn thành công!');
          fetchKeys();
        } catch (err: any) {
          toast.error('Lỗi khi khôi phục key', err.message);
        }
      },
    });
  };

  // Filter keys
  const sections = Array.from(new Set(keys.map((k) => k.sectionName)));
  const filteredKeys = keys.filter((k) => {
    const matchSearch =
      k.keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.sectionName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSection = selectedSection === 'ALL' || k.sectionName === selectedSection;
    return matchSearch && matchSection;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-bold flex items-center gap-2.5">
            <KeyRound className="w-7 h-7 text-orange-500" />
            Từ Điển Schema Keys Cho Template
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Định nghĩa các trường JSON hợp lệ của toàn hệ thống. Mọi template khi import code có các key này sẽ tự động sinh form nhập liệu cho người dùng.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleSeedDefaults}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 shadow-sm'
            }`}
            title="Khôi phục danh sách các trường chuẩn mặc định"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" /> Khôi Phục Key Chuẩn
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" /> + Thêm Key Mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-3xl border ${isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Tổng Số Key Hợp Lệ</span>
          <p className="text-2xl font-black text-orange-500 mt-1">{keys.length}</p>
        </div>
        <div className={`p-4 rounded-3xl border ${isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Key Đang Kích Hoạt</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{keys.filter((k) => k.isActive).length}</p>
        </div>
        <div className={`p-4 rounded-3xl border ${isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Số Nhóm Mục Form</span>
          <p className="text-2xl font-black text-blue-400 mt-1">{sections.length}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo key, nhãn, nhóm mục..."
            className={`w-full pl-10 pr-4 py-2 rounded-2xl border text-xs focus:outline-none transition ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
            }`}
          />
        </div>

        {/* Section Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedSection('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedSection === 'ALL'
                ? 'bg-orange-500 text-white shadow-sm'
                : isDark
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            Tất Cả ({keys.length})
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedSection === sec
                  ? 'bg-orange-500 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              {sec} ({keys.filter((k) => k.sectionName === sec).length})
            </button>
          ))}
        </div>
      </div>

      {/* Keys Table / List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Đang tải danh sách Schema Keys...</div>
      ) : filteredKeys.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-[#121824] border-slate-800 text-slate-400' : 'bg-white border-stone-200 text-stone-500'
        }`}>
          <HelpCircle className="w-10 h-10 mx-auto text-orange-400/60" />
          <p className="text-sm font-semibold">Chưa có Schema Key nào phù hợp bộ lọc</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition"
          >
            + Thêm Key Đầu Tiên
          </button>
        </div>
      ) : (
        <div className={`rounded-3xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-stone-50 border-stone-200 text-stone-500'
              }`}>
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Mã Key (Dùng trong JSON)</th>
                  <th className="p-4">Nhãn Hiển Thị</th>
                  <th className="p-4">Kiểu Nhập Liệu</th>
                  <th className="p-4">Nhóm Mục</th>
                  <th className="p-4">Gợi Ý (Placeholder)</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredKeys.map((item, idx) => {
                  const typeConf = FIELD_TYPE_CONFIG[item.fieldType] || {
                    label: item.fieldType,
                    icon: Type,
                    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                  };
                  const Icon = typeConf.icon;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/30' : 'hover:bg-stone-50/70'
                      }`}
                    >
                      <td className="p-4 text-slate-500 font-mono text-[11px]">{idx + 1}</td>

                      {/* Key Name with Click-to-copy */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 text-xs">
                            {item.keyName}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.keyName)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Sao chép cú pháp key"
                          >
                            {copiedKey === item.keyName ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Label */}
                      <td className="p-4 font-bold text-stone-200">{item.label}</td>

                      {/* Field Type */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${typeConf.color}`}>
                          <Icon className="w-3 h-3" />
                          {typeConf.label}
                        </span>
                      </td>

                      {/* Section */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                          isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {item.sectionName}
                        </span>
                      </td>

                      {/* Placeholder */}
                      <td className="p-4 text-slate-400 italic text-[11px] max-w-[200px] truncate">
                        {item.placeholder || '—'}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                            item.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {item.isActive ? 'Hoạt Động' : 'Tạm Tắt'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                            title="Chỉnh sửa key"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Xóa key này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Key */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`max-w-lg w-full rounded-3xl border p-6 shadow-2xl space-y-4 transition-colors ${
            isDark ? 'bg-[#121824] border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-800">
              <h3 className="font-editorial text-lg font-bold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-orange-500" />
                {editingKey ? 'Chỉnh Sửa Schema Key' : 'Thêm Schema Key Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Key Name */}
              <div>
                <label className="block font-semibold mb-1 text-xs">
                  Mã Key Trong Code/JSON * (Ví dụ: <code className="text-amber-400">recipientName</code>)
                </label>
                <input
                  type="text"
                  required
                  pattern="^[a-zA-Z0-9_]+$"
                  value={formKeyName}
                  onChange={(e) => setFormKeyName(e.target.value)}
                  placeholder="recipientName"
                  className={`w-full px-3.5 py-2 rounded-xl border font-mono text-xs focus:outline-none transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-amber-300 focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
                <p className="text-[10px] text-stone-500 mt-0.5">Chỉ viết liền không dấu, chữ cái hoặc gạch dưới.</p>
              </div>

              {/* Label */}
              <div>
                <label className="block font-semibold mb-1 text-xs">Nhãn Hiển Thị Cho Người Dùng *</label>
                <input
                  type="text"
                  required
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="Ví dụ: Tên Người Nhận"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
              </div>

              {/* Grid: Type & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-xs">Kiểu Dữ Liệu *</label>
                  <select
                    value={formFieldType}
                    onChange={(e) => setFormFieldType(e.target.value as FieldType)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none cursor-pointer ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  >
                    {Object.entries(FIELD_TYPE_CONFIG).map(([t, c]) => (
                      <option key={t} value={t}>
                        {c.label} ({t})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-xs">Nhóm Mục Hiển Thị *</label>
                  <input
                    type="text"
                    list="section-presets"
                    required
                    value={formSectionName}
                    onChange={(e) => setFormSectionName(e.target.value)}
                    placeholder="Ví dụ: Lời Chúc"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                  <datalist id="section-presets">
                    {COMMON_SECTIONS.map((sec) => (
                      <option key={sec} value={sec} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Placeholder */}
              <div>
                <label className="block font-semibold mb-1 text-xs">Gợi Ý Nhập Liệu (Placeholder)</label>
                <input
                  type="text"
                  value={formPlaceholder}
                  onChange={(e) => setFormPlaceholder(e.target.value)}
                  placeholder="Ví dụ: Nhập tên bạn bè, người yêu..."
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block font-semibold mb-1 text-xs">Thứ Tự Hiển Thị</label>
                <input
                  type="number"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-xl border font-semibold text-xs transition ${
                    isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-900' : 'border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition"
                >
                  {editingKey ? '💾 Lưu Cập Nhật' : '✨ Thêm Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
