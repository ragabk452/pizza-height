/**
 * Types for the data returned by the Pizza Height API.
 * Mirrors the Prisma models — kept in sync manually until we wire a shared types package.
 */

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ItemSize {
  id: string;
  menuItemId: string;
  name: string;
  diameterCm: number | null;
  priceModifier: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface Modifier {
  id: string;
  modifierGroupId: string;
  name: string;
  priceModifier: number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface ModifierGroup {
  id: string;
  menuItemId: string;
  name: string;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  sortOrder: number;
  modifiers: Modifier[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  basePrice: number;
  isAvailable: boolean;
  isPopular: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isNew: boolean;
  prepTimeMin: number;
  sortOrder: number;
  category?: Pick<Category, 'id' | 'slug' | 'name'>;
  sizes?: ItemSize[];
  modifierGroups?: ModifierGroup[];
}

export interface RestaurantSettings {
  'restaurant.name'?: string;
  'restaurant.tagline'?: string;
  'restaurant.currency'?: string;
  'restaurant.vatPercent'?: number;
  'restaurant.serviceChargePercent'?: number;
  'restaurant.minOrderAmount'?: number;
  'restaurant.defaultDeliveryFee'?: number;
  'restaurant.workingHours'?: Record<string, { open: string; close: string }>;
}

export interface MenuItemQuery {
  category?: string;
  search?: string;
  popular?: boolean;
  availableOnly?: boolean;
}

// ============================================================
// Auth
// ============================================================
export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  customer: CustomerProfile;
}

// ============================================================
// Addresses
// ============================================================
export interface Address {
  id: string;
  customerId: string;
  label: string;
  street: string;
  building: string | null;
  apartment: string | null;
  floor: string | null;
  area: string;
  city: string;
  governorate: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  instructions: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressPayload {
  label?: string;
  street: string;
  building?: string;
  apartment?: string;
  floor?: string;
  area: string;
  city: string;
  governorate?: string;
  landmark?: string;
  instructions?: string;
  isDefault?: boolean;
}

// ============================================================
// Coupons
// ============================================================
export type CouponType = 'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY';

export interface CouponPreview {
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  discount: number;
  freeDelivery: boolean;
}

// ============================================================
// Orders
// ============================================================
export type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';
export type PaymentMethod = 'CASH' | 'CARD' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemModifierSnapshot {
  id: string;
  modifierId: string;
  nameSnapshot: string;
  priceSnapshot: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  itemNameSnapshot: string;
  sizeNameSnapshot: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  notes: string | null;
  modifiers: OrderItemModifierSnapshot[];
}

export interface OrderStatusEntry {
  id: string;
  toStatus: OrderStatus;
  fromStatus: OrderStatus | null;
  createdAt: string;
  reason: string | null;
}

export interface OrderPayment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  providerName: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  addressId: string | null;
  type: OrderType;
  status: OrderStatus;
  subtotal: number;
  vatAmount: number;
  deliveryFee: number;
  serviceCharge: number;
  discountAmount: number;
  tipAmount: number;
  total: number;
  customerNotes: string | null;
  estimatedReadyAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: Address | null;
  payment: OrderPayment | null;
  statusHistory: OrderStatusEntry[];
  couponUsage?: { coupon: { code: string }; discountApplied: number } | null;
}

export interface CreateOrderItemPayload {
  menuItemId: string;
  sizeId?: string;
  modifierIds?: string[];
  quantity: number;
  notes?: string;
}

export interface CreateOrderPayload {
  type: OrderType;
  items: CreateOrderItemPayload[];
  addressId?: string;
  paymentMethod?: PaymentMethod;
  couponCode?: string;
  customerNotes?: string;
  tipAmount?: number;
}

// Payments ===========================================================

export interface CheckoutSession {
  iframeUrl: string;
  sessionRef: string;
  provider: 'paymob' | 'mock';
}
