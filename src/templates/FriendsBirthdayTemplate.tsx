import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import { Sparkles, Volume2, VolumeX, PartyPopper, Flame, Send, MessageSquare, Heart, Music } from 'lucide-react';
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
  const [selectedEmoji, setSelectedEmoji] = useState('🎉');
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
      particleCount: 160,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f43f5e', '#38bdf8', '#a855f7', '#34d399'],
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
    <div className="relative min-h-full w-full overflow-x-hidden bg-gradient-to-b from-[#0b0c16] via-[#120e24] to-[#08070f] text-white font-sans selection:bg-amber-500 pb-12">
      {/* Background Animated Strobe Glows */}
      <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-rose-500/15 blur-[120px] pointer-events-none" />

      {/* Floating Music Button */}
      {data.musicUrl && (
        <button
          onClick={toggleMusic}
          className={`${isPreview ? 'absolute' : 'fixed'} top-4 right-4 z-40 flex items-center gap-2 bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-amber-300/50 shadow-xl shadow-amber-950/60 transition-all active:scale-95 text-xs`}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-bounce text-slate-950" />
              <span className="text-[11px]">Party Music: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="text-[11px]">Bật Nhạc Quẩy 🎵</span>
            </>
          )}
        </button>
      )}

      {/* Main Content Container */}
      <div className="relative z-20 max-w-2xl mx-auto px-4 py-8 space-y-8 text-center">
        {/* Header Ribbon & Title */}
        <header className="space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-lg"
          >
            <PartyPopper className="w-4 h-4 text-amber-400" />
            <span>ĐẠI TIỆC SINH NHẬT BÙNG NỔ</span>
          </motion.div>

          <h1 className="font-editorial text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 leading-tight drop-shadow-md">
            {data.greetingTitle || 'Happy Birthday Bro! 🎉'}
          </h1>
          <p className="text-amber-100/80 text-xs sm:text-sm font-medium">
            Gửi tặng người bạn thân: <span className="text-amber-400 font-bold">{data.recipientName || 'Bạn Thân'}</span>
          </p>
        </header>

        {/* 3D LUXURY INTERACTIVE BIRTHDAY CAKE */}
        <section className="relative p-6 sm:p-8 rounded-[36px] bg-gradient-to-b from-[#18142a]/90 via-[#100d1e]/90 to-[#0c0a17]/90 border border-amber-500/30 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="absolute inset-2.5 rounded-[28px] border border-amber-500/15 pointer-events-none" />

          {/* Interactive Candle & Glowing Cake */}
          <div className="relative inline-block py-2">
            {candleLit ? (
              <div
                onClick={handleBlowCandle}
                className="cursor-pointer flex flex-col items-center group select-none"
                title="Bấm vào ngọn nến để thổi tắt!"
              >
                {/* Glowing Candle Flame Animation */}
                <div className="relative flex items-center justify-center">
                  <div className="w-4 h-8 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 animate-pulse shadow-lg shadow-amber-400/80" />
                  <div className="absolute w-8 h-8 rounded-full bg-amber-400/20 blur-md pointer-events-none" />
                </div>
                {/* Candle Stick */}
                <div className="w-2 h-5 bg-gradient-to-b from-amber-200 to-amber-400 rounded-sm shadow" />
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-1 opacity-80 group-hover:opacity-100 transition">
                  ✨ Chạm để thổi nến
                </span>
              </div>
            ) : (
              <div className="space-y-1 select-none animate-fade">
                <div className="text-xs text-amber-300 font-bold py-1 px-3 rounded-full bg-amber-500/20 border border-amber-500/40 inline-block shadow">
                  🎉 Nến đã thổi tắt! Ước nguyện thành hiện thực! ✨
                </div>
                <div className="w-1.5 h-4 bg-slate-700 mx-auto rounded-sm" />
              </div>
            )}

            {/* 3D Visual Cake Display */}
            <div className="text-7xl sm:text-8xl select-none transform hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_15px_25px_rgba(245,158,11,0.3)]">
              🎂
            </div>
          </div>

          {/* Action Candle Button */}
          <div>
            {candleLit ? (
              <button
                onClick={handleBlowCandle}
                className="px-6 py-3 rounded-2xl font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 shadow-xl shadow-amber-500/30 hover:scale-103 active:scale-95 transition text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto"
              >
                <Flame className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Thổi Nến Sinh Nhật 🕯️</span>
              </button>
            ) : (
              <button
                onClick={() => setCandleLit(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 text-xs font-semibold hover:bg-slate-700 transition active:scale-95"
              >
                Thắp Lại Nến 🕯️
              </button>
            )}
          </div>

          {/* Greeting Letter Box */}
          <div className="relative p-5 rounded-2xl bg-[#1d1732]/70 border border-amber-500/20 text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
              <span>💌 Lời chúc gửi từ: {data.senderName || 'Hội Bạn Thân'}</span>
              <span>✨ KD Party</span>
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed italic">
              "{data.greetingMessage || 'Chúc bạn tuổi mới rực rỡ, tiền tài đầy túi, công danh thăng tiến và luôn giữ trọn ngọn lửa đam mê!'}"
            </p>
          </div>
        </section>

        {/* Memory Photos Grid */}
        {data.photos && data.photos.length > 0 && (
          <section className="space-y-4 text-center">
            <div>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-amber-200">
                Khoảnh Khắc Kỷ Niệm
              </h3>
              <p className="text-slate-400 text-xs">Những hình ảnh không thể nào quên</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {data.photos.map((photo, i) => (
                <div
                  key={i}
                  className="bg-[#18142a] border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-lg hover:border-amber-500/40 transition group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-950">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Memory'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {photo.caption && (
                    <p className="text-[11px] font-medium text-amber-300/90 text-center mt-1.5 truncate">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Wishes Wall */}
        <section className="p-5 rounded-3xl bg-[#141026]/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Bức Tường Lưu Bút ({wishes ? wishes.length : 0})
            </h3>

            {onSendWish && (
              <button
                onClick={() => setShowWishesModal(true)}
                className="px-3.5 py-1.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs flex items-center gap-1 shadow-md active:scale-95 transition"
              >
                <Send className="w-3.5 h-3.5" /> Viết Lời Chúc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {wishes && wishes.length > 0 ? (
              wishes.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#1d1732] border border-slate-700/60 shadow text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300">{w.senderName}</span>
                    <span className="text-sm">{w.emotionIcon || '🎉'}</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                  <PartyPopper className="w-5 h-5" /> Gửi Lời Chúc Sinh Nhật
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tên của bạn</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Tên của bạn"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lời chúc</label>
                  <textarea
                    required
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Viết lời chúc ý nghĩa..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none resize-none"
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
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold shadow-lg hover:brightness-110 active:scale-95 transition text-xs"
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
