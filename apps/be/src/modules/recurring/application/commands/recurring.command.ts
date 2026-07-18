import {
  type CategoryType,
  type RecurringCadence,
  type RecurringOccurrenceStatus,
} from '@repo/shared';

export interface CreateRecurringRuleCommand {
  name: string;
  accountId: string;
  categoryId: string;
  type: CategoryType;
  amount: number;
  cadence: RecurringCadence;
  interval?: number;
  nextDueAt: Date;
  endsAt?: Date;
  autoConfirm?: boolean;
  isEssential?: boolean;
}

export interface UpdateRecurringRuleCommand {
  name?: string;
  accountId?: string;
  categoryId?: string;
  amount?: number;
  cadence?: RecurringCadence;
  interval?: number;
  nextDueAt?: Date;
  endsAt?: Date | null;
  autoConfirm?: boolean;
  isEssential?: boolean;
  isPaused?: boolean;
}

export interface ConfirmOccurrenceCommand {
  amount?: number;
  occurredAt?: Date;
}

export interface OccurrenceListFilters {
  statuses?: RecurringOccurrenceStatus[];
  from?: Date;
  to?: Date;
}
