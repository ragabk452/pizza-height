import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers (admin/manager only)' })
  findAll(@Query('search') search?: string, @Query('limit') limitRaw?: string) {
    // Validate manually — the global ValidationPipe's enableImplicitConversion
    // silently turns "abc" into NaN before ParseIntPipe gets to reject it,
    // which Prisma then rejects with a 500. Inline validation gives a clean
    // 400 with a useful message.
    let limit = 100;
    if (limitRaw !== undefined) {
      const parsed = Number.parseInt(String(limitRaw), 10);
      if (!Number.isFinite(parsed) || parsed < 1) {
        throw new BadRequestException('limit must be a positive integer');
      }
      // Cap so a misbehaving client can't ask for everything in one request.
      limit = Math.min(parsed, 500);
    }
    return this.service.findAll({ search, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one customer with addresses + recent orders' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
