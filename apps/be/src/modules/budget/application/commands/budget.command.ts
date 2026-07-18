import { type BudgetPeriodType } from '@repo/shared';

export interface CreateBudgetCommand {
  categoryId: string;
  amount: number;
  periodType?: BudgetPeriodType;
  startDate?: Date;
  rollover?: boolean;
}

export interface UpdateBudgetCommand {
  amount?: number;
  rollover?: boolean;
  isArchived?: boolean;
}
