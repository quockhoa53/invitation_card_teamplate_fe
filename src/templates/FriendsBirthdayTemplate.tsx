import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import { Sparkles, Volume2, VolumeX, Flame, Send, MessageSquare, Heart } from 'lucide-react';
import { FriendsBirthdayData, CardWish } from '../types';

interface TemplateProps {
  data: FriendsBirthdayData;
  title: string;
  wishes: CardWish[];
  onSendWish?: (name: string, message: string, emoji?: string) => Promise<void>;
  isPreview?: boolean;
}

export const FriendsBirthdayTemplate: React.FC<TemplateProps> = ({
  data,
  title,
  wishes,
  onSendWish,
  isPreview = false,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [candleLit, setCandleLit] = useState(true);
  const [showWishesModal, setShowWishesModal] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [wishText, setWishText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    if (data.musicUrl && !soundRef.current) {
      soundRef.current = new Howl({
        src: [data.musicUrl],
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

  const handleBlowCandle = () => {
    setCandleLit(false);
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f43f5e', '#fb7185', '#ffffff', '#cbd5e1'],
    });
  };

  const handlePostWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !wishText.trim() || !onSendWish) return;
    setIsSubmitting(true);
    try {
      await onSendWish(senderName, wishText, selectedEmoji);
      setWishText('');
      setShowWishesModal(false);
      confetti({ particleCount: 80, spread: 70 });
    } catch (err) {
      alert('Không thể gửi lời chúc, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-full w-full overflow-x-hidden bg-gradient-to-b from-[#080b11] via-[#0f1522] to-[#080b11] text-white font-sans pb-12">
      {/* Subtle Rose Ambient Glow */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-rose-600/15 blur-[120px] pointer-events-none" />

      {/* Floating Music Button */}
      {data.musicUrl && (
        <button
          onClick={toggleMusic}
          className={`${isPreview ? 'absolute' : 'fixed'} top-4 right-4 z-40 flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-md border border-slate-700 shadow-xl transition-all active:scale-95 text-xs`}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-rose-500" />
              <span className="text-[11px]">Âm Nhạc</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Bật Nhạc</span>
            </>
          )}
        </button>
      )}

      {/* Main Content Container */}
      <div className="relative z-20 max-w-2xl mx-auto px-4 py-8 space-y-8 text-center">
        {/* Header Ribbon & Title */}
        <header className="space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 font-semibold text-xs tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Tiệc Sinh Nhật Bạn Bè 2026</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-white leading-tight">
            {data.greetingTitle || 'Happy Birthday!'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Gửi tặng: <strong className="text-white font-semibold">{data.recipientName || 'Bạn Thân'}</strong>
          </p>
        </header>

        {/* 3D LUXURY INTERACTIVE BIRTHDAY CAKE */}
        <section className="relative p-6 sm:p-8 rounded-[32px] bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

          {/* Interactive Candle & 3D Layered Cake */}
          <div className="relative inline-flex flex-col items-center py-4 cursor-pointer select-none" onClick={handleBlowCandle}>
            {/* Candle with Flame */}
            <div className="relative flex flex-col items-center mb-1">
              <div
                className={`w-3.5 h-6 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-white shadow-lg shadow-orange-500/60 transition-all duration-300 ${
                  candleLit ? 'animate-pulse opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
              />
              <div className="w-1 h-2 bg-slate-500" />
              <div className="w-2.5 h-7 bg-gradient-to-b from-rose-400 to-rose-600 rounded-sm shadow-md" />
            </div>

            {/* 3D Velvet Cake Tiers */}
            <div className="flex flex-col items-center">
              {/* Top Tier */}
              <div className="w-28 h-10 rounded-xl bg-gradient-to-b from-rose-500 to-rose-700 border border-white/20 shadow-md flex items-center justify-center -mb-2 z-10">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider opacity-90">Happy Birthday</span>
              </div>
              {/* Bottom Tier */}
              <div className="w-40 h-14 rounded-2xl bg-gradient-to-b from-rose-700 to-rose-950 border border-white/15 shadow-xl flex items-center justify-center">
                <span className="text-xs font-semibold text-rose-200">★ ★ ★</span>
              </div>
              {/* Cake Stand */}
              <div className="w-48 h-3 rounded-full bg-slate-800 border-t border-white/10 mt-1 shadow-lg" />
            </div>

            <span className="text-[11px] font-semibold text-rose-400 mt-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {candleLit ? 'Chạm vào nến để thổi ước nguyện' : 'Ước nguyện sinh nhật đã được gửi gắm!'}
            </span>
          </div>

          {/* Action Candle Button */}
          <div>
            {candleLit ? (
              <button
                onClick={handleBlowCandle}
                className="px-6 py-2.5 rounded-full font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 active:scale-95 transition text-xs flex items-center justify-center gap-2 mx-auto"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>Thổi Nến Sinh Nhật</span>
              </button>
            ) : (
              <button
                onClick={() => setCandleLit(true)}
                className="px-5 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white transition active:scale-95"
              >
                Thắp Lại Nến
              </button>
            )}
          </div>

          {/* Greeting Letter Box */}
          <div className="relative p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-1.5">
            <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
              <span>Lời chúc từ: {data.senderName || 'Hội Bạn Thân'}</span>
              <span className="text-slate-500">KD Atelier</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
              "{data.greetingMessage || 'Chúc bạn tuổi mới rực rỡ, thành công bứt phá và luôn giữ trọn ngọn lửa đam mê!'}"
            </p>
          </div>
        </section>

        {/* Memory Photos Grid */}
        {data.photos && data.photos.length > 0 && (
          <section className="space-y-4 text-center">
            <div>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white">
                Khoảnh Khắc Kỷ Niệm
              </h3>
              <p className="text-slate-400 text-xs">Những hình ảnh không thể nào quên</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {data.photos.map((photo, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-lg hover:border-rose-500/40 transition group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-950">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Memory'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {photo.caption && (
                    <p className="text-[11px] font-medium text-slate-300 text-center mt-1.5 truncate">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Wishes Wall */}
        <section className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-rose-500" /> Bức Tường Lưu Bút ({wishes ? wishes.length : 0})
            </h3>

            {onSendWish && (
              <button
                onClick={() => setShowWishesModal(true)}
                className="px-4 py-1.5 rounded-full font-semibold bg-rose-600 hover:bg-rose-500 text-white text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <Send className="w-3 h-3" /> Viết Lời Chúc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {wishes && wishes.length > 0 ? (
              wishes.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shadow text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-rose-400">{w.senderName}</span>
                    <span className="text-[11px] text-slate-500">Người bạn</span>
                  </div>
                  <p className="text-slate-300">{w.message}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-4 text-center text-xs text-slate-500">
                Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc!
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Wish Modal */}
      <AnimatePresence>
        {showWishesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" /> Gửi Lời Chúc Sinh Nhật
                </h4>
                <button
                  onClick={() => setShowWishesModal(false)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePostWish} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tên của bạn</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Nhập tên của bạn..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Lời chúc</label>
                  <textarea
                    required
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Viết lời chúc ý nghĩa..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWishesModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-950/50 active:scale-95 transition text-xs"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
