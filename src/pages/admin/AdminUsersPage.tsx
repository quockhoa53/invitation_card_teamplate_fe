import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { User } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { Users, Search, ShieldCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = async () => {
    try {
      const res = await api.getAdminUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await api.toggleUserStatus(userId);
      if (res.success && res.data) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
        toast.success(res.data.isActive ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!');
      }
    } catch (err) {
      toast.error('Không thể đổi trạng thái tài khoản');
    }
  };

  const handleRoleChange = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    confirmModal({
      title: 'Thay Đổi Quyền Hạn',
      message: `Bạn có chắc muốn đổi quyền của user này thành ${newRole === 'ROLE_ADMIN' ? 'Quản Trị Viên (ROLE_ADMIN)' : 'Người Dùng (ROLE_USER)'}?`,
      confirmText: 'Đổi Quyền Ngay',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await api.updateUserRole(userId, newRole);
          if (res.success && res.data) {
            setUsers((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
            toast.success(`Đã đổi quyền thành công sang ${newRole}!`);
          }
        } catch (err) {
          toast.error('Không thể đổi quyền user');
        }
      },
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" /> Quản Lý Người Dùng
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Danh sách tài khoản và phân quyền bảo mật hệ thống
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo email hoặc họ tên..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                : 'bg-white border-stone-200 text-stone-900 focus:border-orange-500 shadow-sm'
            }`}
          />
        </div>
      </div>

      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        {loading ? (
          <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Đang tải danh sách...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-bold uppercase text-[10px] ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-stone-200 text-stone-500'
                }`}>
                  <tr>
                    <th className="py-3 px-4">Người Dùng</th>
                    <th className="py-3 px-4">Vai Trò</th>
                    <th className="py-3 px-4">Bảo Mật 2FA</th>
                    <th className="py-3 px-4">Số Dư</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-stone-100'}`}>
                  {pagedUsers.map((u) => (
                    <tr key={u.id} className={`transition ${
                      isDark ? 'hover:bg-slate-800/40' : 'hover:bg-stone-50'
                    }`}>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`}
                          alt="avatar"
                          className="w-8 h-8 rounded-xl object-cover border border-orange-500/40"
                        />
                        <div>
                          <p className="font-bold">{u.fullName || 'Chưa đặt tên'}</p>
                          <p className="text-[10px] opacity-70">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.role === 'ROLE_ADMIN'
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              : isDark
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.is2FAEnabled ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-[10px]">
                            <ShieldCheck className="w-3.5 h-3.5" /> Đã Bật 2FA
                          </span>
                        ) : (
                          <span className="opacity-50 text-[10px]">Chưa bật</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-orange-500 font-mono">
                        {u.creditsBalance?.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.isActive
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-orange-500/15 text-orange-500'
                          }`}
                        >
                          {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRoleChange(u.id, u.role)}
                          className={`p-1.5 rounded-lg text-[11px] font-semibold border transition ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                          title="Đổi quyền Admin/User"
                        >
                          Đổi Quyền
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`p-1.5 rounded-lg text-[11px] font-semibold transition ${
                            u.isActive
                              ? 'bg-orange-500/15 text-orange-500 hover:bg-orange-500/25'
                              : 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
                          }`}
                        >
                          {u.isActive ? 'Khóa' : 'Mở Khóa'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for Users */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={pageSize}
              onPageChange={(p) => setPage(p)}
              onItemsPerPageChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
              labelItem="người dùng"
            />
          </div>
        )}
      </div>
    </div>
  );
};
