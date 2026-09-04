import axios from 'axios';
import {
  ApiResponse,
  AuthResponse,
  Card,
  PublicCard,
  Template,
  TemplateCategory,
  TemplateSchemaKey,
  User,
  CardWish,
  PaymentOrder,
  TransactionItem,
  AdminStats,
  Setup2FAResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-logout if on 2FA stage or login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/c/')) {
        // localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  loginWithGoogle: async (data: { email: string; fullName: string; avatarUrl?: string; googleId?: string; idToken?: string }): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post('/auth/google', data);
    return res.data;
  },

  setPassword: async (newPassword: string): Promise<ApiResponse<User>> => {
    const res = await apiClient.post('/auth/set-password', { newPassword });
    return res.data;
  },

  register: async (email: string, password: string, fullName: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post('/auth/register', { email, password, fullName });
    return res.data;
  },

  verify2FA: async (tempToken: string, code?: string, backupCode?: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post('/auth/verify-2fa', { tempToken, code, backupCode });
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  setup2FA: async (): Promise<ApiResponse<Setup2FAResponse>> => {
    const res = await apiClient.post('/auth/2fa/setup');
    return res.data;
  },

  sendEmailOtp: async (): Promise<ApiResponse<void>> => {
    const res = await apiClient.post('/auth/2fa/send-email-otp');
    return res.data;
  },

  resend2FAEmailOtp: async (tempToken: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.post('/auth/2fa/resend-email-otp', { tempToken });
    return res.data;
  },

  enable2FA: async (code: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.post('/auth/2fa/enable', { code });
    return res.data;
  },

  disable2FA: async (password: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.post('/auth/2fa/disable', { password });
    return res.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.post('/auth/change-password', { oldPassword, newPassword });
    return res.data;
  },

  // Templates
  getTemplates: async (): Promise<ApiResponse<Template[]>> => {
    const res = await apiClient.get('/templates');
    return res.data;
  },

  getTemplateBySlug: async (slug: string): Promise<ApiResponse<Template>> => {
    const res = await apiClient.get(`/templates/${slug}`);
    return res.data;
  },

  // User Cards
  getMyCards: async (): Promise<ApiResponse<Card[]>> => {
    const res = await apiClient.get('/cards');
    return res.data;
  },

  getCardById: async (id: string): Promise<ApiResponse<Card>> => {
    const res = await apiClient.get(`/cards/${id}`);
    return res.data;
  },

  createCard: async (data: { templateId: string; title: string; slug?: string; passcode?: string; customData?: string }): Promise<ApiResponse<Card>> => {
    const res = await apiClient.post('/cards', data);
    return res.data;
  },

  updateCard: async (id: string, data: { title: string; slug?: string; passcode?: string; clearPasscode?: boolean; customData?: string; isPublished?: boolean }): Promise<ApiResponse<Card>> => {
    const res = await apiClient.put(`/cards/${id}`, data);
    return res.data;
  },

  deleteCard: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete(`/cards/${id}`);
    return res.data;
  },

  // Public Cards
  getPublicCard: async (slug: string): Promise<ApiResponse<PublicCard>> => {
    const res = await apiClient.get(`/public/cards/${slug}`);
    return res.data;
  },

  verifyCardPasscode: async (slug: string, passcode: string): Promise<ApiResponse<PublicCard>> => {
    const res = await apiClient.post(`/public/cards/${slug}/verify-passcode`, { passcode });
    return res.data;
  },

  addWish: async (slug: string, data: { senderName: string; message: string; emotionIcon?: string }): Promise<ApiResponse<CardWish>> => {
    const res = await apiClient.post(`/public/cards/${slug}/wishes`, data);
    return res.data;
  },

  getWishes: async (slug: string): Promise<ApiResponse<CardWish[]>> => {
    const res = await apiClient.get(`/public/cards/${slug}/wishes`);
    return res.data;
  },

  // Payments
  createPaymentOrder: async (data: { cardId?: string; templateId?: string; amount: number; paymentMethod?: string }): Promise<ApiResponse<PaymentOrder>> => {
    const res = await apiClient.post('/payment/orders', data);
    return res.data;
  },

  getMyTransactions: async (params?: { page?: number; size?: number }): Promise<ApiResponse<{ content: TransactionItem[]; totalPages: number; totalElements: number; number: number }>> => {
    const res = await apiClient.get('/payment/my-transactions', { params });
    return res.data;
  },

  getOrderStatus: async (orderCode: string): Promise<ApiResponse<TransactionItem>> => {
    const res = await apiClient.get(`/payment/orders/${orderCode}/status`);
    return res.data;
  },

  getPaymentOrderDetails: async (orderCode: string): Promise<ApiResponse<PaymentOrder>> => {
    const res = await apiClient.get(`/payment/orders/${orderCode}/details`);
    return res.data;
  },

  cancelUserPaymentOrder: async (orderCode: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.post(`/payment/orders/${orderCode}/cancel`);
    return res.data;
  },

  simulatePaymentSuccess: async (orderCode: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.post(`/payment/simulate-success/${orderCode}`);
    return res.data;
  },

  // Upload
  uploadFile: async (file: File): Promise<ApiResponse<{ fileName: string; url: string; dataUri: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Admin
  getAdminStats: async (): Promise<ApiResponse<AdminStats>> => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  getAdminUsers: async (): Promise<ApiResponse<User[]>> => {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },

  toggleUserStatus: async (userId: string): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch(`/admin/users/${userId}/toggle-status`);
    return res.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  getAdminTransactions: async (params?: { status?: string; search?: string; page?: number; size?: number }): Promise<ApiResponse<{ content: TransactionItem[]; totalPages: number; totalElements: number; number: number }>> => {
    const res = await apiClient.get('/admin/transactions', { params });
    return res.data;
  },

  approveAdminTransaction: async (orderCode: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.post(`/admin/transactions/${orderCode}/approve`);
    return res.data;
  },

  cancelAdminTransaction: async (orderCode: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.post(`/admin/transactions/${orderCode}/cancel`);
    return res.data;
  },

  getAdminTemplates: async (): Promise<ApiResponse<Template[]>> => {
    const res = await apiClient.get('/admin/templates');
    return res.data;
  },

  publishAdminTemplate: async (id: string): Promise<ApiResponse<Template>> => {
    const res = await apiClient.patch(`/admin/templates/${id}/publish`);
    return res.data;
  },

  createAdminTemplate: async (data: any): Promise<ApiResponse<Template>> => {
    const res = await apiClient.post('/admin/templates', data);
    return res.data;
  },

  updateAdminTemplate: async (id: string, data: any): Promise<ApiResponse<Template>> => {
    const res = await apiClient.put(`/admin/templates/${id}`, data);
    return res.data;
  },

  deleteAdminTemplate: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete(`/admin/templates/${id}`);
    return res.data;
  },

  // Categories
  getCategories: async (): Promise<ApiResponse<TemplateCategory[]>> => {
    const res = await apiClient.get('/categories');
    return res.data;
  },

  getAdminCategories: async (): Promise<ApiResponse<TemplateCategory[]>> => {
    const res = await apiClient.get('/admin/categories');
    return res.data;
  },

  createAdminCategory: async (data: Partial<TemplateCategory>): Promise<ApiResponse<TemplateCategory>> => {
    const res = await apiClient.post('/admin/categories', data);
    return res.data;
  },

  updateAdminCategory: async (id: string, data: Partial<TemplateCategory>): Promise<ApiResponse<TemplateCategory>> => {
    const res = await apiClient.put(`/admin/categories/${id}`, data);
    return res.data;
  },

  toggleAdminCategoryStatus: async (id: string): Promise<ApiResponse<TemplateCategory>> => {
    const res = await apiClient.patch(`/admin/categories/${id}/toggle-status`);
    return res.data;
  },

  deleteAdminCategory: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete(`/admin/categories/${id}`);
    return res.data;
  },

  // Schema Keys Master Dictionary
  getSchemaKeys: async (): Promise<ApiResponse<TemplateSchemaKey[]>> => {
    const res = await apiClient.get('/schema-keys');
    return res.data;
  },

  getAdminSchemaKeys: async (): Promise<ApiResponse<TemplateSchemaKey[]>> => {
    const res = await apiClient.get('/admin/schema-keys');
    return res.data;
  },

  createAdminSchemaKey: async (data: Partial<TemplateSchemaKey>): Promise<ApiResponse<TemplateSchemaKey>> => {
    const res = await apiClient.post('/admin/schema-keys', data);
    return res.data;
  },

  updateAdminSchemaKey: async (id: string, data: Partial<TemplateSchemaKey>): Promise<ApiResponse<TemplateSchemaKey>> => {
    const res = await apiClient.put(`/admin/schema-keys/${id}`, data);
    return res.data;
  },

  toggleAdminSchemaKeyStatus: async (id: string): Promise<ApiResponse<TemplateSchemaKey>> => {
    const res = await apiClient.patch(`/admin/schema-keys/${id}/toggle-status`);
    return res.data;
  },

  seedAdminSchemaKeys: async (): Promise<ApiResponse<TemplateSchemaKey[]>> => {
    const res = await apiClient.post('/admin/schema-keys/seed-defaults');
    return res.data;
  },

  deleteAdminSchemaKey: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete(`/admin/schema-keys/${id}`);
    return res.data;
  },

  // Underpaid resolution options (OP1 & OP2)
  settleUnderpaidToWallet: async (orderCode: string): Promise<ApiResponse<PaymentOrder>> => {
    const res = await apiClient.post(`/payment/orders/${orderCode}/settle-to-wallet`);
    return res.data;
  },

  getSupplementOrder: async (orderCode: string): Promise<ApiResponse<PaymentOrder>> => {
    const res = await apiClient.get(`/payment/orders/${orderCode}/supplement-order`);
    return res.data;
  },

  // Withdrawals
  requestWithdrawal: async (data: { amount: number; bankName: string; accountNumber: string; accountHolder: string }): Promise<ApiResponse<any>> => {
    const res = await apiClient.post('/withdrawals', data);
    return res.data;
  },

  getMyWithdrawals: async (params?: { page?: number; size?: number }): Promise<ApiResponse<{ content: any[]; totalPages: number; totalElements: number }>> => {
    const res = await apiClient.get('/withdrawals/my', { params });
    return res.data;
  },

  getAdminWithdrawals: async (params?: { status?: string; search?: string; page?: number; size?: number }): Promise<ApiResponse<{ content: any[]; totalPages: number; totalElements: number }>> => {
    const res = await apiClient.get('/admin/withdrawals', { params });
    return res.data;
  },

  approveAdminWithdrawal: async (id: string, note?: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.post(`/admin/withdrawals/${id}/approve`, { note });
    return res.data;
  },

  rejectAdminWithdrawal: async (id: string, reason?: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.post(`/admin/withdrawals/${id}/reject`, { reason });
    return res.data;
  },

  // Promotions / Coupons
  validatePromotion: async (code: string, amount: number): Promise<ApiResponse<any>> => {
    const res = await apiClient.get('/promotions/validate', { params: { code, amount } });
    return res.data;
  },

  getAdminPromotions: async (params?: { search?: string; isActive?: boolean; page?: number; size?: number }): Promise<ApiResponse<{ content: any[]; totalPages: number; totalElements: number }>> => {
    const res = await apiClient.get('/admin/promotions', { params });
    return res.data;
  },

  createAdminPromotion: async (data: any): Promise<ApiResponse<any>> => {
    const res = await apiClient.post('/admin/promotions', data);
    return res.data;
  },

  updateAdminPromotion: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const res = await apiClient.put(`/admin/promotions/${id}`, data);
    return res.data;
  },

  deleteAdminPromotion: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete(`/admin/promotions/${id}`);
    return res.data;
  },

  toggleAdminPromotion: async (id: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.patch(`/admin/promotions/${id}/toggle`);
    return res.data;
  },

  // Template Purchases
  getMyPurchasedTemplateIds: async (): Promise<ApiResponse<string[]>> => {
    const res = await apiClient.get('/templates/my-purchases');
    return res.data;
  },

  purchaseTemplate: async (templateId: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.post(`/templates/${templateId}/purchase`);
    return res.data;
  },
};
