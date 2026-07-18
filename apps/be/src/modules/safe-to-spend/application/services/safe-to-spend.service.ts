import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CategoryType,
  type SafeToSpendDto,
  type SimulateSpendResultDto,
  StsLineKey,
} from '@repo/shared';

import { CacheKeys, CacheService } from '@/libs/cache';
import {
  type IPeriodResolver,
  PERIOD_RESOLVER_TOKEN,
} from '@/libs/periods';
import {
  ACCOUNT_REPOSITORY_TOKEN,
  type IAccountRepository,
} from '@/modules/account/application/interfaces/account-repo.interface';
import { GoalService } from '@/modules/goal/application/services/goal.service';
import { GoalEventName } from '@/modules/goal/domain/goal.events';
import { RecurringService } from '@/modules/recurring/application/services/recurring.service';
import { RecurringEventName } from '@/modules/recurring/domain/recurring.events';
import {
  type IStsSnapshotRepository,
  STS_SNAPSHOT_REPOSITORY_TOKEN,
} from '@/modules/safe-to-spend/application/interfaces/sts-snapshot-repo.interface';
import { TransactionEventName } from '@/modules/transaction/domain/transaction.events';
import { type User } from '@/modules/user/domain';

interface UserScopedEvent {
  userId: string;
}

const STS_CACHE_TTL = 5 * 60 * 1000;

@Injectable()
export class SafeToSpendService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: IAccountRepository,
    @Inject(PERIOD_RESOLVER_TOKEN)
    private readonly periodResolver: IPeriodResolver,
    @Inject(STS_SNAPSHOT_REPOSITORY_TOKEN)
    private readonly snapshotRepository: IStsSnapshotRepository,
    private readonly recurringService: RecurringService,
    private readonly goalService: GoalService,
    private readonly cacheService: CacheService,
  ) {}

  async get(user: User): Promise<SafeToSpendDto> {
    const cacheKey = CacheKeys.sts.byUser(user.id);
    const cached = await this.cacheService.get<SafeToSpendDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const computed = await this.compute(user);
    await this.cacheService.set(cacheKey, computed, STS_CACHE_TTL);
    await this.snapshotRepository.create(user.id, computed);
    return computed;
  }

  async simulate(
    user: User,
    amount: number,
  ): Promise<SimulateSpendResultDto> {
    const current = await this.get(user);
    const simulatedSts = current.amount - amount;

    let goalDelayMonths: number | null = null;
    if (simulatedSts < 0) {
      const requiredPerMonth =
        await this.goalService.firstActiveRequiredPerMonth(user);
      goalDelayMonths =
        requiredPerMonth > 0
          ? Math.ceil(Math.abs(simulatedSts) / requiredPerMonth)
          : null;
    }

    return {
      current,
      simulatedAmount: amount,
      simulatedSts,
      goalDelayMonths,
    };
  }

  @OnEvent(TransactionEventName.CREATED)
  @OnEvent(TransactionEventName.UPDATED)
  @OnEvent(TransactionEventName.DELETED)
  @OnEvent(RecurringEventName.CHANGED)
  @OnEvent(GoalEventName.CHANGED)
  async invalidate(event: UserScopedEvent): Promise<void> {
    await this.cacheService.del(CacheKeys.sts.byUser(event.userId));
  }

  private async compute(user: User): Promise<SafeToSpendDto> {
    const now = new Date();
    const period = this.periodResolver.resolveMonthly(user.cycleStartDay, now);
    const currency = user.displayCurrency;
    const warnings: string[] = [];

    const accounts = await this.accountRepository.findAllByUser(user.id, false);
    const spendableAccounts = accounts.filter(
      (account) => account.currency === currency && !account.isCreditCard,
    );
    const availableBalance = spendableAccounts.reduce(
      (sum, account) => sum + account.currentBalance,
      0,
    );

    if (accounts.length === 0) {
      warnings.push('No accounts yet — add your accounts to get a real number.');
    }
    if (accounts.some((account) => account.isCreditCard)) {
      warnings.push(
        'Credit cards are excluded from the available balance; card payments count as bills.',
      );
    }

    const pending = await this.recurringService.pendingTotalsForPeriod(
      user.id,
      currency,
      now,
      period.end,
    );
    const remainingIncome = pending
      .filter((row) => row.type === CategoryType.INCOME)
      .reduce((sum, row) => sum + row.total, 0);
    const remainingBills = pending
      .filter((row) => row.type === CategoryType.EXPENSE && row.isEssential)
      .reduce((sum, row) => sum + row.total, 0);

    if (remainingIncome > 0) {
      warnings.push(
        'Remaining income is projected from recurring rules and is not guaranteed yet.',
      );
    }
    if (pending.length === 0) {
      warnings.push(
        'No recurring bills or income configured — the result may be optimistic.',
      );
    }

    const committedGoalContributions =
      await this.goalService.committedContributionsForPeriod(
        user,
        period.start,
        period.end,
      );

    const safetyBuffer = user.safetyBuffer;
    const amount =
      availableBalance +
      remainingIncome -
      remainingBills -
      committedGoalContributions -
      safetyBuffer;

    return {
      period: period.toDto(),
      currency,
      amount,
      lines: [
        {
          key: StsLineKey.AVAILABLE_BALANCE,
          label: 'Available balance',
          amount: availableBalance,
          link: '/accounts',
        },
        {
          key: StsLineKey.CONFIRMED_REMAINING_INCOME,
          label: 'Remaining income this period',
          amount: remainingIncome,
          link: '/recurring',
        },
        {
          key: StsLineKey.REMAINING_BILLS,
          label: 'Remaining bills & essential expenses',
          amount: -remainingBills,
          link: '/recurring',
        },
        {
          key: StsLineKey.COMMITTED_GOAL_CONTRIBUTIONS,
          label: 'Committed goal contributions',
          amount: -committedGoalContributions,
          link: '/goals',
        },
        {
          key: StsLineKey.SAFETY_BUFFER,
          label: 'Safety buffer',
          amount: -safetyBuffer,
          link: '/settings',
        },
      ],
      warnings,
      computedAt: now.toISOString(),
    };
  }
}
