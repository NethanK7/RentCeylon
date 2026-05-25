import {
  UserRole, VerificationStatus, BookingStatus, DepositStatus,
  PaymentStatus, PaymentProvider, ConditionPhotoParty, ConditionPhotoType,
  DisputeStatus, DisputeOutcome, BadgeCategory, BadgeType,
  ListingStatus, SubscriptionTier, CancellationTier, DepositAuditAction,
  NotificationType, PropertyType, PropertyStatus,
} from '../enums';

export interface UserPublic {
  id: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  memberSince: string;
  rating: number;
  reviewCount: number;
  responseRate: number;
  badges: BadgeSummary[];
}

export interface BadgeSummary {
  type: BadgeType;
  category: BadgeCategory;
  awardedAt: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  category: CategorySummary;
  dailyRate: number;
  depositAmount: number;
  coverImageUrl: string;
  location: string;
  status: ListingStatus;
  badges: BadgeSummary[];
  owner: UserPublic;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  icon: string;
  isEnabled: boolean;
  itemCount: number;
}

export interface BookingSummary {
  id: string;
  listing: ListingSummary;
  renter: UserPublic;
  startDate: string;
  endDate: string;
  totalDays: number;
  rentalAmount: number;
  platformFee: number;
  depositAmount: number;
  totalCharged: number;
  status: BookingStatus;
  depositStatus: DepositStatus;
  conditionPhotosComplete: boolean;
  createdAt: string;
}

export interface PlatformFeeBreakdown {
  rentalAmount: number;
  feePercentage: number;
  feeAmount: number;
  depositAmount: number;
  totalCharged: number;
}

export interface DepositAuditEntry {
  id: string;
  action: DepositAuditAction;
  amount: number;
  performedBy: string;
  note?: string;
  createdAt: string;
}

export interface ConditionPhotoSlot {
  party: ConditionPhotoParty;
  type: ConditionPhotoType;
  imageUrl?: string;
  uploadedAt?: string;
  isFilled: boolean;
}

export interface MessageThread {
  id: string;
  bookingId: string;
  participants: UserPublic[];
  messages: ChatMessage[];
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  isDeleted: boolean;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: string;
}

export interface DisputeSummary {
  id: string;
  bookingId: string;
  raisedBy: UserPublic;
  type: string;
  description: string;
  status: DisputeStatus;
  outcome?: DisputeOutcome;
  slaDeadline: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ReviewSummary {
  id: string;
  bookingId: string;
  reviewer: UserPublic;
  reviewee: UserPublic;
  rating: number;
  comment: string;
  isBlinded: boolean;
  submittedAt: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ReferralSummary {
  code: string;
  invitesSent: number;
  converted: number;
  rewardsEarned: number;
  referrals: ReferralEntry[];
}

export interface ReferralEntry {
  id: string;
  referredUser: UserPublic;
  status: 'PENDING' | 'CONVERTED';
  rewardGranted: boolean;
  convertedAt?: string;
}

export interface PropertySummary {
  id: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  address: string;
  thumbnailUrl?: string;
  currentTenant?: UserPublic;
  leaseStart?: string;
  leaseEnd?: string;
  monthlyRent: number;
  managementFeePercent: number;
  ownerId: string;
  managerId?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchListingsParams extends PaginationParams {
  query?: string;
  categorySlug?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}
