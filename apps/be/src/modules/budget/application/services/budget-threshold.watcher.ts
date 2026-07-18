import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  formatMoney,
  NotificationType,
  TransactionType,
} from '@repo/shared';

import { BudgetService } from '@/modules/budget/application/services/budget.service';
import { type BudgetStatus } from '@/modules/budget/domain/budget-status';
import { CategoryService } from '@/modules/category/application/services/category.service';
import { NotificationService } from '@/modules/notification/application/services/notification.service';
import {
  type TransactionChangedEvent,
  TransactionEventName,
} from '@/modules/transaction/domain/transaction.events';
import {
  type IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '@/modules/user/application/interfaces';

const WARNING_THRESHOLD_PERCENT = 80;

@Injectable()
export class BudgetThresholdWatcher {
  private readonly logger = new Logger(BudgetThresholdWatcher.name);

  constructor(
    private readonly budgetService: BudgetService,
    private readonly categoryService: CategoryService,
    private readonly notificationService: NotificationService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  @OnEvent(TransactionEventName.CREATED)
  @OnEvent(TransactionEventName.UPDATED)
  async evaluate(event: TransactionChangedEvent): Promise<void> {
    const { transaction } = event;
    if (
      transaction.type !== TransactionType.EXPENSE ||
      !transaction.categoryId
    ) {
      return;
    }

    try {
      const user = await this.userRepository.findById(event.userId);
      if (!user) {
        return;
      }

      const category = await this.categoryService.get(
        user,
        transaction.categoryId,
      );
      const candidateCategoryIds = category.parentId
        ? [category.id, category.parentId]
        : [category.id];

      const statuses = await this.budgetService.statusesForCategory(
        user,
        candidateCategoryIds,
      );

      for (const status of statuses) {
        await this.notifyThresholds(status);
      }
    } catch (error) {
      this.logger.error(
        'Failed to evaluate budget thresholds',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async notifyThresholds(status: BudgetStatus): Promise<void> {
    const periodKey = status.period.start.toISOString().slice(0, 10);
    const { budget } = status;

    if (status.percentUsed >= 100) {
      await this.notificationService.notify(budget.userId, {
        type: NotificationType.BUDGET_EXCEEDED,
        title: `${budget.categoryName} budget exceeded`,
        body: `You have spent ${formatMoney(status.spent, budget.currency)} of your ${formatMoney(budget.amount, budget.currency)} ${budget.categoryName} budget.`,
        link: '/budgets',
        dedupeKey: `budget:${budget.id}:${periodKey}:100`,
      });
      return;
    }

    if (status.percentUsed >= WARNING_THRESHOLD_PERCENT) {
      await this.notificationService.notify(budget.userId, {
        type: NotificationType.BUDGET_AT_RISK,
        title: `${budget.categoryName} budget at ${Math.floor(status.percentUsed)}%`,
        body: `Keep daily spend under ${formatMoney(status.suggestedDailySpend, budget.currency)} to stay within budget.`,
        link: '/budgets',
        dedupeKey: `budget:${budget.id}:${periodKey}:80`,
      });
    }
  }
}
