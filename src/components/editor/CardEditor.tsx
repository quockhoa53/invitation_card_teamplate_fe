import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Template, Card } from '../../types';
import { TemplateRenderer } from '../../templates/TemplateRenderer';
import { api } from '../../services/api';
import {
  Save,
  Smartphone,
  Monitor,
  QrCode,
  Image as ImageIcon,
  Music,
  Lock,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QrCodeModal } from '../common/QrCodeModal';
import { MusicStoryPicker } from '../common/MusicStoryPicker';
import { parseTemplateSchema, groupFieldsBySection } from '../../utils/templateSchema';
import { TemplateSectionGroup } from '../../types/schema';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';

interface CardEditorProps {
  initialCard?: Card | null;
  selectedTemplate: Template;
  onSaved: (savedCard: Card) => void;
  onCancel: () => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  initialCard,
  selectedTemplate,
  onSaved,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState(initialCard ? initialCard.title : `Thiệp ${selectedTemplate.title}`);
  const [slug, setSlug] = useState(initialCard ? initialCard.slug : '');
  const [passcode, setPasscode] = useState('');
  const [enablePasscode, setEnablePasscode] = useState(initialCard?.hasPasscode || false);
  const [isPublished, setIsPublished] = useState(initialCard ? initialCard.isPublished : true);

  // Form custom data state
  const [customData, setCustomData] = useState<any>(() => {
    if (initialCard && initialCard.customData) {
      try {
        return JSON.parse(initialCard.customData);
      } catch (e) {
        // fallback
      }
    }
    try {
      return JSON.parse(selectedTemplate.defaultConfig);
    } catch (e) {
      return {};
    }
  });

  // Dynamically parse schema and group fields by logical sections
  const dynamicFields = React.useMemo(() => {
    return parseTemplateSchema(selectedTemplate.defaultConfig, customData);
  }, [selectedTemplate.defaultConfig]);

  const dynamicSections = React.useMemo(() => {
    return groupFieldsBySection(dynamicFields);
  }, [dynamicFields]);

  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isCollapsed = (sectionId: string) => Boolean(collapsedSections[sectionId]);

  const areAllCollapsed = React.useMemo(() => {
    const allIds = ['basic', ...dynamicSections.map((s) => s.id)];
    return allIds.length > 0 && allIds.every((id) => Boolean(collapsedSections[id]));
  }, [collapsedSections, dynamicSections]);

  const toggleAllSections = () => {
    const allIds = ['basic', ...dynamicSections.map((s) => s.id)];
    const nextState = !areAllCollapsed;
    const nextMap: Record<string, boolean> = {};
    for (const id of allIds) {
      nextMap[id] = nextState;
    }
    setCollapsedSections(nextMap);
  };

