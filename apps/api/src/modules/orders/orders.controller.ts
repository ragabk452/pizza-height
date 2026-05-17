import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderStatus, OrderType, UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  type JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';

// NestJS / Express resolve routes in declaration order. All static-prefix
// handlers MUST be declared before the catch-all `@Get(':id')` and the
// `@Patch(':id/status')` handlers below, otherwise a new route like
// `@Get('export')` declared further down would be swallowed by `:id`.
@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  // ============================================================
  // Customer endpoints (static prefixes / create)
  // ============================================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place an order (customer only)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    if (user.type !== 'customer') {
      throw new ForbiddenException('Only customers can place orders');
    }
    return this.service.create(user.sub, dto);
  }

  @Get('me')
  @ApiOperation({ summary: "List the current customer's orders" })
  findMine(@CurrentUser() user: JwtPayload) {
    if (user.type !== 'customer') {
      throw new ForbiddenException('Customer authentication required');
    }
    return this.service.findMine(user.sub);
  }

  // ============================================================
  // Staff endpoints (static prefixes)
  // ============================================================
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'List all orders (staff only)' })
  findAllForStaff(
    @Query('status') status?: OrderStatus,
    @Query('type') type?: OrderType,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAllForStaff({
      status,
      type,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('stats/today')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({
    summary: "Today's KPIs + status counts + recent orders (admin dashboard)",
  })
  stats() {
    return this.service.stats();
  }

  @Get('kds/board')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({
    summary:
      'Kitchen Display board — active orders only, sorted by estimatedReadyAt',
  })
  kdsBoard() {
    return this.service.kdsBoard();
  }

  // ============================================================
  // Dynamic-id endpoints — MUST stay at the bottom
  // ============================================================
  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id (customer owns it or staff)' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.findOne(id, { id: user.sub, type: user.type });
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN, UserRole.DRIVER)
  @ApiOperation({ summary: 'Transition an order to the next status (staff)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateStatus(id, dto, user.sub);
  }
}
