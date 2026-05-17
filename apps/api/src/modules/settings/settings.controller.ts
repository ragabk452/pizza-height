import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SettingsService } from './settings.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all restaurant settings (public)' })
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'Get one setting by key' })
  get(@Param('key') key: string) {
    return this.service.get(key);
  }

  @Put(':key')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a setting (admin/manager only)' })
  upsert(@Param('key') key: string, @Body('value') value: unknown) {
    return this.service.upsert(key, value);
  }
}
