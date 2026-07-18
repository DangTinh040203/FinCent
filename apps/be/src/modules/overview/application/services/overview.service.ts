import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { type OverviewDto } from '@repo/shared';

import { CacheKeys, CacheService } from '@/libs/cache';
import {
  type IPeriodResolver,
  PERIOD_RESOLVER_TOKEN,
} from '@/libs/periods';
import {
  ACCOUNT_REPOSITORY_TOKEN,
  type IAccountRepository,
} from '@/modules/account/application/interfaces/account-repo.interface';
import {
  type IOverviewQuery,
  OVERVIEW_QUERY_TOKEN,
} from '@/modules/overview/application/interfaces/overview-query.interface';
import {
  type TransactionChangedEvent,
  TransactionEventName,
} from '@/modules/transaction/domain/transaction.events';
import { type User } from '@/modules/user/domain';

const OVERVIEW_CACHE_TTL = 5 * 60 * 1000;
const TOP_CATEGORIES_LIMIT = 5;

@Injectable()
export class OverviewService {
  constructor(
    @Inject(OVERVIEW_QUERY_TOKEN)
    private readonly overviewQuery: IOverviewQuery,
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: IAccountRepository,
    @Inject(PERIOD_RESOLVER_TOKEN)
    private readonly periodResolver: IPeriodResolver,
    private readonly cacheService: CacheService,
  ) {}

  async getOverview(user: User): Promise<OverviewDto> {
    const cacheKey = CacheKeys.overview.byUser(user.id);
    const cached = await this.cacheService.get<OverviewDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const overview = await this.compute(user);
    await this.cacheService.set(cacheKey, overview, OVERVIEW_CACHE_TTL);
    return overview;
  }

  @OnEvent(TransactionEventName.CREATED)
  @OnEvent(TransactionEventName.UPDATED)
  @OnEvent(TransactionEventName.DELETED)
  async invalidateOnTransactionChange(
    event: TransactionChangedEvent,
  ): Promise<void> {
    await this.cacheService.del(CacheKeys.overview.byUser(event.userId));
  }

  private async compute(user: User): Promise<OverviewDto> {
    const period = this.periodResolver.resolveMonthly(user.cycleStartDay);
    const currency = user.displayCurrency;

    const [accounts, totals, topCategories, dailySpend] = await Promise.all([
      this.accountRepository.findAllByUser(user.id, false),
      this.overviewQuery.totalsForPeriod(
        user.id,
        currency,
        period.start,
        period.end,
      ),
      this.overviewQuery.topExpenseCategories(
        user.id,
        currency,
        period.start,
        period.end,
        TOP_CATEGORIES_LIMIT,
      ),
      this.overviewQuery.dailyExpenseSeries(
        user.id,
        currency,
        period.start,
        period.end,
      ),
    ]);

    const totalBalance = accounts
      .filter((account) => account.currency === currency)
      .reduce((sum, account) => sum + account.currentBalance, 0);

    return {
      period: period.toDto(),
      currency,
      totalBalance,
      accounts: accounts.map((account) => ({
        accountId: account.id,
        name: account.name,
        type: account.type,
        currency: account.currency,
        balance: account.currentBalance,
      })),
      income: totals.income,
      expense: totals.expense,
      net: totals.income - totals.expense,
      topCategories,
      dailySpend,
    };
  }
}
