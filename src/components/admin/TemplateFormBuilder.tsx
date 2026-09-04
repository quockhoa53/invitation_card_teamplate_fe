import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Wand2,
  Sparkles,
  Layers,
  HelpCircle,
  Tag,
  AlignLeft,
  Type,
  Calendar,
  Image,
  Music,
  Hash,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { TemplateFieldSchema, FieldType } from '../../types/schema';
import { parseTemplateSchema } from '../../utils/templateSchema';

interface TemplateFormBuilderProps {
  configString: string;
  onChangeConfig: (newConfig: string) => void;
  isDark: boolean;
}

const FIELD_TYPES: { value: FieldType; label: string; icon: any }[] = [
  { value: 'text', label: 'Văn bản ngắn (Text)', icon: Type },
  { value: 'textarea', label: 'Đoạn văn dài (Textarea)', icon: AlignLeft },
  { value: 'date', label: 'Ngày tháng (Date)', icon: Calendar },
  { value: 'datetime', label: 'Ngày & Giờ (DateTime)', icon: Calendar },
  { value: 'number', label: 'Số lượng / Khoảng cách (Number)', icon: Hash },
  { value: 'image', label: 'Ảnh đơn URL (Image)', icon: Image },
  { value: 'gallery', label: 'Album ảnh kỷ niệm (Gallery)', icon: Image },
  { value: 'music', label: 'Kho nhạc bài hát (Music)', icon: Music },
  { value: 'keywords', label: 'Từ khóa rơi hiệu ứng (Keywords)', icon: Tag },
  { value: 'color', label: 'Mã màu sắc (Color)', icon: Palette },
];

const PRESET_FIELDS: Omit<TemplateFieldSchema, 'defaultValue'>[] = [
  { key: 'recipientName', label: 'Tên Người Nhận', type: 'text', section: 'Nội Dung Lời Chúc', placeholder: 'Nhập tên người nhận...' },
  { key: 'senderName', label: 'Tên Người Gửi', type: 'text', section: 'Nội Dung Lời Chúc', placeholder: 'Nhập tên của bạn...' },
  { key: 'greetingTitle', label: 'Tiêu Đề Lời Chúc', type: 'text', section: 'Nội Dung Lời Chúc', placeholder: 'Ví dụ: Chúc Mừng Sinh Nhật!' },
  { key: 'greetingMessage', label: 'Nội Dung Lời Chúc', type: 'textarea', section: 'Nội Dung Lời Chúc', placeholder: 'Gửi ngàn lời chúc yêu thương...' },
  { key: 'eventDate', label: 'Ngày Diễn Ra Sự Kiện', type: 'date', section: 'Thời Gian & Địa Điểm' },
  { key: 'eventTime', label: 'Giờ Diễn Ra', type: 'text', section: 'Thời Gian & Địa Điểm', placeholder: '18:30' },
  { key: 'eventLocation', label: 'Địa Điểm Tổ Chức', type: 'text', section: 'Thời Gian & Địa Điểm', placeholder: 'Nhà hàng White Palace...' },
  { key: 'senderAvatar', label: 'Ảnh Đại Diện', type: 'image', section: 'Hình Ảnh', placeholder: 'https://...' },
  { key: 'photos', label: 'Album Ảnh Kỷ Niệm', type: 'gallery', section: 'Album Ảnh Kỷ Niệm' },
  { key: 'musicUrl', label: 'Nhạc Nền Thiệp Mời', type: 'music', section: 'Nhạc Nền Thiệp Mời' },
  { key: 'distanceKm', label: 'Khoảng Cách (km)', type: 'number', section: 'Bản Đồ & Khoảng Cách' },
  { key: 'fallingKeywords', label: 'Hiệu Ứng Từ Khóa Rơi', type: 'keywords', section: 'Hiệu Ứng Từ Khóa Rơi' },
];

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

