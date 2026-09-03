import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { QrShapeRenderer, QrShapeType } from './QrShapeRenderer';
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  QrCode,
  Heart,
  Square,
  Circle,
  MessageCircle,
  Palette,
  X,
  Sparkles,
} from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  publicUrl: string;
  qrCodeBase64?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  publicUrl,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [copied, setCopied] = useState(false);
  const [selectedShape, setSelectedShape] = useState<QrShapeType>('default');
  const [selectedColor, setSelectedColor] = useState<string>('#0f172a');

  if (!isOpen) return null;

  const colorPalette = [
    { name: 'Đen Chuẩn', hex: '#0f172a' },
    { name: 'Đỏ Yêu', hex: '#ef4444' },
    { name: 'Hồng Đào', hex: '#f43f5e' },
    { name: 'Tím Mộng', hex: '#8b5cf6' },
    { name: 'Xanh Biển', hex: '#0284c7' },
    { name: 'Xanh Ngọc', hex: '#10b981' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectShape = (shape: QrShapeType) => {
    setSelectedShape(shape);
    if (shape === 'default') {
      setSelectedColor('#0f172a');
    } else if (shape === 'heart' && selectedColor === '#0f172a') {
      setSelectedColor('#ef4444');
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-modal-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 500, 500);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${selectedShape}_${title.replace(/\s+/g, '_')}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl transition-all border ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition ${
            isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
              : 'hover:bg-stone-100 text-stone-500 hover:text-stone-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="inline-flex p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Mã QR Thiệp</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Quét mã bằng camera điện thoại hoặc Zalo để mở thiệp ngay
          </p>
        </div>

        {/* CUSTOMIZATION CONTROLS */}
        <div className={`p-3 rounded-2xl border mb-4 space-y-3 ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'
        }`}>
          {/* Row 1: Shape Selector */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-left">
              1. Hình dạng mã QR:
            </span>
            <div className="grid grid-cols-5 gap-1">
              <button
                type="button"
                onClick={() => handleSelectShape('default')}
                className={`py-1.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  selectedShape === 'default'
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-rose-500'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white border text-stone-700 hover:border-slate-400'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px]">Mặc Định</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectShape('heart')}
                className={`py-1.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  selectedShape === 'heart'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white border text-stone-700 hover:border-rose-300'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-current" />
                <span className="text-[10px]">Trái Tim</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectShape('square')}
                className={`py-1.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  selectedShape === 'square'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white border text-stone-700 hover:border-rose-300'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span className="text-[10px]">Bo Góc</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectShape('circle')}
                className={`py-1.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  selectedShape === 'circle'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white border text-stone-700 hover:border-rose-300'
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                <span className="text-[10px]">Hình Tròn</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectShape('chat')}
                className={`py-1.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  selectedShape === 'chat'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white border text-stone-700 hover:border-rose-300'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[10px]">Bong Bóng</span>
              </button>
            </div>
          </div>

          {/* Row 2: Color Palette */}
          <div className="flex items-center justify-between gap-2 border-t pt-2 border-slate-800/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Palette className="w-3 h-3" /> 2. Màu sắc:
            </span>
            <div className="flex items-center gap-2">
              {colorPalette.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-6 h-6 rounded-full transition-transform border-2 ${
                    selectedColor === c.hex ? 'scale-125 border-rose-500 shadow-md' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                title="Tự chọn màu tùy ý"
                className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 p-0"
              />
            </div>
          </div>
        </div>

        {/* PURE CLEAN QR CODE PREVIEW */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="p-3 bg-white rounded-3xl shadow-xl border border-stone-200 inline-block transition-transform hover:scale-102">
            <QrShapeRenderer
              id="qr-modal-svg"
              value={publicUrl}
              size={210}
              shape={selectedShape}
              fgColor={selectedColor}
              bgColor="#ffffff"
              centerIcon={selectedShape === 'default' ? 'none' : 'heart'}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {selectedShape === 'default'
              ? 'Mã QR tiêu chuẩn sắc nét, tương thích mọi loại máy'
              : 'Mã QR nghệ thuật độ bảo toàn cao, quét cực nhanh'}
          </p>
        </div>

        {/* Public Link Box */}
        <div className="space-y-1.5 text-left mt-3">
          <label className={`block text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
            Đường dẫn xem trực tiếp (Public Link):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className={`w-full px-3 py-2 rounded-xl text-xs border truncate font-mono focus:outline-none ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã chép' : 'Chép'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handleDownloadQR}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition"
          >
            <Download className="w-4 h-4" /> Tải Mã QR (PNG)
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
            }`}
          >
            <ExternalLink className="w-4 h-4" /> Mở Thiệp
          </a>
        </div>
      </div>
    </div>
  );
};
