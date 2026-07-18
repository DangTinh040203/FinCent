import { Injectable } from '@nestjs/common';
import { TransactionType } from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import {
  type CategorySpendRow,
  type DailySpendRow,
  type IOverviewQuery,
  type PeriodTotals,
} from '@/modules/overview/application/interfaces/overview-query.interface';

@Injectable()
export class PrismaOverviewQuery implements IOverviewQuery {
  constructor(private readonly prisma: PrismaService) {}

  async totalsForPeriod(
    userId: string,
    currency: string,
    start: Date,
    end: Date,
  ): Promise<PeriodTotals> {
    const grouped = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        currency,
        deletedAt: null,
        type: { in: [TransactionType.INCOME, TransactionType.EXPENSE] },
        occurredAt: { gte: start, lt: end },
      },
      _sum: { amount: true },
    });

    const byType = new Map(
      grouped.map((row) => [row.type as string, Number(row._sum.amount ?? 0)]),
    );

    return {
      income: byType.get(TransactionType.INCOME) ?? 0,
      expense: byType.get(TransactionType.EXPENSE) ?? 0,
    };
  }

  async topExpenseCategories(
    userId: string,
    currency: string,
    start: Date,
    end: Date,
    limit: number,
  ): Promise<CategorySpendRow[]> {
    const grouped = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        currency,
        deletedAt: null,
        type: TransactionType.EXPENSE,
        occurredAt: { gte: start, lt: end },
        categoryId: { not: null },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    const categoryIds = grouped
      .map((row) => row.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, icon: true },
    });
    const byId = new Map(categories.map((category) => [category.id, category]));

    return grouped
      .filter((row): row is typeof row & { categoryId: string } =>
        Boolean(row.categoryId),
      )
      .map((row) => ({
        categoryId: row.categoryId,
        name: byId.get(row.categoryId)?.name ?? 'Unknown',
        icon: byId.get(row.categoryId)?.icon ?? null,
        amount: Number(row._sum.amount ?? 0),
      }));
  }

  async dailyExpenseSeries(
    userId: string,
    currency: string,
    start: Date,
    end: Date,
  ): Promise<DailySpendRow[]> {
    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        currency,
        deletedAt: null,
        type: TransactionType.EXPENSE,
        occurredAt: { gte: start, lt: end },
      },
      select: { occurredAt: true, amount: true },
    });

    const byDay = new Map<string, number>();
    for (const row of rows) {
      const day = row.occurredAt.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + Number(row.amount));
    }

    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }
}
