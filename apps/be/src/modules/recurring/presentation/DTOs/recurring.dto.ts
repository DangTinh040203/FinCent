import {
  CategoryType,
  RecurringCadence,
  RecurringOccurrenceStatus,
} from '@repo/shared';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateRecurringRuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsUUID()
  accountId: string;

  @IsUUID()
  categoryId: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsInt()
  @IsPositive()
  amount: number;

  @IsEnum(RecurringCadence)
  cadence: RecurringCadence;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  interval?: number;

  @IsDateString()
  nextDueAt: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsBoolean()
  autoConfirm?: boolean;

  @IsOptional()
  @IsBoolean()
  isEssential?: boolean;
}

export class UpdateRecurringRuleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsEnum(RecurringCadence)
  cadence?: RecurringCadence;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  interval?: number;

  @IsOptional()
  @IsDateString()
  nextDueAt?: string;

  @ValidateIf((dto: UpdateRecurringRuleDto) => dto.endsAt !== null)
  @IsOptional()
  @IsDateString()
  endsAt?: string | null;

  @IsOptional()
  @IsBoolean()
  autoConfirm?: boolean;

  @IsOptional()
  @IsBoolean()
  isEssential?: boolean;

  @IsOptional()
  @IsBoolean()
  isPaused?: boolean;
}

export class ConfirmOccurrenceDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

export class ListOccurrencesQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: string | string[] }) =>
    Array.isArray(value) ? value : value.split(','),
  )
  @IsEnum(RecurringOccurrenceStatus, { each: true })
  status?: RecurringOccurrenceStatus[];

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
