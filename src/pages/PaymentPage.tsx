import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { PaymentOrder, ValidatePromotionResult } from '../types';
import {
  QrCode,
  CheckCircle,
  Clock,
  Copy,
  ShieldCheck,
  Sparkles,
  Check,
  RefreshCw,
  XCircle,
  Tag,
  ArrowDownToLine,
  AlertTriangle,
  Wallet,
  Building,
  CreditCard,
  X,
  Gift,
  ArrowRight,
  Info,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext';
import { useSearchParams } from 'react-router-dom';

const POPULAR_BANKS = [
  'Vietcombank',
  'MB Bank',
  'Techcombank',
  'ACB',
  'BIDV',
  'VietinBank',
  'VPBank',
  'TPBank',
  'Sacombank',
  'HDBank',
  'VIB',
  'MSB',
  'OCB',
  'SHB',
  'SeABank',
];

export const PaymentPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [searchParams] = useSearchParams();
  const urlOrderCode = searchParams.get('orderCode');
  const urlTemplateId = searchParams.get('templateId');

  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  // Balance Info Modal State (Exclamation mark click)
  const [balanceInfoModal, setBalanceInfoModal] = useState<'real' | 'bonus' | null>(null);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<ValidatePromotionResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);
  const [withdrawBank, setWithdrawBank] = useState<string>('Vietcombank');
  const [withdrawAccountNo, setWithdrawAccountNo] = useState<string>('');
  const [withdrawAccountName, setWithdrawAccountName] = useState<string>('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  // Underpaid action loading
  const [underpaidActionLoading, setUnderpaidActionLoading] = useState(false);

  const pollingTimerRef = useRef<any>(null);

  const predefinedPacks = [
    { amount: 20000, label: 'Gói Trải Nghiệm (20.000 đ)', bonus: 0, credits: '20.000 đ' },
    { amount: 50000, label: 'Gói Tiết Kiệm (50.000 đ)', bonus: 10000, credits: '50.000 đ + 🎁 Tặng 10.000 đ = 60.000 đ' },
    { amount: 100000, label: 'Gói VIP Pro (100.000 đ)', bonus: 30000, credits: '100.000 đ + 🎁 Tặng 30.000 đ = 130.000 đ' },
  ];

  // Auto load existing order if passed via URL ?orderCode=INV...
  useEffect(() => {
    if (urlOrderCode && !paymentOrder) {
      setLoading(true);
      api.getPaymentOrderDetails(urlOrderCode)
        .then((res) => {
          if (res.success && res.data) {
            setPaymentOrder(res.data);
            if (res.data.status === 'SUCCESS') {
              setIsSuccess(true);
            }
          }
        })
        .catch(() => {
          toast.error('Không tìm thấy đơn hàng cần thanh toán');
        })
        .finally(() => setLoading(false));
    }
  }, [urlOrderCode]);

  // Handle Apply Promo Code
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      toast.error('Vui lòng nhập mã khuyến mãi');
      return;
    }

    setPromoLoading(true);
    try {
      const res = await api.validatePromotion(promoCodeInput.trim(), selectedAmount);
      if (res.success && res.data) {
        if (res.data.valid) {
          setAppliedPromo(res.data);
          toast.success('Áp dụng mã giảm giá thành công!', res.data.message);
        } else {
          setAppliedPromo(null);
          toast.error('Mã không hợp lệ', res.data.message);
        }
      }
    } catch (err: any) {
      setAppliedPromo(null);
      toast.error('Không thể kiểm tra mã', err.response?.data?.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const finalAmountToPay = appliedPromo && appliedPromo.finalAmount !== undefined
    ? appliedPromo.finalAmount
    : selectedAmount;

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const res = await api.createPaymentOrder({
        amount: finalAmountToPay,
        paymentMethod: 'VIETQR',
      });
      if (res.success && res.data) {
        setPaymentOrder(res.data);
        setIsSuccess(false);
        setPollingCount(0);
        toast.info('Đã tạo mã thanh toán VietQR!', 'Quét mã bằng app ngân hàng để hoàn tất tự động.');
      }
    } catch (err: any) {
      toast.error('Không thể tạo đơn thanh toán', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccessCelebration = async () => {
    setIsSuccess(true);
    await refreshUser();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
    if (urlTemplateId) {
      try {
        await api.purchaseTemplate(urlTemplateId);
        toast.success('Thanh toán & Mở khóa thành công!', 'Bạn đã sở hữu mẫu thiệp này.');
      } catch (e) {
        toast.success('Thanh toán thành công!', 'Số dư tài khoản của bạn đã được cập nhật.');
      }
    } else {
      toast.success('Nạp tiền thành công!', 'Số dư tài khoản của bạn đã được cập nhật.');
    }
  };

  // Real-time polling to check if payment is confirmed or underpaid
  useEffect(() => {
    if (!paymentOrder || isSuccess) {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    pollingTimerRef.current = setInterval(async () => {
      try {
        setPollingCount((prev) => prev + 1);
        const res = await api.getPaymentOrderDetails(paymentOrder.orderCode);
        if (res.success && res.data) {
          // If status changed, update local paymentOrder
          if (res.data.status !== paymentOrder.status) {
            setPaymentOrder(res.data);
          }

          if (res.data.status === 'SUCCESS') {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            triggerSuccessCelebration();
          } else if (res.data.status === 'UNDERPAID') {
            // Underpaid state reached - stop fast polling to avoid flood
            setPaymentOrder(res.data);
          }
        }
      } catch (err) {
        // Silent polling fail
      }
    }, 2500);

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [paymentOrder, isSuccess]);

  // OP1: Settle underpaid amount directly to user's real balance
  const handleSettleToWallet = async () => {
    if (!paymentOrder) return;
    setUnderpaidActionLoading(true);
    try {
      const res = await api.settleUnderpaidToWallet(paymentOrder.orderCode);
      if (res.success) {
        toast.success(
          'Đã nạp số tiền chuyển thiếu vào Ví KD!',
          `Đã cộng ${paymentOrder.actualAmount?.toLocaleString('vi-VN')} đ vào Ví KD khả dụng.`
        );
        refreshUser();
        setPaymentOrder(null);
      }
    } catch (err: any) {
      toast.error('Không thể nạp vào Ví KD', err.response?.data?.message);
    } finally {
      setUnderpaidActionLoading(false);
    }
  };

  // OP2: Generate supplement order QR for the remaining missing amount
  const handleSupplementOrder = async () => {
    if (!paymentOrder) return;
    setUnderpaidActionLoading(true);
    try {
      const res = await api.getSupplementOrder(paymentOrder.orderCode);
      if (res.success && res.data) {
        setPaymentOrder(res.data);
        toast.info(
          'Mã QR Nạp Bổ Sung',
          `Vui lòng chuyển nốt ${res.data.amount?.toLocaleString('vi-VN')} đ còn thiếu để hoàn tất đơn hàng.`
        );
      }
    } catch (err: any) {
      toast.error('Không thể tạo mã nạp bổ sung', err.response?.data?.message);
    } finally {
      setUnderpaidActionLoading(false);
    }
  };

  const handleCancelOrder = () => {
    if (!paymentOrder) return;
    confirmModal({
      title: 'Hủy Giao Dịch Nạp Tiền',
      message: `Bạn có chắc chắn muốn hủy đơn thanh toán mã "${paymentOrder.orderCode}" không?`,
      confirmText: 'Xác Nhận Hủy Đơn',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.cancelUserPaymentOrder(paymentOrder.orderCode);
          toast.info('Đã hủy đơn nạp tiền');
          setPaymentOrder(null);
        } catch (err) {
          toast.error('Không thể hủy giao dịch');
        }
      },
    });
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    toast.info('Đã sao chép!', text);
  };

  // Submit Withdrawal Request
  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const realBal = user?.realBalance ?? (user?.creditsBalance ?? 0);

    if (withdrawAmount < 10000) {
      toast.error('Số tiền rút tối thiểu là 10.000 VNĐ');
      return;
    }

    if (withdrawAmount > realBal) {
      toast.error(`Số dư khả dụng rút (${realBal.toLocaleString('vi-VN')} đ) không đủ để rút ${withdrawAmount.toLocaleString('vi-VN')} đ`);
      return;
    }

    setWithdrawSubmitting(true);
    try {
      const res = await api.requestWithdrawal({
        amount: withdrawAmount,
        bankName: withdrawBank,
        accountNumber: withdrawAccountNo.trim(),
        accountHolder: withdrawAccountName.trim().toUpperCase(),
      });

      if (res.success) {
        toast.success(
          'Gửi yêu cầu rút tiền thành công!',
          'Admin sẽ duyệt và chuyển khoản trực tiếp vào tài khoản ngân hàng của bạn trong vòng 1-24h.'
        );
        setShowWithdrawModal(false);
        refreshUser();
      }
    } catch (err: any) {
      toast.error('Không thể tạo yêu cầu rút tiền', err.response?.data?.message);
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const realBalance = user?.realBalance ?? (user?.creditsBalance ?? 0);
  const bonusBalance = user?.bonusBalance ?? 0;
  const isTransactionOrSuccess = Boolean(paymentOrder || isSuccess || searchParams.get('orderCode'));

  return (
    <div className={`min-h-screen py-10 transition-colors ${
      isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#faf8f5] text-stone-800'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Main Section: Unified Wallet & Deposit OR View QR */}
        {!paymentOrder ? (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-7 max-w-2xl mx-auto shadow-xl transition-all ${
            isDark ? 'bg-[#121824] border-slate-800 shadow-slate-950/40' : 'bg-white border-stone-200/80 shadow-stone-200/60'
          }`}>
            {/* 1. Header: Ví KD Card - Embedded into unified background */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
              isDark 
                ? 'bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 border-slate-800/90' 
                : 'bg-gradient-to-br from-stone-50 via-amber-50/20 to-orange-50/20 border-stone-200/80 shadow-xs'
            }`}>
              {/* Wallet Title & Total Balance */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                      <Wallet className="w-5 h-5" />
                    </span>
                    <h2 className="font-editorial text-xl sm:text-2xl font-bold">Ví KD</h2>
                  </div>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                      Tổng số dư Ví KD:
                    </span>
                    <span className="text-xl sm:text-2xl text-emerald-400 font-mono font-bold">
                      {(realBalance + bonusBalance).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setWithdrawAmount(Math.min(realBalance, 50000));
                    setShowWithdrawModal(true);
                  }}
                  disabled={realBalance < 10000}
                  className="px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-40 flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <ArrowDownToLine className="w-4 h-4" /> Rút Tiền Về Ngân Hàng
                </button>
              </div>

              {/* Balances Breakdown Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {/* Tiền Nạp Thật */}
                <div 
                  onClick={() => setBalanceInfoModal('real')}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all group ${
                    isDark 
                      ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850' 
                      : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Tiền Nạp Thật
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBalanceInfoModal('real');
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                        isDark 
                          ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white border border-emerald-500/40' 
                          : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white border border-emerald-300'
                      }`}
                      title="Bấm để xem chi tiết tiền nạp thật"
                    >
                      !
                    </button>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono font-bold text-base sm:text-lg text-emerald-400">
                      {realBalance.toLocaleString('vi-VN')} đ
                    </span>
                    <span className={`text-[11px] group-hover:underline ${isDark ? 'text-slate-400' : 'text-stone-400'}`}>
                      Chi tiết &rarr;
                    </span>
                  </div>
                </div>

                {/* Tiền Thưởng */}
                <div 
                  onClick={() => setBalanceInfoModal('bonus')}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all group ${
                    isDark 
                      ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 hover:bg-slate-850' 
                      : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Tiền Thưởng
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBalanceInfoModal('bonus');
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                        isDark 
                          ? 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white border border-amber-500/40' 
                          : 'bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white border border-amber-300'
                      }`}
                      title="Bấm để xem chi tiết tiền thưởng"
                    >
                      !
                    </button>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono font-bold text-base sm:text-lg text-amber-400">
                      +{bonusBalance.toLocaleString('vi-VN')} đ
                    </span>
                    <span className={`text-[11px] group-hover:underline ${isDark ? 'text-slate-400' : 'text-stone-400'}`}>
                      Chi tiết &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Recharge Packs Section */}
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Nạp Tiền VietQR Tự Động
                </span>
                <h3 className="font-editorial text-2xl font-bold">Chọn Gói Nạp Tiền</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Nạp gói 50k hoặc 100k để nhận thêm quà tặng tiền thưởng khuyến mãi!
                </p>
              </div>

              {/* Pack Selection */}
              <div className="space-y-3">
                {predefinedPacks.map((pack) => (
                  <div
                    key={pack.amount}
                    onClick={() => {
                      setSelectedAmount(pack.amount);
                      if (appliedPromo) setAppliedPromo(null); // Reset promo when pack changes
                    }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      selectedAmount === pack.amount
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                        : isDark
                        ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        : 'border-stone-200 bg-stone-50/70 hover:border-stone-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        {pack.label}
                        {pack.bonus > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                            <Gift className="w-3 h-3" /> +{pack.bonus.toLocaleString('vi-VN')} đ
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-emerald-500 font-semibold">{pack.credits}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedAmount === pack.amount ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400'
                      }`}
                    >
                      {selectedAmount === pack.amount && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input Box */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Tag className="w-4 h-4" /> Mã Giảm Giá / Khuyến Mãi
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="Nhập mã (Ví dụ: CHAOMUNG)"
                    className={`flex-1 px-3.5 py-2 rounded-xl text-xs uppercase font-mono font-bold border focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500' : 'bg-white border-stone-200 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCodeInput.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-50"
                  >
                    {promoLoading ? 'Đang kiểm tra...' : 'Áp Dụng'}
                  </button>
                </div>

                {appliedPromo && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex justify-between items-center text-emerald-400">
                    <div>
                      <p className="font-bold">Mã {appliedPromo.code}: Giảm {appliedPromo.discountAmount?.toLocaleString('vi-VN')} đ</p>
                      <p className="text-[11px] text-slate-400">Cần thanh toán: {appliedPromo.finalAmount?.toLocaleString('vi-VN')} đ</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCodeInput('');
                      }}
                      className="p-1 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Create Order Button */}
              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm shadow-lg shadow-emerald-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                {loading ? 'Đang tạo mã...' : `Tạo Mã VietQR (${finalAmountToPay.toLocaleString('vi-VN')} đ)`}
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 max-w-2xl mx-auto ${
            isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            {isSuccess ? (
              <div className="text-center py-10 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-editorial text-2xl font-bold">Thanh Toán Thành Công!</h3>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                  Số dư Ví KD của bạn đã được cộng thêm <strong>{paymentOrder.amount.toLocaleString('vi-VN')} đ</strong>.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setPaymentOrder(null);
                      setIsSuccess(false);
                    }}
                    className={`px-6 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                  >
                    Nạp Tiếp
                  </button>
                  <a
                    href={urlTemplateId ? `/editor?templateId=${urlTemplateId}` : "/dashboard"}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                  >
                    <span>{urlTemplateId ? 'Bắt Đầu Tạo Thiệp Ngay' : 'Về Trang Cá Nhân'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Underpaid Banner Alert if customer transferred less */}
                {paymentOrder.status === 'UNDERPAID' && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 space-y-3 animate-pulse">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <span>BẠN ĐÃ CHUYỂN THIẾU SỐ TIỀN!</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-300">
                      <p>• Yêu cầu gói: <strong className="text-white">{paymentOrder.amount.toLocaleString('vi-VN')} đ</strong></p>
                      <p>• Thực tế hệ thống đã nhận: <strong className="text-emerald-400">{paymentOrder.actualAmount?.toLocaleString('vi-VN')} đ</strong></p>
                      <p>• Số tiền còn thiếu: <strong className="text-orange-400 font-bold">{paymentOrder.missingAmount?.toLocaleString('vi-VN')} đ</strong></p>
                    </div>

                    <p className="text-xs font-semibold text-white pt-1">
                      Vui lòng chọn 1 trong 2 giải pháp bên dưới:
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {/* OP1 */}
                      <button
                        type="button"
                        onClick={handleSettleToWallet}
                        disabled={underpaidActionLoading}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        OP1: Nạp {paymentOrder.actualAmount?.toLocaleString('vi-VN')} đ vào Ví KD
                      </button>

                      {/* OP2 */}
                      <button
                        type="button"
                        onClick={handleSupplementOrder}
                        disabled={underpaidActionLoading}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        OP2: Quét QR Nạp {paymentOrder.missingAmount?.toLocaleString('vi-VN')} đ Còn Thiếu
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* VietQR Image */}
                  <div className="text-center space-y-3">
                    <div className="relative p-4 bg-white rounded-3xl shadow-xl inline-block border border-stone-200 group">
                      <img
                        src={paymentOrder.vietQrUrl || paymentOrder.qrCodeBase64}
                        alt="VietQR"
                        className="w-56 h-56 object-contain mx-auto"
                      />
                      <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/30 animate-pulse pointer-events-none" />
                    </div>

                    {/* Real-time Listening Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-medium animate-pulse ${
                      isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                      <span>Hệ thống đang tự động lắng nghe giao dịch...</span>
                    </div>
                  </div>

                  {/* Transfer Info */}
                  <div className="space-y-4 text-xs">
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Ngân hàng:</span>
                        <strong className="text-orange-500">{paymentOrder.bankName}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Số tài khoản:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold">
                          <span>{paymentOrder.bankAccountNo}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(paymentOrder.bankAccountNo, 'accNo')}
                            className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-500 transition"
                            title="Sao chép số tài khoản"
                          >
                            {copiedField === 'accNo' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Chủ tài khoản:</span>
                        <strong className="uppercase">{paymentOrder.accountHolder}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Số tiền:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-500 text-sm">
                          <span>{paymentOrder.amount.toLocaleString('vi-VN')} đ</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(paymentOrder.amount.toString(), 'amt')}
                            className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-500 transition"
                            title="Sao chép số tiền"
                          >
                            {copiedField === 'amt' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className={`flex justify-between items-center pt-2.5 border-t ${
                        isDark ? 'border-slate-800' : 'border-stone-200'
                      }`}>
                        <div>
                          <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Nội dung CK:</span>
                          <p className="text-[10px] text-amber-500 font-semibold">(Bắt buộc đúng)</p>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono font-black text-amber-500 text-sm bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                          <span>{paymentOrder.transferContent}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(paymentOrder.transferContent, 'content')}
                            className="p-1 rounded-lg hover:bg-amber-500/30 text-amber-500 transition"
                            title="Sao chép nội dung chuyển khoản"
                          >
                            {copiedField === 'content' ? <Check className="w-3.5 h-3.5 text-amber-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setPaymentOrder(null)}
                        className={`text-xs px-4 py-2.5 rounded-xl border font-semibold transition ${
                          isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        ← Đổi gói nạp khác
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelOrder}
                        className={`text-xs px-4 py-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                          isDark
                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                            : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                        }`}
                      >
                        <XCircle className="w-4 h-4 text-orange-500" />
                        <span>Hủy Giao Dịch Này</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`max-w-md w-full rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-editorial text-xl font-bold flex items-center gap-2 text-orange-500">
                <ArrowDownToLine className="w-5 h-5" /> Yêu Cầu Rút Tiền Về Ngân Hàng
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="p-1.5 rounded-full hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4 text-xs">
              {/* Anti-Loss Clawback Alert */}
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px] space-y-1">
                <p className="font-bold text-orange-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Quy định rút tiền & bảo vệ quyền lợi:
                </p>
                <p>• Bạn chỉ được rút tối đa số <strong>Tiền Nạp Thật</strong> hiện có ({realBalance.toLocaleString('vi-VN')} đ).</p>
                <p>• Khi rút tiền, toàn bộ <strong>Tiền Thưởng Khuyến Mãi</strong> còn lại ({bonusBalance.toLocaleString('vi-VN')} đ) sẽ được thu hồi tự động để chống gian lận.</p>
                <p>• Admin sẽ chuyển khoản qua VietQR trong vòng 1 - 24 giờ.</p>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-bold mb-1">Số tiền muốn rút (VNĐ)*</label>
                <input
                  type="number"
                  required
                  min={10000}
                  max={realBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-sm text-emerald-400 focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 focus:border-orange-500' : 'bg-stone-50 border-stone-200 focus:border-orange-500'
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Tối đa: {realBalance.toLocaleString('vi-VN')} đ | Tối thiểu: 10.000 đ
                </p>
              </div>

              {/* Bank Name */}
              <div>
                <label className="block font-bold mb-1">Ngân hàng thụ hưởng*</label>
                <select
                  value={withdrawBank}
                  onChange={(e) => setWithdrawBank(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block font-bold mb-1">Số tài khoản ngân hàng*</label>
                <input
                  type="text"
                  required
                  value={withdrawAccountNo}
                  onChange={(e) => setWithdrawAccountNo(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Ví dụ: 0123456789"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-orange-500' : 'bg-stone-50 border-stone-200'
                  }`}
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block font-bold mb-1">Họ và tên chủ tài khoản (In hoa không dấu)*</label>
                <input
                  type="text"
                  required
                  value={withdrawAccountName}
                  onChange={(e) => setWithdrawAccountName(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: NGUYEN VAN A"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-bold uppercase focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-orange-500' : 'bg-stone-50 border-stone-200'
                  }`}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={withdrawSubmitting || realBalance < 10000}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  {withdrawSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Rút Tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Số Dư (Tiền Nạp Thật / Tiền Thưởng) */}
      {balanceInfoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setBalanceInfoModal(null)}
        >
          <div 
            className={`w-full max-w-md rounded-3xl border p-6 space-y-5 shadow-2xl relative animate-scaleUp ${
              isDark ? 'bg-[#121824] border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/20 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className={`p-2.5 rounded-2xl text-white ${
                  balanceInfoModal === 'real' ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-amber-500 shadow-md shadow-amber-500/20'
                }`}>
                  {balanceInfoModal === 'real' ? <Wallet className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {balanceInfoModal === 'real' ? 'Thông Tin Tiền Nạp Thật' : 'Thông Tin Tiền Thưởng'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {balanceInfoModal === 'real' ? 'Số dư thanh toán chính trong Ví KD' : 'Tiền ưu đãi khuyến mãi tặng kèm'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setBalanceInfoModal(null)} 
                className="p-1.5 rounded-full hover:bg-slate-500/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            {balanceInfoModal === 'real' ? (
              <div className="space-y-3.5 text-xs leading-relaxed">
                <div className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <p className="font-bold text-sm mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> 
                    Số dư hiện có: {realBalance.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-[11px] opacity-90">
                    Tiền nạp thật là số tiền bạn đã nạp vào Ví KD thông qua chuyển khoản ngân hàng hoặc quét mã VietQR tự động 24/7.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold shrink-0 text-[11px]">✓</span>
                    <div>
                      <strong className={`block font-semibold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>Dùng để mua bất kỳ mẫu thiệp nào:</strong>
                      <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Bạn có thể dùng để mở khóa bất kỳ mẫu thiệp cưới, sinh nhật, sự kiện nào trên hệ thống KD Card.</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold shrink-0 text-[11px]">✓</span>
                    <div>
                      <strong className={`block font-semibold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>Có thể rút về tài khoản ngân hàng:</strong>
                      <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Bạn hoàn toàn có thể rút số tiền này về ngân hàng bất kỳ lúc nào (hỗ trợ rút tối thiểu từ <strong>10.000 đ</strong>).</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold shrink-0 text-[11px]">✓</span>
                    <div>
                      <strong className={`block font-semibold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>Không có hạn sử dụng:</strong>
                      <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Số dư nạp thật được bảo toàn vĩnh viễn trong Ví KD của bạn cho đến khi bạn sử dụng hoặc rút về.</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs leading-relaxed">
                <div className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <p className="font-bold text-sm mb-1 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-500 shrink-0" /> 
                    Tiền thưởng hiện có: +{bonusBalance.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-[11px] opacity-90">
                    Tiền thưởng là phần quà tặng tri ân khi bạn nạp các gói nạp ưu đãi (50k tặng 10k, 100k tặng 30k) hoặc khi áp dụng mã giảm giá.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold shrink-0 text-[11px]">★</span>
                    <div>
                      <strong className={`block font-semibold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>Tự động ưu tiên trừ trước:</strong>
                      <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Khi bạn mua bất kỳ mẫu thiệp nào, hệ thống sẽ <strong>tự động ưu tiên trừ vào Tiền Thưởng trước</strong>, giúp bạn tiết kiệm tối đa Tiền Nạp Thật!</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold shrink-0 text-[11px]">★</span>
                    <div>
                      <strong className={`block font-semibold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>Giá trị quy đổi nguyên giá:</strong>
                      <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>1 đ Tiền Thưởng có giá trị tương đương 1 đ tiền nạp thật khi thanh toán mua thiệp.</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center font-bold shrink-0 text-[11px]">!</span>
                    <div>
                      <strong className="block font-semibold text-red-400">Không thể rút về ngân hàng:</strong>
                      <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Tiền thưởng chỉ dùng để mua thiệp trên hệ thống. Nếu bạn thực hiện yêu cầu rút Tiền Nạp Thật, tiền thưởng còn lại sẽ được hệ thống thu hồi tự động theo chính sách.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setBalanceInfoModal(null)}
                className={`w-full py-2.5 rounded-xl font-bold text-white text-xs transition shadow-md ${
                  balanceInfoModal === 'real'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                }`}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
