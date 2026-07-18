import { Injectable } from '@nestjs/common';
import {
  type TransactionSource,
  type TransactionType,
} from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import {
  type Prisma,
  type Transaction as TransactionRow,
} from '@/libs/databases/prisma/generated/client';
import { type TransactionListFilters } from '@/modules/transaction/application/commands/transaction.command';
import {
  type ITransactionRepository,
  type TransactionCursor,
  type TransactionPage,
  type TransactionPersistenceData,
} from '@/modules/transaction/application/interfaces/transaction-repo.interface';
import { type BalanceImpact } from '@/modules/transaction/domain/balance-impact';
import { Transaction } from '@/modules/transaction/domain/transaction.domain';

@Injectable()
export class PrismaAdapterTransactionRepository
  implements ITransactionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createWithBalanceUpdate(
    userId: string,
    data: TransactionPersistenceData,
    impact: BalanceImpact,
  ): Promise<Transaction> {
    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          categoryId: data.categoryId,
          counterAccountId: data.counterAccountId,
          type: data.type as TransactionRow['type'],
          amount: BigInt(data.amount),
          currency: data.currency,
          occurredAt: data.occurredAt,
          note: data.note,
          source: data.source,
        },
      });
      await this.applyImpact(tx, impact);
      return created;
    });
    return this.toDomain(row);
  }

  async updateWithBalanceUpdate(
    id: string,
    data: TransactionPersistenceData,
    impact: BalanceImpact,
  ): Promise<Transaction> {
    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          accountId: data.accountId,
          categoryId: data.categoryId,
          counterAccountId: data.counterAccountId,
          type: data.type as TransactionRow['type'],
          amount: BigInt(data.amount),
          currency: data.currency,
          occurredAt: data.occurredAt,
          note: data.note,
        },
      });
      await this.applyImpact(tx, impact);
      return updated;
    });
    return this.toDomain(row);
  }

  async softDeleteWithBalanceUpdate(
    id: string,
    impact: BalanceImpact,
  ): Promise<Transaction> {
    const row = await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.transaction.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      await this.applyImpact(tx, impact);
      return deleted;
    });
    return this.toDomain(row);
  }

  async findById(userId: string, id: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
    });
    return row ? this.toDomain(row) : null;
  }

  async list(
    userId: string,
    filters: TransactionListFilters,
    cursor: TransactionCursor | null,
    limit: number,
  ): Promise<TransactionPage> {
    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(filters.accountId && {
        OR: [
          { accountId: filters.accountId },
          { counterAccountId: filters.accountId },
        ],
      }),
      ...(filters.categoryIds?.length && {
        categoryId: { in: filters.categoryIds },
      }),
      ...(filters.type && { type: filters.type }),
      ...(filters.search && {
        note: { contains: filters.search, mode: 'insensitive' as const },
      }),
      ...((filters.from || filters.to) && {
        occurredAt: {
          ...(filters.from && { gte: filters.from }),
          ...(filters.to && { lt: filters.to }),
        },
      }),
      ...(cursor && {
        AND: [
          {
            OR: [
              { occurredAt: { lt: cursor.occurredAt } },
              {
                occurredAt: cursor.occurredAt,
                id: { lt: cursor.id },
              },
            ],
          },
        ],
      }),
    };

    const rows = await this.prisma.transaction.findMany({
      where,
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const last = pageRows[pageRows.length - 1];

    return {
      items: pageRows.map((row) => this.toDomain(row)),
      nextCursor:
        hasMore && last ? { occurredAt: last.occurredAt, id: last.id } : null,
    };
  }

  private async applyImpact(
    tx: Prisma.TransactionClient,
    impact: BalanceImpact,
  ): Promise<void> {
    for (const { accountId, delta } of impact.entries()) {
      await tx.account.update({
        where: { id: accountId },
        data: { currentBalance: { increment: BigInt(delta) } },
      });
    }
  }

  private toDomain(row: TransactionRow): Transaction {
    return new Transaction({
      id: row.id,
      userId: row.userId,
      accountId: row.accountId,
      categoryId: row.categoryId,
      counterAccountId: row.counterAccountId,
      type: row.type as TransactionType,
      amount: Number(row.amount),
      currency: row.currency,
      occurredAt: row.occurredAt,
      note: row.note,
      source: row.source as TransactionSource,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
