import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsUrl } from 'class-validator';
import { UploadService } from './upload.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

class UploadFromUrlDto {
  @IsUrl()
  url!: string;
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Post('from-url')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image to Cloudinary from a remote URL' })
  uploadFromUrl(@Body() dto: UploadFromUrlDto) {
    return this.service.uploadFromUrl(dto.url);
  }
}
