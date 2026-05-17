import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(customerId: string, dto: CreateAddressDto) {
    return this.prisma.$transaction(async (tx) => {
      const existingCount = await tx.address.count({
        where: { customerId, deletedAt: null },
      });
      const shouldBeDefault = dto.isDefault ?? existingCount === 0;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { customerId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          ...dto,
          isDefault: shouldBeDefault,
          customerId,
        },
      });
    });
  }

  async update(customerId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.ensureOwned(customerId, id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault === true && !address.isDefault) {
        // Promoting this one — demote whatever was the default before.
        await tx.address.updateMany({
          where: { customerId, isDefault: true },
          data: { isDefault: false },
        });
      } else if (
        dto.isDefault === false &&
        address.isDefault &&
        !dto.isDefault
      ) {
        // Demoting the current default — refuse, since the customer would
        // be left with no default address. They can promote a different
        // one instead (which auto-demotes this one above).
        throw new ForbiddenException(
          'Cannot clear the default flag — promote another address instead',
        );
      }
      return tx.address.update({ where: { id }, data: dto });
    });
  }

  async remove(customerId: string, id: string) {
    await this.ensureOwned(customerId, id);
    await this.prisma.address.update({
      where: { id },
      data: { deletedAt: new Date(), isDefault: false },
    });
  }

  private async ensureOwned(customerId: string, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, deletedAt: null },
    });
    if (!address) throw new NotFoundException('Address not found');
    if (address.customerId !== customerId) {
      throw new ForbiddenException('You can only access your own addresses');
    }
    return address;
  }
}
