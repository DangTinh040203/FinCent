import {
  type TransactionListQuery,
  TransactionType,
} from '@repo/shared';
import { Type } from 'class-transformer';
import {
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

export class CreateTransactionDto {
  @IsUUID()
  accountId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsInt()
  @IsPositive()
  amount: number;

  @IsDateString()
  occurredAt: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  counterAccountId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ValidateIf((dto: UpdateTransactionDto) => dto.categoryId !== null)
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ValidateIf((dto: UpdateTransactionDto) => dto.counterAccountId !== null)
  @IsOptional()
  @IsUUID()
  counterAccountId?: string | null;

  @ValidateIf((dto: UpdateTransactionDto) => dto.note !== null)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string | null;
}

export class ListTransactionsQueryDto implements TransactionListQuery {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  search?: string;
}
