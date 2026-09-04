import React, { useState, useEffect, useRef } from 'react';
import { Template, PaymentOrder } from '../../types';
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
  CreditCard,
  QrCode,
  Copy,
  Check,
  Sparkles,
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const isDark = theme === 'dark';

  // Payment Method Selection: 'WALLET' | 'BANK_QR'
  const [selectedMethod, setSelectedMethod] = useState<'WALLET' | 'BANK_QR'>('WALLET');

  // Wallet purchase state
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Bank QR state
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const pollingRef = useRef<any>(null);

  const realBal = user?.realBalance ?? (user?.creditsBalance ?? 0);
  const bonusBal = user?.bonusBalance ?? 0;
  const totalBalance = realBal + bonusBal;
  const price = template?.price || 0;
  const hasEnoughBalance = totalBalance >= price;
  const missingAmount = Math.max(0, price - totalBalance);

  const bonusDeduct = Math.min(bonusBal, price);
  const realDeduct = price - bonusDeduct;

  // Auto-select method when modal opens
  useEffect(() => {
    if (isOpen && template) {
      setPurchaseSuccess(false);
      setPaymentOrder(null);
      // If user has enough balance, default to WALLET, else default to BANK_QR
      if (hasEnoughBalance) {
        setSelectedMethod('WALLET');
      } else {
        setSelectedMethod('BANK_QR');
      }
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, template]);

  // When user switches to BANK_QR, automatically generate or fetch payment order
  useEffect(() => {
    if (!isOpen || !template || selectedMethod !== 'BANK_QR' || purchaseSuccess) return;

    const generateOrder = async () => {
      if (paymentOrder) return;
      setLoadingOrder(true);
      try {
        const res = await api.createPaymentOrder({
          amount: template.price,
          paymentMethod: 'VIETQR',
        });
        if (res.success && res.data) {
          setPaymentOrder(res.data);
        }
      } catch (err: any) {
        toast.error('Không thể tạo mã VietQR', err.response?.data?.message || 'Vui lòng thử lại sau');
      } finally {
        setLoadingOrder(false);
      }
    };

    generateOrder();
  }, [selectedMethod, isOpen, template]);

  // Real-time polling for Bank QR transaction
  useEffect(() => {
    if (!paymentOrder || purchaseSuccess || selectedMethod !== 'BANK_QR') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.getPaymentOrderDetails(paymentOrder.orderCode);
        if (res.success && res.data) {
          if (res.data.status === 'SUCCESS') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            // Complete template purchase
            await handleAutoPurchaseAfterDeposit();
          } else if (res.data.status !== paymentOrder.status) {
            setPaymentOrder(res.data);
          }
        }
      } catch (err) {
        // silent fail
      }
    }, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentOrder, purchaseSuccess, selectedMethod]);

  const handleAutoPurchaseAfterDeposit = async () => {
    if (!template) return;
    try {
      // Call purchase template
      await api.purchaseTemplate(template.id);
      setPurchaseSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      toast.success('Thanh toán thành công!', `Bạn đã sở hữu mẫu "${template.title}".`);
      await refreshUser();
      await refreshPurchasedTemplates();
    } catch (err: any) {
      toast.info('Giao dịch đã được ghi nhận!', 'Vui lòng kiểm tra số dư ví.');
      await refreshUser();
      await refreshPurchasedTemplates();
    }
  };

  // Method 1: Purchase using Wallet balance
  const handleWalletPurchase = async () => {
    if (!user || !template) {
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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.info('Đã sao chép vào bộ nhớ tạm');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStartEditing = () => {
    onClose();
    if (template) {
      onSuccess(template);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`max-w-lg w-full max-h-[92vh] overflow-y-auto rounded-[28px] p-5 sm:p-7 border shadow-2xl space-y-5 ${
        isDark ? 'bg-[#0f1523] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-base sm:text-lg font-bold">
                Sở Hữu & Mở Khóa Thiệp
              </h3>
              <p className="text-[11px] text-slate-400">Chọn phương thức thanh toán phù hợp với bạn</p>
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
          /* PAYMENT FLOW */
          <div className="space-y-4 text-xs">
            {/* Template Summary Card */}
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${
              isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <img
                src={template.thumbnailUrl}
                alt={template.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block">
                  Mẫu Thiệp Trả Phí
                </span>
                <h4 className="font-bold text-sm truncate" title={template.title}>
                  {template.title}
                </h4>
                <div className="font-mono font-bold text-sm text-orange-500">
                  {price.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Chọn phương thức thanh toán:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Method 1: Wallet */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('WALLET')}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    selectedMethod === 'WALLET'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-md shadow-orange-500/10'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Wallet className="w-4 h-4 shrink-0 text-orange-500" />
                    <span className="font-bold text-xs">Ví Của Tôi</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Số dư: {totalBalance.toLocaleString('vi-VN')} đ
                  </div>
                  {selectedMethod === 'WALLET' && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </button>

                {/* Method 2: Bank QR */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('BANK_QR')}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    selectedMethod === 'BANK_QR'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-md shadow-orange-500/10'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <QrCode className="w-4 h-4 shrink-0 text-orange-500" />
                    <span className="font-bold text-xs">Quét Mã VietQR</span>
                  </div>
                  <div className="text-[11px] text-emerald-500 font-semibold">
                    Ngân Hàng Tự Động
                  </div>
                  {selectedMethod === 'BANK_QR' && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: WALLET PAYMENT */}
            {selectedMethod === 'WALLET' && (
              <div className={`p-4 rounded-2xl border space-y-3.5 animate-fadeIn ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Tổng số dư khả dụng:</span>
                  <strong className={`font-mono text-sm ${hasEnoughBalance ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {totalBalance.toLocaleString('vi-VN')} đ
                  </strong>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span>• Tiền thưởng khuyến mãi:</span>
                    <span className="font-mono text-amber-400">+{bonusBal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Tiền nạp thực tế:</span>
                    <span className="font-mono text-slate-300">{realBal.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                {hasEnoughBalance ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] space-y-0.5">
                    <p className="font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Số dư ví đủ để mở khóa ngay!
                    </p>
                    <p className="text-slate-400">
                      Hệ thống tự động trừ {price.toLocaleString('vi-VN')} đ và mở khóa vĩnh viễn mẫu thiệp.
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Số dư ví không đủ (còn thiếu {missingAmount.toLocaleString('vi-VN')} đ)
                    </p>
                    <p className="text-slate-400">
                      Bạn có thể chọn phương thức <strong className="text-orange-400 cursor-pointer underline" onClick={() => setSelectedMethod('BANK_QR')}>"Quét Mã VietQR"</strong> để chuyển khoản trực tiếp đúng {price.toLocaleString('vi-VN')} đ.
                    </p>
                  </div>
                )}

                {/* Submit Wallet */}
                <div className="pt-1">
                  {hasEnoughBalance ? (
                    <button
                      type="button"
                      onClick={handleWalletPurchase}
                      disabled={purchasing}
                      className="w-full py-3.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm shadow-md shadow-orange-500/25 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang trừ ví và kích hoạt...</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />
                          <span>Xác Nhận Trừ Ví ({price.toLocaleString('vi-VN')} đ)</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('BANK_QR')}
                      className="w-full py-3.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm shadow-md shadow-orange-500/25 active:scale-95 transition flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Chuyển Sang Quét Mã VietQR Ngân Hàng</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: DIRECT BANK VIETQR */}
            {selectedMethod === 'BANK_QR' && (
              <div className={`p-4 rounded-2xl border space-y-4 animate-fadeIn ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {loadingOrder ? (
                  <div className="text-center py-8 space-y-3">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs">Đang khởi tạo mã QR thanh toán ngân hàng...</p>
                  </div>
                ) : paymentOrder ? (
                  <>
                    {/* Live Processing Notice */}
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <span>Hệ thống đang chờ giao dịch... Thiệp sẽ tự động mở khóa ngay khi nhận được tiền.</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* QR Code Container */}
                      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm shrink-0 flex flex-col items-center">
                        <img
                          src={paymentOrder.vietQrUrl || paymentOrder.qrCodeBase64}
                          alt="VietQR Payment"
                          className="w-40 h-40 object-contain rounded-lg"
                        />
                        <span className="text-[10px] font-bold text-slate-700 mt-1 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-orange-500" /> Quét bằng App Bank
                        </span>
                      </div>

                      {/* Transfer Details with Copy Buttons */}
                      <div className="space-y-2 flex-1 w-full min-w-0">
                        <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Ngân hàng:</span>
                            <strong className="text-orange-400 font-bold">{paymentOrder.bankName}</strong>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Số tài khoản:</span>
                            <strong className="font-mono text-white text-xs">{paymentOrder.bankAccountNo}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(paymentOrder.bankAccountNo, 'acc')}
                            className="p-1 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] text-slate-200 flex items-center gap-1 transition"
                          >
                            {copiedField === 'acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Sao chép</span>
                          </button>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Số tiền chính xác:</span>
                            <strong className="font-mono text-emerald-400 text-xs">{paymentOrder.amount.toLocaleString('vi-VN')} đ</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(String(paymentOrder.amount), 'amt')}
                            className="p-1 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] text-slate-200 flex items-center gap-1 transition"
                          >
                            {copiedField === 'amt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Sao chép</span>
                          </button>
                        </div>

                        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-orange-300 block">Nội dung chuyển khoản (bắt buộc):</span>
                            <strong className="font-mono text-orange-400 text-xs tracking-wider">{paymentOrder.transferContent}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(paymentOrder.transferContent, 'content')}
                            className="p-1 px-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-[11px] text-white font-bold flex items-center gap-1 transition"
                          >
                            {copiedField === 'content' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>Sao chép</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center">
                      ⚠️ Lưu ý: Vui lòng giữ nguyên nội dung chuyển khoản <strong className="text-orange-400">{paymentOrder.transferContent}</strong> để hệ thống tự động nhận diện và mở khóa thiệp ngay lập tức.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-slate-400">Không thể tải thông tin thanh toán VietQR.</p>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('WALLET')}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white"
                    >
                      Quay lại thanh toán bằng ví
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
