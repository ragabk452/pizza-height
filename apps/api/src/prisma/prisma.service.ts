import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Serialize Prisma's Decimal as a plain number in JSON responses
// (defaults to ugly { s, e, d } object form)
(Decimal.prototype as unknown as { toJSON: () => number }).toJSON = function (
  this: Decimal,
) {
  return Number(this);
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('🐘 Prisma connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🐘 Prisma disconnected');
  }
}
