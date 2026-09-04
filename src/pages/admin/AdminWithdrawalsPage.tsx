import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { WithdrawalItem } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import {
  ArrowDownToLine,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  X,
  Copy,
  ExternalLink,
  QrCode,
  AlertTriangle,
  CreditCard,
  Building,
  User as UserIcon,
} from 'lucide-react';

export const AdminWithdrawalsPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [copiedAcc, setCopiedAcc] = useState<string | null>(null);

  // QR Modal for fast payout
  const [activeQrPayout, setActiveQrPayout] = useState<WithdrawalItem | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminWithdrawals({
        status: statusFilter,
        search,
        page: page - 1,
        size: pageSize,
      });

      if (res.success && res.data) {
        setWithdrawals(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải danh sách yêu cầu rút tiền', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter, search, page, pageSize]);

  const handleApprove = (item: WithdrawalItem) => {
    confirmModal({
      title: 'Xác Nhận Đã Chuyển Tiền Cho Khách',
      message: `Bạn đã thực hiện chuyển khoản ${item.amount.toLocaleString('vi-VN')} đ đến tài khoản:\n\n• Ngân hàng: ${item.bankName}\n• STK: ${item.accountNumber}\n• Tên: ${item.accountHolder}\n\nSau khi bấm xác nhận, đơn sẽ được đánh dấu HOÀN THÀNH.`,
      confirmText: '✅ Đã Chuyển Khoản & Duyệt',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await api.approveAdminWithdrawal(item.id);
          if (res.success) {
            toast.success(`Đã duyệt đơn rút tiền của ${item.accountHolder}!`);
            fetchWithdrawals();
          }
        } catch (err: any) {
          toast.error('Không thể duyệt đơn', err.response?.data?.message);
        }
      },
    });
  };

  const handleReject = (item: WithdrawalItem) => {
    const reason = window.prompt('Nhập lý do từ chối (Tiền sẽ được hoàn trả lại vào Ví KD người dùng):', 'Thông tin số tài khoản hoặc ngân hàng không chính xác');
    if (!reason) return;

    confirmModal({
      title: 'Từ Chối Yêu Cầu Rút Tiền',
      message: `Bạn có chắc chắn từ chối yêu cầu rút ${item.amount.toLocaleString('vi-VN')} đ của "${item.accountHolder}"?\n\nSố tiền này sẽ được HOÀN TRẢ lại vào Ví KD của người dùng.`,
      confirmText: '❌ Từ Chối & Hoàn Tiền',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.rejectAdminWithdrawal(item.id, reason);
          if (res.success) {
            toast.success(`Đã từ chối và hoàn tiền cho khách hàng!`);
            fetchWithdrawals();
          }
        } catch (err: any) {
          toast.error('Không thể từ chối đơn', err.response?.data?.message);
        }
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAcc(text);
    toast.success('Đã sao chép STK!', text);
    setTimeout(() => setCopiedAcc(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ArrowDownToLine className="w-7 h-7 text-orange-500" /> Quản Lý Yêu Cầu Rút Tiền
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Duyệt yêu cầu rút tiền của khách hàng. Quét mã QR chuyển khoản nhanh và xác nhận hoàn tất.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-center ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { key: 'ALL', label: 'Tất Cả' },
            { key: 'PENDING', label: 'Chờ Duyệt' },
            { key: 'APPROVED', label: 'Đã Chuyển' },
            { key: 'REJECTED', label: 'Đã Từ Chối' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo Tên, STK, Email..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
                : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
            }`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
              <tr>
                <th className="py-3.5 px-4 font-semibold">Khách Hàng</th>
                <th className="py-3.5 px-4 font-semibold">Số Tiền Rút</th>
                <th className="py-3.5 px-4 font-semibold">Thông Tin Ngân Hàng</th>
                <th className="py-3.5 px-4 font-semibold">Trạng Thái</th>
                <th className="py-3.5 px-4 font-semibold">Thời Gian</th>
                <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            {loading ? (
              <TableRowSkeleton rows={5} cols={6} />
            ) : (
              <tbody className="divide-y divide-slate-800/40">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      Không tìm thấy yêu cầu rút tiền nào phù hợp.
                    </td>
                  </tr>
                ) : (
                withdrawals.map((item) => (
                  <tr key={item.id} className={`transition hover:${isDark ? 'bg-slate-850/40' : 'bg-stone-50/80'}`}>
                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400 shrink-0">
                          {item.accountHolder?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold">{item.accountHolder}</p>
                          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>{item.userEmail || 'Chưa có email'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sm text-emerald-400">
                        {item.amount.toLocaleString('vi-VN')} đ
                      </span>
                    </td>

                    {/* Bank Info */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-orange-400">
                          <Building className="w-3.5 h-3.5" />
                          <span>{item.bankName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                            {item.accountNumber}
                          </span>
                          <button
                            onClick={() => copyToClipboard(item.accountNumber)}
                            title="Sao chép STK"
                            className="p-1 hover:text-orange-400 transition"
                          >
                            {copiedAcc === item.accountNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                          Chủ TK: {item.accountHolder}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {item.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Đã Chuyển
                        </span>
                      ) : item.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Chờ Duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/20">
                          <XCircle className="w-3 h-3" /> Đã Từ Chối
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveQrPayout(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition"
                            title="Quét QR Chuyển Khoản Nhanh"
                          >
                            <QrCode className="w-3.5 h-3.5" /> Quét QR
                          </button>
                          <button
                            onClick={() => handleApprove(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-emerald-500/20"
                          >
                            <Check className="w-3.5 h-3.5" /> Đã Chuyển
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/30 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Từ Chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          {item.adminNote || 'Đã hoàn tất'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800/40">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalElements}
              itemsPerPage={pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Quick QR Payout Modal */}
      {activeQrPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-editorial text-lg font-bold flex items-center gap-2 text-orange-500">
                <QrCode className="w-5 h-5" /> Quét QR Chuyển Khoản Cho Khách
              </h3>
              <button
                onClick={() => setActiveQrPayout(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <p className="text-xs text-slate-400">
                Mở app ngân hàng của bạn và quét mã QR dưới đây để điền sẵn STK, số tiền và nội dung chuyển:
              </p>

              <div className="p-3 bg-white rounded-2xl inline-block shadow-lg border border-slate-200">
                <img
                  src={`https://qr.sepay.vn/img?bank=${encodeURIComponent(activeQrPayout.bankName)}&acc=${encodeURIComponent(activeQrPayout.accountNumber)}&amount=${activeQrPayout.amount}&des=${encodeURIComponent('RUT TIEN KD CARD')}`}
                  alt="VietQR Payout"
                  className="w-64 h-64 mx-auto object-contain"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-left space-y-1">
                <p><strong className="text-slate-400">Ngân hàng:</strong> {activeQrPayout.bankName}</p>
                <p><strong className="text-slate-400">Số tài khoản:</strong> <span className="font-mono font-bold text-orange-400">{activeQrPayout.accountNumber}</span></p>
                <p><strong className="text-slate-400">Tên chủ thẻ:</strong> {activeQrPayout.accountHolder}</p>
                <p><strong className="text-slate-400">Số tiền:</strong> <span className="text-emerald-400 font-bold">{activeQrPayout.amount.toLocaleString('vi-VN')} đ</span></p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(activeQrPayout);
                    setActiveQrPayout(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition shadow-lg shadow-emerald-500/20"
                >
                  ✅ Đã Chuyển Khoản Xong
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQrPayout(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
