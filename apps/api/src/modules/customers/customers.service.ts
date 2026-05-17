import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
        _count: { select: { orders: true } },
      },
    });

    // Compute lifetime spend for each customer in one round trip.
    const ids = customers.map((c) => c.id);
    const spend = await this.prisma.order.groupBy({
      by: ['customerId'],
      where: { customerId: { in: ids }, status: { not: 'CANCELLED' } },
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
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        addresses: { where: { deletedAt: null } },
        orders: {
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
      where: { customerId: id, status: { not: 'CANCELLED' } },
      _sum: { total: true },
      _count: { _all: true },
    });

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      emailVerified: customer.emailVerified,
      phoneVerified: customer.phoneVerified,
      createdAt: customer.createdAt,
      addresses: customer.addresses,
      orders: customer.orders,
      orderCount: totalSpend._count._all,
      lifetimeSpend: Number(totalSpend._sum.total ?? 0),
    };
  }
}
