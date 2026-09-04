import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PublicCard, CardWish } from '../types';
import { api } from '../services/api';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { Lock, KeyRound, AlertCircle, Sparkles, Heart, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const PublicCardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [card, setCard] = useState<PublicCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Passcode verification state
  const [passcode, setPasscode] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const [verifyingPasscode, setVerifyingPasscode] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchCard = async () => {
      try {
        const res = await api.getPublicCard(slug);
        if (res.success && res.data) {
          setCard(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không tìm thấy thiệp mời này');
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [slug]);

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !passcode.trim()) return;
    setPasscodeError('');
    setVerifyingPasscode(true);

    try {
      const res = await api.verifyCardPasscode(slug, passcode.trim());
      if (res.success && res.data) {
        setCard(res.data);
      }
    } catch (err: any) {
      setPasscodeError(err.response?.data?.message || 'Mật khẩu mở thiệp không chính xác. Vui lòng thử lại!');
    } finally {
      setVerifyingPasscode(false);
    }
  };

  const handleSendWish = async (senderName: string, message: string, emoji?: string) => {
    if (!slug) return;
    const res = await api.addWish(slug, { senderName, message, emotionIcon: emoji });
    if (res.success && res.data) {
      setCard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          wishes: [res.data, ...(prev.wishes || [])],
        };
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-pulse">
          <div className="w-full aspect-[16/10] rounded-2xl bg-slate-800/80" />
          <div className="space-y-2 py-2">
            <div className="h-6 w-3/4 bg-slate-800 rounded-lg mx-auto" />
            <div className="h-4 w-1/2 bg-slate-800/60 rounded mx-auto" />
          </div>
          <div className="h-10 w-full bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center text-white space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Thiệp Mời Không Tồn Tại Hoặc Đã Bị Ẩn</h2>
        <p className="text-xs text-slate-400 max-w-sm">{error || 'Vui lòng kiểm tra lại đường dẫn chia sẻ.'}</p>
        <a
          href="/"
          className="px-6 py-2.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-lg shadow-orange-500/20"
        >
          Trở Về Trang Chủ
        </a>
      </div>
    );
  }

  // Check if card is protected by password (support both isProtected and protected)
  const isProtected = Boolean(card.isProtected ?? (card as any).protected);

  if (isProtected && !card.customData) {
    return (
      <div className="min-h-screen bg-radial-at-c from-slate-900 via-slate-950 to-[#05070e] flex items-center justify-center p-4 text-white relative overflow-hidden">
        {/* Background Glowing Circles */}
        <div className="absolute w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20 animate-pulse" />

        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-orange-500/30 rounded-[36px] p-8 sm:p-10 shadow-2xl text-center space-y-6 relative z-10">
          {/* Glowing Lock Icon */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-3xl blur-md opacity-40 animate-pulse" />
            <div className="relative w-18 h-18 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-400/50 rounded-3xl flex items-center justify-center text-amber-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> Thiệp Được Khóa Bảo Vệ
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Thông Điệp Riêng Tư
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Người gửi đã cài mật khẩu bảo mật cho tấm thiệp này. Vui lòng nhập mật khẩu để mở khóa và xem nội dung.
            </p>
          </div>

          {passcodeError && (
            <div className="p-3.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs flex items-center justify-center gap-2 animate-bounce">
              <AlertCircle className="w-4 h-4 shrink-0 text-orange-400" />
              <span className="font-medium">{passcodeError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyPasscode} className="space-y-4">
            <div className="relative">
              <input
                type={showPasswordText ? 'text' : 'password'}
                required
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError('');
                }}
                placeholder="Nhập mật khẩu mở thiệp..."
                className="w-full text-center py-3.5 pl-5 pr-12 rounded-2xl bg-slate-950/80 border border-orange-500/40 text-white text-sm tracking-widest font-mono focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPasswordText(!showPasswordText)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition p-1"
                title={showPasswordText ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={verifyingPasscode || !passcode.trim()}
              className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white text-sm shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{verifyingPasscode ? 'Đang xác thực...' : 'Mở Khóa Thiệp Mời'}</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500">
            Nếu bạn không biết mật khẩu, vui lòng liên hệ trực tiếp với người đã gửi link cho bạn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950 flex flex-col">
      <div className="flex-1 w-full h-full relative">
        <TemplateRenderer
          slug={card.template.slug}
          category={card.template.category}
          templateType={card.template.templateType}
          customHtml={card.template.customHtml}
          customCss={card.template.customCss}
          customJs={card.template.customJs}
          customData={card.customData}
          title={card.title}
          wishes={card.wishes || []}
          onSendWish={handleSendWish}
          isPreview={false}
        />
      </div>
    </div>
  );
};
