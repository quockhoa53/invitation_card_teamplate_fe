import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  Volume2,
  VolumeX,
  Mail,
  Send,
  MessageSquare,
  QrCode,
  Share2,
} from 'lucide-react';
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
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [openedEnvelope, setOpenedEnvelope] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'IDLE' | 'ATTENDING' | 'DECLINED'>('IDLE');
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

  const handleOpenEnvelope = () => {
    setOpenedEnvelope(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f43f5e', '#fb7185', '#ffffff', '#cbd5e1'],
    });
    if (soundRef.current && !isPlayingMusic) {
      soundRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  const handleRSVP = (status: 'ATTENDING' | 'DECLINED') => {
    setRsvpStatus(status);
    if (status === 'ATTENDING') {
      confetti({
        particleCount: 100,
        spread: 80,
        colors: ['#e11d48', '#ffffff', '#f43f5e'],
      });
    }
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
      {/* Background Soft Orange Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-orange-500/15 blur-[140px] pointer-events-none" />

      {/* Music Controller */}
      {data.musicUrl && (
        <button
          onClick={toggleMusic}
          className={`${isPreview ? 'absolute' : 'fixed'} top-4 right-4 z-40 flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-md border border-slate-700 shadow-xl transition active:scale-95 text-xs`}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-orange-500" />
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

      {/* STEP 1: INITIAL WAX SEAL ENVELOPE SCREEN */}
      <AnimatePresence>
        {!openedEnvelope && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[520px] px-4 py-8 text-center my-auto">
            <div className="max-w-md w-full p-8 rounded-[36px] bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>Thư Mời Chính Thức VIP</span>
              </div>

              <div className="space-y-1">
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
                  Trân Trọng Kính Mời
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm">
                  {data.recipientName || 'Quý Khách & Gia Đình'}
                </p>
              </div>

              {/* 3D Royal Wax Seal Envelope */}
              <div
                onClick={handleOpenEnvelope}
                className="cursor-pointer mx-auto w-44 h-28 bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all select-none border border-white/10 group"
              >
                {/* Royal Wax Seal Stamp */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-700 border-2 border-amber-300/80 flex items-center justify-center shadow-lg shadow-orange-950/80 group-hover:scale-110 transition-transform">
                  <span className="text-[11px] font-black text-amber-100 tracking-wider font-mono">
                    KD
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-orange-400 font-semibold block -mt-2">
                Chạm vào dấu sáp để mở thư mời
              </span>

              <button
                onClick={handleOpenEnvelope}
                className="w-full py-3 rounded-xl font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-950/50 active:scale-95 transition text-xs sm:text-sm"
              >
                Mở Thư Mời Sự Kiện →
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* STEP 2: MAIN INVITATION CONTENT */}
      {openedEnvelope && (
        <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-8 text-center">
          {/* Header */}
          <header className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" /> Save The Date
            </div>

            <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {data.greetingTitle || 'Dạ Tiệc Tri Ân & Kết Nối'}
            </h1>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto italic">
              "{data.greetingMessage || 'Sự hiện diện của quý khách là niềm vinh hạnh to lớn cho chúng tôi.'}"
            </div>
          </header>

          {/* Event Details Card */}
          <section className="relative p-6 sm:p-8 rounded-[32px] bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5 text-left">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

            <h3 className="font-editorial text-base font-bold text-white uppercase tracking-wider text-center">
              Thông Tin Chi Tiết Sự Kiện
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <Calendar className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-white">Thời Gian</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{data.eventDate || '20 Tháng 10, 2026'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-white">Địa Điểm</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{data.eventLocation || 'Trung Tâm Hội Nghị Quốc Gia'}</p>
                </div>
              </div>
            </div>

            {/* RSVP Decision Box */}
            <div className="pt-4 border-t border-slate-800 text-center space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Xác Nhận Tham Dự (RSVP)
              </h4>

              {rsvpStatus === 'IDLE' ? (
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleRSVP('ATTENDING')}
                    className="px-6 py-2.5 rounded-xl font-semibold bg-orange-500 hover:bg-orange-600 text-white text-xs shadow-lg shadow-orange-950/50 active:scale-95 transition"
                  >
                    Xác Nhận Tham Dự
                  </button>
                  <button
                    onClick={() => handleRSVP('DECLINED')}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:bg-slate-700 transition active:scale-95"
                  >
                    Rất Tiếc Không Thể Đến
                  </button>
                </div>
              ) : rsvpStatus === 'ATTENDING' ? (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-center space-y-2">
                  <span className="text-xs font-bold text-orange-400 block">
                    ✓ Cảm ơn quý khách đã xác nhận tham dự!
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Mã QR check-in sự kiện đã sẵn sàng tại bàn lễ tân khi quý khách tới.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400">
                    Ban tổ chức đã ghi nhận phản hồi. Cảm ơn sự quan tâm của quý khách!
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Wishes Wall */}
          <section className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-orange-500" /> Lời Chúc Mừng ({wishes ? wishes.length : 0})
              </h3>

              {onSendWish && (
                <button
                  onClick={() => setShowWishesModal(true)}
                  className="px-4 py-1.5 rounded-full font-semibold bg-orange-500 hover:bg-orange-600 text-white text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Send className="w-3 h-3" /> Gửi Lời Chúc
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
                      <span className="font-semibold text-orange-400">{w.senderName}</span>
                      <span className="text-[11px] text-slate-500">Khách mời</span>
                    </div>
                    <p className="text-slate-300">{w.message}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-slate-500">
                  Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc mừng!
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {/* Wishes Modal */}
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
                  <Sparkles className="w-4 h-4 text-orange-500" /> Gửi Lời Chúc Sự Kiện
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
                    placeholder="Nhập tên hoặc danh xưng..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Lời chúc</label>
                  <textarea
                    required
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Viết lời chúc tới ban tổ chức..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-orange-500 focus:outline-none resize-none"
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
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-950/50 active:scale-95 transition text-xs"
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
