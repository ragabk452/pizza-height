import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMenuItemDto,
  MenuItemQueryDto,
  UpdateMenuItemDto,
} from './dto/menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: MenuItemQueryDto) {
    const where: Prisma.MenuItemWhereInput = {
      deletedAt: null,
    };

    if (query.availableOnly !== false) {
      where.isAvailable = true;
    }

    if (query.category) {
      const cat = await this.prisma.category.findFirst({
        where: { OR: [{ id: query.category }, { slug: query.category }] },
        select: { id: true },
      });
      // If the caller specified a category that doesn't exist, return zero
      // items rather than silently ignoring the filter (which would return
      // the entire menu and confuse the client).
      if (!cat) return [];
      where.categoryId = cat.id;
    }

    if (query.popular) {
      where.isPopular = true;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.menuItem.findMany({
      where,
      include: {
        category: { select: { id: true, slug: true, name: true } },
        sizes: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(slugOrId: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
        deletedAt: null,
      },
      include: {
        category: { select: { id: true, slug: true, name: true } },
        sizes: { orderBy: { sortOrder: 'asc' } },
        modifierGroups: {
          orderBy: { sortOrder: 'asc' },
          include: {
            modifiers: {
              where: { isAvailable: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
    if (!item) throw new NotFoundException(`Menu item "${slugOrId}" not found`);
    return item;
  }

  async create(dto: CreateMenuItemDto) {
    try {
      return await this.prisma.menuItem.create({
        data: dto,
        include: { category: true },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException(`Slug "${dto.slug}" already in use`);
        }
        if (err.code === 'P2003') {
          throw new NotFoundException(`Category "${dto.categoryId}" not found`);
        }
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.findOne(id);
    return this.prisma.menuItem.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date(), isAvailable: false },
    });
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    await this.findOne(id);
    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
      select: { id: true, name: true, isAvailable: true },
    });
  }
}
