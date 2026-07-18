import { BudgetRiskLevel, type BudgetStatusDto } from '@repo/shared';

import { type Period } from '@/libs/periods';
import { type Budget } from '@/modules/budget/domain/budget.domain';

const AT_RISK_PERCENT = 80;

export class BudgetStatus {
  constructor(
    readonly budget: Budget,
    readonly period: Period,
    readonly spent: number,
    private readonly now: Date = new Date(),
  ) {}

  get remaining(): number {
    return this.budget.amount - this.spent;
  }

  get percentUsed(): number {
    if (this.budget.amount <= 0) {
      return 0;
    }
    return (this.spent / this.budget.amount) * 100;
  }

  get elapsedDays(): number {
    const elapsed = this.period.elapsedFraction(this.now) * this.period.totalDays;
    return Math.max(elapsed, 1);
  }

  get pace(): number {
    return this.spent / this.elapsedDays;
  }

  get projected(): number {
    return Math.round(this.pace * this.period.totalDays);
  }

  get projectedOverrunAt(): Date | null {
    if (this.pace <= 0 || this.projected <= this.budget.amount) {
      return null;
    }
    const daysUntilOverrun = this.budget.amount / this.pace;
    const overrunAt = new Date(
      this.period.start.getTime() + daysUntilOverrun * 86_400_000,
    );
    return overrunAt < this.period.end ? overrunAt : null;
  }

  get suggestedDailySpend(): number {
    const remainingDays = this.period.remainingDays(this.now);
    if (remainingDays <= 0 || this.remaining <= 0) {
      return 0;
    }
    return Math.floor(this.remaining / remainingDays);
  }

  get riskLevel(): BudgetRiskLevel {
    if (this.spent >= this.budget.amount) {
      return BudgetRiskLevel.OVER_BUDGET;
    }
    if (
      this.percentUsed >= AT_RISK_PERCENT ||
      this.projected > this.budget.amount
    ) {
      return BudgetRiskLevel.AT_RISK;
    }
    return BudgetRiskLevel.ON_TRACK;
  }

  toDto(): BudgetStatusDto {
    return {
      ...this.budget.toDto(),
      period: this.period.toDto(),
      spent: this.spent,
      remaining: this.remaining,
      percentUsed: Math.round(this.percentUsed * 10) / 10,
      pace: Math.round(this.pace),
      projected: this.projected,
      projectedOverrunAt: this.projectedOverrunAt
        ? this.projectedOverrunAt.toISOString()
        : null,
      suggestedDailySpend: this.suggestedDailySpend,
      riskLevel: this.riskLevel,
    };
  }
}
