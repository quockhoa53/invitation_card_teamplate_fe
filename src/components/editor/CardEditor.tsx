import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
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
} from 'lucide-react';
import { QrCodeModal } from '../common/QrCodeModal';
import { MusicStoryPicker } from '../common/MusicStoryPicker';

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
      setError(err.response?.data?.message || err.message || 'Lưu thiệp thất bại');
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
                  ? 'bg-rose-500 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Điện thoại
            </button>
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition ${
                devicePreview === 'desktop'
                  ? 'bg-rose-500 text-white shadow-sm'
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
                  ? 'bg-slate-900 hover:bg-slate-800 text-rose-400 border-rose-500/30'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
            >
              <QrCode className="w-4 h-4" /> Xem Mã QR
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white text-xs sm:text-sm shadow-md shadow-rose-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center gap-1.5"
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
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
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

          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Basic Info */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <h3 className="font-editorial text-base font-bold flex items-center gap-2 text-rose-500">
                <Sparkles className="w-4 h-4" /> Thông Tin Cơ Bản
              </h3>

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
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
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
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
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

            {/* Section 2: Template Content Customization */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <h3 className="font-editorial text-base font-bold flex items-center gap-2 text-rose-500">
                <Sparkles className="w-4 h-4" /> Nội Dung Lời Chúc
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                    Tên người nhận
                  </label>
                  <input
                    type="text"
                    value={customData.recipientName || ''}
                    onChange={(e) => updateField('recipientName', e.target.value)}
                    placeholder="Em Yêu, Bạn Thân, Quý Khách..."
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                    Tên người gửi
                  </label>
                  <input
                    type="text"
                    value={customData.senderName || ''}
                    onChange={(e) => updateField('senderName', e.target.value)}
                    placeholder="Anh, Tôi, Ban Tổ Chức..."
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                  Tiêu đề chúc mừng
                </label>
                <input
                  type="text"
                  value={customData.greetingTitle || ''}
                  onChange={(e) => updateField('greetingTitle', e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                  {selectedTemplate.slug.includes('map') || customData.distanceKm !== undefined
                    ? '💌 Lời nhắn gửi yêu thương (Xuất hiện cùng ảnh khi khoảng cách về 0 KM)'
                    : 'Thông điệp / Lời chúc chính'}
                </label>
                <textarea
                  rows={4}
                  value={customData.greetingMessage || ''}
                  onChange={(e) => updateField('greetingMessage', e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none resize-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                  }`}
                />
              </div>

              {/* Date pickers depending on template type */}
              {customData.birthdayDate !== undefined && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 flex items-center gap-1.5 ${
                    isDark ? 'text-slate-300' : 'text-stone-700'
                  }`}>
                    <Calendar className="w-3.5 h-3.5 text-rose-500" /> Ngày sinh nhật
                  </label>
                  <input
                    type="date"
                    value={customData.birthdayDate || ''}
                    onChange={(e) => updateField('birthdayDate', e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                    }`}
                  />
                </div>
              )}

              {customData.anniversaryStartDate !== undefined && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 flex items-center gap-1.5 ${
                    isDark ? 'text-slate-300' : 'text-stone-700'
                  }`}>
                    <Calendar className="w-3.5 h-3.5 text-pink-500" /> Ngày bắt đầu yêu nhau (đếm ngày)
                  </label>
                  <input
                    type="datetime-local"
                    value={customData.anniversaryStartDate ? customData.anniversaryStartDate.substring(0, 16) : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateField('anniversaryStartDate', val);
                      if (val) {
                        const start = new Date(val);
                        const diffDays = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
                        const years = Math.max(1, Math.floor(diffDays / 365));
                        if (customData.milestoneUnit === 'YEARS') {
                          updateField('milestoneText', `${years} Năm Yêu Nhau`);
                        } else if (customData.milestoneUnit === 'DAYS' || !customData.milestoneUnit) {
                          updateField('milestoneText', `${diffDays} Ngày Yêu Nhau`);
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                    }`}
                  />
                </div>
              )}

              {(customData.anniversaryStartDate !== undefined ||
                selectedTemplate.category === 'LOVE_ANNIVERSARY' ||
                selectedTemplate.slug?.includes('mua') ||
                selectedTemplate.slug?.includes('rain') ||
                selectedTemplate.slug?.includes('love') ||
                selectedTemplate.slug?.includes('ky-niem') ||
                selectedTemplate.title?.toLowerCase().includes('mưa') ||
                selectedTemplate.title?.toLowerCase().includes('love') ||
                selectedTemplate.title?.toLowerCase().includes('kỷ niệm') ||
                customData.fallingWords !== undefined ||
                customData.keyword1 !== undefined) && (
                <div className="space-y-3 pt-2 border-t border-dashed border-slate-700/50">
                  {/* Mốc Kỷ Niệm: Bao Nhiêu Ngày hay Bao Nhiêu Năm */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
                      isDark ? 'text-cyan-300' : 'text-stone-800'
                    }`}>
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Kiểu hiển thị mốc kỷ niệm
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-700 text-xs mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateField('milestoneUnit', 'DAYS');
                          const start = customData.anniversaryStartDate ? new Date(customData.anniversaryStartDate) : new Date(Date.now() - 1000 * 86400000);
                          const diffDays = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
                          updateField('milestoneText', `${diffDays} Ngày Yêu Nhau`);
                        }}
                        className={`py-1 px-2 rounded-lg font-semibold transition ${
                          (customData.milestoneUnit || 'DAYS') === 'DAYS'
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Theo Số Ngày
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateField('milestoneUnit', 'YEARS');
                          const start = customData.anniversaryStartDate ? new Date(customData.anniversaryStartDate) : new Date(Date.now() - 1000 * 86400000);
                          const diffDays = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
                          const years = Math.max(1, Math.floor(diffDays / 365));
                          updateField('milestoneText', `${years} Năm Yêu Nhau`);
                        }}
                        className={`py-1 px-2 rounded-lg font-semibold transition ${
                          customData.milestoneUnit === 'YEARS'
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Theo Số Năm
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('milestoneUnit', 'CUSTOM')}
                        className={`py-1 px-2 rounded-lg font-semibold transition ${
                          customData.milestoneUnit === 'CUSTOM'
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Tùy Biến
                      </button>
                    </div>

                    <input
                      type="text"
                      value={customData.milestoneText || ''}
                      onChange={(e) => updateField('milestoneText', e.target.value)}
                      placeholder={
                        customData.milestoneUnit === 'YEARS'
                          ? 'Ví dụ: 3 Năm Bên Nhau'
                          : customData.milestoneUnit === 'CUSTOM'
                          ? 'Ví dụ: Kỷ Niệm 08/06/2023'
                          : 'Ví dụ: 1000 Ngày Yêu Nhau (để trống sẽ tự tính số ngày)'
                      }
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-cyan-300 focus:border-cyan-400'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-cyan-500'
                      }`}
                    />
                  </div>

                  {/* 5 Từ Khóa Rơi (Keywords) */}
                  <div className="space-y-2 pt-1">
                    <label className={`block text-xs font-bold flex items-center gap-1.5 ${
                      isDark ? 'text-cyan-300' : 'text-stone-800'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" /> 5 Từ khóa phát sáng rơi liên tục (Nhập 5 câu bạn thích):
                    </label>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 w-16 shrink-0">Từ khóa 1:</span>
                        <input
                          type="text"
                          value={customData.keyword1 || ''}
                          onChange={(e) => updateField('keyword1', e.target.value)}
                          placeholder="Ví dụ: Em yêu anh / Yêu em nhiều"
                          className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 w-16 shrink-0">Từ khóa 2:</span>
                        <input
                          type="text"
                          value={customData.keyword2 || ''}
                          onChange={(e) => updateField('keyword2', e.target.value)}
                          placeholder="Ví dụ: Thành công / Luôn hạnh phúc"
                          className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 w-16 shrink-0">Từ khóa 3:</span>
                        <input
                          type="text"
                          value={customData.keyword3 || ''}
                          onChange={(e) => updateField('keyword3', e.target.value)}
                          placeholder="Ví dụ: Vững vàng / Bình yên"
                          className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 w-16 shrink-0">Từ khóa 4:</span>
                        <input
                          type="text"
                          value={customData.keyword4 || ''}
                          onChange={(e) => updateField('keyword4', e.target.value)}
                          placeholder="Ví dụ: Chúc anh luôn vui vẻ / Nụ cười rạng rỡ"
                          className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 w-16 shrink-0">Từ khóa 5:</span>
                        <input
                          type="text"
                          value={customData.keyword5 || ''}
                          onChange={(e) => updateField('keyword5', e.target.value)}
                          placeholder="Ví dụ: Happy Anniversary / Mãi bên nhau"
                          className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {customData.eventDate !== undefined && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 flex items-center gap-1.5 ${
                    isDark ? 'text-slate-300' : 'text-stone-700'
                  }`}>
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Ngày & Giờ sự kiện
                  </label>
                  <input
                    type="datetime-local"
                    value={customData.eventDate ? customData.eventDate.substring(0, 16) : ''}
                    onChange={(e) => updateField('eventDate', e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Section 2.5: Love Map Coordinates & Reunion Photo Settings */}
            {(selectedTemplate.slug.includes('map') || customData.distanceKm !== undefined || customData.senderAvatar !== undefined) && (
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
              }`}>
                <h3 className="font-editorial text-base font-bold flex items-center gap-2 text-rose-500">
                  <Sparkles className="w-4 h-4" /> Cấu Hình Bản Đồ Tọa Độ & Khoảng Cách
                </h3>

                {/* Avatar 1 & Location 1 */}
                <div className={`p-3.5 rounded-xl border space-y-3 ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                    📍 Vị Trí 1 (Người Gửi / Bạn Trai)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                        Link Avatar 1 (URL)
                      </label>
                      <div className="flex items-center gap-2">
                        <img
                          src={customData.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt="Avatar 1"
                          className="w-8 h-8 rounded-full object-cover border border-rose-500/50 shrink-0"
                        />
                        <input
                          type="text"
                          value={customData.senderAvatar || ''}
                          onChange={(e) => updateField('senderAvatar', e.target.value)}
                          placeholder="https://..."
                          className={`w-full px-2.5 py-1.5 rounded-xl border text-[11px] focus:outline-none ${
                            isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-stone-200'
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                        Tên Vị Trí / Tọa Độ 1
                      </label>
                      <input
                        type="text"
                        value={customData.senderLocation || ''}
                        onChange={(e) => updateField('senderLocation', e.target.value)}
                        placeholder="Hà Nội (21.0285° N)"
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-[11px] focus:outline-none ${
                          isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-stone-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar 2 & Location 2 */}
                <div className={`p-3.5 rounded-xl border space-y-3 ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <span className="text-xs font-bold text-pink-500 flex items-center gap-1.5">
                    📍 Vị Trí 2 (Người Nhận / Bạn Gái)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                        Link Avatar 2 (URL)
                      </label>
                      <div className="flex items-center gap-2">
                        <img
                          src={customData.recipientAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                          alt="Avatar 2"
                          className="w-8 h-8 rounded-full object-cover border border-pink-500/50 shrink-0"
                        />
                        <input
                          type="text"
                          value={customData.recipientAvatar || ''}
                          onChange={(e) => updateField('recipientAvatar', e.target.value)}
                          placeholder="https://..."
                          className={`w-full px-2.5 py-1.5 rounded-xl border text-[11px] focus:outline-none ${
                            isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-stone-200'
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                        Tên Vị Trí / Tọa Độ 2
                      </label>
                      <input
                        type="text"
                        value={customData.recipientLocation || ''}
                        onChange={(e) => updateField('recipientLocation', e.target.value)}
                        placeholder="TP. Hồ Chí Minh (10.8231° N)"
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-[11px] focus:outline-none ${
                          isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-stone-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Initial Distance KM */}
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                    Khoảng Cách Địa Lý Ban Đầu (km)
                  </label>
                  <input
                    type="number"
                    value={customData.distanceKm || '1720'}
                    onChange={(e) => updateField('distanceKm', e.target.value)}
                    placeholder="1720"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>

                {/* Reunion Photo */}
                <div className="space-y-2">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                    Ảnh Kỷ Niệm / Ôm Nhau (Xuất hiện sau khi 2 avatar lại gần nhau 0km)
                  </label>
                  <div className="flex gap-3 items-center">
                    <img
                      src={customData.reunionPhotoUrl || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300'}
                      alt="Ảnh đoàn tụ"
                      className="w-16 h-16 rounded-xl object-cover border border-rose-500/40 bg-slate-950 shrink-0"
                    />
                    <input
                      type="text"
                      value={customData.reunionPhotoUrl || ''}
                      onChange={(e) => updateField('reunionPhotoUrl', e.target.value)}
                      placeholder="Nhập link ảnh kỷ niệm (https://...)"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Music & Sound (Story Style Picker) */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <MusicStoryPicker
                selectedMusicUrl={customData.musicUrl || ''}
                selectedMusicTitle={customData.musicTitle || ''}
                onSelectMusic={(url, trackTitle) => {
                  updateField('musicUrl', url);
                  updateField('musicTitle', trackTitle);
                }}
              />
            </div>

            {/* Section 4: Photos Gallery */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-base font-bold flex items-center gap-2 text-rose-500">
                  <ImageIcon className="w-4 h-4" /> Album Ảnh Kỷ Niệm ({(customData.photos || []).length})
                </h3>
                <button
                  type="button"
                  onClick={addPhoto}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Ảnh
                </button>
              </div>

              <div className="space-y-3">
                {(customData.photos || []).map((photo: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex gap-3 items-center ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt="preview"
                      className="w-16 h-16 rounded-lg object-cover bg-slate-950 shrink-0"
                    />

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={photo.url}
                        onChange={(e) => updatePhoto(idx, 'url', e.target.value)}
                        placeholder="Link ảnh (URL)"
                        className={`w-full px-2.5 py-1 rounded-lg border text-[11px] font-mono ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white'
                            : 'bg-white border-stone-200 text-stone-900'
                        }`}
                      />
                      <input
                        type="text"
                        value={photo.caption || ''}
                        onChange={(e) => updatePhoto(idx, 'caption', e.target.value)}
                        placeholder="Chú thích ảnh..."
                        className={`w-full px-2.5 py-1 rounded-lg border text-[11px] ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white'
                            : 'bg-white border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className={`p-1.5 transition ${
                        isDark ? 'text-slate-400 hover:text-rose-400' : 'text-stone-400 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Interactive Live Preview */}
        <div className={`lg:col-span-7 flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto max-h-[calc(100vh-60px)] transition-colors ${
          isDark ? 'bg-[#080b11]' : 'bg-[#f5f2eb]'
        }`}>
          <div className="w-full flex items-center justify-between mb-4 max-w-sm sm:max-w-md">
            <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
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
