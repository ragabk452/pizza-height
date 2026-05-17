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
