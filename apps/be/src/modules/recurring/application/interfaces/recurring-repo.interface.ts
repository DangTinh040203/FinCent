import { type CategoryType } from '@repo/shared';

import {
  type CreateRecurringRuleCommand,
  type OccurrenceListFilters,
  type UpdateRecurringRuleCommand,
} from '@/modules/recurring/application/commands/recurring.command';
import { type RecurringOccurrence } from '@/modules/recurring/domain/recurring-occurrence.domain';
import { type RecurringRule } from '@/modules/recurring/domain/recurring-rule.domain';

export const RECURRING_REPOSITORY_TOKEN = Symbol('RECURRING_REPOSITORY_TOKEN');

export interface PendingRecurringTotals {
  type: CategoryType;
  isEssential: boolean;
  total: number;
}

export interface IRecurringRepository {
  createRule(
    userId: string,
    currency: string,
    command: CreateRecurringRuleCommand,
  ): Promise<RecurringRule>;
  findRuleById(userId: string, id: string): Promise<RecurringRule | null>;
  findRulesByUser(userId: string): Promise<RecurringRule[]>;
  findActiveRulesDueBefore(horizon: Date): Promise<RecurringRule[]>;
  updateRule(
    id: string,
    data: UpdateRecurringRuleCommand & { currency?: string },
  ): Promise<RecurringRule>;
  advanceRule(id: string, nextDueAt: Date): Promise<void>;
  deleteRule(id: string): Promise<void>;
  upsertProjectedOccurrence(
    ruleId: string,
    userId: string,
    dueAt: Date,
    amount: number,
  ): Promise<void>;
  deletePendingOccurrences(ruleId: string): Promise<void>;
  markOccurrencesDue(now: Date): Promise<RecurringOccurrence[]>;
  findOccurrences(
    userId: string,
    filters: OccurrenceListFilters,
    limit: number,
  ): Promise<RecurringOccurrence[]>;
  findOccurrenceById(
    userId: string,
    id: string,
  ): Promise<RecurringOccurrence | null>;
  resolveOccurrence(
    id: string,
    status: string,
    transactionId: string | null,
    amount?: number,
  ): Promise<RecurringOccurrence>;
  sumPendingByTypeInRange(
    userId: string,
    currency: string,
    from: Date,
    to: Date,
  ): Promise<PendingRecurringTotals[]>;
}
