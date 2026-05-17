import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Customer-facing metrics ignore cancelled orders consistently across list,
// detail, and the embedded "recent orders" preview. Defining this once
// keeps the dashboard, customer list, and customer detail in agreement.
const NON_CANCELLED: Prisma.OrderWhereInput = {
  status: { not: OrderStatus.CANCELLED },
};

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts: { search?: string; limit?: number }) {
    const where: Prisma.CustomerWhereInput = { deletedAt: null };
    if (opts.search) {
      where.OR = [
        { name: { contains: opts.search, mode: 'insensitive' } },
        { phone: { contains: opts.search } },
        { email: { contains: opts.search, mode: 'insensitive' } },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: opts.limit ?? 100,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        _count: { select: { orders: { where: NON_CANCELLED } } },
      },
    });

    // Compute lifetime spend for each customer in one round trip.
    const ids = customers.map((c) => c.id);
    const spend = await this.prisma.order.groupBy({
      by: ['customerId'],
      where: { customerId: { in: ids }, ...NON_CANCELLED },
      _sum: { total: true },
    });
    const spendMap = new Map(
      spend.map((s) => [s.customerId, Number(s._sum.total ?? 0)]),
    );

    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      emailVerified: c.emailVerified,
      phoneVerified: c.phoneVerified,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      lifetimeSpend: spendMap.get(c.id) ?? 0,
    }));
  }

  async findOne(id: string) {
    // Whitelisted columns only — never pull passwordHash or refreshToken
    // out of the database even though our return literal also strips them.
    // Defense in depth: a future refactor that returns `customer` directly
    // wouldn't leak.
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        addresses: { where: { deletedAt: null } },
        // Recent non-cancelled orders so the count above the list matches
        // the rows shown below it. Cancelled orders aren't displayed here;
        // they live under a separate (future) "Cancelled" tab.
        orders: {
          where: NON_CANCELLED,
          orderBy: { createdAt: 'desc' },
          take: 25,
          select: {
            id: true,
            orderNumber: true,
            type: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const totalSpend = await this.prisma.order.aggregate({
      where: { customerId: id, ...NON_CANCELLED },
      _sum: { total: true },
      _count: { _all: true },
    });

    return {
      ...customer,
      orderCount: totalSpend._count._all,
      lifetimeSpend: Number(totalSpend._sum.total ?? 0),
    };
  }
}
