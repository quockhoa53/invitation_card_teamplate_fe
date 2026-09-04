import React, { useState } from 'react';
import { Heart, Sparkles, QrCode, Play, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Hero3DCard: React.FC<{ isDark: boolean; onOpenDemo?: () => void }> = ({ isDark, onOpenDemo }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rX = -(y / (rect.height / 2)) * 12;
    const rY = (x / (rect.width / 2)) * 12;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleTriggerCelebration = (e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fbbf24', '#e11d48', '#fda4af'],
    });
    if (onOpenDemo) onOpenDemo();
  };

  return (
    <div
      className="relative w-full max-w-[420px] aspect-[3/4] mx-auto cursor-pointer select-none"
      style={{ perspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleTriggerCelebration}
    >
      {/* Ambient Glow behind 3D Card */}
      <div
        className={`absolute inset-0 rounded-[36px] blur-3xl transition-opacity duration-700 pointer-events-none ${
          isDark ? 'bg-gradient-to-tr from-orange-500/20 via-amber-500/20 to-orange-600/10' : 'bg-orange-400/25'
        } ${isHovered ? 'opacity-100 scale-105' : 'opacity-50 scale-95'}`}
      />

      {/* Main 3D Card Container */}
      <div
        className="w-full h-full rounded-[36px] transition-transform duration-200 ease-out preserve-3d relative"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'scale3d(1.02, 1.02, 1.02)' : 'scale3d(1, 1, 1)'}`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Layer 1: Envelope / Cover Base */}
        <div
          className={`absolute inset-0 rounded-[36px] p-7 flex flex-col justify-between overflow-hidden shadow-2xl border transition-colors ${
            isDark
              ? 'bg-gradient-to-br from-[#181f30] via-[#101622] to-[#0c1017] border-slate-700/80 text-white'
              : 'bg-gradient-to-br from-[#ffffff] via-[#faf6f0] to-[#f4ede4] border-stone-300 text-stone-900 shadow-stone-300/60'
          }`}
          style={{
            transform: 'translateZ(20px)',
            boxShadow: isDark
              ? '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(244, 63, 94, 0.2)'
              : '0 25px 50px -12px rgba(120, 113, 108, 0.35), 0 0 0 1px rgba(217, 119, 6, 0.2)',
          }}
        >
          {/* Subtle Geometric / Art Deco Line Accents */}
          <div className="absolute inset-3 rounded-[28px] border border-amber-500/20 pointer-events-none" />
          <div className="absolute inset-4 rounded-[24px] border border-orange-500/15 pointer-events-none" />

          {/* Top Header of Card */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-editorial text-xs font-black tracking-widest uppercase text-amber-500">
                KD ATELIER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            </div>

            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              isDark
                ? 'bg-slate-900/80 border-slate-700 text-slate-300'
                : 'bg-white border-stone-200 text-stone-700'
            }`}>
              Interactive 3D
            </div>
          </div>

          {/* Centerpiece: Wax Seal & Monogram KD */}
          <div className="relative z-10 my-auto text-center space-y-4">
            {/* Wax Seal */}
            <div className="relative inline-block group/seal">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-700 via-orange-600 to-amber-600 p-[3px] shadow-lg shadow-orange-900/40 flex items-center justify-center mx-auto transform group-hover/seal:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full bg-[#12080a] border border-amber-400/40 flex flex-col items-center justify-center text-amber-400 shadow-inner">
                  <span className="font-editorial text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200">
                    KD
                  </span>
                  <span className="text-[8px] tracking-widest text-amber-500/80 uppercase -mt-0.5 font-bold">
                    Official
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-orange-500 text-[9px] font-extrabold text-white uppercase tracking-wider shadow">
                Chạm để mở
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-1">
              <h3 className="font-editorial text-2xl font-bold tracking-tight">
                Thiệp Mời Đặc Biệt
              </h3>
              <p className={`text-xs font-sans max-w-[240px] mx-auto leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-stone-600'
              }`}>
                Thổi nến sinh nhật • Đếm ngày yêu • Nhạc du dương & Lời chúc lưu bút
              </p>
            </div>
          </div>

          {/* Bottom Card Footer with QR teaser & Play button */}
          <div className="relative z-10 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-orange-400' : 'bg-white border-stone-200 text-orange-600'
              }`}>
                <QrCode className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold">Quét QR & Link Riêng</p>
                <p className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Tự động tạo mã</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-500 font-bold text-[10px]">
              <Play className="w-3 h-3 fill-orange-500" />
              <span>Xem Thử Ngay</span>
            </div>
          </div>
        </div>

        {/* Floating Mini 3D Badge (Top Right) */}
        <div
          className="absolute -top-4 -right-4 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-1.5 animate-soft-float"
          style={{ transform: 'translateZ(50px)' }}
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Bìa 3D Tương Tác</span>
        </div>

        {/* Floating Mini Audio Badge (Bottom Left) */}
        <div
          className={`absolute -bottom-4 -left-4 px-3 py-1.5 rounded-2xl border shadow-xl flex items-center gap-1.5 text-xs font-semibold backdrop-blur-xl ${
            isDark
              ? 'bg-slate-900/90 border-slate-700 text-orange-300'
              : 'bg-white/90 border-stone-200 text-orange-600'
          }`}
          style={{ transform: 'translateZ(40px)' }}
        >
          <Volume2 className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span className="text-[11px]">Tích hợp âm nhạc</span>
        </div>
      </div>
    </div>
  );
};
