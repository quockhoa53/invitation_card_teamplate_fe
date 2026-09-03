import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { PaymentOrder } from '../types';
import { QrCode, CheckCircle, Clock, Copy, ShieldCheck, Sparkles, Check, RefreshCw, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext';

import { useSearchParams } from 'react-router-dom';

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

  const pollingTimerRef = useRef<any>(null);

  const predefinedPacks = [
    { amount: 20000, label: 'Gói Cơ Bản (20.000 đ)', credits: '20.000 đ' },
    { amount: 50000, label: 'Gói Tiết Kiệm (50.000 đ)', credits: '50.000 đ + Tặng 10.000 đ' },
    { amount: 100000, label: 'Gói VIP Pro (100.000 đ)', credits: '100.000 đ + Tặng 30.000 đ' },
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
        .catch((err) => {
          toast.error('Không tìm thấy đơn hàng cần thanh toán');
        })
        .finally(() => setLoading(false));
    }
  }, [urlOrderCode]);

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const res = await api.createPaymentOrder({
        amount: selectedAmount,
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

  // Real-time polling to check if payment is confirmed via SePay / Bank Webhook
  useEffect(() => {
    if (!paymentOrder || isSuccess) {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    pollingTimerRef.current = setInterval(async () => {
      try {
        setPollingCount((prev) => prev + 1);
        const res = await api.getOrderStatus(paymentOrder.orderCode);
        if (res.success && res.data) {
          if (res.data.status === 'SUCCESS') {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            triggerSuccessCelebration();
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

  return (
    <div className={`min-h-screen py-12 transition-colors ${
      isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#faf8f5] text-stone-800'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Thanh Toán Tự Động VietQR
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold">Nạp Tiền & Mở Khóa Mẫu Pro</h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Số dư hiện tại của bạn: <strong className="text-rose-500">{user?.creditsBalance?.toLocaleString('vi-VN')} đ</strong>
          </p>
        </div>

        {!paymentOrder ? (
          <div className={`p-8 rounded-3xl border space-y-6 max-w-xl mx-auto ${
            isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <h3 className="font-editorial text-base font-bold">
              Chọn Gói Nạp Tiền
            </h3>

            <div className="space-y-3">
              {predefinedPacks.map((pack) => (
                <div
                  key={pack.amount}
                  onClick={() => setSelectedAmount(pack.amount)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedAmount === pack.amount
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      : 'border-stone-200 bg-stone-50/70 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold">{pack.label}</h4>
                    <p className="text-xs text-emerald-500 font-semibold mt-0.5">{pack.credits}</p>
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

            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm shadow-lg shadow-emerald-500/20 hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {loading ? 'Đang tạo mã...' : `Tạo Mã VietQR (${selectedAmount.toLocaleString('vi-VN')} đ)`}
            </button>
          </div>
        ) : (
          <div className={`p-8 rounded-3xl border space-y-6 max-w-2xl mx-auto ${
            isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            {isSuccess ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-editorial text-2xl font-bold">Thanh Toán Thành Công!</h3>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                  Số dư của bạn đã được cộng thêm <strong>{paymentOrder.amount.toLocaleString('vi-VN')} đ</strong>.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => setPaymentOrder(null)}
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};
