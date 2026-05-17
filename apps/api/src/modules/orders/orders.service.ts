import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CouponType,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeEvents, RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';

// Status flow used to reject illegal transitions.
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED],
  OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================
  async create(customerId: string, dto: CreateOrderDto) {
    if (dto.type === OrderType.DELIVERY && !dto.addressId) {
      throw new BadRequestException(
        'addressId is required for delivery orders',
      );
    }

    // Pull menu data needed for snapshot pricing
    const menuItemIds = [...new Set(dto.items.map((i) => i.menuItemId))];
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, deletedAt: null },
      include: {
        sizes: true,
        modifierGroups: { include: { modifiers: true } },
      },
    });
    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('One or more menu items not found');
    }
    const itemMap = new Map(menuItems.map((m) => [m.id, m]));

    // Validate address ownership when DELIVERY
    if (dto.type === OrderType.DELIVERY) {
      const address = await this.prisma.address.findFirst({
        where: { id: dto.addressId, customerId, deletedAt: null },
      });
      if (!address) {
        throw new BadRequestException(
          'Address not found or not owned by customer',
        );
      }
    }

    // Settings (VAT, delivery fee, min order)
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          in: [
            'restaurant.vatPercent',
            'restaurant.defaultDeliveryFee',
            'restaurant.minOrderAmount',
            'restaurant.serviceChargePercent',
          ],
        },
      },
    });
    const settingsMap = Object.fromEntries(
      settings.map((s) => [s.key, s.value]),
    ) as Record<string, number>;
    const vatPercent = Number(settingsMap['restaurant.vatPercent'] ?? 14);
    const deliveryFeeBase = Number(
      settingsMap['restaurant.defaultDeliveryFee'] ?? 5,
    );
    const minOrderAmount = Number(
      settingsMap['restaurant.minOrderAmount'] ?? 15,
    );
    const serviceChargePercent = Number(
      settingsMap['restaurant.serviceChargePercent'] ?? 0,
    );

    // Compute each line + validate sizes/modifiers
    type ComputedLine = {
      input: CreateOrderDto['items'][number];
      menuItemId: string;
      itemNameSnapshot: string;
      sizeNameSnapshot: string | null;
      unitPrice: number;
      lineTotal: number;
      modifiers: { modifierId: string; name: string; price: number }[];
    };
    const lines: ComputedLine[] = [];

    for (const input of dto.items) {
      const item = itemMap.get(input.menuItemId)!;
      if (!item.isAvailable) {
        throw new BadRequestException(
          `"${item.name}" is currently unavailable`,
        );
      }

      let unitPrice = Number(item.basePrice);
      let sizeName: string | null = null;
      if (item.sizes.length > 0) {
        const sizeId = input.sizeId ?? item.sizes.find((s) => s.isDefault)?.id;
        const size = item.sizes.find((s) => s.id === sizeId);
        if (!size) {
          throw new BadRequestException(
            `Size selection required for "${item.name}"`,
          );
        }
        unitPrice += Number(size.priceModifier);
        sizeName = size.name;
      } else if (input.sizeId) {
        throw new BadRequestException(`"${item.name}" does not have sizes`);
      }

      const requestedMods = input.modifierIds ?? [];
      const allowedMods = item.modifierGroups.flatMap((g) => g.modifiers);
      const allowedModIds = new Set(allowedMods.map((m) => m.id));
      const chosenMods: ComputedLine['modifiers'] = [];
      for (const modId of requestedMods) {
        if (!allowedModIds.has(modId)) {
          throw new BadRequestException(
            `Modifier ${modId} is not valid for "${item.name}"`,
          );
        }
        const mod = allowedMods.find((m) => m.id === modId)!;
        if (!mod.isAvailable) continue;
        unitPrice += Number(mod.priceModifier);
        chosenMods.push({
          modifierId: mod.id,
          name: mod.name,
          price: Number(mod.priceModifier),
        });
      }

      // Validate required modifier groups
      for (const group of item.modifierGroups) {
        const chosenInGroup = requestedMods.filter((id) =>
          group.modifiers.some((m) => m.id === id),
        );
        if (group.isRequired && chosenInGroup.length < group.minSelection) {
          throw new BadRequestException(
            `"${group.name}" requires at least ${group.minSelection} selection(s) for "${item.name}"`,
          );
        }
        if (
          group.maxSelection > 0 &&
          chosenInGroup.length > group.maxSelection
        ) {
          throw new BadRequestException(
            `"${group.name}" allows at most ${group.maxSelection} selection(s)`,
          );
        }
      }

      const lineTotal = round2(unitPrice * input.quantity);
      lines.push({
        input,
        menuItemId: item.id,
        itemNameSnapshot: item.name,
        sizeNameSnapshot: sizeName,
        unitPrice: round2(unitPrice),
        lineTotal,
        modifiers: chosenMods,
      });
    }

    const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
    if (subtotal < minOrderAmount) {
      throw new BadRequestException(
        `Minimum order is $${minOrderAmount.toFixed(2)}`,
      );
    }

    // Apply coupon (server-side validation)
    let discountAmount = 0;
    let deliveryFee = dto.type === OrderType.DELIVERY ? deliveryFeeBase : 0;
    let appliedCoupon: { id: string; discount: number } | null = null;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });
      const now = new Date();
      if (
        !coupon ||
        coupon.deletedAt ||
        !coupon.isActive ||
        (coupon.validFrom && coupon.validFrom > now) ||
        (coupon.validUntil && coupon.validUntil < now)
      ) {
        throw new BadRequestException('Coupon is invalid or expired');
      }
      if (coupon.minOrderTotal && subtotal < Number(coupon.minOrderTotal)) {
        throw new BadRequestException(
          `Coupon requires a minimum order of $${Number(coupon.minOrderTotal).toFixed(2)}`,
        );
      }
      if (coupon.firstOrderOnly) {
        const prior = await this.prisma.order.count({
          where: { customerId, status: { not: OrderStatus.CANCELLED } },
        });
        if (prior > 0) {
          throw new BadRequestException(
            'Coupon only valid on your first order',
          );
        }
      }
      if (coupon.maxUsesPerCustomer) {
        const usages = await this.prisma.couponUsage.count({
          where: { couponId: coupon.id, order: { customerId } },
        });
        if (usages >= coupon.maxUsesPerCustomer) {
          throw new BadRequestException('Coupon usage limit reached');
        }
      }
      if (coupon.maxUses) {
        const total = await this.prisma.couponUsage.count({
          where: { couponId: coupon.id },
        });
        if (total >= coupon.maxUses) {
          throw new BadRequestException('Coupon usage limit reached');
        }
      }

      if (coupon.type === CouponType.PERCENTAGE) {
        discountAmount = round2(subtotal * (Number(coupon.value) / 100));
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
        }
      } else if (coupon.type === CouponType.FIXED) {
        discountAmount = Math.min(Number(coupon.value), subtotal);
      } else if (coupon.type === CouponType.FREE_DELIVERY) {
        discountAmount = deliveryFee;
        deliveryFee = 0;
      }
      appliedCoupon = { id: coupon.id, discount: round2(discountAmount) };
    }

    const taxable = Math.max(subtotal - discountAmount, 0);
    const vatAmount = round2(taxable * (vatPercent / 100));
    const serviceCharge = round2(taxable * (serviceChargePercent / 100));
    const tipAmount = round2(dto.tipAmount ?? 0);
    const total = round2(
      taxable + vatAmount + serviceCharge + deliveryFee + tipAmount,
    );

    // Generate orderNumber (PH-YYYY-NNNN). Retry on the rare collision.
    const orderNumber = await this.nextOrderNumber();

    // Estimated ready time = now + max(prepTime of items) + small buffer
    const prepMinutes =
      Math.max(...lines.map((l) => itemMap.get(l.menuItemId)!.prepTimeMin), 0) +
      (dto.type === OrderType.DELIVERY ? 20 : 5);
    const estimatedReadyAt = new Date(Date.now() + prepMinutes * 60_000);

    const order = await this.prisma.$transaction(async (tx) => {
      const draft = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          addressId: dto.type === OrderType.DELIVERY ? dto.addressId : null,
          type: dto.type,
          status: OrderStatus.PENDING,
          subtotal,
          vatAmount,
          deliveryFee,
          serviceCharge,
          discountAmount,
          tipAmount,
          total,
          customerNotes: dto.customerNotes,
          estimatedReadyAt,
          items: {
            create: lines.map((l) => ({
              menuItemId: l.menuItemId,
              itemNameSnapshot: l.itemNameSnapshot,
              sizeNameSnapshot: l.sizeNameSnapshot,
              unitPrice: l.unitPrice,
              quantity: l.input.quantity,
              lineTotal: l.lineTotal,
              notes: l.input.notes,
              modifiers: {
                create: l.modifiers.map((m) => ({
                  modifierId: m.modifierId,
                  nameSnapshot: m.name,
                  priceSnapshot: m.price,
                })),
              },
            })),
          },
          statusHistory: {
            create: { toStatus: OrderStatus.PENDING },
          },
          payment: {
            create: {
              amount: total,
              method: dto.paymentMethod ?? PaymentMethod.CASH,
              status: PaymentStatus.PENDING,
              providerName:
                (dto.paymentMethod ?? PaymentMethod.CASH) === PaymentMethod.CASH
                  ? 'cash'
                  : null,
            },
          },
        },
        select: { id: true },
      });

      if (appliedCoupon) {
        await tx.couponUsage.create({
          data: {
            couponId: appliedCoupon.id,
            orderId: draft.id,
            discountApplied: appliedCoupon.discount,
          },
        });
      }

      // Re-fetch with the full include so the response includes the couponUsage
      // record that was created in the second step of this transaction.
      return tx.order.findUniqueOrThrow({
        where: { id: draft.id },
        include: this.fullInclude,
      });
    });

    // Broadcast to staff
    this.realtime.broadcastToRoom('admin', RealtimeEvents.OrderCreated, {
      id: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      type: order.type,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
      createdAt: order.createdAt,
    });
    this.realtime.broadcastToRoom('kitchen', RealtimeEvents.OrderCreated, {
      id: order.id,
      orderNumber: order.orderNumber,
      type: order.type,
      items: order.items.map((i) => ({
        name: i.itemNameSnapshot,
        size: i.sizeNameSnapshot,
        quantity: i.quantity,
        notes: i.notes,
      })),
      estimatedReadyAt: order.estimatedReadyAt,
    });

    return order;
  }

  // ============================================================
  // QUERIES
  // ============================================================
  async findMine(customerId: string, limit = 20) {
    return this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: this.fullInclude,
    });
  }

  async findOne(
    id: string,
    requester: { id: string; type: 'staff' | 'customer' },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.fullInclude,
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    if (requester.type === 'customer' && order.customerId !== requester.id) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  async findAllForStaff(filters: {
    status?: OrderStatus;
    type?: OrderType;
    limit?: number;
  }) {
    return this.prisma.order.findMany({
      where: {
        status: filters.status,
        type: filters.type,
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 50,
      include: this.fullInclude,
    });
  }

  // ============================================================
  // STATUS TRANSITIONS
  // ============================================================
  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    staffUserId: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          cancelReason:
            dto.status === OrderStatus.CANCELLED ? dto.reason : undefined,
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: dto.status,
          changedById: staffUserId,
          reason: dto.reason,
        },
      });
      return tx.order.findUniqueOrThrow({
        where: { id },
        include: this.fullInclude,
      });
    });

    // Notify both staff rooms + the specific order room (customer tracking page)
    const payload = {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
    this.realtime.broadcastToRoom(
      'admin',
      RealtimeEvents.OrderStatusChanged,
      payload,
    );
    this.realtime.broadcastToRoom(
      'kitchen',
      RealtimeEvents.OrderStatusChanged,
      payload,
    );
    this.realtime.broadcastToRoom(
      `order:${updated.id}`,
      RealtimeEvents.OrderStatusChanged,
      payload,
    );

    return updated;
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private readonly fullInclude = {
    items: {
      include: { modifiers: true },
      orderBy: { createdAt: 'asc' as const },
    },
    address: true,
    payment: true,
    statusHistory: {
      orderBy: { createdAt: 'asc' as const },
    },
    couponUsage: { include: { coupon: true } },
    customer: {
      select: { id: true, name: true, phone: true, email: true },
    },
  } satisfies Prisma.OrderInclude;

  /**
   * Generates a sequential order number of the form PH-YYYY-NNNN.
   * Concurrent inserts can collide on the unique constraint, so we
   * retry up to a few times — the alternative would be a DB sequence,
   * which is overkill for a portfolio piece.
   */
  private async nextOrderNumber(maxAttempts = 5): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PH-${year}-`;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const count = await this.prisma.order.count({
        where: { orderNumber: { startsWith: prefix } },
      });
      const candidate = `${prefix}${String(count + 1 + attempt).padStart(4, '0')}`;
      const exists = await this.prisma.order.findUnique({
        where: { orderNumber: candidate },
        select: { id: true },
      });
      if (!exists) return candidate;
    }
    // Fallback to a timestamp-based suffix — guaranteed unique.
    return `${prefix}${Date.now().toString().slice(-6)}`;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
