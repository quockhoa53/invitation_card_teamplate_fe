import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import { Mail, Calendar, MapPin, Volume2, VolumeX, CheckCircle, Send, ExternalLink, Sparkles } from 'lucide-react';
import { EventInvitationData, CardWish } from '../types';

interface TemplateProps {
  data: EventInvitationData;
  title: string;
  wishes: CardWish[];
  onSendWish?: (name: string, message: string, emoji?: string) => Promise<void>;
  isPreview?: boolean;
}

export const EventInvitationTemplate: React.FC<TemplateProps> = ({
  data,
  title,
  wishes,
  onSendWish,
  isPreview = false,
}) => {
  const [openedEnvelope, setOpenedEnvelope] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [showWishesModal, setShowWishesModal] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [wishText, setWishText] = useState('');
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

  const handleOpenEnvelope = () => {
    setOpenedEnvelope(true);
    confetti({ particleCount: 120, spread: 90, colors: ['#10b981', '#34d399', '#fbbf24', '#ffffff'] });
    if (soundRef.current && !isPlayingMusic) {
      soundRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  // Event countdown
  useEffect(() => {
    const eventTime = new Date(data.eventDate || '2026-10-10T18:00:00').getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, eventTime - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [data.eventDate]);

  const handlePostWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !wishText.trim() || !onSendWish) return;
    setIsSubmitting(true);
    try {
      await onSendWish(senderName, wishText, '🕊️');
      setWishText('');
      setShowWishesModal(false);
      confetti({ particleCount: 80, spread: 70 });
    } catch (err) {
      alert('Không thể gửi lời chúc, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpStatus('confirmed');
    setShowRsvpModal(false);
    confetti({ particleCount: 100, spread: 80 });
  };

  return (
    <div className="relative min-h-full w-full overflow-x-hidden bg-gradient-to-b from-[#081410] via-[#0b1c16] to-[#040a08] text-white font-sans selection:bg-emerald-500 pb-12">
      {/* Background Soft Glow */}
      <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      {/* Music Controller */}
      {data.musicUrl && (
        <button
          onClick={toggleMusic}
          className={`${isPreview ? 'absolute' : 'fixed'} top-4 right-4 z-40 flex items-center gap-2 bg-emerald-700/80 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full backdrop-blur-md border border-emerald-400/40 shadow-xl transition active:scale-95 text-xs font-bold`}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
              <span className="text-[11px]">Nhạc: Bật ✨</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="text-[11px]">Bật Nhạc</span>
            </>
          )}
        </button>
      )}

      {/* INITIAL WAX SEAL ENVELOPE SCREEN */}
      <AnimatePresence>
        {!openedEnvelope && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[520px] px-4 py-8 text-center my-auto">
            <div className="max-w-md w-full p-8 rounded-[36px] bg-gradient-to-b from-[#0e241c]/90 via-[#0a1b15]/90 to-[#06120e]/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Thiệp Mời Trọng Đại
              </div>

              <div className="space-y-1">
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-emerald-200">
                  Trân Trọng Kính Mời
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm italic">
                  {data.recipientName || 'Quý Khách & Gia Đình'}
                </p>
              </div>

              {/* 3D Wax Seal Envelope */}
              <div
                onClick={handleOpenEnvelope}
                className="cursor-pointer mx-auto w-36 h-28 bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-700 rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all select-none border-2 border-amber-400/40"
              >
                <div className="w-14 h-14 rounded-full bg-rose-700 border-2 border-amber-300 flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-[10px] font-black text-amber-200 uppercase tracking-tighter">
                    MỞ THIỆP
                  </span>
                </div>
              </div>

              <button
                onClick={handleOpenEnvelope}
                className="w-full py-3 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-xl hover:brightness-105 active:scale-95 transition text-xs sm:text-sm"
              >
                Mở Thư Mời Sự Kiện
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN INVITATION CONTENT */}
      {openedEnvelope && (
        <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-8 text-center">
          {/* Header */}
          <header className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" /> Save The Date
            </div>

            <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200 leading-tight">
              {data.greetingTitle || 'Thư Mời Sự Kiện Trọng Đại'}
            </h1>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0c221a]/70 border border-emerald-500/20 text-slate-200 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              {data.greetingMessage || 'Sự hiện diện của quý khách là niềm vinh hạnh to lớn cho chúng tôi.'}
            </div>
          </header>

          {/* Countdown to Event */}
          <section className="relative p-6 sm:p-8 rounded-[36px] bg-gradient-to-b from-[#0f291f]/90 via-[#0a1d16]/90 to-[#06120e]/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="absolute inset-2.5 rounded-[28px] border border-emerald-500/15 pointer-events-none" />

            <div className="text-xs uppercase tracking-widest text-emerald-300 font-bold flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Đếm Ngược Đến Ngày Sự Kiện
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#06120e] border border-emerald-500/30 shadow-inner">
                <span className="text-xl sm:text-3xl font-black text-emerald-300 block font-mono">{countdown.days}</span>
                <span className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold mt-0.5 block">Ngày</span>
              </div>
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#06120e] border border-emerald-500/30 shadow-inner">
                <span className="text-xl sm:text-3xl font-black text-emerald-300 block font-mono">{countdown.hours}</span>
                <span className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold mt-0.5 block">Giờ</span>
              </div>
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#06120e] border border-emerald-500/30 shadow-inner">
                <span className="text-xl sm:text-3xl font-black text-teal-300 block font-mono">{countdown.minutes}</span>
                <span className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold mt-0.5 block">Phút</span>
              </div>
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#06120e] border border-emerald-500/30 shadow-inner animate-pulse">
                <span className="text-xl sm:text-3xl font-black text-teal-400 block font-mono">{countdown.seconds}</span>
                <span className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold mt-0.5 block">Giây</span>
              </div>
            </div>
          </section>

          {/* Time & Venue Location */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e241c] border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Thời Gian Sự Kiện</h4>
              <p className="text-slate-300 text-xs leading-relaxed">{data.eventDate || '18:00, Ngày 10/10/2026'}</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e241c] border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Địa Điểm Tổ Chức</h4>
              <p className="text-slate-300 text-xs leading-relaxed">{data.eventLocation || 'Trung Tâm Hội Nghị Tiệc Cưới'}</p>
              {data.mapUrl && (
                <a
                  href={data.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold pt-1"
                >
                  <ExternalLink className="w-3 h-3" /> Xem Bản Đồ Chỉ Đường
                </a>
              )}
            </div>
          </section>

          {/* RSVP Section */}
          <section className="p-6 sm:p-8 rounded-[36px] bg-gradient-to-r from-[#0e2b20] to-[#0a1e16] border border-emerald-500/40 text-center space-y-3">
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-emerald-200">
              Xác Nhận Tham Dự (RSVP)
            </h3>
            <p className="text-slate-300 text-xs max-w-sm mx-auto">
              Xin vui lòng xác nhận trước để ban tổ chức chuẩn bị chu đáo nhất.
            </p>

            {rsvpStatus === 'confirmed' ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold text-xs">
                <CheckCircle className="w-4 h-4" /> Đã xác nhận tham dự thành công!
              </div>
            ) : (
              <button
                onClick={() => setShowRsvpModal(true)}
                className="px-6 py-2.5 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs shadow-lg hover:scale-103 active:scale-95 transition"
              >
                Xác Nhận Tham Dự Ngay
              </button>
            )}
          </section>

          {/* Wishes Section */}
          <section className="p-5 rounded-3xl bg-[#091712]/90 border border-slate-800 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-400" /> Sổ Lưu Bút ({wishes ? wishes.length : 0})
              </h3>
              {onSendWish && (
                <button
                  onClick={() => setShowWishesModal(true)}
                  className="px-3.5 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1 shadow-md active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi Lời Chúc
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wishes && wishes.length > 0 ? (
                wishes.map((w, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#0e241c] border border-emerald-500/20 shadow text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-300">{w.senderName}</span>
                      <span className="text-sm">{w.emotionIcon || '🕊️'}</span>
                    </div>
                    <p className="text-slate-300">{w.message}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-slate-500">
                  Chưa có lời chúc nào. Hãy để lại lời chúc mừng đầu tiên!
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {/* RSVP Modal */}
      <AnimatePresence>
        {showRsvpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-lg font-bold text-emerald-300">Xác Nhận Tham Dự (RSVP)</h4>
                <button onClick={() => setShowRsvpModal(false)} className="text-slate-400 hover:text-white font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Họ và Tên</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Tên khách mời"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Số lượng người tham dự</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={1}>1 người (Chỉ mình tôi)</option>
                    <option value={2}>2 người (Kèm theo 1 người)</option>
                    <option value={3}>3 người</option>
                    <option value={4}>4 người (Gia đình)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRsvpModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:brightness-110 active:scale-95 transition text-xs"
                  >
                    Xác Nhận Tham Dự
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wish Modal */}
      <AnimatePresence>
        {showWishesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-lg font-bold text-emerald-300">Gửi Lời Chúc Mừng</h4>
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lời chúc mừng</label>
                  <textarea
                    required
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Chúc sự kiện thành công tốt đẹp..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none resize-none"
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
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:brightness-110 active:scale-95 transition text-xs"
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
