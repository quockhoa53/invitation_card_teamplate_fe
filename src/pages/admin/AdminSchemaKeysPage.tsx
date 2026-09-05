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
  Upload,
  FileJson,
  Download,
  AlertCircle,
  Sparkles,
  FileCode,
} from 'lucide-react';
import { KNOWN_FIELD_META } from '../../utils/templateSchema';

const FIELD_TYPE_CONFIG: Record<FieldType, { label: string; icon: any; color: string; lightColor: string }> = {
  text: { label: 'Văn bản ngắn', icon: Type, color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', lightColor: 'bg-blue-50 text-blue-800 border-blue-200 shadow-2xs' },
  textarea: { label: 'Đoạn văn dài', icon: AlignLeft, color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', lightColor: 'bg-indigo-50 text-indigo-800 border-indigo-200 shadow-2xs' },
  date: { label: 'Ngày tháng', icon: Calendar, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', lightColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs' },
  datetime: { label: 'Ngày & Giờ', icon: Calendar, color: 'bg-teal-500/15 text-teal-400 border-teal-500/30', lightColor: 'bg-teal-50 text-teal-800 border-teal-200 shadow-2xs' },
  number: { label: 'Số / Điểm %', icon: Hash, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', lightColor: 'bg-amber-50 text-amber-900 border-amber-200 shadow-2xs' },
  image: { label: 'Ảnh đơn URL', icon: Image, color: 'bg-purple-500/15 text-purple-400 border-purple-500/30', lightColor: 'bg-purple-50 text-purple-800 border-purple-200 shadow-2xs' },
  gallery: { label: 'Album ảnh', icon: Image, color: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30', lightColor: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 shadow-2xs' },
  music: { label: 'Nhạc nền', icon: Music, color: 'bg-rose-500/15 text-rose-400 border-rose-500/30', lightColor: 'bg-rose-50 text-rose-800 border-rose-200 shadow-2xs' },
  keywords: { label: 'Từ khóa rơi', icon: Tag, color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', lightColor: 'bg-cyan-50 text-cyan-800 border-cyan-200 shadow-2xs' },
  color: { label: 'Mã màu', icon: Palette, color: 'bg-orange-500/15 text-orange-400 border-orange-500/30', lightColor: 'bg-orange-50 text-orange-800 border-orange-200 shadow-2xs' },
  select: { label: 'Lựa chọn', icon: FolderTree, color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', lightColor: 'bg-stone-100 text-stone-800 border-stone-200 shadow-2xs' },
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
  const [selectedKeyForLabels, setSelectedKeyForLabels] = useState<TemplateSchemaKey | null>(null);

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState<TemplateSchemaKey | null>(null);
  const [formKeyName, setFormKeyName] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formLabels, setFormLabels] = useState('');
  const [formFieldType, setFormFieldType] = useState<FieldType>('text');
  const [formSectionName, setFormSectionName] = useState('Nội Dung Lời Chúc');
  const [formPlaceholder, setFormPlaceholder] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDefaultValue, setFormDefaultValue] = useState('');
  const [formIsRequired, setFormIsRequired] = useState(false);
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);

  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDefaults = async () => {
    try {
      setIsSeeding(true);
      const res = await api.seedAdminSchemaKeys();
      if (res.data) {
        setKeys(res.data);
        toast.success('Đồng bộ thành công!', `Đã nạp đầy đủ ${res.data.length} Schema Key chuẩn hệ thống vào cơ sở dữ liệu.`);
      }
    } catch (err: any) {
      toast.error('Đồng bộ thất bại', err.message || 'Không thể đồng bộ key chuẩn');
    } finally {
      setIsSeeding(false);
    }
  };

  // JSON Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTab, setImportTab] = useState<'file' | 'text'>('file');
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importOverwrite, setImportOverwrite] = useState(false);
  const [parsedImportKeys, setParsedImportKeys] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const openImportModal = () => {
    setImportJsonInput('');
    setImportFileName('');
    setParsedImportKeys([]);
    setImportError(null);
    setImportOverwrite(false);
    setImportTab('file');
    setShowImportModal(true);
  };

  const parseJsonContent = (text: string) => {
    try {
      setImportError(null);
      if (!text.trim()) {
        setParsedImportKeys([]);
        return;
      }
      const parsed = JSON.parse(text);
      const result: any[] = [];
      const existingKeyNames = new Set(keys.map((k) => k.keyName));

      if (Array.isArray(parsed)) {
        // Format A: Array of schema key objects
        parsed.forEach((item, index) => {
          if (typeof item === 'object' && item !== null && item.keyName) {
            const keyName = String(item.keyName).trim();
            const known = KNOWN_FIELD_META[keyName];
            result.push({
              keyName,
              label: item.label || known?.label || keyName,
              fieldType: item.fieldType || known?.type || 'text',
              sectionName: item.sectionName || known?.section || 'Tùy Chỉnh Nội Dung',
              placeholder: item.placeholder || known?.placeholder || '',
              description: item.description || '',
              defaultValue: item.defaultValue || '',
              isRequired: Boolean(item.isRequired),
              displayOrder: item.displayOrder ?? keys.length + index + 1,
              isActive: item.isActive ?? true,
              isExisting: existingKeyNames.has(keyName),
            });
          }
        });
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Format B: Template config JSON dictionary { "recipientName": "Bống", ... }
        let orderOffset = 1;
        for (const [rawKey, val] of Object.entries(parsed)) {
          if (rawKey === '_schema' || rawKey === 'isPublished') continue;
          const keyName = rawKey.trim();
          const known = KNOWN_FIELD_META[keyName];

          let fieldType: FieldType = 'text';
          let sectionName = 'Tùy Chỉnh Nội Dung';

          if (known) {
            fieldType = (known.type as FieldType) || 'text';
            sectionName = known.section || 'Tùy Chỉnh Nội Dung';
          } else {
            const lower = keyName.toLowerCase();
            if (Array.isArray(val)) {
              fieldType = lower.includes('photo') || lower.includes('gallery') ? 'gallery' : 'keywords';
              sectionName = fieldType === 'gallery' ? 'Album Ảnh Kỷ Niệm' : 'Hiệu Ứng Từ Khóa Rơi';
            } else if (lower === 'musicurl' || lower.includes('audio')) {
              fieldType = 'music';
              sectionName = 'Nhạc Nền Thiệp Mời';
            } else if (lower.includes('photo') || lower.includes('image') || lower.includes('avatar') || lower.includes('thumb')) {
              fieldType = 'image';
              sectionName = 'Hình Ảnh';
            } else if (lower.includes('datetime')) {
              fieldType = 'datetime';
              sectionName = 'Thời Gian & Địa Điểm';
            } else if (lower.includes('date') || lower.includes('day')) {
              fieldType = 'date';
              sectionName = 'Thời Gian & Địa Điểm';
            } else if (typeof val === 'number') {
              fieldType = 'number';
            } else if (
              lower.includes('message') ||
              lower.includes('letter') ||
              lower.includes('wish') ||
              (typeof val === 'string' && val.length > 50)
            ) {
              fieldType = 'textarea';
              sectionName = 'Nội Dung Lời Chúc';
            }
          }

          const formattedLabel =
            known?.label ||
            keyName
              .replace(/([A-Z])/g, ' $1')
              .replace(/_/g, ' ')
              .replace(/^\w/, (c) => c.toUpperCase());

          result.push({
            keyName,
            label: formattedLabel,
            fieldType,
            sectionName,
            placeholder: known?.placeholder || `Nhập ${formattedLabel.toLowerCase()}...`,
            description: '',
            defaultValue: typeof val === 'string' && val.length < 100 ? val : '',
            isRequired: false,
            displayOrder: keys.length + orderOffset++,
            isActive: true,
            isExisting: existingKeyNames.has(keyName),
          });
        }
      } else {
        setImportError('Dữ liệu JSON không hợp lệ. Phải là mảng danh sách các key hoặc object cấu hình template');
        setParsedImportKeys([]);
        return;
      }

      if (result.length === 0) {
        setImportError('Không tìm thấy trường dữ liệu nào trong file JSON');
      }
      setParsedImportKeys(result);
    } catch (err: any) {
      setImportError('Lỗi cú pháp JSON: ' + err.message);
      setParsedImportKeys([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonInput(content);
      parseJsonContent(content);
    };
    reader.onerror = () => {
      setImportError('Không thể đọc file đã chọn');
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleJson = () => {
    const sample = [
      {
        keyName: 'moment1Photo',
        label: 'Ảnh Khoảnh Khắc 1',
        fieldType: 'image',
        sectionName: '5 Khoảnh Khắc Kỷ Niệm',
        placeholder: 'https://...',
      },
      {
        keyName: 'moment1Text',
        label: 'Nội Dung Khoảnh Khắc 1',
        fieldType: 'text',
        sectionName: '5 Khoảnh Khắc Kỷ Niệm',
        placeholder: 'Ngày đầu tiên nắm tay...',
      },
      {
        keyName: 'birthdayDate',
        label: 'Ngày Sinh Nhật',
        fieldType: 'date',
        sectionName: 'Thời Gian & Địa Điểm',
        placeholder: 'YYYY-MM-DD',
      },
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema_keys_sample.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = async () => {
    if (parsedImportKeys.length === 0) {
      toast.error('Chưa có key nào để import', 'Vui lòng kiểm tra lại nội dung file JSON');
      return;
    }

    setIsImporting(true);
    try {
      const payload = parsedImportKeys.map((item) => ({
        keyName: item.keyName,
        label: item.label,
        fieldType: item.fieldType,
        sectionName: item.sectionName,
        placeholder: item.placeholder,
        description: item.description,
        defaultValue: item.defaultValue,
        isRequired: item.isRequired,
        displayOrder: item.displayOrder,
        isActive: item.isActive,
      }));

      const res = await api.importAdminSchemaKeys(payload, importOverwrite);
      if (res.success) {
        const stats = res.data;
        toast.success(
          'Import Schema Keys Thành Công!',
          stats
            ? `Tổng nộp: ${stats.totalSubmitted}, Tạo mới: ${stats.createdCount}, Cập nhật: ${stats.updatedCount}, Bỏ qua: ${stats.skippedCount}`
            : 'Đã thêm các trường dữ liệu vào hệ thống'
        );
        setShowImportModal(false);
        fetchKeys();
      } else {
        toast.error('Lỗi khi import', res.message || 'Không thể lưu keys');
      }
    } catch (err: any) {
      toast.error('Lỗi khi import keys', err.message);
    } finally {
      setIsImporting(false);
    }
  };

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
    setFormLabels('');
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
    setFormLabels(item.labels && item.labels.length > 0 ? item.labels.join(', ') : item.label);
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
    const rawLabels = formLabels
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const primaryLabel = formLabel.trim();
    const labelsList = rawLabels.length > 0
      ? (rawLabels.includes(primaryLabel) ? rawLabels : [primaryLabel, ...rawLabels])
      : [primaryLabel];

    const payload = {
      keyName: formKeyName.trim(),
      label: primaryLabel,
      labels: labelsList,
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

  // Filter keys
  const sections = Array.from(new Set(keys.map((k) => k.sectionName)));
  const filteredKeys = keys.filter((k) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      k.keyName.toLowerCase().includes(q) ||
      k.label.toLowerCase().includes(q) ||
      (Array.isArray(k.labels) && k.labels.some((l) => l.toLowerCase().includes(q))) ||
      k.sectionName.toLowerCase().includes(q);
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
            disabled={isSeeding}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition active:scale-95 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 shadow-sm'
            }`}
            title="Đồng bộ tất cả các Schema Key chuẩn hệ thống vào cơ sở dữ liệu"
          >
            <Sparkles className={`w-4 h-4 text-amber-500 ${isSeeding ? 'animate-spin' : ''}`} />
            {isSeeding ? 'Đang đồng bộ...' : 'Đồng Bộ Key Mặc Định'}
          </button>

          <button
            type="button"
            onClick={openImportModal}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-400'
                : 'bg-white hover:bg-sky-50 border-stone-200 text-sky-700 shadow-sm'
            }`}
            title="Import các schema keys bằng file JSON hoặc dán JSON cấu hình"
          >
            <Upload className="w-4 h-4 text-sky-500" /> Import Bằng JSON
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
        <div className={`p-4 rounded-3xl border ${isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Tổng Số Key Hợp Lệ</span>
          <p className="text-2xl font-black text-orange-500 mt-1">{keys.length}</p>
        </div>
        <div className={`p-4 rounded-3xl border ${isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Key Đang Kích Hoạt</span>
          <p className={`text-2xl font-black mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{keys.filter((k) => k.isActive).length}</p>
        </div>
        <div className={`p-4 rounded-3xl border ${isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Số Nhóm Mục Form</span>
          <p className={`text-2xl font-black mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{sections.length}</p>
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
            <table className="w-full text-left text-xs border-collapse">
              <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}>
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Mã Key (Dùng trong JSON)</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Nhãn Hiển Thị</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Kiểu Nhập Liệu</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Nhóm Mục</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Gợi Ý (Placeholder)</th>
                  <th className="py-3.5 px-4 text-center w-28">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right w-24">Thao Tác</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-stone-100'}`}>
                {filteredKeys.map((item, idx) => {
                  const typeConf = FIELD_TYPE_CONFIG[item.fieldType] || {
                    label: item.fieldType,
                    icon: Type,
                    color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
                    lightColor: 'bg-stone-100 text-stone-700 border-stone-200',
                  };
                  const Icon = typeConf.icon;
                  const badgeStyle = isDark ? typeConf.color : (typeConf.lightColor || typeConf.color);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-orange-50/20'
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[11px] font-mono font-semibold ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
                          {idx + 1}
                        </span>
                      </td>

                      {/* Key Name (Mã Key duy nhất trong code/JSON) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <code className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg border tracking-tight ${
                            isDark
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-2xs'
                              : 'bg-amber-50/90 text-amber-900 border-amber-200/90 shadow-2xs'
                          }`}>
                            {item.keyName}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.keyName)}
                            className={`p-1.5 rounded-lg transition ${
                              isDark
                                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
                            }`}
                            title="Sao chép tên key"
                          >
                            {copiedKey === item.keyName ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Label & Diverse Labels */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`text-xs font-bold leading-snug ${
                            isDark ? 'text-white' : 'text-stone-900'
                          }`}>
                            {item.label}
                          </span>
                          {item.description ? (
                            <span className={`text-[11px] line-clamp-1 ${
                              isDark ? 'text-slate-400' : 'text-stone-500'
                            }`} title={item.description}>
                              {item.description}
                            </span>
                          ) : null}

                          {/* Nút Xem nhãn hiển thị đa dạng */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <button
                              type="button"
                              onClick={() => setSelectedKeyForLabels(item)}
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border transition active:scale-95 ${
                                isDark
                                  ? 'bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border-sky-800/80 shadow-2xs'
                                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200 shadow-2xs'
                              }`}
                              title="Xem danh sách các tên nhãn hiển thị cho người dùng"
                            >
                              <Tag className="w-3 h-3 text-sky-500 shrink-0" />
                              <span>Xem nhãn</span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                isDark ? 'bg-sky-900 text-sky-200' : 'bg-sky-200 text-sky-900'
                              }`}>
                                {item.labels && item.labels.length > 0 ? item.labels.length : 1}
                              </span>
                            </button>

                            {item.labels && item.labels.length > 1 && (
                              <span
                                className={`text-[10px] font-medium truncate max-w-[140px] ${
                                  isDark ? 'text-slate-400' : 'text-stone-500'
                                }`}
                                title={item.labels.join(', ')}
                              >
                                ({item.labels.slice(1, 3).join(', ')}{item.labels.length > 3 ? '...' : ''})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Field Type */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badgeStyle}`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          {typeConf.label}
                        </span>
                      </td>

                      {/* Section */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                          isDark
                            ? 'bg-slate-800/90 text-slate-200 border-slate-700/60'
                            : 'bg-stone-100/90 text-stone-800 border-stone-200'
                        }`}>
                          <FolderTree className="w-3 h-3 opacity-60 shrink-0" />
                          {item.sectionName}
                        </span>
                      </td>

                      {/* Placeholder */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        {item.placeholder ? (
                          <span className={`italic text-[11px] truncate block ${
                            isDark ? 'text-slate-400' : 'text-stone-600 font-normal'
                          }`} title={item.placeholder}>
                            {item.placeholder}
                          </span>
                        ) : (
                          <span className={`text-[11px] ${isDark ? 'text-slate-600' : 'text-stone-300'}`}>—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                            item.isActive
                              ? isDark
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80 shadow-2xs'
                              : isDark
                              ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/60'
                              : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200/70'
                          }`}
                          title={item.isActive ? 'Đang bật, nhấn để tắt' : 'Đang tắt, nhấn để bật'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {item.isActive ? 'Hoạt Động' : 'Tạm Tắt'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className={`p-1.5 rounded-xl border transition ${
                              isDark
                                ? 'border-slate-800 bg-slate-800/60 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/40'
                                : 'border-stone-200 bg-white text-amber-600 hover:bg-amber-50 hover:border-amber-300 shadow-2xs'
                            }`}
                            title="Chỉnh sửa key"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className={`p-1.5 rounded-xl border transition ${
                              isDark
                                ? 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/40'
                                : 'border-stone-200 bg-white text-stone-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-2xs'
                            }`}
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
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-stone-200'}`}>
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
              {/* Key Name (Duy nhất 1 canonical key) */}
              <div>
                <label className="block font-semibold mb-1 text-xs">
                  Mã Key Trong Code/JSON * (Ví dụ: <code className="text-amber-400 font-mono">recipientName</code>)
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
                <p className="text-[10px] text-stone-500 mt-1">
                  Tên field kỹ thuật duy nhất trong hệ thống & JSON template (chỉ gồm chữ cái, số, gạch dưới).
                </p>
              </div>

              {/* Primary Label */}
              <div>
                <label className="block font-semibold mb-1 text-xs">Nhãn Hiển Thị Chính Cho Người Dùng *</label>
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

              {/* Diverse Labels List */}
              <div>
                <label className="block font-semibold mb-1 text-xs">
                  Các Nhãn Hiển Thị Gợi Ý (Đa Dạng Hóa Tên Gọi)
                </label>
                <input
                  type="text"
                  value={formLabels}
                  onChange={(e) => setFormLabels(e.target.value)}
                  placeholder="Tên Người Nhận, Tên Cô Dâu, Tên Bạn Gái, Tên Người Thương"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-sky-300 focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Nhập các tên nhãn hiển thị cho người dùng, cách nhau bằng dấu phẩy.
                </p>
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
              <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-stone-200'}`}>
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
      {/* ================= MODAL IMPORT SCHEMA KEYS BẰNG JSON ================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#121824] border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-slate-800' : 'border-stone-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    Import Schema Keys Bằng JSON
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Tự Động Suy Luận
                    </span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                    Nhập file JSON cấu hình template hoặc danh sách keys để nạp vào từ điển hệ thống
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className={`p-2 rounded-xl transition ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-100 text-stone-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              {/* Tabs: File Upload vs Raw Text */}
              <div className="flex items-center justify-between gap-3">
                <div className={`flex items-center p-1 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-100 border-stone-200'}`}>
                  <button
                    type="button"
                    onClick={() => setImportTab('file')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      importTab === 'file'
                        ? 'bg-sky-500 text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Tải Lên File .JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportTab('text')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      importTab === 'text'
                        ? 'bg-sky-500 text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" /> Dán Trực Tiếp JSON
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSampleJson}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'
                  }`}
                  title="Tải file mẫu JSON để tham khảo cấu trúc"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" /> Tải JSON Mẫu
                </button>
              </div>

              {/* Tab 1: File Upload */}
              {importTab === 'file' ? (
                <div className="relative">
                  <label
                    className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition text-center ${
                      importFileName
                        ? 'border-sky-500/50 bg-sky-500/5'
                        : isDark
                        ? 'border-slate-700 hover:border-sky-500/50 bg-slate-900/50 hover:bg-slate-900'
                        : 'border-stone-300 hover:border-sky-500/50 bg-stone-50 hover:bg-sky-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
                      <FileJson className="w-6 h-6" />
                    </div>
                    {importFileName ? (
                      <div>
                        <p className="text-xs font-bold text-sky-400">Đã chọn: {importFileName}</p>
                        <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                          Nhấp hoặc kéo thả file khác để thay thế
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold">Kéo thả file .json vào đây hoặc <span className="text-sky-400 underline">chọn từ máy tính</span></p>
                        <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                          Chấp nhận file <code className="text-sky-400">config.json</code> của template hoặc mảng định nghĩa keys
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                /* Tab 2: Raw JSON Textarea */
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold">Nội Dung JSON</label>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                      Hỗ trợ mảng [ &#123; keyName: "..." &#125; ] hoặc đối tượng &#123; "key": "value" &#125;
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={importJsonInput}
                    onChange={(e) => {
                      setImportJsonInput(e.target.value);
                      parseJsonContent(e.target.value);
                    }}
                    placeholder={`{\n  "recipientName": "Bống",\n  "birthdayDate": "2026-10-25",\n  "moment1Photo": "https://...",\n  "moment1Text": "Khoảnh khắc 1"\n}`}
                    className={`w-full p-3.5 rounded-2xl border font-mono text-xs focus:outline-none transition ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-sky-200 focus:border-sky-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-sky-500'
                    }`}
                  />
                </div>
              )}

              {/* Error Alert */}
              {importError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview Table if Keys Detected */}
              {parsedImportKeys.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">Danh Sách Keys Nhận Diện ({parsedImportKeys.length})</span>
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={importOverwrite}
                        onChange={(e) => setImportOverwrite(e.target.checked)}
                        className="rounded border-slate-700 text-sky-500 focus:ring-sky-500"
                      />
                      <span className={isDark ? 'text-slate-300' : 'text-stone-700'}>
                        Ghi đè nếu key đã tồn tại trong hệ thống
                      </span>
                    </label>
                  </div>

                  <div className={`rounded-2xl border overflow-hidden max-h-56 overflow-y-auto ${
                    isDark ? 'border-slate-800 bg-slate-900/50' : 'border-stone-200 bg-stone-50'
                  }`}>
                    <table className="w-full text-left text-xs">
                      <thead className={`sticky top-0 ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-stone-100 text-stone-600'}`}>
                        <tr>
                          <th className="p-2.5 pl-3">Tên Key</th>
                          <th className="p-2.5">Nhãn Gợi Ý</th>
                          <th className="p-2.5">Kiểu Trường</th>
                          <th className="p-2.5">Nhóm Mục</th>
                          <th className="p-2.5 text-center">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {parsedImportKeys.map((item, idx) => (
                          <tr key={idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-stone-100/50'}>
                            <td className="p-2.5 pl-3 font-mono font-bold text-sky-400">{item.keyName}</td>
                            <td className="p-2.5">{item.label}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                                FIELD_TYPE_CONFIG[item.fieldType as FieldType]?.color || 'bg-slate-500/10 text-slate-400'
                              }`}>
                                {item.fieldType}
                              </span>
                            </td>
                            <td className="p-2.5 text-stone-400 text-[11px]">{item.sectionName}</td>
                            <td className="p-2.5 text-center">
                              {item.isExisting ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  {importOverwrite ? 'Cập nhật' : 'Đã có (bỏ qua)'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Mới
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between shrink-0 ${isDark ? 'border-slate-800 bg-[#121824]' : 'border-stone-200 bg-stone-50'}`}>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                {parsedImportKeys.length > 0
                  ? `Sẵn sàng import ${parsedImportKeys.length} keys`
                  : 'Hãy chọn file hoặc dán JSON để xem trước'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold transition ${
                    isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={parsedImportKeys.length === 0 || isImporting}
                  onClick={handleExecuteImport}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isImporting ? (
                    'Đang Import...'
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Xác Nhận Import ({parsedImportKeys.length} Keys)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xem Danh Sách Nhãn Hiển Thị (Labels) */}
      {selectedKeyForLabels && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`max-w-md w-full rounded-3xl border p-6 shadow-2xl space-y-4 transition-colors ${
            isDark ? 'bg-[#121824] border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className={`flex items-start justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-stone-200'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-sky-500" />
                  <h3 className="font-editorial text-base font-bold">
                    Danh Sách Nhãn Hiển Thị (Labels)
                  </h3>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Mã key hệ thống: <code className="font-mono font-bold text-amber-400">{selectedKeyForLabels.keyName}</code> ({selectedKeyForLabels.fieldType})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKeyForLabels(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-xs leading-relaxed p-3 rounded-2xl border ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-sky-50 border-sky-200 text-sky-900'
            }`}>
              💡 Đây là các tên gọi gợi ý đa dạng để hiển thị cho người dùng trên form tùy biến (ví dụ cùng mã key <code className="font-mono font-bold text-amber-500">{selectedKeyForLabels.keyName}</code> nhưng mẫu đám cưới có thể ghi nhãn là "Tên Cô Dâu", mẫu tình yêu ghi "Tên Bạn Gái").
            </p>

            {/* List of labels */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {(selectedKeyForLabels.labels && selectedKeyForLabels.labels.length > 0
                ? selectedKeyForLabels.labels
                : [selectedKeyForLabels.label]
              ).map((l, index) => {
                const isPrimary = index === 0 || l === selectedKeyForLabels.label;
                return (
                  <div
                    key={l}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between transition ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        : 'bg-stone-50 border-stone-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">
                        {l}
                      </span>
                      {isPrimary && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[10px] font-bold border border-orange-500/30">
                          Nhãn Mặc Định
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(l)}
                      className={`p-1.5 rounded-lg border transition ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                          : 'border-stone-200 bg-white text-stone-600 hover:text-stone-900 shadow-2xs'
                      }`}
                      title="Sao chép tên nhãn này"
                    >
                      {copiedKey === l ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const all = (selectedKeyForLabels.labels && selectedKeyForLabels.labels.length > 0)
                    ? selectedKeyForLabels.labels
                    : [selectedKeyForLabels.label];
                  navigator.clipboard.writeText(all.join(', '));
                  toast.success('Đã sao chép tất cả các nhãn!');
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    : 'border-stone-200 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <Copy className="w-3.5 h-3.5" /> Sao chép tất cả
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = selectedKeyForLabels;
                  setSelectedKeyForLabels(null);
                  openEditModal(target);
                }}
                className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa nhãn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
