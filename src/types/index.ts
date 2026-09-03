export type Role = 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: Role;
  isActive: boolean;
  is2FAEnabled: boolean;
  hasPassword?: boolean;
  authProvider?: 'LOCAL' | 'GOOGLE';
  googleId?: string;
  creditsBalance: number;
  realBalance?: number;
  bonusBalance?: number;
  createdAt: string;
}

export interface GoogleLoginRequest {
  email: string;
  fullName: string;
  avatarUrl?: string;
  googleId?: string;
  idToken?: string;
}

export interface SetPasswordRequest {
  newPassword: string;
}

export interface TemplateCategory {
  id: string;
  code: string;
  name: string;
  emoji: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  templateCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  previewUrl: string;
  isFree: boolean;
  price: number;
  defaultConfig: string;
  schemaRules: string;
  templateType?: 'BUILT_IN' | 'CUSTOM_CODE';
  customHtml?: string;
  customCss?: string;
  customJs?: string;
  isPublished?: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export interface Card {
  id: string;
  template: Template;
  title: string;
  slug: string;
  hasPasscode: boolean;
  customData: string;
  qrCodeBase64: string;
  publicUrl: string;
  isPublished: boolean;
  viewCount: number;
  wishesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCard {
  id: string;
  template: Template;
  title: string;
  slug: string;
  isProtected: boolean;
  customData: string | null;
  isPublished: boolean;
  viewCount: number;
  wishes: CardWish[];
  createdAt: string;
}

export interface CardWish {
  id: string;
  senderName: string;
  message: string;
  emotionIcon?: string;
  createdAt: string;
}

export interface PaymentOrder {
  orderCode: string;
  amount: number;
  bonusAmount?: number;
  actualAmount?: number;
  missingAmount?: number;
  paymentMethod: string;
  vietQrUrl: string;
  qrCodeBase64: string;
  bankName: string;
  bankAccountNo: string;
  accountHolder: string;
  transferContent: string;
  status: string;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  orderCode: string;
  paymentMethod: string;
  amount: number;
  bonusAmount?: number;
  actualAmount?: number;
  missingAmount?: number;
  type?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'UNDERPAID' | 'SETTLED_TO_WALLET';
  gatewayPayload?: string;
  completedAt?: string;
  createdAt: string;
  userId?: string;
  userEmail?: string;
  userFullName?: string;
  userAvatarUrl?: string;
}

export interface WithdrawalItem {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  processedAt?: string;
  createdAt: string;
  userId?: string;
  userEmail?: string;
  userFullName?: string;
}

export interface PromotionItem {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  maxUsage?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ValidatePromotionResult {
  valid: boolean;
  message: string;
  code?: string;
  discountType?: string;
  discountValue?: number;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalCards: number;
  totalTemplates: number;
  totalRevenue: number;
  totalTransactions: number;
  activeTemplatesCount: number;
  publishedCardsCount: number;
  recentTransactions: {
    orderCode: string;
    userEmail: string;
    userName: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface AuthResponse {
  accessToken?: string;
  tokenType?: string;
  require2FA: boolean;
  tempToken?: string;
  user?: User;
}

export interface Setup2FAResponse {
  secretKey: string;
  qrCodeUri: string;
  qrCodeBase64: string;
  backupCodes: string[];
}

// Template specific data models
export interface PhotoItem {
  url: string;
  caption?: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

export interface LoverBirthdayData {
  recipientName: string;
  senderName: string;
  greetingTitle: string;
  greetingMessage: string;
  birthdayDate: string;
  musicUrl?: string;
  musicTitle?: string;
  themeColor?: string;
  cakeFlavor?: string;
  enableCandleBlow?: boolean;
  enableGiftBox?: boolean;
  photos: PhotoItem[];
}

export interface FriendsBirthdayData {
  recipientName: string;
  senderName: string;
  greetingTitle: string;
  greetingMessage: string;
  birthdayDate: string;
  musicUrl?: string;
  musicTitle?: string;
  themeColor?: string;
  enableConfetti?: boolean;
  enablePartyBalloons?: boolean;
  photos: PhotoItem[];
}

export interface LoveAnniversaryData {
  recipientName: string;
  senderName: string;
  greetingTitle: string;
  greetingMessage: string;
  anniversaryStartDate: string;
  musicUrl?: string;
  musicTitle?: string;
  themeColor?: string;
  timeline?: TimelineItem[];
  photos: PhotoItem[];
  fallingWords?: string[];
  keyword1?: string;
  keyword2?: string;
  keyword3?: string;
  keyword4?: string;
  keyword5?: string;
  milestoneUnit?: 'DAYS' | 'YEARS' | 'CUSTOM';
  milestoneText?: string;
  neonTheme?: 'cyan' | 'pink' | 'gold' | 'white';
}

export interface EventInvitationData {
  recipientName: string;
  senderName: string;
  greetingTitle: string;
  greetingMessage: string;
  eventDate: string;
  eventLocation: string;
  mapUrl?: string;
  musicUrl?: string;
  musicTitle?: string;
  themeColor?: string;
  enableRsvp?: boolean;
}
