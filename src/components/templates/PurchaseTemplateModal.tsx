import React, { useState } from 'react';
import { Template } from '../../types';
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
  Sparkles,
  X,
  Loader2,
  FileText,
  CreditCard,
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

  // Step: 'CHOOSE_METHOD' | 'WALLET_CONFIRM'
  const [step, setStep] = useState<'CHOOSE_METHOD' | 'WALLET_CONFIRM'>('WALLET_CONFIRM');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);

  if (!isOpen || !template) return null;

  const realBal = user?.realBalance ?? (user?.creditsBalance ?? 0);
  const bonusBal = user?.bonusBalance ?? 0;
  const totalBalance = realBal + bonusBal;
  const price = template.price || 0;
  const hasEnoughBalance = totalBalance >= price;
  const missingAmount = Math.max(0, price - totalBalance);
  const remainingBalanceAfter = Math.max(0, totalBalance - price);

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

  // Option 1: Confirm purchase using Wallet
  const handleConfirmWalletPurchase = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua mẫu thiệp!');
      return;
    }

    if (!hasEnoughBalance) {
      toast.error('Số dư ví không đủ', `Bạn còn thiếu ${missingAmount.toLocaleString('vi-VN')} đ`);
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
      // Create payment order for exact template price
      const res = await api.createPaymentOrder({
        amount: template.price,
        paymentMethod: 'VIETQR',
      });
      if (res.success && res.data) {
        onClose();
        navigate(`/payment?orderCode=${res.data.orderCode}&templateId=${template.id}`);
      } else {
        onClose();
        navigate(`/payment?amount=${template.price}&templateId=${template.id}`);
      }
    } catch (e) {
      onClose();
      navigate(`/payment?amount=${template.price}&templateId=${template.id}`);
    } finally {
      setRedirectingToPayment(false);
    }
  };

  const handleStartEditing = () => {
    onClose();
    onSuccess(template);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
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
                  {price.toLocaleString('vi-VN')} đ
                </div>
              </div>
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
                  <span className="font-mono font-semibold">{price.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phí hệ thống:</span>
                  <span className="text-emerald-500 font-medium">0 đ (Miễn phí)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-xs">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="font-mono text-base text-orange-500">{price.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Wallet Status Information */}
            <div className={`p-4 rounded-2xl border space-y-2.5 ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                  <Wallet className="w-4 h-4 text-orange-500" /> Số Dư Ví Của Bạn:
                </span>
                <strong className={`font-mono text-sm ${hasEnoughBalance ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {totalBalance.toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>• Tiền thưởng khuyến mãi:</span>
                  <span className="font-mono text-amber-400">+{bonusBal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>• Tiền nạp thực tế:</span>
                  <span className="font-mono text-slate-300">{realBal.toLocaleString('vi-VN')} đ</span>
                </div>
                {hasEnoughBalance && (
                  <div className="flex justify-between pt-1 font-medium text-emerald-400">
                    <span>• Số dư sau khi mua:</span>
                    <span className="font-mono">{remainingBalanceAfter.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
              </div>

              {hasEnoughBalance ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] space-y-0.5">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Số dư ví đủ điều kiện thanh toán!
                  </p>
                  <p className="text-slate-400">
                    Bấm xác nhận bên dưới để trừ {price.toLocaleString('vi-VN')} đ từ ví và mở khóa mẫu thiệp ngay lập tức.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] space-y-0.5">
                  <p className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Số dư ví không đủ (còn thiếu {missingAmount.toLocaleString('vi-VN')} đ)
                  </p>
                  <p className="text-slate-400">
                    Vui lòng chọn thanh toán trực tiếp qua mã QR ngân hàng bên dưới để mở khóa thiệp.
                  </p>
                </div>
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
                      <span>Đang trừ ví và kích hoạt...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Xác Nhận Thanh Toán Bằng Ví ({price.toLocaleString('vi-VN')} đ)</span>
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
                        ? `Quét Mã QR Ngân Hàng Để Thanh Toán (${price.toLocaleString('vi-VN')} đ)`
                        : 'Hoặc Thanh Toán Bằng Quét Mã QR Ngân Hàng →'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
