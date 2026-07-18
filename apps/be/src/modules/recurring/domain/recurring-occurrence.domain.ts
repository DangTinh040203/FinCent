import {
  type CategoryType,
  type RecurringOccurrenceDto,
  RecurringOccurrenceStatus,
} from '@repo/shared';

export class RecurringOccurrence {
  id: string;
  ruleId: string;
  userId: string;
  dueAt: Date;
  status: RecurringOccurrenceStatus;
  amount: number;
  transactionId: string | null;
  ruleName: string;
  ruleType: CategoryType;
  currency: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<RecurringOccurrence>) {
    Object.assign(this, partial);
  }

  get isPending(): boolean {
    return (
      this.status === RecurringOccurrenceStatus.PROJECTED ||
      this.status === RecurringOccurrenceStatus.DUE
    );
  }

  toDto(): RecurringOccurrenceDto {
    return {
      id: this.id,
      ruleId: this.ruleId,
      ruleName: this.ruleName,
      type: this.ruleType,
      dueAt: this.dueAt.toISOString(),
      status: this.status,
      amount: this.amount,
      currency: this.currency,
      transactionId: this.transactionId,
    };
  }
}
