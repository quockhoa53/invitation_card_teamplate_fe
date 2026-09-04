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
  CreditCard,
  Sparkles,
  X,
  Lock,
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

  if (!isOpen || !template) return null;

  const realBal = user?.realBalance ?? (user?.creditsBalance ?? 0);
  const bonusBal = user?.bonusBalance ?? 0;
  const totalBalance = realBal + bonusBal;
  const price = template.price || 0;
  const hasEnoughBalance = totalBalance >= price;
  const missingAmount = Math.max(0, price - totalBalance);

  const bonusDeduct = Math.min(bonusBal, price);
  const realDeduct = price - bonusDeduct;

  const handlePurchase = async () => {
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
          particleCount: 100,
          spread: 70,
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

  const handleStartEditing = () => {
    onClose();
    onSuccess(template);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className={`max-w-md w-full rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-editorial text-lg font-bold flex items-center gap-2 text-orange-500">
            <ShoppingBag className="w-5 h-5" /> Mua & Mở Khóa Mẫu Thiệp
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {purchaseSuccess ? (
          <div className="text-center py-4 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="font-editorial text-2xl font-bold">Mở Khóa Thành Công!</h4>
            <p className="text-xs text-slate-400">
              Bạn đã sở hữu trọn vẹn mẫu thiệp <strong className="text-white">"{template.title}"</strong>. Bây giờ bạn có thể tạo và xuất bản không giới hạn thiệp với mẫu này.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={handleStartEditing}
                className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs shadow-lg shadow-orange-500/25 hover:brightness-105 transition flex items-center justify-center gap-2"
              >
                <span>Bắt Đầu Tạo Thiệp Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            {/* Template Card Mini Preview */}
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-stone-50 border-stone-200'
            }`}>
              <img
                src={template.thumbnailUrl}
                alt={template.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                  Mẫu Thiệp Trả Phí
                </span>
                <h4 className="font-bold text-sm line-clamp-1">{template.title}</h4>
                <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-emerald-400">
                  <span>{price.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Wallet Balance Section */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                  <Wallet className="w-4 h-4 text-orange-400" /> Tổng Số Dư Ví Của Bạn:
                </span>
                <strong className={`text-sm font-mono ${hasEnoughBalance ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {totalBalance.toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-700/40">
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
                  <p className="font-bold">✓ Số dư đủ để mở khóa mẫu thiệp!</p>
                  <p className="text-slate-400">
                    Hệ thống ưu tiên trừ {bonusDeduct.toLocaleString('vi-VN')} đ từ tiền thưởng {realDeduct > 0 ? `và ${realDeduct.toLocaleString('vi-VN')} đ từ tiền nạp` : ''}.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] space-y-0.5">
                  <p className="font-bold">⚠️ Số dư ví hiện tại không đủ!</p>
                  <p className="text-slate-400">
                    Bạn còn thiếu <strong className="text-orange-400">{missingAmount.toLocaleString('vi-VN')} đ</strong> để mua mẫu thiệp này.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2">
              {hasEnoughBalance ? (
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 text-white text-xs shadow-lg shadow-emerald-500/25 hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {purchasing ? 'Đang mở khóa...' : `Xác Nhận Mua & Mở Khóa (${price.toLocaleString('vi-VN')} đ)`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/payment');
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs shadow-lg shadow-orange-500/25 hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Nạp Tiền Vào Ví Ngay (Thiếu {missingAmount.toLocaleString('vi-VN')} đ)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
