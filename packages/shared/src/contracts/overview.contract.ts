import { type AccountType } from '../enums/account.enum';
import { type PeriodDto } from './common.contract';

export interface AccountBalanceDto {
  accountId: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
}

export interface CategorySpendDto {
  categoryId: string;
  name: string;
  icon: string | null;
  amount: number;
}

export interface DailySpendPointDto {
  date: string;
  amount: number;
}

export interface OverviewDto {
  period: PeriodDto;
  currency: string;
  totalBalance: number;
  accounts: AccountBalanceDto[];
  income: number;
  expense: number;
  net: number;
  topCategories: CategorySpendDto[];
  dailySpend: DailySpendPointDto[];
}
