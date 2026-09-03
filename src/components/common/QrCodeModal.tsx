import React, { useState, useRef } from 'react';
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
  Phone,
  Video,
  Menu,
  ChevronLeft,
  Share2,
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
  const [selectedShape, setSelectedShape] = useState<QrShapeType>('heart');
  const [selectedColor, setSelectedColor] = useState<string>('#ef4444');
  const [viewMode, setViewMode] = useState<'qr_only' | 'chat_frame'>('chat_frame');
  const [contactName, setContactName] = useState('Công chúa 🥰');
  const [customMsg1, setCustomMsg1] = useState('Mừng kỉ niệm 1000 ngày 💖');
  const [customMsg2, setCustomMsg2] = useState('Em có quà tặng anh nè 🎁');
  const [customMsg3, setCustomMsg3] = useState('Anh quét để nhận quà nhaaaa 😚');

  const chatFrameRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const colorPalette = [
    { name: 'Đỏ Yêu', hex: '#ef4444' },
    { name: 'Hồng Đào', hex: '#f43f5e' },
    { name: 'Tím Mộng', hex: '#8b5cf6' },
    { name: 'Xanh Biển', hex: '#0284c7' },
    { name: 'Xanh Ngọc', hex: '#10b981' },
    { name: 'Đen Sang', hex: '#0f172a' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleDownloadChatFrame = () => {
    // Download the entire chat message card as high-res PNG
    const svg = document.getElementById('qr-modal-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 640;
      canvas.height = 840;
      if (!ctx) return;

      // Draw background
      ctx.fillStyle = isDark ? '#0b0f19' : '#f1f5f9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Header bar
      ctx.fillStyle = isDark ? '#121827' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, 90);

      ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(contactName, 80, 55);

      // Draw Chat bubbles
      const drawBubble = (text: string, y: number) => {
        ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
        ctx.beginPath();
        ctx.roundRect(40, y, 360, 48, 16);
        ctx.fill();

        ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
        ctx.font = '16px sans-serif';
        ctx.fillText(text, 60, y + 30);
      };

      drawBubble(customMsg1, 120);
      drawBubble(customMsg2, 180);
      drawBubble(customMsg3, 240);

      // Draw QR Card Container
      ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(40, 310, 560, 460, 24);
      ctx.fill();

      // Draw Heart QR inside card
      ctx.drawImage(img, 140, 340, 360, 360);

      // Draw Bottom Hint
      ctx.fillStyle = selectedColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔍 Quét mã QR để mở thiệp nhận quà', canvas.width / 2, 735);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `Thiep_Tin_Nhan_${title.replace(/\s+/g, '_')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className={`max-w-xl w-full border rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-center relative transition-colors my-auto ${
        isDark ? 'bg-[#121824] border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-800'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-500 text-xs font-bold">
            <QrCode className="w-3.5 h-3.5" />
            <span>Mã QR Tùy Biến Hình Dạng & Màu Sắc</span>
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold">Tạo Mã QR Độc Bản</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>{title}</p>
        </div>

        {/* View Mode Toggle: [💬 Khung Tin Nhắn (Zalo/iMessage)] vs [🔲 Mã QR Độc Lập] */}
        <div className={`p-1 rounded-2xl border flex items-center justify-center gap-1 max-w-xs mx-auto ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-100 border-stone-200'
        }`}>
          <button
            type="button"
            onClick={() => setViewMode('chat_frame')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'chat_frame'
                ? 'bg-rose-500 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Khung Tin Nhắn
          </button>
          <button
            type="button"
            onClick={() => setViewMode('qr_only')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'qr_only'
                ? 'bg-rose-500 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> QR Độc Lập
          </button>
        </div>

        {/* Customizer Controls Toolbar */}
        <div className={`p-3 rounded-2xl border space-y-3 text-left ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-stone-50 border-stone-200'
        }`}>
          {/* Row 1: Shape Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              1. Hình dạng QR:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedShape('heart')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  selectedShape === 'heart'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300' : 'bg-white border text-stone-700'
                }`}
              >
                <Heart className="w-3 h-3 fill-current" /> Trái Tim
              </button>
              <button
                type="button"
                onClick={() => setSelectedShape('square')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  selectedShape === 'square'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300' : 'bg-white border text-stone-700'
                }`}
              >
                <Square className="w-3 h-3" /> Vuông
              </button>
              <button
                type="button"
                onClick={() => setSelectedShape('circle')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  selectedShape === 'circle'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300' : 'bg-white border text-stone-700'
                }`}
              >
                <Circle className="w-3 h-3" /> Tròn
              </button>
              <button
                type="button"
                onClick={() => setSelectedShape('chat')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  selectedShape === 'chat'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300' : 'bg-white border text-stone-700'
                }`}
              >
                <MessageCircle className="w-3 h-3" /> Bong Bóng
              </button>
            </div>
          </div>

          {/* Row 2: Color Palette */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 border-slate-800/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Palette className="w-3 h-3" /> 2. Màu sắc QR:
            </span>
            <div className="flex items-center gap-2">
              {colorPalette.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-6 h-6 rounded-full transition-transform border-2 ${
                    selectedColor === c.hex ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
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

        {/* PREVIEW DISPLAY CONTAINER */}
        <div className="relative flex justify-center items-center py-2">
          {viewMode === 'qr_only' ? (
            /* Standalone QR View */
            <div className="p-6 bg-white rounded-3xl shadow-xl border border-stone-200 inline-block transition-transform hover:scale-102">
              <QrShapeRenderer
                id="qr-modal-svg"
                value={publicUrl}
                size={220}
                shape={selectedShape}
                fgColor={selectedColor}
                bgColor="#ffffff"
                centerIcon="heart"
              />
            </div>
          ) : (
            /* Zalo / iMessage Chat Bubble Frame (Matching Screenshot 1) */
            <div
              ref={chatFrameRef}
              className={`w-full max-w-[360px] rounded-3xl border shadow-2xl overflow-hidden text-left transition-colors duration-200 ${
                isDark ? 'bg-[#0f141f] border-slate-800' : 'bg-[#f0f4f9] border-stone-300'
              }`}
            >
              {/* Chat App Top Bar */}
              <div className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark ? 'bg-[#141b2b] border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800'
              }`}>
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-5 h-5 text-sky-500" />
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="font-bold text-xs bg-transparent outline-none border-b border-dashed border-slate-500/40 max-w-[120px]"
                  />
                </div>
                <div className="flex items-center gap-3 text-sky-500">
                  <Phone className="w-4 h-4" />
                  <Video className="w-4 h-4" />
                  <Menu className="w-4 h-4" />
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="p-4 space-y-2 text-xs">
                <div className="text-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-500/15 text-[10px] text-slate-400 font-medium">
                    18:19 Hôm nay
                  </span>
                </div>

                {/* Left Incoming Bubbles */}
                <div className="space-y-1.5 max-w-[85%]">
                  <div className={`p-2.5 rounded-2xl shadow-sm ${
                    isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-stone-800'
                  }`}>
                    <input
                      type="text"
                      value={customMsg1}
                      onChange={(e) => setCustomMsg1(e.target.value)}
                      className="w-full bg-transparent outline-none border-b border-dashed border-transparent hover:border-slate-500/40"
                    />
                  </div>

                  <div className={`p-2.5 rounded-2xl shadow-sm ${
                    isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-stone-800'
                  }`}>
                    <input
                      type="text"
                      value={customMsg2}
                      onChange={(e) => setCustomMsg2(e.target.value)}
                      className="w-full bg-transparent outline-none border-b border-dashed border-transparent hover:border-slate-500/40"
                    />
                  </div>

                  <div className={`p-2.5 rounded-2xl shadow-sm ${
                    isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-stone-800'
                  }`}>
                    <input
                      type="text"
                      value={customMsg3}
                      onChange={(e) => setCustomMsg3(e.target.value)}
                      className="w-full bg-transparent outline-none border-b border-dashed border-transparent hover:border-slate-500/40"
                    />
                  </div>
                </div>

                {/* Heart-Shaped QR Card Bubble (Screenshot 1 Match!) */}
                <div className="pt-2">
                  <div className={`p-4 rounded-3xl shadow-lg border text-center space-y-3 ${
                    isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-stone-200'
                  }`}>
                    <div className="flex justify-center">
                      <QrShapeRenderer
                        id="qr-modal-svg"
                        value={publicUrl}
                        size={190}
                        shape={selectedShape}
                        fgColor={selectedColor}
                        bgColor="#ffffff"
                        centerIcon="heart"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 px-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: selectedColor }}>
                        <QrCode className="w-3.5 h-3.5" /> Quét mã QR
                      </div>
                      <div className="flex items-center gap-1 text-rose-500 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">
                        <Heart className="w-3 h-3 fill-current" /> 2
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Public Link Box */}
        <div className="space-y-1.5 text-left">
          <label className={`block text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
            Đường dẫn xem trực tiếp (Public Link):
          </label>
          <div className={`flex items-center gap-2 p-2 rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-stone-50 border-stone-200'
          }`}>
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="bg-transparent text-xs flex-1 outline-none px-2 font-mono truncate"
            />
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition active:scale-95 flex items-center gap-1 text-xs font-bold shrink-0 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDownloadQR}
            className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
              isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                : 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-800'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-rose-500" /> Tải Mã QR
          </button>

          {viewMode === 'chat_frame' && (
            <button
              type="button"
              onClick={handleDownloadChatFrame}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Tải Thiệp Tin Nhắn
            </button>
          )}

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Xem Thiệp
          </a>
        </div>
      </div>
    </div>
  );
};
