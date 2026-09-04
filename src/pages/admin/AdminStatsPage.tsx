import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { AdminStats } from '../../types';
import { Users, Layers, LayoutDashboard, DollarSign, TrendingUp } from 'lucide-react';
import { StatsCardSkeleton, TableRowSkeleton } from '../../components/common/Skeleton';

export const AdminStatsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getAdminStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-editorial text-3xl font-bold">Tổng Quan Quản Trị Hệ Thống</h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Báo cáo thống kê thời gian thực người dùng, doanh thu và các lượt tạo thiệp
          </p>
        </div>

        <StatsCardSkeleton />

        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className={`h-6 w-44 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`} />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b font-bold uppercase text-[10px] ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-stone-200 text-stone-500'
              }`}>
                <tr>
                  <th className="py-3 px-4">Mã Đơn</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Loại GD</th>
                  <th className="py-3 px-4">Số Tiền</th>
                  <th className="py-3 px-4">Phương Thức</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Thời Gian</th>
                </tr>
              </thead>
              <TableRowSkeleton rows={5} cols={7} />
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-editorial text-3xl font-bold">Tổng Quan Quản Trị Hệ Thống</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
          Báo cáo thống kê thời gian thực người dùng, doanh thu và các lượt tạo thiệp
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-3xl border space-y-2 ${
          isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Tổng Người Dùng
            </span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-editorial">{stats?.totalUsers}</p>
          <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Đang hoạt động
          </span>
        </div>

        <div className={`p-6 rounded-3xl border space-y-2 ${
          isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Tổng Thiệp Mời
            </span>
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-500">
              <LayoutDashboard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-editorial">{stats?.totalCards}</p>
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            {stats?.publishedCardsCount} thiệp public
          </span>
        </div>

        <div className={`p-6 rounded-3xl border space-y-2 ${
          isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Kho Template
            </span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-editorial">{stats?.totalTemplates}</p>
          <span className="text-[11px] text-purple-500 font-medium">
            {stats?.activeTemplatesCount} mẫu đang bật
          </span>
        </div>

        <div className={`p-6 rounded-3xl border space-y-2 ${
          isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Tổng Doanh Thu
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-editorial text-emerald-500">
            {stats?.totalRevenue?.toLocaleString('vi-VN')} đ
          </p>
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            {stats?.totalTransactions} lượt nạp / thanh toán thành công
          </span>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <h3 className="font-editorial text-lg font-bold">Giao Dịch Gần Đây</h3>

        {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b font-bold uppercase text-[10px] ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-stone-200 text-stone-500'
              }`}>
                <tr>
                  <th className="py-3 px-4">Mã Đơn</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Loại GD</th>
                  <th className="py-3 px-4">Số Tiền</th>
                  <th className="py-3 px-4">Phương Thức</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Thời Gian</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-stone-100'}`}>
                {stats.recentTransactions.map((tx, idx) => {
                  const isDeduct = tx.paymentMethod === 'WALLET' || tx.type === 'CARD_PURCHASE' || tx.orderCode?.startsWith('BUY') || tx.type === 'WITHDRAWAL' || tx.orderCode?.startsWith('WDR');
                  const isPurchase = tx.type === 'CARD_PURCHASE' || tx.orderCode?.startsWith('BUY') || tx.paymentMethod === 'WALLET';
                  const isWithdrawal = tx.type === 'WITHDRAWAL' || tx.orderCode?.startsWith('WDR');

                  return (
                    <tr key={idx} className={`transition ${
                      isDark ? 'hover:bg-slate-800/40' : 'hover:bg-stone-50'
                    }`}>
                      <td className="py-3 px-4 font-mono font-bold text-amber-500">{tx.orderCode}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold">{tx.userName}</p>
                        <p className="text-[10px] opacity-70">{tx.userEmail}</p>
                      </td>
                      <td className="py-3 px-4">
                        {isPurchase ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            Mua Thiệp
                          </span>
                        ) : isWithdrawal ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            Rút Tiền
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            Nạp Tiền
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold font-mono">
                        {isDeduct ? (
                          <span className="text-orange-400">-{tx.amount.toLocaleString('vi-VN')} đ</span>
                        ) : (
                          <span className="text-emerald-500">+{tx.amount.toLocaleString('vi-VN')} đ</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {tx.paymentMethod === 'WALLET' ? 'VÍ KD' : (tx.paymentMethod || 'VIETQR')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tx.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-amber-500/15 text-amber-500'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 opacity-70">{tx.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 opacity-60 text-xs">Chưa có giao dịch nào</div>
        )}
      </div>
    </div>
  );
};
