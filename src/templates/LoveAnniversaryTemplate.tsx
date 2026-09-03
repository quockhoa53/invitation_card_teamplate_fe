import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import { Heart, Volume2, VolumeX, Calendar, Clock, Sparkles, Send, MessageCircle } from 'lucide-react';
import { LoveAnniversaryData, CardWish } from '../types';

interface TemplateProps {
  data: LoveAnniversaryData;
  title: string;
  wishes: CardWish[];
  onSendWish?: (name: string, message: string, emoji?: string) => Promise<void>;
  isPreview?: boolean;
}

export const LoveAnniversaryTemplate: React.FC<TemplateProps> = ({
  data,
  title,
  wishes,
  onSendWish,
  isPreview = false,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showWishesModal, setShowWishesModal] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [wishText, setWishText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💍');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const soundRef = useRef<Howl | null>(null);

  // Background music
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
      if (soundRef.current) soundRef.current.stop();
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

  // Realtime Love Days Counter
  useEffect(() => {
    const startDateStr = data.anniversaryStartDate || '2023-08-25T00:00:00';
    const startDate = new Date(startDateStr).getTime();

    const updateCounter = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, now - startDate);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, [data.anniversaryStartDate]);

  const handlePostWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !wishText.trim() || !onSendWish) return;
    setIsSubmitting(true);
    try {
      await onSendWish(senderName, wishText, selectedEmoji);
      setWishText('');
      setShowWishesModal(false);
      confetti({ particleCount: 90, spread: 80, colors: ['#f43f5e', '#ec4899', '#ffd700'] });
    } catch (err) {
      alert('Không thể gửi lời chúc, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-full w-full overflow-hidden bg-gradient-to-b from-[#140810] via-[#1a0b18] to-[#090409] text-white font-sans selection:bg-rose-500 pb-12">
      {/* Background Soft Glows */}
      <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-80 h-80 rounded-full bg-rose-500/15 blur-[120px] pointer-events-none" />

      {/* Floating Music Button */}
      {data.musicUrl && (
        <button
          onClick={toggleMusic}
          className={`${isPreview ? 'absolute' : 'fixed'} top-4 right-4 z-40 flex items-center gap-2 bg-pink-600/80 hover:bg-pink-500 text-white px-3 py-1.5 rounded-full backdrop-blur-md border border-pink-400/40 shadow-xl transition active:scale-95 text-xs font-bold`}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-pink-200" />
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

      {/* Main Container */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-8 text-center">
        {/* Header Hero */}
        <header className="space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
            <span>KỶ NIỆM TÌNH YÊU • {data.senderName || 'Anh'} & {data.recipientName || 'Em'}</span>
          </div>

          <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-rose-300 to-amber-200 leading-tight">
            {data.greetingTitle || 'Happy Anniversary 💍✨'}
          </h1>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#220d1c]/60 border border-pink-500/20 text-slate-200 text-xs sm:text-sm leading-relaxed italic max-w-lg mx-auto">
            "{data.greetingMessage || 'Mỗi ngày trôi qua được ở bên em đều là một ngày tuyệt vời nhất. Cảm ơn em vì đã cùng anh viết nên câu chuyện tình yêu đẹp này!'}"
          </div>
        </header>

        {/* REALTIME LOVE DAYS COUNTER (FIXED OVERLAP & GORGEOUS DESIGN) */}
        <section className="relative p-6 sm:p-8 rounded-[36px] bg-gradient-to-b from-[#240e1f]/90 via-[#180916]/90 to-[#10050e]/90 border border-pink-500/30 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="absolute inset-2.5 rounded-[28px] border border-pink-500/15 pointer-events-none" />

          <div className="flex items-center justify-center gap-2 text-pink-300 font-bold text-xs uppercase tracking-widest">
            <Clock className="w-4 h-4 text-rose-400 animate-spin" />
            <span>CHÚNG MÌNH ĐÃ YÊU NHAU ĐƯỢC</span>
          </div>

          {/* Beating Heart Icon */}
          <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500 animate-ping" style={{ animationDuration: '2s' }} />
          </div>

          {/* Counter 4-Box Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
            {/* Days */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#140610] border border-pink-500/30 shadow-inner text-center">
              <span className="text-xl sm:text-3xl font-black text-rose-300 block font-mono tracking-tight">
                {timeTogether.days}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-0.5 block">
                NGÀY
              </span>
            </div>

            {/* Hours */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#140610] border border-pink-500/30 shadow-inner text-center">
              <span className="text-xl sm:text-3xl font-black text-pink-300 block font-mono tracking-tight">
                {timeTogether.hours}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-0.5 block">
                GIỜ
              </span>
            </div>

            {/* Minutes */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#140610] border border-pink-500/30 shadow-inner text-center">
              <span className="text-xl sm:text-3xl font-black text-rose-300 block font-mono tracking-tight">
                {timeTogether.minutes}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-0.5 block">
                PHÚT
              </span>
            </div>

            {/* Seconds */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#140610] border border-pink-500/30 shadow-inner text-center">
              <span className="text-xl sm:text-3xl font-black text-rose-400 block font-mono tracking-tight animate-pulse">
                {timeTogether.seconds}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-0.5 block">
                GIÂY
              </span>
            </div>
          </div>

          <div className="text-[11px] text-pink-300/80 font-medium">
            Từ ngày: <strong className="text-pink-200">{data.anniversaryStartDate ? new Date(data.anniversaryStartDate).toLocaleDateString('vi-VN') : '25/08/2023'}</strong>
          </div>
        </section>

        {/* Love Story Timeline */}
        {data.timeline && data.timeline.length > 0 && (
          <section className="space-y-6 text-center">
            <div>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-pink-200">
                Hành Trình Tình Yêu Của Chúng Mình
              </h3>
              <p className="text-slate-400 text-xs">Từng mốc son đánh dấu chặng đường hạnh phúc</p>
            </div>

            <div className="relative border-l-2 border-pink-500/40 ml-4 sm:ml-6 pl-5 sm:pl-6 space-y-6 text-left">
              {data.timeline.map((item, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -left-[27px] sm:-left-[31px] top-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center shadow" />
                  <div className="p-4 rounded-2xl bg-[#220d1c] border border-pink-500/20 shadow space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold">
                      {item.date}
                    </span>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-slate-300 text-xs">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        {data.photos && data.photos.length > 0 && (
          <section className="space-y-4 text-center">
            <div>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-pink-200">
                Album Kỷ Niệm Tình Yêu
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {data.photos.map((photo, i) => (
                <div key={i} className="p-2.5 bg-white rounded-2xl shadow-xl transform hover:-translate-y-1 transition duration-300">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Love photo'}
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

        {/* Wishes Wall */}
        <section className="p-5 rounded-3xl bg-[#180914]/90 border border-slate-800 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-pink-300 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-pink-400" /> Sổ Lưu Bút Kỷ Niệm ({wishes ? wishes.length : 0})
            </h3>
            {onSendWish && (
              <button
                onClick={() => setShowWishesModal(true)}
                className="px-3.5 py-1.5 rounded-xl font-bold bg-pink-600 hover:bg-pink-500 text-white text-xs flex items-center gap-1 shadow-md active:scale-95 transition"
              >
                <Send className="w-3.5 h-3.5" /> Gửi Lời Chúc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wishes && wishes.length > 0 ? (
              wishes.map((w, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#240e1f] border border-pink-500/20 shadow text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-pink-300">{w.senderName}</span>
                    <span className="text-sm">{w.emotionIcon || '💍'}</span>
                  </div>
                  <p className="text-slate-300">{w.message}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-4 text-center text-xs text-slate-500">
                Hãy là người đầu tiên để lại lời chúc ngọt ngào cho đôi bạn trẻ!
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Wish Modal */}
      <AnimatePresence>
        {showWishesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-pink-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-lg font-bold text-pink-300 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" /> Gửi Lời Chúc Kỷ Niệm
                </h4>
                <button onClick={() => setShowWishesModal(false)} className="text-slate-400 hover:text-white font-bold">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lời chúc hạnh phúc</label>
                  <textarea
                    required
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Chúc 2 bạn mãi luôn hạnh phúc bên nhau..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-pink-500 focus:outline-none resize-none"
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
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:brightness-110 active:scale-95 transition text-xs"
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
