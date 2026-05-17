import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponType, OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(customerId: string, dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (!coupon || coupon.deletedAt || !coupon.isActive) {
      throw new NotFoundException('Coupon not found');
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      throw new BadRequestException('Coupon has expired');
    }
    if (coupon.minOrderTotal && dto.subtotal < Number(coupon.minOrderTotal)) {
      throw new BadRequestException(
        `Requires a minimum order of $${Number(coupon.minOrderTotal).toFixed(2)}`,
      );
    }

    if (coupon.firstOrderOnly) {
      const prior = await this.prisma.order.count({
        where: { customerId, status: { not: OrderStatus.CANCELLED } },
      });
      if (prior > 0) {
        throw new BadRequestException('Coupon only valid on first order');
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

    // Estimate the discount preview for the UI.
    // For FREE_DELIVERY we read the current delivery fee from settings so
    // the frontend has a real "amount saved" to display.
    let discount = 0;
    let freeDelivery = false;
    if (coupon.type === CouponType.PERCENTAGE) {
      discount = +(dto.subtotal * (Number(coupon.value) / 100)).toFixed(2);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else if (coupon.type === CouponType.FIXED) {
      discount = Math.min(Number(coupon.value), dto.subtotal);
    } else if (coupon.type === CouponType.FREE_DELIVERY) {
      freeDelivery = true;
      const setting = await this.prisma.setting.findUnique({
        where: { key: 'restaurant.defaultDeliveryFee' },
      });
      const fee = Number(setting?.value ?? 5);
      discount = Number.isFinite(fee) ? fee : 5;
    }

    return {
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: Number(coupon.value),
      discount,
      freeDelivery,
    };
  }
}
