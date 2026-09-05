import React from 'react';
import { TemplateFieldSchema } from '../../types/schema';
import { MusicStoryPicker } from '../common/MusicStoryPicker';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  Calendar,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Hash,
} from 'lucide-react';

interface DynamicFieldRendererProps {
  field: TemplateFieldSchema;
  value: any;
  onChange: (value: any) => void;
  onUpdateMusicTitle?: (title: string) => void;
  isDark: boolean;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  onUpdateMusicTitle,
  isDark,
}) => {
  const { key, label, type, placeholder, rows = 3, helperText, options } = field;

  // 1. MUSIC TYPE
  if (type === 'music') {
    return (
      <div className="pt-1">
        <MusicStoryPicker
          selectedMusicUrl={value || ''}
          selectedMusicTitle=""
          onSelectMusic={(url, trackTitle) => {
            onChange(url);
            if (onUpdateMusicTitle) onUpdateMusicTitle(trackTitle);
          }}
        />
      </div>
    );
  }

  // 2. GALLERY / PHOTOS ALBUM TYPE
  if (type === 'gallery') {
    const photos: Array<{ url: string; caption?: string }> = Array.isArray(value) ? value : [];

    const handleAddPhoto = () => {
      const newPhotos = [
        ...photos,
        {
          url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600',
          caption: 'Kỷ niệm mới',
        },
      ];
      onChange(newPhotos);
    };

    const handleUpdatePhoto = (index: number, prop: 'url' | 'caption', val: string) => {
      const newPhotos = [...photos];
      if (newPhotos[index]) {
        newPhotos[index] = { ...newPhotos[index], [prop]: val };
        onChange(newPhotos);
      }
    };

    const handleRemovePhoto = (index: number) => {
      const newPhotos = photos.filter((_, i) => i !== index);
      onChange(newPhotos);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
            {label} ({photos.length})
          </label>
          <button
            type="button"
            onClick={handleAddPhoto}
            className="px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-500 hover:bg-orange-500/25 text-xs font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm Ảnh
          </button>
        </div>

        {photos.length === 0 ? (
          <p className={`text-xs text-center py-4 italic border border-dashed rounded-xl ${
            isDark ? 'border-slate-800 text-slate-500' : 'border-stone-200 text-stone-400'
          }`}>
            Chưa có hình ảnh nào. Bấm nút "+ Thêm Ảnh" để tải ảnh kỷ niệm lên thiệp.
          </p>
        ) : (
          <div className="space-y-2.5">
            {photos.map((photo, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex gap-3 items-center ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <img
                  src={photo.url || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300'}
                  alt="preview"
                  className="w-14 h-14 rounded-lg object-cover bg-slate-950 shrink-0 border border-orange-500/20"
                />

                <div className="flex-1 space-y-1.5 min-w-0">
                  <input
                    type="text"
                    value={photo.url || ''}
                    onChange={(e) => handleUpdatePhoto(idx, 'url', e.target.value)}
                    placeholder="Đường link ảnh (https://...)"
                    className={`w-full px-2.5 py-1 rounded-lg border text-[11px] font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-orange-500'
                        : 'bg-white border-stone-200 text-stone-900 focus:border-orange-500'
                    }`}
                  />
                  <input
                    type="text"
                    value={photo.caption || ''}
                    onChange={(e) => handleUpdatePhoto(idx, 'caption', e.target.value)}
                    placeholder="Chú thích ảnh..."
                    className={`w-full px-2.5 py-1 rounded-lg border text-[11px] focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-orange-500'
                        : 'bg-white border-stone-200 text-stone-900 focus:border-orange-500'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition shrink-0"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. IMAGE TYPE (Single image with live preview & client-side WebP compression)
  if (type === 'image') {
    return (
      <ImageUploadInput
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        helperText={helperText}
        isDark={isDark}
      />
    );
  }

  // 4. TEXTAREA TYPE
  if (type === 'textarea') {
    return (
      <div>
        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
          {label}
        </label>
        <textarea
          rows={rows}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none resize-none ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
              : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
          }`}
        />
        {helperText && (
          <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>{helperText}</p>
        )}
      </div>
    );
  }

  // 5. DATE & DATETIME TYPE
  if (type === 'date' || type === 'datetime') {
    const isDateTime = type === 'datetime';
    let dateStr = typeof value === 'string' ? value : '';
    if (isDateTime && dateStr.length > 16) {
      dateStr = dateStr.substring(0, 16);
    }
    return (
      <div>
        <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${
          isDark ? 'text-slate-300' : 'text-stone-700'
        }`}>
          <Calendar className="w-3.5 h-3.5 text-orange-500" />
          {label}
        </label>
        <input
          type={isDateTime ? 'datetime-local' : 'date'}
          value={dateStr}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
              : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
          }`}
        />
        {helperText && (
          <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>{helperText}</p>
        )}
      </div>
    );
  }

  // 6. NUMBER TYPE
  if (type === 'number') {
    return (
      <div>
        <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${
          isDark ? 'text-slate-300' : 'text-stone-700'
        }`}>
          <Hash className="w-3.5 h-3.5 text-orange-500" />
          {label}
        </label>
        <input
          type="number"
          value={value !== undefined ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
              : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
          }`}
        />
        {helperText && (
          <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>{helperText}</p>
        )}
      </div>
    );
  }

  // 7. SELECT TYPE
  if (type === 'select' && options && options.length > 0) {
    return (
      <div>
        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
          {label}
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
              : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
          }`}
        >
          {options.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 8. DEFAULT / TEXT TYPE
  return (
    <div>
      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
        {label}
      </label>
      <input
        type="text"
        value={typeof value === 'string' || typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
            : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
        }`}
      />
      {helperText && (
        <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>{helperText}</p>
      )}
    </div>
  );
};
