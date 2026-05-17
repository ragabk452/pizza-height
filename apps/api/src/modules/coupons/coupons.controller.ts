import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  type JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  // Public so guests can preview discounts before login — customer-specific
  // restrictions (first-order, per-customer caps) are enforced when the user is
  // authenticated, otherwise just generic checks.
  @Public()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validate a coupon code against the current cart subtotal',
  })
  validate(@Body() dto: ValidateCouponDto, @CurrentUser() user?: JwtPayload) {
    const customerId = user?.type === 'customer' ? user.sub : null;
    return this.service.validate(customerId, dto);
  }
}
