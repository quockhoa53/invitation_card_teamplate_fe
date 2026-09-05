import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  ShieldCheck,
  Link,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { compressImageToWebp, formatBytes, CompressResult } from '../../utils/imageCompression';

interface ImageUploadInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  isDark?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  compact?: boolean;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Nhập link ảnh (https://...) hoặc tải ảnh từ máy',
  helperText,
  isDark = true,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82,
  compact = false,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressStats, setCompressStats] = useState<CompressResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasImage = typeof value === 'string' && value.trim().length > 0;
  const isBase64 = hasImage && value.startsWith('data:image/');

  const handleFile = async (file: File) => {
    if (!file) return;
    setErrorMsg(null);

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn một tệp hình ảnh hợp lệ (.jpg, .png, .webp, .heic...)');
      return;
    }

    try {
      setIsCompressing(true);
      const result = await compressImageToWebp(file, { maxWidth, maxHeight, quality });
      setCompressStats(result);
      onChange(result.dataUri);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể xử lý hình ảnh này');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input value to allow re-selecting the same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    setCompressStats(null);
    setErrorMsg(null);
  };

  return (
    <div className="w-full">
      {/* Label and Mode Switcher */}
      {label && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
            {label}
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                mode === 'upload'
                  ? 'bg-orange-500 text-white shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Upload className="w-3 h-3" /> Tải từ máy
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                mode === 'url'
                  ? 'bg-orange-500 text-white shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Link className="w-3 h-3" /> Dán link
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Main Area: Upload Box vs URL Input */}
      {mode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border transition-all p-3 ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/30'
              : isDark
              ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              : 'bg-stone-50 border-stone-200 hover:border-stone-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Image Preview or Placeholder */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer group border flex items-center justify-center ${
                hasImage
                  ? 'border-orange-500/40 bg-black'
                  : isDark
                  ? 'bg-slate-950 border-slate-800 hover:border-orange-500/50'
                  : 'bg-white border-stone-300 hover:border-orange-500/50'
              }`}
            >
              {hasImage ? (
                <>
                  <img src={value} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-white animate-spin-once" />
                  </div>
                </>
              ) : isCompressing ? (
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              ) : (
                <ImageIcon className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-stone-400'}`} />
              )}
            </div>

            {/* Action text & Upload Button */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang nén WebP...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{hasImage ? 'Đổi ảnh khác' : 'Chọn ảnh từ máy'}</span>
                    </>
                  )}
                </button>

                {hasImage && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                      isDark
                        ? 'text-rose-400 hover:bg-rose-500/10'
                        : 'text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Xóa ảnh này"
                  >
                    <X className="w-3.5 h-3.5" /> Xóa
                  </button>
                )}
              </div>

              {/* Compression stats / Privacy badge */}
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                {compressStats ? (
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold font-mono">
                    <Check className="w-3 h-3" /> Nén WebP ({formatBytes(compressStats.compressedSize)}) • -{compressStats.reductionPercentage}%
                  </span>
                ) : hasImage && isBase64 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Đã lưu WebP nội bộ
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    100% Riêng tư (tự động nén WebP trên máy)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Manual URL Mode */
        <div className="flex gap-2 items-center">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 border border-orange-500/30 shrink-0 flex items-center justify-center">
            {hasImage ? (
              <img src={value} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-4 h-4 text-stone-500" />
            )}
          </div>
          <input
            type="text"
            value={isBase64 ? '(Ảnh tải từ máy tính/điện thoại)' : value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isBase64}
            placeholder={placeholder}
            className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
                : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
            }`}
          />
          {hasImage && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-2 rounded-xl border transition ${
                isDark
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
              title="Xóa link ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
          <X className="w-3 h-3 shrink-0" /> {errorMsg}
        </p>
      )}

      {/* Helper text */}
      {helperText && !errorMsg && (
        <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};
