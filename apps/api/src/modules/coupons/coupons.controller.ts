import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  // Requires customer auth so we can enforce per-customer restrictions
  // (firstOrderOnly, maxUsesPerCustomer) at preview time. Otherwise the
  // checkout page would let a customer "apply" a coupon that the order
  // endpoint then rejects with a confusing error.
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate a coupon code against the current cart subtotal',
  })
  validate(@Body() dto: ValidateCouponDto, @CurrentUser() user: JwtPayload) {
    if (user.type !== 'customer') {
      throw new ForbiddenException('Customer authentication required');
    }
    return this.service.validate(user.sub, dto);
  }
}
