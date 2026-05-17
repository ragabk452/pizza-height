import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

// ---------------------------------------------------------------------------
// Nested children — passed inside the create/update payload. The service
// wraps the whole write in a Prisma transaction so the menu item + its
// sizes + its modifier groups + their modifiers all land atomically.
// ---------------------------------------------------------------------------

export class SizeDto {
  @ApiProperty({ example: 'Large' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;

  @ApiPropertyOptional({ example: 32 })
  @IsOptional()
  @IsInt()
  @Min(0)
  diameterCm?: number;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  priceModifier!: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ModifierDto {
  @ApiProperty({ example: 'Truffle oil drizzle' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  priceModifier!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ModifierGroupDto {
  @ApiProperty({ example: 'Extra toppings' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  isRequired!: boolean;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  minSelection!: number;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(0)
  maxSelection!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ type: [ModifierDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ModifierDto)
  modifiers!: ModifierDto[];
}

// ---------------------------------------------------------------------------
// Top-level menu item DTOs
// ---------------------------------------------------------------------------

export class CreateMenuItemDto {
  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiProperty({ example: 'truffle-bianca' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MinLength(2)
  @MaxLength(80)
  slug!: string;

  @ApiProperty({ example: 'Truffle Bianca' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 24 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSpicy?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isVegetarian?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isVegan?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isGlutenFree?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @ApiPropertyOptional({ default: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  prepTimeMin?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  // Nested children — admin UI sends the full desired state of sizes +
  // modifier groups in one payload. The service treats them as a complete
  // replacement (delete-then-create) so admins can reorder, add, and remove
  // without orchestrating per-row HTTP calls.
  @ApiPropertyOptional({ type: [SizeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeDto)
  sizes?: SizeDto[];

  @ApiPropertyOptional({ type: [ModifierGroupDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierGroupDto)
  modifierGroups?: ModifierGroupDto[];
}

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}

export class MenuItemQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category id or slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Full-text search in name/description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Only popular items' })
  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @ApiPropertyOptional({
    description: 'Only available (in-stock) items',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  availableOnly?: boolean;
}
