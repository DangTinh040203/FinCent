import {
  AccountType,
  type CreateAccountPayload,
  SUPPORTED_CURRENCIES,
  type UpdateAccountPayload,
} from '@repo/shared';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAccountDto implements CreateAccountPayload {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: string;

  @IsOptional()
  @IsInt()
  openingBalance?: number;
}

export class UpdateAccountDto implements UpdateAccountPayload {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @IsOptional()
  @IsInt()
  openingBalance?: number;
}

export class ListAccountsQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  includeArchived?: string;
}
