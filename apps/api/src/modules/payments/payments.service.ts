import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeEvents, RealtimeGateway } from '../realtime/realtime.gateway';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from './providers/payment-provider.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    @Inject(PAYMENT_PROVIDER)
    private readonly provider: PaymentProvider,
  ) {}

  /**
   * Initiate a hosted-payment session for an existing CARD order. Returns
   * the iframe URL the customer should be redirected to. Stores the
   * provider's session ref on the Payment so the webhook can match it
   * back later.
   */
  async createCheckoutSession(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, customer: true, address: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) {
      throw new ForbiddenException('You can only pay for your own orders');
    }
    if (!order.payment) {
      throw new BadRequestException('Order has no payment record');
    }
    if (order.payment.method !== PaymentMethod.CARD) {
      throw new BadRequestException(
        'Checkout session is only for CARD payments',
      );
    }
    if (order.payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    const session = await this.provider.createSession({
      amount: Number(order.payment.amount),
      currency: 'EGP',
      merchantOrderRef: order.orderNumber,
      merchantOrderId: order.id,
      billing: {
        firstName: order.customer.name.split(' ')[0] ?? 'Customer',
        lastName:
          order.customer.name.split(' ').slice(1).join(' ') || 'Pizza Height',
        email: order.customer.email ?? 'noreply@pizzaheight.com',
        phoneNumber: order.customer.phone,
        street: order.address?.street,
        city: order.address?.city,
        country: 'EG',
      },
    });

    await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        providerName: this.provider.name,
        providerId: session.providerOrderId,
        idempotencyKey: session.sessionRef,
        providerPayload: session.raw as Prisma.InputJsonValue,
      },
    });

    this.logger.log(
      `Created ${this.provider.name} checkout session for ${order.orderNumber}`,
    );

    return {
      iframeUrl: session.iframeUrl,
      sessionRef: session.sessionRef,
      provider: this.provider.name,
    };
  }

  /**
   * Process a provider webhook. Verifies signature, then updates the
   * matching Payment + Order in a transaction and broadcasts realtime
   * events so dashboards/KDS update instantly.
   */
  async handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>,
  ) {
    let payload;
    try {
      payload = this.provider.verifyAndParseWebhook(rawBody, headers);
    } catch (err) {
      this.logger.warn(`Webhook rejected: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Find the Payment row by the session ref we stored at session-creation
    // time. Falls back to merchant order ref if the provider echoes it.
    const payment = await this.prisma.payment.findFirst({
      where: payload.merchantOrderRef
        ? {
            OR: [
              { idempotencyKey: payload.sessionRef },
              { order: { orderNumber: payload.merchantOrderRef } },
            ],
          }
        : { idempotencyKey: payload.sessionRef },
      include: { order: true },
    });

    if (!payment) {
      this.logger.warn(
        `Webhook for unknown session ${payload.sessionRef} — ignoring`,
      );
      return { received: true, matched: false };
    }

    // Idempotency: if we've already recorded the final state, no-op.
    if (
      (payload.success && payment.status === PaymentStatus.PAID) ||
      (!payload.success && payment.status === PaymentStatus.FAILED)
    ) {
      return { received: true, matched: true, alreadyApplied: true };
    }

    const nextPaymentStatus = payload.success
      ? PaymentStatus.PAID
      : PaymentStatus.FAILED;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: nextPaymentStatus,
          providerId: payload.transactionId ?? payment.providerId,
          providerPayload: payload.raw as Prisma.InputJsonValue,
        },
      });

      // On success, move the order forward to CONFIRMED if it's still
      // sitting in PENDING. Other statuses are left alone — staff may
      // have moved it manually already.
      if (payload.success && payment.order.status === OrderStatus.PENDING) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CONFIRMED },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            fromStatus: OrderStatus.PENDING,
            toStatus: OrderStatus.CONFIRMED,
            reason: `Payment confirmed via ${this.provider.name}`,
          },
        });
      }
    });

    // Broadcast — KDS / admin dashboards / customer tracking page all
    // subscribe to these.
    const statusPayload = {
      id: payment.orderId,
      orderNumber: payment.order.orderNumber,
      status: payload.success ? OrderStatus.CONFIRMED : payment.order.status,
      updatedAt: new Date(),
    };
    this.realtime.broadcastToRoom(
      'admin',
      RealtimeEvents.OrderStatusChanged,
      statusPayload,
    );
    this.realtime.broadcastToRoom(
      'kitchen',
      RealtimeEvents.OrderStatusChanged,
      statusPayload,
    );
    this.realtime.broadcastToRoom(
      `order:${payment.orderId}`,
      RealtimeEvents.OrderStatusChanged,
      statusPayload,
    );

    this.logger.log(
      `Webhook applied: ${payment.order.orderNumber} → payment ${nextPaymentStatus}`,
    );

    return { received: true, matched: true, status: nextPaymentStatus };
  }
}
