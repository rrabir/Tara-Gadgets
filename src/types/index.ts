export type UserRole = 'owner' | 'product-manager' | 'order-manager' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Matte Black / 64GB"
  color?: string;
  colorHex?: string;
  capacity?: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export type ProductStatus = 'published' | 'draft' | 'archived';

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  regularPrice: number;
  salePrice?: number;
  sku: string;
  stock: number;
  images: string[];
  coverImage: string;
  videoUrl?: string;
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  compatibility?: string[];
  warranty: string; // e.g., "6 Months Official Replacement Warranty"
  inTheBox: string[];
  deliveryInfo: string;
  status: ProductStatus;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  salesCount: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount?: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'failed-delivery'
  | 'returned';

export type PaymentStatus = 'pending' | 'paid' | 'cod-pending' | 'refunded' | 'partially-refunded';
export type CourierCodStatus = 'unassigned' | 'booked' | 'in-transit' | 'collected' | 'settled';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryAddress {
  customerName: string;
  phone: string; // Bangladesh phone normalized
  email?: string;
  district: string; // e.g., "Dhaka", "Chattogram", etc.
  area: string;
  fullAddress: string;
  orderNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., "TG-2026-1042"
  customerId?: string;
  isGuest: boolean;
  address: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'cash-on-delivery' | 'online-payment';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  courierStatus: CourierCodStatus;
  courierName?: string;
  courierTrackingId?: string;
  courierTrackingUrl?: string;
  internalNotes?: string[];
  refundAmount?: number;
  refundReason?: string;
  isRestocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g., 10 for 10% or 150 for ৳150
  minOrderValue: number;
  maxDiscount?: number;
  usageCount: number;
  maxUsageLimit?: number;
  expiresAt: string;
  isActive: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string; // e.g. "Inside Dhaka", "Outside Dhaka"
  fee: number; // ৳
  estimatedDays: string; // e.g. "1-2 Business Days"
  freeDeliveryThreshold?: number; // ৳
  isActive: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  email: string;
  facebookUrl: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  announcementBarText: string;
  isAnnouncementBarActive: boolean;
  freeDeliveryMinSpend: number;
  logoText: string;
  logoImageUrl?: string;
  primaryColor: string;
  enableCod: boolean;
  enableOnlinePayment: boolean;
  sslcommerzStatus: 'not-configured' | 'test' | 'live';
  bkashStatus: 'not-configured' | 'test' | 'live';
  nagadStatus: 'not-configured' | 'test' | 'live';
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  isDraft: boolean;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  productName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}
