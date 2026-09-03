import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { TransactionItem } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  X,
  Copy,
  DollarSign,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

export const AdminTransactionsPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminTransactions({
        status: statusFilter,
        search,
        page: page - 1,
        size: pageSize,
      });

      if (res.success && res.data) {
        setTransactions(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách giao dịch', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, search, page, pageSize]);

  const handleApprove = (item: TransactionItem) => {
    confirmModal({
      title: 'Duyệt Nạp Tiền Thủ Công',
      message: `Bạn có chắc chắn muốn duyệt nạp tiền cho đơn "${item.orderCode}"?\n\nTài khoản khách hàng ${item.userEmail || 'người dùng'} sẽ được cộng +${item.amount.toLocaleString('vi-VN')} đ ngay lập tức.`,
      confirmText: '✅ Duyệt Nạp Tiền',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await api.approveAdminTransaction(item.orderCode);
          if (res.success) {
            toast.success(`Đã duyệt đơn ${item.orderCode} thành công!`, `Đã nạp +${item.amount.toLocaleString('vi-VN')} đ cho ${item.userEmail}`);
            fetchTransactions();
          }
        } catch (err: any) {
          toast.error('Không thể duyệt đơn', err.response?.data?.message);
        }
      },
    });
  };

  const handleCancel = (item: TransactionItem) => {
    confirmModal({
      title: 'Hủy Giao Dịch Nạp Tiền',
      message: `Bạn có chắc chắn muốn hủy đơn giao dịch "${item.orderCode}"?\nĐơn sẽ chuyển sang trạng thái ĐÃ HỦY.`,
      confirmText: 'Hủy Đơn Này',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.cancelAdminTransaction(item.orderCode);
          if (res.success) {
            toast.success(`Đã hủy đơn ${item.orderCode}!`);
            fetchTransactions();
          }
        } catch (err: any) {
          toast.error('Không thể hủy đơn', err.response?.data?.message);
        }
      },
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.info('Đã sao chép mã đơn', text);
  };

  // Metrics summary
  const totalAmount = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-rose-500" /> Quản Lý Giao Dịch & Dòng Tiền
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Kiểm soát biến động số dư VietQR, webhook SePay tự động và duyệt nạp tiền thủ công
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo mã đơn INV..., email, tên..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white focus:border-rose-500'
                : 'bg-white border-stone-200 text-stone-900 focus:border-rose-500 shadow-sm'
            }`}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'Tất Cả', icon: Filter },
          { id: 'PENDING', label: 'Đang Chờ Quét', icon: Clock },
          { id: 'SUCCESS', label: 'Đã Hoàn Tất', icon: CheckCircle2 },
          { id: 'CANCELLED', label: 'Đã Hủy', icon: XCircle },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Transactions Table */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        {loading ? (
          <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Đang tải dữ liệu giao dịch...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <CreditCard className="w-10 h-10 mx-auto opacity-30 text-rose-500" />
            <h4 className="font-editorial text-base font-bold">Không tìm thấy giao dịch nào</h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Chưa có đơn nạp tiền nào khớp với tiêu chí tìm kiếm hiện tại.
            </p>
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
                    <th className="py-3 px-4">Khách Hàng</th>
                    <th className="py-3 px-4">Loại GD</th>
                    <th className="py-3 px-4">Số Tiền & Thưởng</th>
                    <th className="py-3 px-4">Phương Thức</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4">Thời Gian Tạo</th>
                    <th className="py-3 px-4 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-stone-100'}`}>
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      className={`transition ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-stone-50'}`}
                    >
                      {/* Order Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-amber-500">
                          <span>{t.orderCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(t.orderCode)}
                            className="p-1 hover:bg-amber-500/20 rounded text-slate-400 hover:text-amber-500 transition"
                            title="Sao chép mã đơn"
                          >
                            {copiedCode === t.orderCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={t.userAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.userEmail || 'user'}`}
                            alt="Avatar"
                            className="w-7 h-7 rounded-xl object-cover border border-rose-500/30 shrink-0"
                          />
                          <div>
                            <p className="font-bold">{t.userFullName || 'Khách hàng'}</p>
                            <p className="text-[10px] opacity-70 font-mono">{t.userEmail || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Transaction Type */}
                      <td className="py-3 px-4">
                        {t.type === 'CARD_PURCHASE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/20">
                            Mua Thiệp
                          </span>
                        ) : t.type === 'WITHDRAWAL' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            Rút Tiền
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            Nạp Tiền
                          </span>
                        )}
                      </td>

                      {/* Amount & Bonus */}
                      <td className="py-3 px-4">
                        {(() => {
                          const isExpense = t.type === 'CARD_PURCHASE' || t.type === 'WITHDRAWAL' || t.orderCode?.startsWith('BUY') || t.orderCode?.startsWith('WDR');
                          return (
                            <div className="space-y-0.5">
                              {isExpense ? (
                                <span className="font-bold font-mono text-sm text-rose-400">
                                  -{t.amount.toLocaleString('vi-VN')} đ
                                </span>
                              ) : (
                                <span className="font-bold font-mono text-sm text-emerald-500">
                                  +{t.amount.toLocaleString('vi-VN')} đ
                                </span>
                              )}
                              {!isExpense && t.bonusAmount && t.bonusAmount > 0 ? (
                                <div className="text-[10px] font-semibold text-pink-400 flex items-center gap-1">
                                  <span>🎁 Tặng +{t.bonusAmount.toLocaleString('vi-VN')} đ</span>
                                </div>
                              ) : null}
                              {t.status === 'UNDERPAID' && (
                                <div className="text-[10px] text-amber-400 font-medium">
                                  Thực nhận: {t.actualAmount?.toLocaleString('vi-VN')} đ (Thiếu: {t.missingAmount?.toLocaleString('vi-VN')} đ)
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {t.paymentMethod || 'VIETQR'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {t.status === 'SUCCESS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Thành Công
                          </span>
                        )}
                        {t.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                            <Clock className="w-3 h-3" /> Đang Chờ Quét
                          </span>
                        )}
                        {t.status === 'UNDERPAID' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ⚠️ Chuyển Thiếu
                          </span>
                        )}
                        {t.status === 'SETTLED_TO_WALLET' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            💼 Đã Nạp Vào Ví
                          </span>
                        )}
                        {t.status === 'CANCELLED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <XCircle className="w-3 h-3" /> Đã Hủy
                          </span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 text-[11px] opacity-70 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleString('vi-VN')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-2">
                        {t.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApprove(t)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-[11px] shadow-sm active:scale-95 transition inline-flex items-center gap-1"
                              title="Duyệt nạp tiền ngay cho khách hàng"
                            >
                              <Check className="w-3 h-3" /> Duyệt
                            </button>
                            <button
                              onClick={() => handleCancel(t)}
                              className={`p-1.5 rounded-xl transition ${
                                isDark
                                  ? 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400'
                                  : 'bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200'
                              }`}
                              title="Hủy đơn giao dịch"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-semibold opacity-40 italic">
                            Đã xử lý
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalElements}
              itemsPerPage={pageSize}
              onPageChange={(p) => setPage(p)}
              onItemsPerPageChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
              labelItem="giao dịch"
            />
          </div>
        )}
      </div>
    </div>
  );
};
