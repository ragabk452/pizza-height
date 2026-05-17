import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMenuItemDto,
  MenuItemQueryDto,
  ModifierGroupDto,
  SizeDto,
  UpdateMenuItemDto,
} from './dto/menu-item.dto';

// Shared include — every "full" return shape uses this so the admin UI
// always receives the nested sizes + modifier groups + modifiers.
const FULL_INCLUDE = {
  category: { select: { id: true, slug: true, name: true } },
  sizes: { orderBy: { sortOrder: 'asc' as const } },
  modifierGroups: {
    orderBy: { sortOrder: 'asc' as const },
    include: { modifiers: { orderBy: { sortOrder: 'asc' as const } } },
  },
};

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
    const { sizes, modifierGroups, ...itemData } = dto;
    try {
      return await this.prisma.menuItem.create({
        data: {
          ...itemData,
          sizes: sizes && sizes.length > 0 ? { create: sizes } : undefined,
          modifierGroups:
            modifierGroups && modifierGroups.length > 0
              ? {
                  create: modifierGroups.map((g) => ({
                    name: g.name,
                    isRequired: g.isRequired,
                    minSelection: g.minSelection,
                    maxSelection: g.maxSelection,
                    sortOrder: g.sortOrder ?? 0,
                    modifiers: { create: g.modifiers },
                  })),
                }
              : undefined,
        },
        include: FULL_INCLUDE,
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
    const { sizes, modifierGroups, ...itemData } = dto;

    // Wrap everything in a transaction so a failure in the nested
    // replacement rolls back the scalar update too.
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (Object.keys(itemData).length > 0) {
          await tx.menuItem.update({ where: { id }, data: itemData });
        }

        if (sizes !== undefined) {
          await this.replaceSizes(tx, id, sizes);
        }

        if (modifierGroups !== undefined) {
          await this.replaceModifierGroups(tx, id, modifierGroups);
        }

        const fresh = await tx.menuItem.findFirst({
          where: { id, deletedAt: null },
          include: FULL_INCLUDE,
        });
        if (!fresh) throw new NotFoundException(`Menu item "${id}" not found`);
        return fresh;
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException(`Slug "${dto.slug}" already in use`);
        }
        // P2003: trying to delete a Modifier that is referenced by an
        // existing OrderItemModifier (FK is Restrict by design — orders
        // keep a snapshot but still reference the modifier row).
        if (err.code === 'P2003') {
          throw new BadRequestException(
            'Cannot remove a modifier or modifier group that is referenced by past orders. ' +
              'Toggle its isAvailable flag instead, or keep it in the list.',
          );
        }
      }
      throw err;
    }
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

  // ------------------- nested helpers -------------------

  /**
   * Wipes the existing sizes for this menu item and writes the new ones.
   * ItemSize has no FK pointing back from orders (orders snapshot the size
   * name as a string), so a full replace is always safe.
   */
  private async replaceSizes(
    tx: Prisma.TransactionClient,
    menuItemId: string,
    sizes: SizeDto[],
  ) {
    await tx.itemSize.deleteMany({ where: { menuItemId } });
    if (sizes.length === 0) return;
    await tx.itemSize.createMany({
      data: sizes.map((s, i) => ({
        menuItemId,
        name: s.name,
        diameterCm: s.diameterCm,
        priceModifier: s.priceModifier,
        isDefault: s.isDefault ?? false,
        sortOrder: s.sortOrder ?? i,
      })),
    });
  }

  /**
   * Wipes existing modifier groups (cascading their modifiers) and writes
   * the new ones. If any of the removed modifiers is referenced by past
   * OrderItemModifier rows the transaction will throw P2003 and the
   * outer catch turns it into a friendly BadRequestException.
   */
  private async replaceModifierGroups(
    tx: Prisma.TransactionClient,
    menuItemId: string,
    groups: ModifierGroupDto[],
  ) {
    await tx.modifierGroup.deleteMany({ where: { menuItemId } });
    for (const [i, g] of groups.entries()) {
      await tx.modifierGroup.create({
        data: {
          menuItemId,
          name: g.name,
          isRequired: g.isRequired,
          minSelection: g.minSelection,
          maxSelection: g.maxSelection,
          sortOrder: g.sortOrder ?? i,
          modifiers: {
            create: g.modifiers.map((m, mi) => ({
              name: m.name,
              priceModifier: m.priceModifier,
              isAvailable: m.isAvailable ?? true,
              sortOrder: m.sortOrder ?? mi,
            })),
          },
        },
      });
    }
  }
}
