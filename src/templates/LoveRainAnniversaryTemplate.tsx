import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import {
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  Send,
  MessageCircle,
  X,
} from 'lucide-react';
import { LoveAnniversaryData, CardWish } from '../types';

interface TemplateProps {
  data: LoveAnniversaryData;
  title: string;
  wishes: CardWish[];
  onSendWish?: (name: string, message: string, emoji?: string) => Promise<void>;
  isPreview?: boolean;
}

interface FallingItem {
  x: number;
  y: number;
  text: string;
  isHeart: boolean;
  heartType: 'outline' | 'filled' | 'sparkle';
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  layer: number; // 0 = far, 1 = mid, 2 = hero/foreground
  swayAmplitude: number;
  swaySpeed: number;
  swayOffset: number;
}

interface TouchParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  char: string;
  color: string;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const LoveRainAnniversaryTemplate: React.FC<TemplateProps> = ({
  data,
  wishes,
  onSendWish,
  isPreview = false,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showWishesModal, setShowWishesModal] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [wishText, setWishText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time together calculator
  const [timeTogether, setTimeTogether] = useState({
    days: 1000,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const soundRef = useRef<Howl | null>(null);
  const touchParticlesRef = useRef<TouchParticle[]>([]);
  const shockwavesRef = useRef<ShockwaveRing[]>([]);

  // Calculate days together
  useEffect(() => {
    const calculateTime = () => {
      const start = data.anniversaryStartDate ? new Date(data.anniversaryStartDate) : new Date(Date.now() - 1000 * 86400000);
      const now = new Date();
      const diff = Math.max(0, now.getTime() - start.getTime());

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [data.anniversaryStartDate]);

  // Audio configuration
  useEffect(() => {
    const musicUrl = data.musicUrl || 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3';
    if (!soundRef.current) {
      soundRef.current = new Howl({
        src: [musicUrl],
        html5: true,
        loop: true,
        volume: 0.6,
      });
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    };
  }, [data.musicUrl]);

  const toggleMusic = () => {
    if (!soundRef.current) return;
    if (isPlayingMusic) {
      soundRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      soundRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  // Falling words list
  const defaultWords = [
    'Em yêu anh',
    'thành công',
    'vững vàng',
    'Chúc anh luôn vui vẻ',
    data.recipientName || 'Đức Huy',
    data.senderName || 'Quỳnh Anh',
    'Happy Anniversary',
    `${timeTogether.days} Days`,
    'Yêu anh nhiều lắm',
    'Mãi bên nhau',
  ];

  const wordsList = data.fallingWords && data.fallingWords.length > 0
    ? data.fallingWords
    : defaultWords;

  // Ultra-optimized 60-120fps Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Pre-allocated falling items pool
    const itemCount = isPreview ? 28 : 50;
    const items: FallingItem[] = [];

    for (let i = 0; i < itemCount; i++) {
      const isHeart = Math.random() < 0.28;
      const layer = Math.random() < 0.25 ? 2 : Math.random() < 0.6 ? 1 : 0;
      const size = layer === 2 ? Math.floor(Math.random() * 8 + 26) : layer === 1 ? Math.floor(Math.random() * 6 + 17) : Math.floor(Math.random() * 4 + 13);
      const speed = layer === 2 ? Math.random() * 0.8 + 1.2 : layer === 1 ? Math.random() * 0.5 + 0.8 : Math.random() * 0.3 + 0.5;
      const text = wordsList[Math.floor(Math.random() * wordsList.length)];

      items.push({
        x: Math.random() * width,
        y: Math.random() * height * 1.2 - height * 0.2,
        text,
        isHeart,
        heartType: Math.random() < 0.5 ? 'outline' : Math.random() < 0.8 ? 'filled' : 'sparkle',
        size,
        speed,
        rotation: (Math.random() - 0.5) * 0.35,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
        opacity: layer === 2 ? 0.96 : layer === 1 ? 0.78 : 0.48,
        layer,
        swayAmplitude: Math.random() * 14 + 4,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
      });
    }

    // Pre-sort ONCE by layer to eliminate per-frame Array.sort overhead
    items.sort((a, b) => a.layer - b.layer);

    // Static Stars
    const starCount = 35;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.02 + 0.01,
    }));

    let time = 0;

    const render = () => {
      time += 1;

      // Dark gradient background
      ctx.fillStyle = '#030611';
      ctx.fillRect(0, 0, width, height);

      // Draw Twinkling Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < starCount; i++) {
        const star = stars[i];
        const pulse = 0.5 + 0.5 * Math.sin(time * star.speed + i);
        ctx.globalAlpha = star.alpha * pulse;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw Falling Words & Hearts (Iterate pre-sorted items)
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.y += item.speed;
        item.rotation += item.rotationSpeed;
        const sway = Math.sin(time * item.swaySpeed + item.swayOffset) * item.swayAmplitude;

        if (item.y > height + 40) {
          item.y = -50;
          item.x = Math.random() * width;
          item.text = wordsList[Math.floor(Math.random() * wordsList.length)];
        }

        ctx.save();
        ctx.translate(item.x + sway, item.y);
        ctx.rotate(item.rotation);

        if (item.isHeart) {
          ctx.font = `${item.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (item.heartType === 'outline') {
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = item.layer === 2 ? 14 : 8;
            ctx.fillStyle = `rgba(224, 242, 254, ${item.opacity})`;
            ctx.fillText('♡', 0, 0);
          } else if (item.heartType === 'filled') {
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = item.layer === 2 ? 14 : 6;
            ctx.fillStyle = `rgba(244, 63, 94, ${item.opacity})`;
            ctx.fillText('❤️', 0, 0);
          } else {
            ctx.shadowColor = '#fef08a';
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(254, 240, 138, ${item.opacity})`;
            ctx.fillText('✨', 0, 0);
          }
        } else {
          ctx.font = `bold ${item.size}px "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (item.layer === 2) {
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 16;
            ctx.fillStyle = `rgba(255, 255, 255, ${item.opacity})`;
            ctx.fillText(item.text, 0, 0);
          } else if (item.layer === 1) {
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(224, 242, 254, ${item.opacity})`;
            ctx.fillText(item.text, 0, 0);
          } else {
            ctx.shadowColor = '#0ea5e9';
            ctx.shadowBlur = 4;
            ctx.fillStyle = `rgba(186, 230, 253, ${item.opacity})`;
            ctx.fillText(item.text, 0, 0);
          }
        }

        ctx.restore();
      }

      // Draw Expanding Shockwave Rings (Zero-latency instant feedback)
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const ring = shockwavesRef.current[i];
        ring.radius += 3.5;
        ring.alpha -= 0.035;

        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = ring.alpha;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Instant Touch Particles
      for (let i = touchParticlesRef.current.length - 1; i >= 0; i--) {
        const p = touchParticlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // Gentle gravity
        p.alpha -= 0.024;

        if (p.alpha <= 0) {
          touchParticlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [wordsList, isPreview, timeTogether.days]);

  // Instant Native Touch Burst (0ms latency, zero DOM stalls!)
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // 1. Add instant glowing shockwave ring
    shockwavesRef.current.push({
      x,
      y,
      radius: 8,
      maxRadius: 75,
      alpha: 0.9,
      color: '#38bdf8',
    });

    // 2. Add 14 instantaneous exploding particles
    const particleChars = ['💖', '❤️', '✨', '💕', '⭐'];
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 3.2 + 2.0;
      touchParticlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: Math.random() * 8 + 14,
        alpha: 1,
        char: particleChars[Math.floor(Math.random() * particleChars.length)],
        color: Math.random() < 0.6 ? '#38bdf8' : '#f43f5e',
      });
    }

    // Auto-start music if paused
    if (soundRef.current && !isPlayingMusic) {
      soundRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !wishText.trim() || !onSendWish) return;
    setIsSubmitting(true);
    try {
      await onSendWish(senderName, wishText, '💍');
      setWishText('');
      setShowWishesModal(false);
    } catch (err) {
      alert('Không thể gửi lời chúc, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-x-hidden bg-[#030611] text-white font-sans select-none">
      {/* 60-120fps Neon Falling Words & Hearts Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => handleCanvasInteraction(e.clientX, e.clientY)}
        className="absolute inset-0 w-full h-full cursor-pointer z-0 touch-none"
      />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Milestone Badge */}
        <div className="pointer-events-auto px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 shadow-md">
          <Calendar className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>{timeTogether.days} Ngày Yêu Nhau</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleMusic}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-pink-500/30 text-pink-300 text-[11px] font-bold shadow-md active:scale-95 transition"
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>Nhạc Bật 💖</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Bật Nhạc</span>
            </>
          )}
        </button>
      </div>

      {/* Sleek Compact Action Button: Mở bức thư tình */}
      <div className="absolute bottom-3 left-0 right-0 z-30 flex items-center justify-center gap-2 pointer-events-none px-4">
        <button
          onClick={() => setShowLetterModal(true)}
          className="pointer-events-auto px-4 py-1.5 rounded-full font-bold text-xs bg-gradient-to-r from-cyan-600 via-sky-500 to-pink-500 text-white shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
        >
          <Heart className="w-3.5 h-3.5 fill-white animate-pulse" />
          <span>Mở bức thư tình</span>
        </button>

        <button
          onClick={() => setShowWishesModal(true)}
          className="pointer-events-auto p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-cyan-300 hover:text-white shadow-md active:scale-95 transition"
          title="Gửi lời chúc"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SECRET LOVE LETTER MODAL */}
      <AnimatePresence>
        {showLetterModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div className="relative max-w-md w-full rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0e1628]/95 via-[#080d19]/95 to-[#04060d]/95 border border-cyan-500/30 shadow-2xl text-center space-y-6">
              <button
                onClick={() => setShowLetterModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Thư Tình Kỷ Niệm
                </div>
                <h3 className="font-editorial text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-pink-200">
                  {data.senderName || 'Quỳnh Anh'} & {data.recipientName || 'Đức Huy'}
                </h3>
              </div>

              {/* Days Together Counter Display */}
              <div className="grid grid-cols-4 gap-2 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/20">
                <div>
                  <span className="font-editorial text-xl sm:text-2xl font-black text-cyan-400 block">
                    {timeTogether.days}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ngày</span>
                </div>
                <div>
                  <span className="font-editorial text-xl sm:text-2xl font-black text-pink-400 block">
                    {timeTogether.hours}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Giờ</span>
                </div>
                <div>
                  <span className="font-editorial text-xl sm:text-2xl font-black text-amber-400 block">
                    {timeTogether.minutes}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Phút</span>
                </div>
                <div>
                  <span className="font-editorial text-xl sm:text-2xl font-black text-emerald-400 block">
                    {timeTogether.seconds}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Giây</span>
                </div>
              </div>

              {/* Love Message Content */}
              <div className="p-4 rounded-2xl bg-[#142036]/60 border border-cyan-500/15 text-slate-200 text-xs sm:text-sm leading-relaxed italic text-left max-h-48 overflow-y-auto">
                "{data.greetingMessage || 'Mỗi ngày trôi qua được ở bên anh đều là một ngày ngập tràn ấm áp và hạnh phúc. Cảm ơn anh vì đã luôn là chỗ dựa vững vàng, luôn yêu thương và che chở cho em. Chúc tình yêu của chúng mình mãi luôn bền chặt như ngày đầu tiên!'}"
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowLetterModal(false)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-600 to-pink-600 text-white shadow-lg active:scale-95 transition"
                >
                  Tiếp Tục Ngắm Mưa Chữ Phát Sáng ✨
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GUESTBOOK WISHES MODAL */}
      <AnimatePresence>
        {showWishesModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div className="relative max-w-md w-full rounded-3xl p-6 bg-slate-950 border border-cyan-500/30 text-white space-y-4">
              <button
                onClick={() => setShowWishesModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-editorial text-lg font-bold text-cyan-300">
                Gửi Lời Chúc Kỷ Niệm 💍
              </h4>

              <form onSubmit={handleSubmitWish} className="space-y-3">
                <input
                  type="text"
                  placeholder="Tên của bạn..."
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-cyan-500"
                  required
                />
                <textarea
                  rows={3}
                  placeholder="Viết lời chúc ngọt ngào gửi cặp đôi..."
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-cyan-500 resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi Lời Chúc Ngay
                </button>
              </form>

              {/* Wishes List Preview */}
              <div className="space-y-2 max-h-40 overflow-y-auto pt-2 border-t border-slate-800">
                <p className="text-[11px] font-bold text-slate-400">Lời chúc từ bạn bè ({wishes.length})</p>
                {wishes.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">Chưa có lời chúc nào, hãy là người đầu tiên!</p>
                ) : (
                  wishes.map((w) => (
                    <div key={w.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-left">
                      <span className="font-bold text-cyan-300">{w.senderName}: </span>
                      <span className="text-slate-200">{w.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
