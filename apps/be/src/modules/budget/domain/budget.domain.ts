import { type BudgetDto, type BudgetPeriodType } from '@repo/shared';

export class Budget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  amount: number;
  currency: string;
  periodType: BudgetPeriodType;
  startDate: Date;
  rollover: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Budget>) {
    Object.assign(this, partial);
  }

  toDto(): BudgetDto {
    return {
      id: this.id,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      categoryIcon: this.categoryIcon,
      amount: this.amount,
      currency: this.currency,
      periodType: this.periodType,
      startDate: this.startDate.toISOString(),
      rollover: this.rollover,
      isArchived: this.isArchived,
    };
  }
}
