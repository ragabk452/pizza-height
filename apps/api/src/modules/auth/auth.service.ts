import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import {
  CustomerLoginDto,
  RegisterCustomerDto,
} from './dto/register-customer.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ============================================================
  // Staff Login
  // ============================================================
  async staffLogin(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'staff',
    };
    const tokens = await this.signTokens(payload);
    await this.persistRefreshToken('staff', user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // ============================================================
  // Customer Register + Login
  // ============================================================
  async customerRegister(dto: RegisterCustomerDto) {
    const existingPhone = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
    });
    if (existingPhone) throw new ConflictException('Phone already registered');
    if (dto.email) {
      const existingEmail = await this.prisma.customer.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail)
        throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        passwordHash,
      },
    });

    const payload: JwtPayload = {
      sub: customer.id,
      phone: customer.phone,
      type: 'customer',
    };
    const tokens = await this.signTokens(payload);
    await this.persistRefreshToken(
      'customer',
      customer.id,
      tokens.refreshToken,
    );

    return {
      ...tokens,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    };
  }

  async customerLogin(dto: CustomerLoginDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
    });
    if (!customer || !customer.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: customer.id,
      phone: customer.phone,
      type: 'customer',
    };
    const tokens = await this.signTokens(payload);
    await this.persistRefreshToken(
      'customer',
      customer.id,
      tokens.refreshToken,
    );

    return {
      ...tokens,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    };
  }

  // ============================================================
  // Refresh Token
  // ============================================================
  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret')!,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check token matches the stored one
    const storedToken =
      payload.type === 'staff'
        ? (await this.prisma.user.findUnique({ where: { id: payload.sub } }))
            ?.refreshToken
        : (
            await this.prisma.customer.findUnique({
              where: { id: payload.sub },
            })
          )?.refreshToken;

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const newPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      type: payload.type,
    };
    const tokens = await this.signTokens(newPayload);
    await this.persistRefreshToken(
      payload.type,
      payload.sub,
      tokens.refreshToken,
    );
    return tokens;
  }

  // ============================================================
  // Logout
  // ============================================================
  async logout(payload: JwtPayload) {
    await this.persistRefreshToken(payload.type, payload.sub, null);
    return { success: true };
  }

  // ============================================================
  // Helpers
  // ============================================================
  private async signTokens(payload: JwtPayload): Promise<AuthTokens> {
    // ms-style strings ('15m', '7d') are valid but their type isn't inferable from `string`
    const accessExp = this.config.get<string>(
      'jwt.accessExpiry',
    )! as unknown as number;
    const refreshExp = this.config.get<string>(
      'jwt.refreshExpiry',
    )! as unknown as number;
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { ...payload },
        {
          secret: this.config.get<string>('jwt.secret')!,
          expiresIn: accessExp,
        },
      ),
      this.jwt.signAsync(
        { ...payload },
        {
          secret: this.config.get<string>('jwt.refreshSecret')!,
          expiresIn: refreshExp,
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(
    type: 'staff' | 'customer',
    id: string,
    token: string | null,
  ) {
    if (type === 'staff') {
      await this.prisma.user.update({
        where: { id },
        data: { refreshToken: token },
      });
    } else {
      await this.prisma.customer.update({
        where: { id },
        data: { refreshToken: token },
      });
    }
  }
}
