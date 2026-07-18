import {
  type BudgetPeriodType,
  type BudgetRiskLevel,
} from '../enums/budget.enum';
import { type PeriodDto } from './common.contract';

export interface BudgetDto {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  amount: number;
  currency: string;
  periodType: BudgetPeriodType;
  startDate: string;
  rollover: boolean;
  isArchived: boolean;
}

export interface BudgetStatusDto extends BudgetDto {
  period: PeriodDto;
  spent: number;
  remaining: number;
  percentUsed: number;
  pace: number;
  projected: number;
  projectedOverrunAt: string | null;
  suggestedDailySpend: number;
  riskLevel: BudgetRiskLevel;
}

export interface CreateBudgetPayload {
  categoryId: string;
  amount: number;
  periodType?: BudgetPeriodType;
  startDate?: string;
  rollover?: boolean;
}

export interface UpdateBudgetPayload {
  amount?: number;
  rollover?: boolean;
  isArchived?: boolean;
}