export const TemplateFormBuilder: React.FC<TemplateFormBuilderProps> = ({
  configString,
  onChangeConfig,
  isDark,
}) => {
  const [fields, setFields] = useState<TemplateFieldSchema[]>([]);
  const [hasExplicitSchema, setHasExplicitSchema] = useState(false);

  // Sync from configString on mount or when configString externally changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(configString || '{}');
      if (Array.isArray(parsed._schema) && parsed._schema.length > 0) {
        setFields(parsed._schema);
        setHasExplicitSchema(true);
      } else {
        // Auto-infer schema from existing config keys
        const inferred = parseTemplateSchema(configString);
        setFields(inferred);
        setHasExplicitSchema(false);
      }
    } catch {
      setFields([]);
      setHasExplicitSchema(false);
    }
  }, [configString]);

  // Persist updated fields into configString
  const persistFields = (updatedFields: TemplateFieldSchema[]) => {
    setFields(updatedFields);
    setHasExplicitSchema(true);
    try {
      const parsed = JSON.parse(configString || '{}');
      parsed._schema = updatedFields;
      // Ensure each field key has at least a default mock value in config if not present
      updatedFields.forEach((f) => {
        if (parsed[f.key] === undefined) {
          if (f.type === 'gallery') parsed[f.key] = [];
          else if (f.type === 'number') parsed[f.key] = 0;
          else if (f.type === 'keywords') parsed[f.key] = ['Yêu Thương', 'Hạnh Phúc'];
          else parsed[f.key] = f.defaultValue ?? '';
        }
      });
      onChangeConfig(JSON.stringify(parsed, null, 2));
    } catch {
      const newConfig: Record<string, any> = { _schema: updatedFields };
      updatedFields.forEach((f) => {
        newConfig[f.key] = f.defaultValue ?? '';
      });
      onChangeConfig(JSON.stringify(newConfig, null, 2));
    }
  };

  const handleAddField = () => {
    const newField: TemplateFieldSchema = {
      key: `field_${Date.now().toString().slice(-4)}`,
      label: 'Trường Mới',
      type: 'text',
      section: 'Nội Dung Lời Chúc',
      placeholder: '',
    };
    persistFields([...fields, newField]);
  };

  const handleAddPreset = (preset: Omit<TemplateFieldSchema, 'defaultValue'>) => {
    // Avoid duplicate keys
    if (fields.some((f) => f.key === preset.key)) {
      return;
    }
    persistFields([...fields, { ...preset }]);
  };

  const handleUpdateField = (index: number, patch: Partial<TemplateFieldSchema>) => {
    const next = [...fields];
    next[index] = { ...next[index], ...patch };
    persistFields(next);
  };

  const handleRemoveField = (index: number) => {
    const next = fields.filter((_, i) => i !== index);
    persistFields(next);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const next = [...fields];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    persistFields(next);
  };

  const handleAutoInfer = () => {
    const inferred = parseTemplateSchema(configString);
    persistFields(inferred);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-orange-500" />
              Cấu Hình Form Nhập Cho Người Dùng
            </h4>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                hasExplicitSchema
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {hasExplicitSchema ? '✓ Schema Tùy Chỉnh' : '⚡ Tự Động Phân Tích'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Thiết lập chính xác các trường (Tên, Lời chúc, Ảnh, Nhạc...) hiển thị khi người dùng tạo thiệp.
            Không còn phụ thuộc vào mã if/else hardcoded!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAutoInfer}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700 shadow-sm'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" /> Tự Phân Tích Lại
          </button>
          <button
            type="button"
            onClick={handleAddField}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> + Thêm Trường
          </button>
        </div>
      </div>

      {/* Quick Add Presets */}
      <div>
        <p className="text-[11px] font-semibold text-stone-500 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-orange-400" /> Thêm nhanh trường mẫu phổ biến:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_FIELDS.map((preset) => {
            const isAdded = fields.some((f) => f.key === preset.key);
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleAddPreset(preset)}
                disabled={isAdded}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition ${
                  isAdded
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                    : isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                    : 'bg-white hover:bg-orange-50 text-stone-700 border border-stone-200 shadow-xs'
                }`}
              >
                {isAdded ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3 text-orange-400" />}
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Field List */}
      {fields.length === 0 ? (
        <div
          className={`p-8 rounded-2xl border text-center space-y-3 ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-stone-200 text-stone-500'
          }`}
        >
          <HelpCircle className="w-8 h-8 mx-auto text-orange-400/60" />
          <div>
            <p className="text-sm font-semibold text-stone-300">Chưa có trường nhập nào được cấu hình</p>
            <p className="text-xs text-stone-500 mt-0.5">
              Bấm "Tự Phân Tích Lại" để quét các biến trong Config JSON hoặc bấm "+ Thêm Trường" để tự cấu hình.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoInfer}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition inline-flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" /> Quét Trường Tự Động Từ Config
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {fields.map((field, index) => {
            const CurrentTypeIcon = FIELD_TYPES.find((t) => t.value === field.type)?.icon || Type;

            return (
              <div
                key={index}
                className={`p-3 rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                  {/* Reorder & Index */}
                  <div className="md:col-span-1 flex items-center gap-1 text-slate-500">
                    <span className="text-[11px] font-mono font-bold w-4 text-center">#{index + 1}</span>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-0.5 hover:text-orange-400 disabled:opacity-20 transition"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === fields.length - 1}
                        className="p-0.5 hover:text-orange-400 disabled:opacity-20 transition"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Key (Variable Name) */}
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-semibold text-stone-500 block mb-0.5">
                      Mã Biến (Key trong Code)
                    </label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleUpdateField(index, { key: e.target.value })}
                      placeholder="e.g. recipientName"
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium focus:outline-none ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-amber-300 focus:border-orange-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                      }`}
                    />
                  </div>

                  {/* Label (Display Name) */}
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-semibold text-stone-500 block mb-0.5">
                      Nhãn Hiển Thị (Cho Người Dùng)
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                      placeholder="e.g. Tên Người Nhận"
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                      }`}
                    />
                  </div>

                  {/* Type Selector */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-semibold text-stone-500 block mb-0.5 flex items-center gap-1">
                      <CurrentTypeIcon className="w-3 h-3 text-orange-400" /> Kiểu Nhập
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) => handleUpdateField(index, { type: e.target.value as FieldType })}
                      className={`w-full px-2 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                      }`}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section Group */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-semibold text-stone-500 block mb-0.5">Nhóm Mục</label>
                    <input
                      type="text"
                      list={`sections-${index}`}
                      value={field.section || ''}
                      onChange={(e) => handleUpdateField(index, { section: e.target.value })}
                      placeholder="e.g. Lời Chúc"
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs focus:outline-none ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-300 focus:border-orange-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                      }`}
                    />
                    <datalist id={`sections-${index}`}>
                      {COMMON_SECTIONS.map((sec) => (
                        <option key={sec} value={sec} />
                      ))}
                    </datalist>
                  </div>

                  {/* Actions (Delete) */}
                  <div className="md:col-span-1 flex justify-end pt-3 md:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveField(index)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      title="Xóa trường này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Optional Placeholder / Helper row */}
                {(field.type === 'text' || field.type === 'textarea') && (
                  <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 font-medium">Gợi ý Placeholder:</span>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => handleUpdateField(index, { placeholder: e.target.value })}
                      placeholder="Nhập nội dung gợi ý mờ mờ trong ô nhập..."
                      className={`flex-1 px-2 py-1 rounded-lg border text-[11px] focus:outline-none ${
                        isDark
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300 focus:border-orange-500'
                          : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-orange-500'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
        <span>Tổng cộng: <strong className="text-orange-400">{fields.length}</strong> trường nhập được cấu hình</span>
        <span>Dữ liệu schema sẽ tự động lưu vào <code className="text-amber-400">_schema</code> trong Config JSON</span>
      </div>
    </div>
  );
};
