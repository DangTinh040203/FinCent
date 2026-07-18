import {
  BudgetPeriodType,
  type CreateBudgetPayload,
  type UpdateBudgetPayload,
} from '@repo/shared';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateBudgetDto implements CreateBudgetPayload {
  @IsUUID()
  categoryId: string;

  @IsInt()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsEnum(BudgetPeriodType)
  periodType?: BudgetPeriodType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsBoolean()
  rollover?: boolean;
}

export class UpdateBudgetDto implements UpdateBudgetPayload {
  @IsOptional()
  @IsInt()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsBoolean()
  rollover?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
