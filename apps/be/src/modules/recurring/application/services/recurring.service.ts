import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CategoryType,
  RecurringOccurrenceStatus,
  TransactionSource,
  TransactionType,
} from '@repo/shared';

import {
  ACCOUNT_REPOSITORY_TOKEN,
  type IAccountRepository,
} from '@/modules/account/application/interfaces/account-repo.interface';
import { CategoryService } from '@/modules/category/application/services/category.service';
import {
  type ConfirmOccurrenceCommand,
  type CreateRecurringRuleCommand,
  type OccurrenceListFilters,
  type UpdateRecurringRuleCommand,
} from '@/modules/recurring/application/commands/recurring.command';
import {
  type IRecurringRepository,
  type PendingRecurringTotals,
  RECURRING_REPOSITORY_TOKEN,
} from '@/modules/recurring/application/interfaces/recurring-repo.interface';
import { RecurringMaterializerService } from '@/modules/recurring/application/services/recurring-materializer.service';
import {
  RecurringChangedEvent,
  RecurringEventName,
} from '@/modules/recurring/domain/recurring.events';
import { type RecurringOccurrence } from '@/modules/recurring/domain/recurring-occurrence.domain';
import { type RecurringRule } from '@/modules/recurring/domain/recurring-rule.domain';
import { TransactionService } from '@/modules/transaction/application/services/transaction.service';
import { type User } from '@/modules/user/domain';

@Injectable()
export class RecurringService {
  constructor(
    @Inject(RECURRING_REPOSITORY_TOKEN)
    private readonly recurringRepository: IRecurringRepository,
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: IAccountRepository,
    private readonly categoryService: CategoryService,
    private readonly transactionService: TransactionService,
    private readonly materializer: RecurringMaterializerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async listRules(user: User): Promise<RecurringRule[]> {
    return this.recurringRepository.findRulesByUser(user.id);
  }

  async getRule(user: User, id: string): Promise<RecurringRule> {
    const rule = await this.recurringRepository.findRuleById(user.id, id);
    if (!rule) {
      throw new NotFoundException('Recurring rule not found');
    }
    return rule;
  }

  async createRule(
    user: User,
    command: CreateRecurringRuleCommand,
  ): Promise<RecurringRule> {
    this.requireValidSchedule(command.nextDueAt, command.endsAt ?? null);
    const account = await this.requireAccount(user, command.accountId);
    await this.requireMatchingCategory(user, command.categoryId, command.type);

    const rule = await this.recurringRepository.createRule(
      user.id,
      account.currency,
      command,
    );
    await this.materializer.materializeRule(rule);
    this.emitChanged(user.id);
    return rule;
  }

  async updateRule(
    user: User,
    id: string,
    command: UpdateRecurringRuleCommand,
  ): Promise<RecurringRule> {
    const rule = await this.getRule(user, id);

    this.requireValidSchedule(
      command.nextDueAt ?? rule.nextDueAt,
      command.endsAt === undefined ? rule.endsAt : command.endsAt,
    );

    let currency: string | undefined;
    if (command.accountId && command.accountId !== rule.accountId) {
      const account = await this.requireAccount(user, command.accountId);
      currency = account.currency;
    }
    if (command.categoryId && command.categoryId !== rule.categoryId) {
      await this.requireMatchingCategory(user, command.categoryId, rule.type);
    }

    const updated = await this.recurringRepository.updateRule(id, {
      ...command,
      currency,
    });
    await this.materializer.rematerializeRule(updated);
    this.emitChanged(user.id);
    return updated;
  }

  async deleteRule(user: User, id: string): Promise<void> {
    await this.getRule(user, id);
    await this.recurringRepository.deleteRule(id);
    this.emitChanged(user.id);
  }

  async listOccurrences(
    user: User,
    filters: OccurrenceListFilters,
    limit: number,
  ): Promise<RecurringOccurrence[]> {
    return this.recurringRepository.findOccurrences(user.id, filters, limit);
  }

  async confirmOccurrence(
    user: User,
    id: string,
    command: ConfirmOccurrenceCommand,
  ): Promise<RecurringOccurrence> {
    const occurrence = await this.requirePendingOccurrence(user, id);
    const rule = await this.getRule(user, occurrence.ruleId);

    const amount = command.amount ?? occurrence.amount;
    const transaction = await this.transactionService.create(user, {
      accountId: rule.accountId,
      type:
        rule.type === CategoryType.INCOME
          ? TransactionType.INCOME
          : TransactionType.EXPENSE,
      amount,
      occurredAt: command.occurredAt ?? new Date(),
      categoryId: rule.categoryId,
      note: rule.name,
      source: TransactionSource.RECURRING,
    });

    const resolved = await this.recurringRepository.resolveOccurrence(
      id,
      RecurringOccurrenceStatus.CONFIRMED,
      transaction.id,
      amount,
    );

    await this.advanceRuleIfNeeded(rule, occurrence);
    this.emitChanged(user.id);
    return resolved;
  }

  async skipOccurrence(user: User, id: string): Promise<RecurringOccurrence> {
    const occurrence = await this.requirePendingOccurrence(user, id);
    const rule = await this.getRule(user, occurrence.ruleId);

    const resolved = await this.recurringRepository.resolveOccurrence(
      id,
      RecurringOccurrenceStatus.SKIPPED,
      null,
    );

    await this.advanceRuleIfNeeded(rule, occurrence);
    this.emitChanged(user.id);
    return resolved;
  }

  async pendingTotalsForPeriod(
    userId: string,
    currency: string,
    from: Date,
    to: Date,
  ): Promise<PendingRecurringTotals[]> {
    return this.recurringRepository.sumPendingByTypeInRange(
      userId,
      currency,
      from,
      to,
    );
  }

  private async advanceRuleIfNeeded(
    rule: RecurringRule,
    occurrence: RecurringOccurrence,
  ): Promise<void> {
    if (occurrence.dueAt.getTime() >= rule.nextDueAt.getTime()) {
      const nextDueAt = this.materializer.nextAfter(rule, occurrence.dueAt);
      await this.recurringRepository.advanceRule(rule.id, nextDueAt);
    }
  }

  private async requirePendingOccurrence(
    user: User,
    id: string,
  ): Promise<RecurringOccurrence> {
    const occurrence = await this.recurringRepository.findOccurrenceById(
      user.id,
      id,
    );
    if (!occurrence) {
      throw new NotFoundException('Occurrence not found');
    }
    if (!occurrence.isPending) {
      throw new BadRequestException('Occurrence has already been resolved');
    }
    return occurrence;
  }

  private requireValidSchedule(nextDueAt: Date, endsAt: Date | null): void {
    if (endsAt && endsAt < nextDueAt) {
      throw new BadRequestException(
        'End date must be on or after the next due date',
      );
    }
  }

  private async requireAccount(user: User, accountId: string) {
    const account = await this.accountRepository.findById(user.id, accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (account.isArchived) {
      throw new BadRequestException('Account is archived');
    }
    return account;
  }

  private async requireMatchingCategory(
    user: User,
    categoryId: string,
    type: CategoryType,
  ): Promise<void> {
    const category = await this.categoryService.get(user, categoryId);
    if (category.type !== type) {
      throw new BadRequestException(
        'Category type does not match the rule type',
      );
    }
  }

  private emitChanged(userId: string): void {
    this.eventEmitter.emit(
      RecurringEventName.CHANGED,
      new RecurringChangedEvent(userId),
    );
  }
}
