import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly service: AddressesService) {}

  @Get('me')
  @ApiOperation({ summary: "List the current customer's saved addresses" })
  findMine(@CurrentUser() user: JwtPayload) {
    this.ensureCustomer(user);
    return this.service.findMine(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new delivery address' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAddressDto) {
    this.ensureCustomer(user);
    return this.service.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    this.ensureCustomer(user);
    return this.service.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an address' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    this.ensureCustomer(user);
    await this.service.remove(user.sub, id);
  }

  private ensureCustomer(user: JwtPayload) {
    if (user.type !== 'customer') {
      throw new ForbiddenException('Customer authentication required');
    }
  }
}
