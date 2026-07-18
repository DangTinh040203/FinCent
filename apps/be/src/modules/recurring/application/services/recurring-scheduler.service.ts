import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CategoryType, formatMoney, NotificationType } from '@repo/shared';

import {
  ACCOUNT_REPOSITORY_TOKEN,
  type IAccountRepository,
} from '@/modules/account/application/interfaces/account-repo.interface';
import { NotificationService } from '@/modules/notification/application/services/notification.service';
import {
  type IRecurringRepository,
  RECURRING_REPOSITORY_TOKEN,
} from '@/modules/recurring/application/interfaces/recurring-repo.interface';
import { RecurringService } from '@/modules/recurring/application/services/recurring.service';
import { RecurringMaterializerService } from '@/modules/recurring/application/services/recurring-materializer.service';
import { type RecurringOccurrence } from '@/modules/recurring/domain/recurring-occurrence.domain';
import {
  type IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '@/modules/user/application/interfaces';

@Injectable()
export class RecurringSchedulerService {
  private readonly logger = new Logger(RecurringSchedulerService.name);

  constructor(
    @Inject(RECURRING_REPOSITORY_TOKEN)
    private readonly recurringRepository: IRecurringRepository,
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: IAccountRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly materializer: RecurringMaterializerService,
    private readonly recurringService: RecurringService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async tick(): Promise<void> {
    await this.materializeUpcoming();
    await this.processDueOccurrences();
  }

  private async materializeUpcoming(): Promise<void> {
    const rules = await this.recurringRepository.findActiveRulesDueBefore(
      this.materializer.horizon,
    );
    for (const rule of rules) {
      try {
        await this.materializer.materializeRule(rule);
      } catch (error) {
        this.logger.error(
          `Failed to materialize rule ${rule.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  private async processDueOccurrences(): Promise<void> {
    const dueOccurrences = await this.recurringRepository.markOccurrencesDue(
      new Date(),
    );

    for (const occurrence of dueOccurrences) {
      try {
        await this.handleDueOccurrence(occurrence);
      } catch (error) {
        this.logger.error(
          `Failed to process due occurrence ${occurrence.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  private async handleDueOccurrence(
    occurrence: RecurringOccurrence,
  ): Promise<void> {
    const rule = await this.recurringRepository.findRuleById(
      occurrence.userId,
      occurrence.ruleId,
    );
    if (!rule) {
      return;
    }

    if (rule.autoConfirm) {
      const user = await this.userRepository.findById(occurrence.userId);
      if (user) {
        await this.recurringService.confirmOccurrence(user, occurrence.id, {});
        return;
      }
    }

    const formatted = formatMoney(occurrence.amount, occurrence.currency);
    await this.notificationService.notify(occurrence.userId, {
      type: NotificationType.BILL_DUE,
      title: `${occurrence.ruleName} is due`,
      body: `${occurrence.ruleName} (${formatted}) is due. Confirm it to record the transaction.`,
      link: '/recurring',
      dedupeKey: `bill-due:${occurrence.id}`,
    });

    if (rule.type === CategoryType.EXPENSE) {
      await this.warnIfBalanceInsufficient(occurrence, rule.accountId);
    }
  }

  private async warnIfBalanceInsufficient(
    occurrence: RecurringOccurrence,
    accountId: string,
  ): Promise<void> {
    const account = await this.accountRepository.findById(
      occurrence.userId,
      accountId,
    );
    if (!account || account.currentBalance >= occurrence.amount) {
      return;
    }

    await this.notificationService.notify(occurrence.userId, {
      type: NotificationType.LOW_BALANCE_FOR_BILL,
      title: `Balance too low for ${occurrence.ruleName}`,
      body: `${account.name} holds ${formatMoney(account.currentBalance, account.currency)}, but ${occurrence.ruleName} needs ${formatMoney(occurrence.amount, occurrence.currency)}.`,
      link: '/accounts',
      dedupeKey: `low-balance:${occurrence.id}`,
    });
  }
}
