import {
  type CategoryType,
  type RecurringCadence,
  type RecurringRuleDto,
} from '@repo/shared';

export class RecurringRule {
  id: string;
  userId: string;
  name: string;
  accountId: string;
  categoryId: string;
  type: CategoryType;
  amount: number;
  currency: string;
  cadence: RecurringCadence;
  interval: number;
  nextDueAt: Date;
  endsAt: Date | null;
  autoConfirm: boolean;
  isPaused: boolean;
  isEssential: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<RecurringRule>) {
    Object.assign(this, partial);
  }

  get isActive(): boolean {
    return !this.isPaused && (!this.endsAt || this.endsAt >= new Date());
  }

  toDto(): RecurringRuleDto {
    return {
      id: this.id,
      name: this.name,
      accountId: this.accountId,
      categoryId: this.categoryId,
      type: this.type,
      amount: this.amount,
      currency: this.currency,
      cadence: this.cadence,
      interval: this.interval,
      nextDueAt: this.nextDueAt.toISOString(),
      endsAt: this.endsAt ? this.endsAt.toISOString() : null,
      autoConfirm: this.autoConfirm,
      isPaused: this.isPaused,
      isEssential: this.isEssential,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
