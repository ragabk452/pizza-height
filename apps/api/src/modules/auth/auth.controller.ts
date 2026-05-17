import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  CustomerLoginDto,
  RegisterCustomerDto,
} from './dto/register-customer.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  type JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// Tight rate-limit on credential-handling endpoints to slow down
// brute-force / credential-stuffing attacks. Default global limit is
// 100/min — these get 5/min per IP.
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

class RefreshDto {
  @IsString()
  refreshToken!: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ========== Staff ==========
  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff login (admin/manager/kitchen/driver)' })
  staffLogin(@Body() dto: LoginDto) {
    return this.authService.staffLogin(dto);
  }

  // ========== Customer ==========
  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('customer/register')
  @ApiOperation({ summary: 'Register a new customer' })
  customerRegister(@Body() dto: RegisterCustomerDto) {
    return this.authService.customerRegister(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login (phone + password)' })
  customerLogin(@Body() dto: CustomerLoginDto) {
    return this.authService.customerLogin(dto);
  }

  // ========== Shared ==========
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a new access token' })
  @ApiBody({ type: RefreshDto })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user);
  }
}
