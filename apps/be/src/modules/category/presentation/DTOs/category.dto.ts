import {
  CategoryType,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '@repo/shared';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateCategoryDto implements CreateCategoryPayload {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCategoryDto implements UpdateCategoryPayload {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @ValidateIf((dto: UpdateCategoryDto) => dto.parentId !== null)
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
