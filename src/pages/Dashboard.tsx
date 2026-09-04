import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Card, Template, TransactionItem } from '../types';
import { api } from '../services/api';
import { CardEditor } from '../components/editor/CardEditor';
import { QrCodeModal } from '../components/common/QrCodeModal';
import { Pagination } from '../components/common/Pagination';
import { TemplateCardItem } from '../components/home/TemplateCardItem';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { UserCardSkeleton, TableRowSkeleton } from '../components/common/Skeleton';
import {
  PlusCircle,
  QrCode,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  MessageCircle,
  Lock,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Copy,
  Check,
  ShoppingBag,
  ChevronRight,
  X,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { AdminTwoFactorModal } from './admin/AdminTwoFactorPage';
import { SetPasswordModal } from '../components/auth/SetPasswordModal';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, refreshUser, isTemplateOwned } = useAuth();
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  // Active dashboard view tab
  const [activeTab, setActiveTab] = useState<'cards' | 'purchased' | 'transactions'>('cards');

  const [cards, setCards] = useState<Card[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [demoTemplate, setDemoTemplate] = useState<Template | null>(null);

  // Purchased templates computation
  const purchasedTemplates = useMemo(() => {
    return templates.filter((tpl) => isTemplateOwned(tpl) && !tpl.isFree && (tpl.price || 0) > 0);
  }, [templates, isTemplateOwned]);
  const [loading, setLoading] = useState(true);

  // User transactions state
  const [allUserTransactions, setAllUserTransactions] = useState<TransactionItem[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [isRefreshingTransactions, setIsRefreshingTransactions] = useState(false);
  const [txStatusFilter, setTxStatusFilter] = useState<string>('ALL');
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(8);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // User transaction counts for each status tab
  const txCounts = useMemo(() => {
    return {
      ALL: allUserTransactions.length,
      PENDING: allUserTransactions.filter((t) => t.status === 'PENDING').length,
      SUCCESS: allUserTransactions.filter((t) => t.status === 'SUCCESS').length,
      CANCELLED: allUserTransactions.filter((t) => ['CANCELLED', 'FAILED', 'EXPIRED'].includes(t.status)).length,
    };
  }, [allUserTransactions]);

  // Fast client-side filtering for user transactions
  const filteredUserTransactions = useMemo(() => {
    return allUserTransactions.filter((item) => {
      if (txStatusFilter === 'PENDING' && item.status !== 'PENDING') return false;
      if (txStatusFilter === 'SUCCESS' && item.status !== 'SUCCESS') return false;
      if (txStatusFilter === 'CANCELLED' && !['CANCELLED', 'FAILED', 'EXPIRED'].includes(item.status)) return false;
      return true;
    });
  }, [allUserTransactions, txStatusFilter]);

  const txTotalPages = Math.ceil(filteredUserTransactions.length / txPageSize) || 1;
  const txTotalElements = filteredUserTransactions.length;
  const pagedUserTransactions = useMemo(() => {
    const start = (txPage - 1) * txPageSize;
    return filteredUserTransactions.slice(start, start + txPageSize);
  }, [filteredUserTransactions, txPage, txPageSize]);

  // Pagination for user cards
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Pagination for purchased templates
  const [purchasedPage, setPurchasedPage] = useState(1);
  const [purchasedPageSize, setPurchasedPageSize] = useState(6);
  const totalPurchasedPages = Math.ceil(purchasedTemplates.length / purchasedPageSize) || 1;
  const pagedPurchasedTemplates = purchasedTemplates.slice(
    (purchasedPage - 1) * purchasedPageSize,
    purchasedPage * purchasedPageSize
  );

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

  // Editor states
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedTemplateForNew, setSelectedTemplateForNew] = useState<Template | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // QR Modal
  const [qrModalData, setQrModalData] = useState<{ title: string; publicUrl: string; qrCodeBase64: string } | null>(null);

  // 2FA Setup Modal
  const [show2FASetup, setShow2FASetup] = useState(false);

  // Set Password Modal for Google users
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);

  const fetchCards = async () => {
    try {
      const res = await api.getMyCards();
      if (res.success && res.data) {
        setCards(res.data);
      }
    } catch (err) {
      console.error('Failed to load user cards', err);
      toast.error('Lỗi khi tải danh sách thiệp');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshingTransactions(true);
    } else {
      setLoadingTransactions(true);
    }
    try {
      const res = await api.getMyTransactions({
        page: 0,
        size: 500,
      });
      if (res.success && res.data) {
        setAllUserTransactions(res.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoadingTransactions(false);
      setIsRefreshingTransactions(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.getTemplates();
      if (res.success && res.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error('Failed to load templates', err);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchTemplates();
    fetchUserTransactions();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.info('Đã sao chép mã đơn!', code);
  };

  const handleCancelUserTransaction = (orderCode: string) => {
    confirmModal({
      title: 'Hủy Giao Dịch Nạp Tiền',
      message: `Bạn có chắc chắn muốn hủy đơn thanh toán mã "${orderCode}" không?`,
      confirmText: 'Xác Nhận Hủy Đơn',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.cancelUserPaymentOrder(orderCode);
          toast.info('Đã hủy đơn nạp tiền');
          fetchUserTransactions();
        } catch (err: any) {
          toast.error('Không thể hủy giao dịch', err.response?.data?.message);
        }
      },
    });
  };

  const handleDeleteCard = async (id: string) => {
    confirmModal({
      title: 'Xóa Thiệp Mời',
      message: 'Bạn có chắc chắn muốn xóa thiệp mời này?\nNgười nhận sẽ không thể truy cập vào liên kết thiệp này nữa.',
      confirmText: 'Xóa Thiệp',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteCard(id);
          setCards((prev) => prev.filter((c) => c.id !== id));
          toast.success('Đã xóa thiệp mời thành công!');
        } catch (err) {
          toast.error('Không thể xóa thiệp');
        }
      },
    });
  };

  // If in editor mode
  if (editingCard) {
    return (
      <CardEditor
        initialCard={editingCard}
        selectedTemplate={editingCard.template}
        onSaved={() => {
          setEditingCard(null);
          fetchCards();
        }}
        onCancel={() => setEditingCard(null)}
      />
    );
  }

  if (selectedTemplateForNew) {
    return (
      <CardEditor
        selectedTemplate={selectedTemplateForNew}
        onSaved={() => {
          setSelectedTemplateForNew(null);
          fetchCards();
        }}
        onCancel={() => setSelectedTemplateForNew(null)}
      />
    );
  }

  const totalViews = cards.reduce((acc, c) => acc + (c.viewCount || 0), 0);
  const totalWishes = cards.reduce((acc, c) => acc + (c.wishesCount || 0), 0);

  // Sliced cards for current page
  const totalPages = Math.ceil(cards.length / pageSize) || 1;
  const pagedCards = cards.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={`min-h-screen py-10 transition-colors ${
      isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#faf8f5] text-stone-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* User Greeting & Stats Bar */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          isDark ? 'bg-[#121824] border-slate-800/80' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl border-2 border-orange-500/40 object-cover"
            />
            <div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold flex items-center gap-2">
                Xin chào, {user?.fullName || user?.email}! ✨
              </h1>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Không gian quản lý và cá nhân hóa thiệp mời của bạn
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className="text-lg font-black text-orange-500 block">{cards.length}</span>
              <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Thiệp đã tạo
              </span>
            </div>

            <div className={`px-4 py-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className="text-lg font-black text-amber-500 block">{totalViews}</span>
              <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Lượt xem
              </span>
            </div>

            <div className={`px-4 py-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className="text-lg font-black text-amber-500 block">{totalWishes}</span>
              <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Lời chúc
              </span>
            </div>

            <button
              onClick={() => setShow2FASetup(true)}
              className={`p-3 rounded-2xl border transition flex items-center gap-2 text-xs font-bold ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
              title="Cài đặt bảo mật 2 bước qua Gmail (2FA)"
            >
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">2FA Gmail</span>
            </button>
          </div>
        </div>

        {/* Google User Password Setup Reminder Banner */}
        {user?.hasPassword === false && (
          <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade ${
            isDark
              ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-amber-500/30 text-amber-200'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-900 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-editorial text-base font-bold">Bạn đang đăng nhập bằng tài khoản Google</h4>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                  Tài khoản của bạn chưa có mật khẩu trực tiếp. Hãy thiết lập mật khẩu để có thể đăng nhập bằng cả Email & Mật khẩu khi cần.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSetPasswordModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition shrink-0 self-start sm:self-auto"
            >
              Thiết Lập Mật Khẩu Ngay
            </button>
          </div>
        )}

        {/* Tabs Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Tab 1: Thiệp Mời Của Tôi */}
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'cards'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Thiệp Mời Của Tôi</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'cards' ? 'bg-white/20 text-white' : 'bg-orange-500/15 text-orange-500'
              }`}>
                {cards.length}
              </span>
            </button>

            {/* Tab 2: Thiệp Đã Sở Hữu */}
            <button
              onClick={() => setActiveTab('purchased')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'purchased'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Thiệp Đã Sở Hữu</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'purchased' ? 'bg-white/20 text-white' : 'bg-amber-500/15 text-amber-400'
              }`}>
                {purchasedTemplates.length}
              </span>
            </button>

            {/* Tab 3: Lịch Sử Giao Dịch */}
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'transactions'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Lịch Sử Giao Dịch</span>
              {txTotalElements > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'transactions' ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-500'
                }`}>
                  {txTotalElements}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'cards' ? (
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="px-5 py-2.5 rounded-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> Tạo Thiệp Mới
            </button>
          ) : activeTab === 'purchased' ? (
            <Link
              to="/templates"
              className="px-5 py-2.5 rounded-2xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <Sparkles className="w-4 h-4" /> + Mua Thêm Mẫu Mới
            </Link>
          ) : (
            <Link
              to="/payment"
              className="px-5 py-2.5 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:brightness-105 active:scale-95 transition flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> + Nạp Tiền Thêm
            </Link>
          )}
        </div>

        {/* TAB 1: CARDS GRID */}
        {activeTab === 'cards' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border space-y-4 ${
                isDark ? 'bg-[#121824]/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
              }`}>
                <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-editorial text-xl font-bold">Bạn chưa tạo thiệp mời nào</h3>
                <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Hãy chọn một mẫu template có sẵn và bắt đầu tạo tấm thiệp ý nghĩa đầu tiên của bạn!
                </p>
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="px-6 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-xs shadow-lg transition"
                >
                  Chọn Mẫu Ngay
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pagedCards.map((card) => (
                    <div
                      key={card.id}
                      className={`rounded-3xl border shadow-lg overflow-hidden flex flex-col justify-between transition-all group ${
                        isDark
                          ? 'bg-[#121824] border-slate-800/80 hover:border-slate-700'
                          : 'bg-white border-stone-200 hover:border-orange-300'
                      }`}
                    >
                      {/* Thumbnail / Header */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                        <img
                          src={card.template.thumbnailUrl}
                          alt={card.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                            {card.template.title}
                          </span>
                          {card.hasPasscode && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Khóa
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-5 space-y-3 flex-1">
                        <h3 className="font-editorial text-lg font-bold truncate">{card.title}</h3>

                        <div className={`flex items-center gap-4 text-xs ${
                          isDark ? 'text-slate-400' : 'text-stone-500'
                        }`}>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-orange-500" /> {card.viewCount} lượt xem
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-amber-500" /> {card.wishesCount} lời chúc
                          </span>
                        </div>

                        <div className={`p-2.5 rounded-xl border text-[11px] font-mono truncate ${
                          isDark
                            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}>
                          {card.publicUrl}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className={`p-4 border-t flex items-center justify-between gap-2 ${
                        isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-stone-50/70 border-stone-100'
                      }`}>
                        <button
                          onClick={() =>
                            setQrModalData({
                              title: card.title,
                              publicUrl: card.publicUrl,
                              qrCodeBase64: card.qrCodeBase64,
                            })
                          }
                          className={`p-2 rounded-xl transition ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-orange-400'
                              : 'bg-white hover:bg-stone-100 text-orange-600 border border-stone-200'
                          }`}
                          title="Xem mã QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <a
                          href={card.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-2 rounded-xl transition ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                          title="Mở link public"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setEditingCard(card)}
                          className="flex-1 py-2 px-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-500 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Chỉnh Sửa
                        </button>

                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className={`p-2 rounded-xl transition ${
                            isDark
                              ? 'bg-slate-800 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400'
                              : 'bg-white hover:bg-orange-50 text-stone-400 hover:text-orange-600 border border-stone-200'
                          }`}
                          title="Xóa thiệp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination for Cards */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={cards.length}
                  itemsPerPage={pageSize}
                  onPageChange={(p) => setPage(p)}
                  onItemsPerPageChange={(sz) => {
                    setPageSize(sz);
                    setPage(1);
                  }}
                  labelItem="thiệp mời"
                />
              </div>
            )}
          </>
        )}

        {/* TAB 2: PURCHASED TEMPLATES */}
        {activeTab === 'purchased' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Các Mẫu Thiệp Bạn Đã Sở Hữu
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Các mẫu thiệp cao cấp bạn đã mở khóa. Bạn có thể sử dụng để tạo và xuất bản không giới hạn thiệp mời.
                </p>
              </div>

              <div className="text-right">
                <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Tổng đã sở hữu:</span>
                <strong className="text-base sm:text-lg font-bold text-amber-400 font-mono">
                  {purchasedTemplates.length} Mẫu
                </strong>
              </div>
            </div>

            {purchasedTemplates.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border space-y-4 ${
                isDark ? 'bg-[#121824]/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
              }`}>
                <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="font-editorial text-xl font-bold">Bạn chưa sở hữu mẫu thiệp trả phí nào</h4>
                <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Khám phá bộ sưu tập mẫu thiệp cao cấp độc quyền, mở khóa một lần và sử dụng mãi mãi để tạo nên những tấm thiệp tuyệt đẹp!
                </p>
                <div className="pt-2">
                  <Link
                    to="/templates"
                    className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-xs shadow-lg transition hover:brightness-105 active:scale-95"
                  >
                    Khám Phá Mẫu Thiệp Ngay <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pagedPurchasedTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className={`rounded-3xl border shadow-lg overflow-hidden flex flex-col justify-between transition-all group ${
                        isDark
                          ? 'bg-[#121824] border-slate-800/80 hover:border-slate-700'
                          : 'bg-white border-stone-200 hover:border-orange-300'
                      }`}
                    >
                      {/* Thumbnail / Header */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                        <img
                          src={tpl.thumbnailUrl}
                          alt={tpl.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                            {getCategoryLabel(tpl.category)}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Đã Sở Hữu
                          </span>
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="p-5 space-y-3 flex-1">
                        <h3 className="font-editorial text-lg font-bold truncate group-hover:text-orange-500 transition-colors">
                          {tpl.title}
                        </h3>

                        <div className={`flex items-center gap-4 text-xs ${
                          isDark ? 'text-slate-400' : 'text-stone-500'
                        }`}>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mẫu Thiệp Cao Cấp
                          </span>
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Bản Quyền Vĩnh Viễn
                          </span>
                        </div>

                        <div className={`p-2.5 rounded-xl border text-[11px] font-mono truncate flex items-center justify-between ${
                          isDark
                            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}>
                          <span className="truncate opacity-75">Giá mở khóa:</span>
                          <strong className="text-amber-400 shrink-0 font-bold">
                            {tpl.price ? tpl.price.toLocaleString('vi-VN') + ' đ' : 'Miễn phí'}
                          </strong>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className={`p-4 border-t flex items-center justify-between gap-2 ${
                        isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-stone-50/70 border-stone-100'
                      }`}>
                        <button
                          onClick={() => setDemoTemplate(tpl)}
                          className={`p-2 rounded-xl transition flex items-center gap-1.5 px-3 text-xs font-semibold ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                          title="Xem thử mẫu thiệp"
                        >
                          <Eye className="w-4 h-4 text-orange-500" />
                          <span>Xem Thử</span>
                        </button>

                        <button
                          onClick={() => navigate(`/editor?templateId=${tpl.id}`)}
                          className="flex-1 py-2 px-4 rounded-xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-1.5"
                        >
                          <span>Tạo Thiệp Mới</span>
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination for Purchased Templates */}
                {totalPurchasedPages > 1 && (
                  <Pagination
                    currentPage={purchasedPage}
                    totalPages={totalPurchasedPages}
                    totalItems={purchasedTemplates.length}
                    itemsPerPage={purchasedPageSize}
                    onPageChange={(p) => setPurchasedPage(p)}
                    onItemsPerPageChange={(sz) => {
                      setPurchasedPageSize(sz);
                      setPurchasedPage(1);
                    }}
                    labelItem="mẫu thiệp"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER TRANSACTIONS HISTORY */}
        {activeTab === 'transactions' && (
          <div className={`p-6 sm:p-8 rounded-3xl border ${
            isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-editorial text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" /> Lịch Sử Giao Dịch & Biến Động Số Dư
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Theo dõi chi tiết các giao dịch nạp tiền, mua thiệp và biến động số dư Ví KD
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Số dư Ví KD:</span>
                  <strong className="text-base sm:text-lg font-bold text-orange-500 font-mono">
                    {user?.creditsBalance?.toLocaleString('vi-VN')} đ
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => fetchUserTransactions(true)}
                  disabled={loadingTransactions || isRefreshingTransactions}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 shadow-sm hover:border-stone-300'
                  }`}
                  title="Tải lại giao dịch từ server"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTransactions ? 'animate-spin text-emerald-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Status Filter Tabs (Instant client-side filter) */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {[
                { id: 'ALL', label: 'Tất Cả', icon: Filter, count: txCounts.ALL },
                { id: 'PENDING', label: 'Đang Chờ Quét', icon: Clock, count: txCounts.PENDING },
                { id: 'SUCCESS', label: 'Đã Hoàn Tất', icon: CheckCircle2, count: txCounts.SUCCESS },
                { id: 'CANCELLED', label: 'Đã Hủy', icon: XCircle, count: txCounts.CANCELLED },
              ].map((tab) => {
                const isActive = txStatusFilter === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setTxStatusFilter(tab.id);
                      setTxPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : isDark
                        ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {loadingTransactions ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-bold uppercase text-[10px] ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-stone-200 text-stone-500'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">Mã Đơn</th>
                      <th className="py-3 px-4">Số Tiền</th>
                      <th className="py-3 px-4">Phương Thức</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4">Thời Gian Tạo</th>
                      <th className="py-3 px-4 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <TableRowSkeleton rows={5} cols={6} />
                </table>
              </div>
            ) : filteredUserTransactions.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h4 className="font-editorial text-base font-bold">
                  {allUserTransactions.length === 0 ? 'Chưa có giao dịch nào' : 'Không có giao dịch nào trong mục này'}
                </h4>
                <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  {allUserTransactions.length === 0
                    ? 'Nạp tiền ngay để mở khóa không giới hạn các mẫu thiệp Pro và tính năng cao cấp!'
                    : 'Hãy chọn tab khác để xem các giao dịch liên quan.'}
                </p>
                {allUserTransactions.length === 0 && (
                  <Link
                    to="/payment"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition"
                  >
                    Nạp Tiền Ngay <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-bold uppercase text-[10px] ${
                      isDark ? 'border-slate-800 text-slate-400' : 'border-stone-200 text-stone-500'
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Mã Đơn</th>
                        <th className="py-3 px-4">Số Tiền</th>
                        <th className="py-3 px-4">Phương Thức</th>
                        <th className="py-3 px-4">Trạng Thái</th>
                        <th className="py-3 px-4">Thời Gian Tạo</th>
                        <th className="py-3 px-4 text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-stone-100'}`}>
                      {pagedUserTransactions.map((tx) => {
                        const isPurchase = tx.type === 'CARD_PURCHASE' || tx.type === 'TEMPLATE_PURCHASE' || tx.orderCode?.startsWith('BUY');
                        const isWithdrawal = tx.type === 'WITHDRAWAL' || tx.orderCode?.startsWith('WDR');
                        const isRefund = tx.type === 'REFUND' || tx.orderCode?.startsWith('REF');
                        const isExpense = (isPurchase || isWithdrawal) && !isRefund;

                        return (
                          <tr
                            key={tx.id}
                            className={`transition ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-stone-50'}`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-amber-500">
                                <span>{tx.orderCode}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(tx.orderCode)}
                                  className="p-1 hover:bg-amber-500/20 rounded text-slate-400 hover:text-amber-500 transition"
                                  title="Sao chép mã đơn"
                                >
                                  {copiedCode === tx.orderCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="space-y-0.5">
                                {isExpense ? (
                                  <span className="font-bold font-mono text-sm text-orange-500">
                                    -{tx.amount.toLocaleString('vi-VN')} đ
                                  </span>
                                ) : (
                                  <span className="font-bold font-mono text-sm text-emerald-500">
                                    +{tx.amount.toLocaleString('vi-VN')} đ
                                  </span>
                                )}
                                {!isExpense && !isRefund && tx.bonusAmount && tx.bonusAmount > 0 ? (
                                  <div className="text-[10px] font-semibold text-amber-400">
                                    🎁 Tặng +{tx.bonusAmount.toLocaleString('vi-VN')} đ
                                  </div>
                                ) : null}
                                {isRefund && (
                                  <div className="text-[10px] font-semibold text-purple-400">
                                    Hoàn lại tiền (Rút bị từ chối)
                                  </div>
                                )}
                                {tx.status === 'UNDERPAID' && (
                                  <div className="text-[10px] text-amber-400 font-medium">
                                    Thực nhận: {tx.actualAmount?.toLocaleString('vi-VN')} đ (Thiếu: {tx.missingAmount?.toLocaleString('vi-VN')} đ)
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isPurchase
                                  ? isDark ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : isWithdrawal
                                  ? isDark ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : isRefund
                                  ? isDark ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : isDark ? 'bg-slate-800 text-slate-300' : 'bg-stone-100 text-stone-700'
                              }`}>
                                {isPurchase ? 'VÍ KD' : isWithdrawal ? 'NGÂN HÀNG' : isRefund ? 'VÍ KD' : (tx.paymentMethod || 'VIETQR')}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              {isPurchase && tx.status === 'SUCCESS' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  <ShoppingBag className="w-3 h-3" /> Mua Thiệp
                                </span>
                              ) : isWithdrawal ? (
                                tx.status === 'SUCCESS' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> Đã Rút Tiền
                                  </span>
                                ) : tx.status === 'CANCELLED' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                    <XCircle className="w-3 h-3" /> Đã Từ Chối
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                    <Clock className="w-3 h-3" /> Chờ ADMIN Duyệt
                                  </span>
                                )
                              ) : isRefund ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Hoàn Tiền Thành Công
                                </span>
                              ) : tx.status === 'SUCCESS' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Đã Nạp Tiền
                                </span>
                              ) : tx.status === 'UNDERPAID' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  ⚠️ Chuyển Thiếu
                                </span>
                              ) : tx.status === 'SETTLED_TO_WALLET' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                  💼 Đã Nạp Vào Ví KD
                                </span>
                              ) : tx.status === 'PENDING' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                  <Clock className="w-3 h-3" /> Đang Chờ Quét
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                  <XCircle className="w-3 h-3" /> Đã Hủy
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-[11px] opacity-70 font-mono">
                              {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {isWithdrawal ? (
                                tx.status === 'PENDING' ? (
                                  <span className="text-[11px] text-amber-400 font-semibold italic">
                                    Chờ ADMIN xác nhận
                                  </span>
                                ) : tx.status === 'CANCELLED' ? (
                                  <span className="text-[11px] text-red-400 font-semibold">
                                    Đã hoàn lại tiền
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-emerald-500 font-semibold">
                                    Đã chuyển tiền
                                  </span>
                                )
                              ) : isRefund ? (
                                <span className="text-[11px] text-purple-400 font-semibold">
                                  Đã cộng ví
                                </span>
                              ) : tx.status === 'PENDING' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Link
                                    to={`/payment?orderCode=${tx.orderCode}`}
                                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition inline-flex items-center gap-1 active:scale-95"
                                  >
                                    Thanh Toán Ngay →
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelUserTransaction(tx.orderCode)}
                                    className={`p-1.5 rounded-xl border transition ${
                                      isDark
                                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                        : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                                    }`}
                                    title="Hủy đơn này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : tx.status === 'CANCELLED' ? (
                                <span className="text-[11px] text-slate-400 font-medium">
                                  Đã Hủy
                                </span>
                              ) : isPurchase ? (
                                <span className="text-[11px] text-purple-400 font-semibold inline-flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-purple-400" /> Mở Khóa Mẫu
                                </span>
                              ) : (
                                <span className="text-[11px] text-emerald-500 font-semibold">
                                  ✓ Hoàn tất
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={txPage}
                  totalPages={txTotalPages}
                  totalItems={txTotalElements}
                  itemsPerPage={txPageSize}
                  onPageChange={(p) => setTxPage(p)}
                  onItemsPerPageChange={(sz) => {
                    setTxPageSize(sz);
                    setTxPage(1);
                  }}
                  pageSizeOptions={[8, 15, 30]}
                  labelItem="giao dịch"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`max-w-4xl w-full border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto ${
            isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isDark ? 'border-slate-800' : 'border-stone-200'
            }`}>
              <div>
                <h3 className="font-editorial text-2xl font-bold">Chọn Mẫu Template Để Bắt Đầu</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Chọn mẫu thiệp phù hợp với nhu cầu của bạn
                </p>
              </div>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setShowTemplateSelector(false);
                    setSelectedTemplateForNew(tpl);
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all hover:scale-102 flex flex-col justify-between group ${
                    isDark
                      ? 'bg-slate-900/80 border-slate-800 hover:border-orange-500/60'
                      : 'bg-stone-50 border-stone-200 hover:border-orange-300'
                  }`}
                >
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 mb-3">
                    <img
                      src={tpl.thumbnailUrl}
                      alt={tpl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div>
                    <h4 className="font-editorial text-base font-bold group-hover:text-orange-500 transition">
                      {tpl.title}
                    </h4>
                    <p className={`text-xs line-clamp-2 mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                      {tpl.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500">
                      {tpl.isFree ? 'Miễn phí' : `${tpl.price.toLocaleString('vi-VN')} đ`}
                    </span>
                    <span className="text-xs font-bold text-orange-500 group-hover:underline">
                      Chọn Mẫu →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModalData && (
        <QrCodeModal
          isOpen={!!qrModalData}
          onClose={() => setQrModalData(null)}
          title={qrModalData.title}
          publicUrl={qrModalData.publicUrl}
          qrCodeBase64={qrModalData.qrCodeBase64}
        />
      )}

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <AdminTwoFactorModal
          isOpen={show2FASetup}
          onClose={() => {
            setShow2FASetup(false);
            refreshUser();
          }}
        />
      )}

      {/* Set Password Modal for Google Users */}
      <SetPasswordModal
        isOpen={showSetPasswordModal}
        onClose={() => setShowSetPasswordModal(false)}
        onSuccess={() => {
          setShowSetPasswordModal(false);
          refreshUser();
        }}
      />

      {/* Live Demo Preview Modal */}
      {demoTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm sm:max-w-md h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-editorial text-sm font-bold text-white truncate max-w-[200px]">
                  {demoTemplate.title}
                </h4>
              </div>
              <button
                onClick={() => setDemoTemplate(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto relative">
              <TemplateRenderer
                slug={demoTemplate.slug}
                templateType={demoTemplate.templateType}
                customHtml={demoTemplate.customHtml}
                customCss={demoTemplate.customCss}
                customJs={demoTemplate.customJs}
                customData={demoTemplate.defaultConfig}
                title={demoTemplate.title}
                wishes={[]}
                isPreview={true}
              />
            </div>

            <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setDemoTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const tpl = demoTemplate;
                  setDemoTemplate(null);
                  navigate(`/editor?templateId=${tpl.id}`);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg active:scale-95 transition flex items-center gap-1.5"
              >
                Tạo Thiệp Mới <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
