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

  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

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

  const triggerSuccessCelebration = () => {
    setIsSuccess(true);
    refreshUser();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
    toast.success('Nạp tiền thành công!', 'Số dư tài khoản của bạn đã được cập nhật.');
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
          'Đã nạp số tiền chuyển thiếu vào ví!',
          `Đã cộng ${paymentOrder.actualAmount?.toLocaleString('vi-VN')} đ vào ví khả dụng.`
        );
        refreshUser();
        setPaymentOrder(null);
      }
    } catch (err: any) {
      toast.error('Không thể nạp vào ví', err.response?.data?.message);
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

  return (
    <div className={`min-h-screen py-10 transition-colors ${
      isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#faf8f5] text-stone-800'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* User Balance Overview Cards */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Wallet className="w-5 h-5" />
                </span>
                <h2 className="font-editorial text-xl sm:text-2xl font-bold">Ví Cá Nhân Của Bạn</h2>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Tổng số dư ví: <strong className="text-lg text-emerald-400 font-mono font-bold">{(realBalance + bonusBalance).toLocaleString('vi-VN')} đ</strong>
              </p>
            </div>

            {/* Balances Breakdown */}
            <div className="flex flex-wrap items-center gap-3">
              <div className={`p-3 rounded-2xl border text-xs min-w-[150px] ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <span className="text-[11px] text-slate-400 block font-medium">Tiền Nạp Thật (Khả Dụng Rút)</span>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  {realBalance.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className={`p-3 rounded-2xl border text-xs min-w-[150px] ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <span className="text-[11px] text-slate-400 block font-medium">Tiền Thưởng (Chỉ Mua Thiệp)</span>
                <span className="font-mono font-bold text-sm text-pink-400">
                  +{bonusBalance.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button
                onClick={() => {
                  setWithdrawAmount(Math.min(realBalance, 50000));
                  setShowWithdrawModal(true);
                }}
                disabled={realBalance < 10000}
                className="px-4 py-3 rounded-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs shadow-md shadow-rose-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-40 flex items-center gap-1.5"
              >
                <ArrowDownToLine className="w-4 h-4" /> Rút Tiền Về Ngân Hàng
              </button>
            </div>
          </div>
        </div>

        {/* Main Section: Create Order or View QR */}
        {!paymentOrder ? (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 max-w-xl mx-auto ${
            isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
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
                        <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold border border-pink-500/30 flex items-center gap-1">
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
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400">
                <Tag className="w-4 h-4" /> Mã Giảm Giá / Khuyến Mãi
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã (Ví dụ: CHAOMUNG)"
                  className={`flex-1 px-3.5 py-2 rounded-xl text-xs uppercase font-mono font-bold border focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-pink-500' : 'bg-white border-stone-200 focus:border-pink-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCodeInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white transition disabled:opacity-50"
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
                  Số dư của bạn đã được cộng thêm <strong>{paymentOrder.amount.toLocaleString('vi-VN')} đ</strong>.
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
                    href="/dashboard"
                    className="px-6 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition"
                  >
                    Về Trang Cá Nhân
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
                      <p>• Số tiền còn thiếu: <strong className="text-rose-400 font-bold">{paymentOrder.missingAmount?.toLocaleString('vi-VN')} đ</strong></p>
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
                        OP1: Nạp {paymentOrder.actualAmount?.toLocaleString('vi-VN')} đ vào Ví
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
                        <strong className="text-rose-500">{paymentOrder.bankName}</strong>
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
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                        }`}
                      >
                        <XCircle className="w-4 h-4 text-rose-500" />
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
              <h3 className="font-editorial text-xl font-bold flex items-center gap-2 text-rose-500">
                <ArrowDownToLine className="w-5 h-5" /> Yêu Cầu Rút Tiền Về Ngân Hàng
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="p-1.5 rounded-full hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4 text-xs">
              {/* Anti-Loss Clawback Alert */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] space-y-1">
                <p className="font-bold text-rose-400 flex items-center gap-1">
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
                    isDark ? 'bg-slate-800 border-slate-700 focus:border-rose-500' : 'bg-stone-50 border-stone-200 focus:border-rose-500'
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
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-rose-500' : 'bg-stone-50 border-stone-200'
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
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-rose-500' : 'bg-stone-50 border-stone-200'
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
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-500/25 disabled:opacity-50"
                >
                  {withdrawSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Rút Tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