  const getSectionIcon = (secTitle: string) => {
    const lower = secTitle.toLowerCase();
    if (lower.includes('lời chúc') || lower.includes('nội dung')) return <Sparkles className="w-4 h-4" />;
    if (lower.includes('thời gian') || lower.includes('địa điểm')) return <Calendar className="w-4 h-4" />;
    if (lower.includes('bản đồ') || lower.includes('tọa độ') || lower.includes('khoảng cách')) return <Sparkles className="w-4 h-4" />;
    if (lower.includes('ảnh') || lower.includes('album')) return <ImageIcon className="w-4 h-4" />;
    if (lower.includes('nhạc')) return <Music className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const getSectionSummary = (section: TemplateSectionGroup) => {
    const lower = section.title.toLowerCase();
    if (lower.includes('nhạc')) {
      return customData.musicTitle || (customData.musicUrl ? 'Đã chọn bài hát' : 'Chưa chọn nhạc');
    }
    if (lower.includes('ảnh') || lower.includes('album')) {
      const count = (customData.photos || []).length;
      return count > 0 ? `${count} ảnh đã thêm` : 'Chưa có ảnh nào';
    }
    if (lower.includes('lời chúc')) {
      if (customData.recipientName || customData.senderName) {
        return `${customData.recipientName ? `Gửi: ${customData.recipientName}` : ''}${
          customData.recipientName && customData.senderName ? ' • ' : ''
        }${customData.senderName ? `Từ: ${customData.senderName}` : ''}`;
      }
    }
    if (lower.includes('bản đồ')) {
      if (customData.distanceKm) return `Khoảng cách: ${customData.distanceKm} km`;
    }
    return `${section.fields.length} mục tùy biến`;
  };

  const [devicePreview, setDevicePreview] = useState<'mobile' | 'desktop'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [savedCardResult, setSavedCardResult] = useState<Card | null>(initialCard || null);

  // Handle nested customData changes
  const updateField = (key: string, value: any) => {
    setCustomData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle photos
  const addPhoto = () => {
    const newPhotos = [...(customData.photos || []), { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600', caption: 'Kỷ niệm mới' }];
    updateField('photos', newPhotos);
  };

  const updatePhoto = (index: number, field: 'url' | 'caption', val: string) => {
    const newPhotos = [...(customData.photos || [])];
    if (newPhotos[index]) {
      newPhotos[index][field] = val;
      updateField('photos', newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = (customData.photos || []).filter((_: any, i: number) => i !== index);
    updateField('photos', newPhotos);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validate passcode requirement
    if (enablePasscode && !passcode.trim() && !initialCard?.hasPasscode) {
      setError('Bạn đã bật tính năng khóa mật khẩu nhưng chưa nhập mật khẩu. Vui lòng nhập mật khẩu mở thiệp!');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        title,
        slug: slug.trim() || undefined,
        customData: JSON.stringify(customData),
        isPublished,
      };

      if (enablePasscode && passcode.trim()) {
        payload.passcode = passcode.trim();
      } else if (!enablePasscode && initialCard?.hasPasscode) {
        payload.clearPasscode = true;
      }

      let resCard: Card;
      if (initialCard) {
        const res = await api.updateCard(initialCard.id, payload);
        resCard = res.data;
      } else {
        payload.templateId = selectedTemplate.id;
        const res = await api.createCard(payload);
        resCard = res.data;
      }

      setSavedCardResult(resCard);
      setSuccessMsg('Lưu thiệp mời thành công!');
      onSaved(resCard);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lưu thiệp thất bại';
      if (msg.includes('INSUFFICIENT_CREDITS')) {
        confirmModal({
          title: 'Số Dư Ví KD Không Đủ',
          message: `${msg.replace('INSUFFICIENT_CREDITS: ', '')}\n\nBạn có muốn chuyển sang trang Nạp Tiền ngay bây giờ không?`,
          confirmText: '💳 Đi Đến Nạp Tiền',
          type: 'warning',
          onConfirm: () => {
            window.location.href = '/payment';
          },
        });
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#faf8f5] text-stone-800'
    }`}>
      {/* Top Action Bar */}
      <div className={`sticky top-0 z-30 px-5 py-3 border-b flex items-center justify-between backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#121824]/90 border-slate-800' : 'bg-white/90 border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
            }`}
          >
            ← Quay Lại
          </button>
          <div>
            <h2 className="font-editorial text-base font-bold leading-tight">
              {initialCard ? 'Chỉnh Sửa Thiệp Mời' : 'Tạo Thiệp Mới'}: {selectedTemplate.title}
            </h2>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Tùy biến nội dung & xem trước trực tiếp
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Device switcher */}
          <div className={`hidden sm:flex items-center rounded-xl p-1 border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-100 border-stone-200'
          }`}>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition ${
                devicePreview === 'mobile'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Điện thoại
            </button>
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition ${
                devicePreview === 'desktop'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Máy tính
            </button>
          </div>

          {savedCardResult && (
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-orange-400 border-orange-500/30'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <QrCode className="w-4 h-4" /> Xem Mã QR
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Đang lưu...' : 'Lưu & Xuất Bản'}
          </button>
        </div>
      </div>

      {/* Main 2-Column Visual Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT COLUMN: Customizer Form */}
        <div className={`lg:col-span-5 border-r p-6 overflow-y-auto max-h-[calc(100vh-60px)] space-y-6 transition-colors ${
          isDark ? 'border-slate-800/80 bg-[#0b0f17]/80' : 'border-stone-200 bg-[#faf8f5]'
        }`}>
          {error && (
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            {/* Quick Accordion Toolbar */}
            <div className="flex items-center justify-between px-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Nội Dung & Tùy Biến Thiệp
              </span>
              <button
                type="button"
                onClick={toggleAllSections}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-xs'
                }`}
              >
                {areAllCollapsed ? 'Mở Rộng Tất Cả ▾' : 'Thu Gọn Tất Cả ▴'}
              </button>
            </div>

            {/* Section 1: Basic Info */}
            <div className={`rounded-2xl border transition-all ${
              isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <button
                type="button"
                onClick={() => toggleSection('basic')}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left group transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-editorial text-sm sm:text-base font-bold text-orange-500">
                        Thông Tin Cơ Bản
                      </h3>
                      {enablePasscode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-bold flex items-center gap-0.5 shrink-0">
                          <Lock className="w-2.5 h-2.5" /> Khóa MK
                        </span>
                      )}
                    </div>
                    {title && (
                      <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                        {title}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-400 group-hover:text-orange-500 transition shrink-0">
                  <span className="text-[11px] hidden sm:inline font-medium">
                    {collapsedSections.basic ? 'Mở rộng' : 'Thu gọn'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${collapsedSections.basic ? '-rotate-90' : ''}`} />
                </div>
              </button>

              {!collapsedSections.basic && (
                <div className={`p-5 pt-0 border-t space-y-4 ${isDark ? 'border-slate-800/80' : 'border-stone-100'}`}>
                  <div className="pt-4 space-y-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                        Tiêu đề thiệp mời
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Sinh Nhật Em Yêu Tròn 22 Tuổi"
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
                            : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                        Đường dẫn tùy biến (Slug)
                      </label>
                      <div className="flex items-center gap-1 text-xs">
                        <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>/c/</span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="tu-dong-tao-neu-de-trong"
                          className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
                              : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Passcode Protection */}
                    <div className={`pt-3 border-t space-y-2.5 ${isDark ? 'border-slate-800' : 'border-stone-100'}`}>
                      <label className={`flex items-center gap-2 cursor-pointer text-xs font-semibold select-none ${
                        isDark ? 'text-slate-300' : 'text-stone-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={enablePasscode}
                          onChange={(e) => setEnablePasscode(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                          <Lock className="w-4 h-4" /> Đặt mật khẩu khóa thiệp (Chỉ người có mật khẩu mới xem được)
                        </span>
                      </label>

                      {enablePasscode && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            placeholder={initialCard?.hasPasscode ? "Nhập mật khẩu mới nếu muốn đổi (hoặc để trống giữ nguyên)..." : "Nhập mật khẩu mở thiệp (ví dụ: 123456)..."}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                              isDark
                                ? 'bg-slate-900 border-amber-500/50 text-amber-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50'
                                : 'bg-amber-50/60 border-amber-400 text-stone-900 focus:border-amber-500'
                            }`}
                          />
                          <p className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            Người nhận khi mở link thiệp sẽ phải nhập đúng mật khẩu này mới xem được toàn bộ nội dung & ảnh.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Template Sections rendered via Schema Engine */}
            {dynamicSections.map((section) => {
              const isSecCollapsed = isCollapsed(section.id);
              return (
                <div
                  key={section.id}
                  className={`rounded-2xl border transition-all ${
                    isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left group transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                        {getSectionIcon(section.title)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-editorial text-sm sm:text-base font-bold text-orange-500">
                          {section.title}
                        </h3>
                        <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                          {getSectionSummary(section)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 group-hover:text-orange-500 transition shrink-0">
                      <span className="text-[11px] hidden sm:inline font-medium">
                        {isSecCollapsed ? 'Mở rộng' : 'Thu gọn'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isSecCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {!isSecCollapsed && (
                    <div className={`p-5 pt-0 border-t space-y-4 ${isDark ? 'border-slate-800/80' : 'border-stone-100'}`}>
                      <div className="pt-4 space-y-4">
                        {section.fields.map((field) => (
                          <DynamicFieldRenderer
                            key={field.key}
                            field={field}
                            value={customData[field.key]}
                            onChange={(val) => updateField(field.key, val)}
                            onUpdateMusicTitle={(mTitle) => updateField('musicTitle', mTitle)}
                            isDark={isDark}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </form>
        </div>

        {/* RIGHT COLUMN: Interactive Live Preview */}
        <div className={`lg:col-span-7 flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto max-h-[calc(100vh-60px)] transition-colors ${
          isDark ? 'bg-[#080b11]' : 'bg-[#f5f2eb]'
        }`}>
          <div className="w-full flex items-center justify-between mb-4 max-w-sm sm:max-w-md">
            <span className="text-xs font-bold text-orange-500 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Live Preview (Thời Gian Thực)
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-stone-500'}`}>
              Mô phỏng tương tác thực tế
            </span>
          </div>

          {/* Device Frame */}
          <div
            className={`transition-all duration-300 overflow-hidden shadow-2xl ${
              devicePreview === 'mobile'
                ? `w-full max-w-[390px] h-[780px] rounded-[48px] border-[10px] ${
                    isDark ? 'border-slate-800 ring-1 ring-slate-700/50' : 'border-stone-800 shadow-stone-400/50'
                  }`
                : `w-full max-w-3xl h-[650px] rounded-3xl border-4 ${
                    isDark ? 'border-slate-800' : 'border-stone-800 shadow-stone-400/50'
                  }`
            }`}
          >
            <div className="w-full h-full overflow-y-auto bg-slate-950">
              <TemplateRenderer
                slug={selectedTemplate.slug}
                category={selectedTemplate.category}
                templateType={selectedTemplate.templateType}
                customHtml={selectedTemplate.customHtml}
                customCss={selectedTemplate.customCss}
                customJs={selectedTemplate.customJs}
                customData={customData}
                title={title}
                wishes={[]}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {savedCardResult && (
        <QrCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          title={savedCardResult.title}
          publicUrl={savedCardResult.publicUrl}
          qrCodeBase64={savedCardResult.qrCodeBase64}
        />
      )}
    </div>
  );
};
