import { type CategoryType } from '../enums/category.enum';
import {
  type RecurringCadence,
  type RecurringOccurrenceStatus,
} from '../enums/recurring.enum';

export interface RecurringRuleDto {
  id: string;
  name: string;
  accountId: string;
  categoryId: string;
  type: CategoryType;
  amount: number;
  currency: string;
  cadence: RecurringCadence;
  interval: number;
  nextDueAt: string;
  endsAt: string | null;
  autoConfirm: boolean;
  isPaused: boolean;
  isEssential: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringRulePayload {
  name: string;
  accountId: string;
  categoryId: string;
  type: CategoryType;
  amount: number;
  cadence: RecurringCadence;
  interval?: number;
  nextDueAt: string;
  endsAt?: string;
  autoConfirm?: boolean;
  isEssential?: boolean;
}

export interface UpdateRecurringRulePayload {
  name?: string;
  accountId?: string;
  categoryId?: string;
  amount?: number;
  cadence?: RecurringCadence;
  interval?: number;
  nextDueAt?: string;
  endsAt?: string | null;
  autoConfirm?: boolean;
  isEssential?: boolean;
  isPaused?: boolean;
}

export interface RecurringOccurrenceDto {
  id: string;
  ruleId: string;
  ruleName: string;
  type: CategoryType;
  dueAt: string;
  status: RecurringOccurrenceStatus;
  amount: number;
  currency: string;
  transactionId: string | null;
}

export interface ConfirmOccurrencePayload {
  amount?: number;
  occurredAt?: string;
}
