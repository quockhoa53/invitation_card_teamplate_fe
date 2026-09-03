import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import { Heart, Music, Volume2, VolumeX, Sparkles, Gift, Flame, Send, MessageCircle } from 'lucide-react';
import { LoverBirthdayData, CardWish } from '../types';

interface TemplateProps {
  data: LoverBirthdayData;
  title: string;
  wishes: CardWish[];
  onSendWish?: (name: string, message: string, emoji?: string) => Promise<void>;
  isPreview?: boolean;
}

export const LoverBirthdayTemplate: React.FC<TemplateProps> = ({
  data,
  title,
  wishes,
  onSendWish,
  isPreview = false,
}) => {
  const [openedGift, setOpenedGift] = useState(false);
  const [candleLit, setCandleLit] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [showWishesModal, setShowWishesModal] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [wishText, setWishText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💖');
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

  const triggerRomanticConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#fbbf24', '#ffffff'],
    });
  };

  const handleOpenGift = () => {
    setOpenedGift(true);
    triggerRomanticConfetti();
    if (soundRef.current && !isPlayingMusic) {
      soundRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  const handleBlowCandle = () => {
    setCandleLit(false);
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24', '#ffffff', '#fda4af'],
    });
  };

  // Typewriter effect
  useEffect(() => {
    if (!openedGift) return;
    const fullText = data.greetingMessage || '';
    let index = 0;
    setTypedMessage('');
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedMessage((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [openedGift, data.greetingMessage]);

  const handlePostWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !wishText.trim() || !onSendWish) return;
    setIsSubmitting(true);
    try {
      await onSendWish(senderName, wishText, selectedEmoji);
      setWishText('');
      setShowWishesModal(false);
      triggerRomanticConfetti();
    } catch (err) {
      alert('Không thể gửi lời chúc, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-full w-full overflow-x-hidden bg-gradient-to-b from-[#14080e] via-[#1a0c14] to-[#0a0508] text-white font-sans selection:bg-rose-500 selection:text-white pb-12">
      {/* Soft Ambient Rose Glow */}
      <div className="absolute top-10 left-1/3 w-80 h-80 rounded-full bg-rose-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-pink-600/10 blur-[100px] pointer-events-none" />

      {/* Floating Music Button */}
      {data.musicUrl && (
        <button
          onClick={toggleMusic}
          className={`${isPreview ? 'absolute' : 'fixed'} top-4 right-4 z-40 flex items-center gap-2 bg-rose-600/80 hover:bg-rose-500 text-white px-3 py-1.5 rounded-full backdrop-blur-md border border-rose-400/40 shadow-xl shadow-rose-950/50 transition-all active:scale-95 text-xs font-bold`}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-rose-200" />
              <span className="text-[11px]">Nhạc: Bật 💖</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="text-[11px]">Bật Nhạc</span>
            </>
          )}
        </button>
      )}

      {/* INITIAL 3D GIFT REVEAL SCREEN */}
      <AnimatePresence>
        {!openedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative z-10 flex flex-col items-center justify-center w-full my-auto text-center ${
              isPreview ? 'min-h-full px-2 py-3' : 'min-h-[520px] px-4 py-8'
            }`}
          >
            <div className={`w-full bg-gradient-to-b from-[#240e1a]/90 via-[#180911]/90 to-[#10060c]/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl ${
              isPreview
                ? 'p-4 sm:p-5 rounded-[26px] space-y-3.5 max-w-[280px]'
                : 'p-8 rounded-[36px] space-y-6 max-w-md'
            }`}>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-rose-400" /> Thư Tình Sinh Nhật
              </div>

              <div className="space-y-1">
                <h2 className={`font-editorial font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-rose-300 ${
                  isPreview ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'
                }`}>
                  Gửi Tặng {data.recipientName || 'Em Yêu'}
                </h2>
                <p className={`text-rose-200/70 ${isPreview ? 'text-[11px] leading-tight' : 'text-xs sm:text-sm'}`}>
                  Một món quà bất ngờ tràn ngập yêu thương đang chờ đón bạn!
                </p>
              </div>

              {/* 3D Velvet Gift Box with Satin Ribbon */}
              <div
                onClick={handleOpenGift}
                className={`relative cursor-pointer mx-auto bg-gradient-to-tr from-rose-700 via-rose-600 to-pink-500 p-1 shadow-xl shadow-rose-900/60 flex items-center justify-center group transform hover:scale-105 active:scale-95 transition-all duration-300 select-none ${
                  isPreview ? 'w-24 h-24 rounded-[22px]' : 'w-36 h-36 rounded-[32px]'
                }`}
              >
                <div className={`w-full h-full bg-[#120409]/60 border border-amber-400/30 flex flex-col items-center justify-center space-y-1.5 ${
                  isPreview ? 'rounded-[18px]' : 'rounded-[28px]'
                }`}>
                  <div className={`rounded-xl bg-rose-500/30 border border-rose-400/40 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform ${
                    isPreview ? 'w-10 h-10' : 'w-14 h-14'
                  }`}>
                    <Gift className={`${isPreview ? 'w-5 h-5' : 'w-8 h-8'} text-rose-100`} />
                  </div>
                  <span className={`font-black uppercase tracking-widest text-amber-300 animate-pulse ${
                    isPreview ? 'text-[8.5px]' : 'text-[10px]'
                  }`}>
                    Chạm để mở quà
                  </span>
                </div>
              </div>

              <button
                onClick={handleOpenGift}
                className={`w-full font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-xl shadow-rose-600/30 hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2 ${
                  isPreview ? 'py-2.5 px-4 rounded-xl text-xs' : 'py-3 px-6 rounded-2xl text-xs sm:text-sm'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-white animate-bounce" />
                <span>Mở Thiệp Sinh Nhật Ngay</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN INTERACTIVE CARD EXPERIENCE */}
      {openedGift && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-8 text-center"
        >
          {/* Header & Greeting Title */}
          <header className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>Happy Birthday To My Love</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-amber-200 leading-tight">
              {data.greetingTitle || 'Chúc Mừng Sinh Nhật Người Yêu'}
            </h1>
            <p className="text-rose-200/80 text-xs sm:text-sm font-medium">
              Từ <span className="text-rose-400 font-bold">{data.senderName || 'Anh'}</span> với tất cả tình yêu thương ✨
            </p>
          </header>

          {/* Interactive 3D Cake & Candle Blow */}
          <section className="relative p-6 sm:p-8 rounded-[36px] bg-gradient-to-b from-[#240e1a]/90 via-[#180911]/90 to-[#10060c]/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="absolute inset-2.5 rounded-[28px] border border-rose-500/15 pointer-events-none" />

            <div className="relative inline-block py-2">
              {candleLit ? (
                <div
                  onClick={handleBlowCandle}
                  className="cursor-pointer flex flex-col items-center group select-none"
                  title="Chạm vào nến để thổi tắt!"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-4 h-8 rounded-full bg-gradient-to-t from-rose-500 via-orange-400 to-yellow-200 animate-pulse shadow-lg shadow-orange-400/80" />
                    <div className="absolute w-8 h-8 rounded-full bg-rose-400/20 blur-md pointer-events-none" />
                  </div>
                  <div className="w-2 h-5 bg-rose-300 rounded-sm shadow" />
                  <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider mt-1 opacity-80 group-hover:opacity-100 transition">
                    ✨ Chạm để thổi nến
                  </span>
                </div>
              ) : (
                <div className="space-y-1 select-none animate-fade">
                  <div className="text-xs text-rose-300 font-bold py-1 px-3 rounded-full bg-rose-500/20 border border-rose-500/40 inline-block shadow">
                    🎉 Nến đã thổi tắt! Mọi ước nguyện đều thành hiện thực! 💖
                  </div>
                  <div className="w-1.5 h-4 bg-slate-700 mx-auto rounded-sm" />
                </div>
              )}

              <div className="text-7xl sm:text-8xl select-none transform hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_15px_25px_rgba(244,63,94,0.3)]">
                🎂
              </div>
            </div>

            <div>
              {candleLit ? (
                <button
                  onClick={handleBlowCandle}
                  className="px-6 py-3 rounded-2xl font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-xl shadow-rose-600/30 hover:scale-103 active:scale-95 transition text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Thổi Nến & Nhận Điều Ước ✨</span>
                </button>
              ) : (
                <button
                  onClick={() => setCandleLit(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-300 text-xs font-semibold hover:bg-slate-700 transition active:scale-95"
                >
                  Thắp Lại Nến 🕯️
                </button>
              )}
            </div>
          </section>

          {/* Romantic Wax-Sealed Handwritten Love Letter */}
          <section className="relative p-6 sm:p-8 rounded-[36px] bg-[#1e0a15]/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
              <span className="text-xs uppercase tracking-widest text-rose-400 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-300" /> Bức Thư Tình Yêu
              </span>
              <span className="text-[11px] text-rose-300/70">{data.birthdayDate || 'Hôm Nay'}</span>
            </div>

            <div className="font-editorial text-sm sm:text-base leading-relaxed text-rose-100 min-h-[90px] whitespace-pre-line">
              {typedMessage}
              <span className="inline-block w-1.5 h-4 bg-rose-400 ml-1 animate-pulse" />
            </div>

            <div className="text-right pt-3 border-t border-rose-500/20 text-xs sm:text-sm text-rose-300 font-serif italic">
              Yêu em trọn vẹn,<br />
              <strong className="text-rose-200">{data.senderName || 'Anh'}</strong> 💖
            </div>
          </section>

          {/* Polaroid Photo Memories */}
          {data.photos && data.photos.length > 0 && (
            <section className="space-y-4 text-center">
              <div>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-rose-200">
                  Khoảnh Khắc Ngọt Ngào
                </h3>
                <p className="text-rose-300/70 text-xs">Mỗi bức ảnh là một kỷ niệm vô giá của hai ta</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {data.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="bg-white p-2.5 rounded-2xl shadow-xl transform hover:-translate-y-1 transition duration-300"
                  >
                    <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Memory'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {photo.caption && (
                      <p className="text-slate-900 font-editorial font-bold text-xs text-center mt-2 truncate">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Wishes Wall & Guestbook */}
          <section className="p-5 rounded-3xl bg-[#180911]/90 border border-slate-800 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-rose-400" /> Sổ Lưu Bút ({wishes ? wishes.length : 0})
              </h3>

              {onSendWish && (
                <button
                  onClick={() => setShowWishesModal(true)}
                  className="px-3.5 py-1.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white text-xs flex items-center gap-1 shadow-md active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi Lời Chúc
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wishes && wishes.length > 0 ? (
                wishes.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#240e1a] border border-rose-500/20 shadow text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-300">{w.senderName}</span>
                      <span className="text-sm">{w.emotionIcon || '💖'}</span>
                    </div>
                    <p className="text-slate-300">{w.message}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-slate-500">
                  Hãy là người đầu tiên để lại lời chúc ngọt ngào!
                </div>
              )}
            </div>
          </section>
        </motion.div>
      )}

      {/* Wish Modal */}
      <AnimatePresence>
        {showWishesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-lg font-bold text-rose-300 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" /> Gửi Lời Chúc Yêu Thương
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
                    placeholder="Tên hoặc biệt danh..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lời chúc</label>
                  <textarea
                    required
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Viết lời chúc ngọt ngào..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none resize-none"
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
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-bold shadow-lg hover:brightness-110 active:scale-95 transition text-xs"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi Ngay'}
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
