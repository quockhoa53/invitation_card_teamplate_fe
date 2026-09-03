import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download, ExternalLink, QrCode } from 'lucide-react';

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
  qrCodeBase64,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (qrCodeBase64) {
      const link = document.createElement('a');
      link.href = qrCodeBase64;
      link.download = `QR_${title.replace(/\s+/g, '_')}.png`;
      link.click();
    } else {
      // Fallback SVG download
      const svg = document.getElementById('public-qr-svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `QR_${title.replace(/\s+/g, '_')}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`max-w-md w-full border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative transition-colors ${
        isDark ? 'bg-[#121824] border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-800'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 font-bold"
        >
          ✕
        </button>

        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-2xl font-bold">Mã QR & Link Chia Sẻ</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>{title}</p>
        </div>

        {/* QR Code Container */}
        <div className="p-6 bg-white rounded-2xl inline-block shadow-xl border border-stone-200">
          {qrCodeBase64 ? (
            <img src={qrCodeBase64} alt="QR Code" className="w-52 h-52 object-contain mx-auto" />
          ) : (
            <QRCodeSVG
              id="public-qr-svg"
              value={publicUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          )}
        </div>

        {/* Public Link Box */}
        <div className="space-y-2">
          <label className={`block text-xs font-semibold text-left ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
            Đường dẫn xem trực tiếp (Public Link):
          </label>
          <div className={`flex items-center gap-2 p-2 rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-stone-50 border-stone-200'
          }`}>
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="bg-transparent text-xs flex-1 outline-none px-2 font-mono"
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
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownloadQR}
            className={`py-2.5 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
              isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                : 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-800'
            }`}
          >
            <Download className="w-4 h-4 text-rose-500" /> Tải mã QR (PNG)
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition"
          >
            <ExternalLink className="w-4 h-4" /> Mở Thiệp Public
          </a>
        </div>
      </div>
    </div>
  );
};
