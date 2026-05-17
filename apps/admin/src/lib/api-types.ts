/**
 * Types for the data returned by the Pizza Height API — admin subset.
 * Mirrors the Prisma models. Kept in sync manually until we wire a shared
 * types package.
 */

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
export type UserRole = 'ADMIN' | 'MANAGER' | 'KITCHEN' | 'DRIVER';

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface StaffAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: StaffProfile;
}

// Orders ============================================================

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

export interface OrderAddress {
  id: string;
  label: string;
  street: string;
  building: string | null;
  apartment: string | null;
  area: string;
  city: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
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
  cancelReason: string | null;
  estimatedReadyAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: OrderAddress | null;
  payment: OrderPayment | null;
  statusHistory: OrderStatusEntry[];
  customer: OrderCustomer;
  couponUsage?: {
    coupon: { code: string };
    discountApplied: number;
  } | null;
}

export interface DashboardStats {
  today: {
    orderCount: number;
    revenue: number;
    inProgress: number;
  };
  statusCounts: Record<OrderStatus, number>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    type: OrderType;
    status: OrderStatus;
    total: number;
    createdAt: string;
    customerName: string;
    itemCount: number;
  }>;
}

// Menu ===============================================================

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

// Payloads sent to the API when creating or updating a menu item.
// The nested children replace the existing collections atomically.
export interface SizePayload {
  name: string;
  diameterCm?: number;
  priceModifier: number;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface ModifierPayload {
  name: string;
  priceModifier: number;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface ModifierGroupPayload {
  name: string;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  sortOrder?: number;
  modifiers: ModifierPayload[];
}

export interface MenuItemCreatePayload {
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  basePrice: number;
  isAvailable?: boolean;
  isPopular?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNew?: boolean;
  prepTimeMin?: number;
  sortOrder?: number;
  sizes?: SizePayload[];
  modifierGroups?: ModifierGroupPayload[];
}

export type MenuItemUpdatePayload = Partial<MenuItemCreatePayload>;

export interface CategoryCreatePayload {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type CategoryUpdatePayload = Partial<CategoryCreatePayload>;

// Customers ==========================================================

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  orderCount: number;
  lifetimeSpend: number;
}

export interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  orderCount: number;
  lifetimeSpend: number;
  addresses: Array<{
    id: string;
    label: string;
    street: string;
    area: string;
    city: string;
    isDefault: boolean;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    type: OrderType;
    status: OrderStatus;
    total: number;
    createdAt: string;
  }>;
}

// Settings ==========================================================

export type SettingsMap = Record<string, unknown>;
