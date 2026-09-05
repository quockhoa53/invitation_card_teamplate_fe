import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Template, ValidatePromotionResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import {
  ShoppingBag,
  Wallet,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  QrCode,
  Tag,
  X,
  Loader2,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

interface PurchaseTemplateModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (template: Template) => void;
}

export const PurchaseTemplateModal: React.FC<PurchaseTemplateModalProps> = ({
  template,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser, refreshPurchasedTemplates } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<ValidatePromotionResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Lock body & documentElement scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !template) return null;

  const realBal = user?.realBalance ?? (user?.creditsBalance ?? 0);
  const bonusBal = user?.bonusBalance ?? 0;
  const totalBalance = realBal + bonusBal;

  const rawPrice = template.price || 0;
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const finalPrice = appliedPromo?.finalAmount !== undefined ? appliedPromo.finalAmount : rawPrice;

  const hasEnoughBalance = totalBalance >= finalPrice;
  const missingAmount = Math.max(0, finalPrice - totalBalance);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'BIRTHDAY_LOVER':
        return 'Sinh Nhật Người Yêu';
      case 'BIRTHDAY_FRIENDS':
        return 'Sinh Nhật Bạn Bè';
      case 'LOVE_ANNIVERSARY':
        return 'Kỷ Niệm Tình Yêu';
      case 'EVENT_INVITATION':
        return 'Thư Mời Sự Kiện & Cưới';
      default:
        return 'Mẫu Thiệp Mời';
    }
  };

  // Validate Promo Code
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    setPromoLoading(true);
    try {
      const res = await api.validatePromotion(promoCodeInput.trim(), rawPrice);
      if (res.success && res.data) {
        if (res.data.valid) {
          setAppliedPromo(res.data);
          toast.success('Áp dụng mã giảm giá thành công!', res.data.message || `Giảm ${res.data.discountAmount?.toLocaleString('vi-VN')} đ`);
        } else {
          setAppliedPromo(null);
          toast.error('Mã không hợp lệ', res.data.message || 'Mã giảm giá không áp dụng được cho đơn này');
        }
      }
    } catch (err: any) {
      setAppliedPromo(null);
      toast.error('Không thể kiểm tra mã', err.response?.data?.message || 'Lỗi khi kiểm tra mã');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
  };

  // Option 1: Confirm purchase using Wallet
  const handleConfirmWalletPurchase = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua mẫu thiệp!');
      return;
    }

    if (!hasEnoughBalance) {
      toast.error('Số dư Ví KD không đủ', `Bạn còn thiếu ${missingAmount.toLocaleString('vi-VN')} đ`);
      return;
    }

    setPurchasing(true);
    try {
      const res = await api.purchaseTemplate(template.id);
      if (res.success) {
        setPurchaseSuccess(true);
        confetti({
          particleCount: 110,
          spread: 75,
          origin: { y: 0.6 },
        });
        toast.success('Mở khóa mẫu thiệp thành công!', `Bạn đã sở hữu mẫu "${template.title}".`);
        await refreshUser();
        await refreshPurchasedTemplates();
      }
    } catch (err: any) {
      toast.error('Không thể mua mẫu thiệp', err.response?.data?.message);
    } finally {
      setPurchasing(false);
    }
  };

  // Option 2: Redirect to Payment Page (VietQR)
  const handleRedirectToQrPayment = async () => {
    setRedirectingToPayment(true);
    try {
      const res = await api.createPaymentOrder({
        amount: finalPrice,
        paymentMethod: 'VIETQR',
      });
      if (res.success && res.data) {
        onClose();
        navigate(`/payment?orderCode=${res.data.orderCode}&templateId=${template.id}`);
      } else {
        onClose();
        navigate(`/payment?amount=${finalPrice}&templateId=${template.id}`);
      }
    } catch (e) {
      onClose();
      navigate(`/payment?amount=${finalPrice}&templateId=${template.id}`);
    } finally {
      setRedirectingToPayment(false);
    }
  };

  const handleStartEditing = () => {
    onClose();
    onSuccess(template);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        margin: 0,
      }}
    >
      <div className={`max-w-md w-full rounded-[28px] p-5 sm:p-7 border shadow-2xl space-y-5 ${
        isDark ? 'bg-[#0e1422] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-base sm:text-lg font-bold">
                {purchaseSuccess ? 'Mở Khóa Thành Công' : 'Xác Nhận Mua Thiệp'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {purchaseSuccess ? 'Chúc mừng bạn đã sở hữu mẫu thiệp' : 'Thông tin đơn hàng và thanh toán'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {purchaseSuccess ? (
          /* SUCCESS SCREEN */
          <div className="text-center py-5 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-editorial text-2xl font-bold">Sở Hữu Mẫu Thiệp Thành Công!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bạn đã mở khóa vĩnh viễn mẫu <strong className="text-orange-400">"{template.title}"</strong>. Bây giờ bạn có thể tự do chỉnh sửa và xuất bản thiệp mời không giới hạn.
              </p>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={handleStartEditing}
                className="w-full py-3.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm shadow-lg shadow-orange-500/30 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <span>Bắt Đầu Tạo Thiệp Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ORDER CONFIRMATION FLOW */
          <div className="space-y-4 text-xs">
            {/* Template Order Summary Card */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <img
                src={template.thumbnailUrl}
                alt={template.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 shadow-sm"
              />
              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block">
                  {getCategoryLabel(template.category)}
                </span>
                <h4 className="font-bold text-sm leading-snug line-clamp-2" title={template.title}>
                  {template.title}
                </h4>
                <div className="font-mono font-bold text-sm text-orange-500">
                  {rawPrice.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            {/* Promo Code Input Section */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-orange-500" /> Mã Giảm Giá (Nếu có)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã ưu đãi..."
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  disabled={!!appliedPromo || promoLoading}
                  className={`flex-1 px-3 py-2 rounded-xl border font-mono text-xs uppercase tracking-wider focus:outline-none focus:border-orange-500 transition ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                  >
                    Gỡ mã
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCodeInput.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white transition shadow-sm active:scale-95"
                  >
                    {promoLoading ? 'Kiểm tra...' : 'Áp Dụng'}
                  </button>
                )}
              </div>

              {appliedPromo && (
                <p className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3 h-3" /> Đã áp dụng mã {appliedPromo.code}: Giảm {discountAmount.toLocaleString('vi-VN')} đ
                </p>
              )}
            </div>

            {/* Detailed Order Breakdown */}
            <div className={`p-4 rounded-2xl border space-y-2.5 ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <FileText className="w-3.5 h-3.5 text-orange-500" />
                <span>Chi Tiết Đơn Hàng</span>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Đơn giá mẫu thiệp:</span>
                  <span className="font-mono font-semibold">{rawPrice.toLocaleString('vi-VN')} đ</span>
                </div>
                {appliedPromo && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Giảm giá ({appliedPromo.code}):</span>
                    <span className="font-mono font-semibold">-{discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Phí hệ thống:</span>
                  <span className="text-emerald-500 font-medium">0 đ (Miễn phí)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-xs">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="font-mono text-base text-orange-500">{finalPrice.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Wallet Status Information (Clean & Minimal: Only Current Balance) */}
            <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-400 font-semibold">
                  <Wallet className="w-4 h-4 text-orange-500" /> Số Dư Ví KD:
                </span>
                <strong className={`font-mono text-sm ${hasEnoughBalance ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {totalBalance.toLocaleString('vi-VN')} đ
                </strong>
              </div>

              {!hasEnoughBalance && (
                <p className="text-[11px] text-orange-500 flex items-center gap-1 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Số dư Ví KD không đủ (còn thiếu {missingAmount.toLocaleString('vi-VN')} đ)
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Option 1 Button: Confirm via Wallet if balance is enough */}
              {hasEnoughBalance && (
                <button
                  type="button"
                  onClick={handleConfirmWalletPurchase}
                  disabled={purchasing}
                  className="w-full py-3.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang thanh toán bằng Ví KD và kích hoạt...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Xác Nhận Thanh Toán Bằng Ví KD ({finalPrice.toLocaleString('vi-VN')} đ)</span>
                    </>
                  )}
                </button>
              )}

              {/* Option 2 Button: Redirect to Bank QR Payment Page */}
              <button
                type="button"
                onClick={handleRedirectToQrPayment}
                disabled={redirectingToPayment}
                className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-95 ${
                  !hasEnoughBalance
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : isDark
                    ? 'border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                    : 'border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {redirectingToPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    <span>Đang chuyển sang trang thanh toán...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 text-orange-500" />
                    <span>
                      {!hasEnoughBalance
                        ? `Quét Mã QR Ngân Hàng Để Thanh Toán (${finalPrice.toLocaleString('vi-VN')} đ)`
                        : 'Hoặc Thanh Toán Bằng Quét Mã QR Ngân Hàng →'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
