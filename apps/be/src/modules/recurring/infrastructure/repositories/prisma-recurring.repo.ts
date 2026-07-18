import { Injectable } from '@nestjs/common';
import {
  type CategoryType,
  type RecurringCadence,
  RecurringOccurrenceStatus,
} from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import {
  type RecurringOccurrence as OccurrenceRow,
  type RecurringRule as RuleRow,
} from '@/libs/databases/prisma/generated/client';
import {
  type CreateRecurringRuleCommand,
  type OccurrenceListFilters,
  type UpdateRecurringRuleCommand,
} from '@/modules/recurring/application/commands/recurring.command';
import {
  type IRecurringRepository,
  type PendingRecurringTotals,
} from '@/modules/recurring/application/interfaces/recurring-repo.interface';
import { RecurringOccurrence } from '@/modules/recurring/domain/recurring-occurrence.domain';
import { RecurringRule } from '@/modules/recurring/domain/recurring-rule.domain';

type OccurrenceWithRule = OccurrenceRow & {
  rule: Pick<RuleRow, 'name' | 'type' | 'currency'>;
};

const OCCURRENCE_RULE_SELECT = {
  rule: { select: { name: true, type: true, currency: true } },
} as const;

@Injectable()
export class PrismaAdapterRecurringRepository implements IRecurringRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRule(
    userId: string,
    currency: string,
    command: CreateRecurringRuleCommand,
  ): Promise<RecurringRule> {
    const row = await this.prisma.recurringRule.create({
      data: {
        userId,
        name: command.name,
        accountId: command.accountId,
        categoryId: command.categoryId,
        type: command.type,
        amount: BigInt(command.amount),
        currency,
        cadence: command.cadence,
        interval: command.interval ?? 1,
        nextDueAt: command.nextDueAt,
        endsAt: command.endsAt ?? null,
        autoConfirm: command.autoConfirm ?? false,
        isEssential: command.isEssential ?? true,
      },
    });
    return this.ruleToDomain(row);
  }

  async findRuleById(
    userId: string,
    id: string,
  ): Promise<RecurringRule | null> {
    const row = await this.prisma.recurringRule.findFirst({
      where: { id, userId },
    });
    return row ? this.ruleToDomain(row) : null;
  }

  async findRulesByUser(userId: string): Promise<RecurringRule[]> {
    const rows = await this.prisma.recurringRule.findMany({
      where: { userId },
      orderBy: { nextDueAt: 'asc' },
    });
    return rows.map((row) => this.ruleToDomain(row));
  }

  async findActiveRulesDueBefore(horizon: Date): Promise<RecurringRule[]> {
    const rows = await this.prisma.recurringRule.findMany({
      where: {
        isPaused: false,
        nextDueAt: { lt: horizon },
        OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
      },
    });
    return rows.map((row) => this.ruleToDomain(row));
  }

  async updateRule(
    id: string,
    data: UpdateRecurringRuleCommand & { currency?: string },
  ): Promise<RecurringRule> {
    const row = await this.prisma.recurringRule.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.accountId !== undefined && { accountId: data.accountId }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.amount !== undefined && { amount: BigInt(data.amount) }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.cadence !== undefined && { cadence: data.cadence }),
        ...(data.interval !== undefined && { interval: data.interval }),
        ...(data.nextDueAt !== undefined && { nextDueAt: data.nextDueAt }),
        ...(data.endsAt !== undefined && { endsAt: data.endsAt }),
        ...(data.autoConfirm !== undefined && {
          autoConfirm: data.autoConfirm,
        }),
        ...(data.isEssential !== undefined && {
          isEssential: data.isEssential,
        }),
        ...(data.isPaused !== undefined && { isPaused: data.isPaused }),
      },
    });
    return this.ruleToDomain(row);
  }

  async advanceRule(id: string, nextDueAt: Date): Promise<void> {
    await this.prisma.recurringRule.update({
      where: { id },
      data: { nextDueAt },
    });
  }

  async deleteRule(id: string): Promise<void> {
    await this.prisma.recurringRule.delete({ where: { id } });
  }

  async upsertProjectedOccurrence(
    ruleId: string,
    userId: string,
    dueAt: Date,
    amount: number,
  ): Promise<void> {
    await this.prisma.recurringOccurrence.upsert({
      where: { ruleId_dueAt: { ruleId, dueAt } },
      create: {
        ruleId,
        userId,
        dueAt,
        amount: BigInt(amount),
        status: RecurringOccurrenceStatus.PROJECTED,
      },
      update: {},
    });
  }

  async deletePendingOccurrences(ruleId: string): Promise<void> {
    await this.prisma.recurringOccurrence.deleteMany({
      where: {
        ruleId,
        status: {
          in: [
            RecurringOccurrenceStatus.PROJECTED,
            RecurringOccurrenceStatus.DUE,
          ],
        },
      },
    });
  }

  async markOccurrencesDue(now: Date): Promise<RecurringOccurrence[]> {
    const due = await this.prisma.recurringOccurrence.findMany({
      where: {
        status: RecurringOccurrenceStatus.PROJECTED,
        dueAt: { lte: now },
      },
      include: OCCURRENCE_RULE_SELECT,
    });

    if (due.length > 0) {
      await this.prisma.recurringOccurrence.updateMany({
        where: { id: { in: due.map((row) => row.id) } },
        data: { status: RecurringOccurrenceStatus.DUE },
      });
    }

    return due.map((row) =>
      this.occurrenceToDomain({
        ...row,
        status: RecurringOccurrenceStatus.DUE,
      }),
    );
  }

  async findOccurrences(
    userId: string,
    filters: OccurrenceListFilters,
    limit: number,
  ): Promise<RecurringOccurrence[]> {
    const rows = await this.prisma.recurringOccurrence.findMany({
      where: {
        userId,
        ...(filters.statuses?.length && {
          status: {
            in: filters.statuses as unknown as OccurrenceRow['status'][],
          },
        }),
        ...((filters.from || filters.to) && {
          dueAt: {
            ...(filters.from && { gte: filters.from }),
            ...(filters.to && { lt: filters.to }),
          },
        }),
      },
      orderBy: { dueAt: 'asc' },
      take: limit,
      include: OCCURRENCE_RULE_SELECT,
    });
    return rows.map((row) => this.occurrenceToDomain(row));
  }

  async findOccurrenceById(
    userId: string,
    id: string,
  ): Promise<RecurringOccurrence | null> {
    const row = await this.prisma.recurringOccurrence.findFirst({
      where: { id, userId },
      include: OCCURRENCE_RULE_SELECT,
    });
    return row ? this.occurrenceToDomain(row) : null;
  }

  async resolveOccurrence(
    id: string,
    status: string,
    transactionId: string | null,
    amount?: number,
  ): Promise<RecurringOccurrence> {
    const row = await this.prisma.recurringOccurrence.update({
      where: { id },
      data: {
        status: status as OccurrenceRow['status'],
        transactionId,
        ...(amount !== undefined && { amount: BigInt(amount) }),
      },
      include: OCCURRENCE_RULE_SELECT,
    });
    return this.occurrenceToDomain(row);
  }

  async sumPendingByTypeInRange(
    userId: string,
    currency: string,
    from: Date,
    to: Date,
  ): Promise<PendingRecurringTotals[]> {
    const rows = await this.prisma.recurringOccurrence.findMany({
      where: {
        userId,
        status: {
          in: [
            RecurringOccurrenceStatus.PROJECTED,
            RecurringOccurrenceStatus.DUE,
          ],
        },
        dueAt: { gte: from, lt: to },
        rule: { currency },
      },
      select: {
        amount: true,
        rule: { select: { type: true, isEssential: true } },
      },
    });

    const grouped = new Map<string, PendingRecurringTotals>();
    for (const row of rows) {
      const key = `${row.rule.type}:${String(row.rule.isEssential)}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.total += Number(row.amount);
      } else {
        grouped.set(key, {
          type: row.rule.type as CategoryType,
          isEssential: row.rule.isEssential,
          total: Number(row.amount),
        });
      }
    }
    return Array.from(grouped.values());
  }

  private ruleToDomain(row: RuleRow): RecurringRule {
    return new RecurringRule({
      id: row.id,
      userId: row.userId,
      name: row.name,
      accountId: row.accountId,
      categoryId: row.categoryId,
      type: row.type as CategoryType,
      amount: Number(row.amount),
      currency: row.currency,
      cadence: row.cadence as RecurringCadence,
      interval: row.interval,
      nextDueAt: row.nextDueAt,
      endsAt: row.endsAt,
      autoConfirm: row.autoConfirm,
      isPaused: row.isPaused,
      isEssential: row.isEssential,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private occurrenceToDomain(row: OccurrenceWithRule): RecurringOccurrence {
    return new RecurringOccurrence({
      id: row.id,
      ruleId: row.ruleId,
      userId: row.userId,
      dueAt: row.dueAt,
      status: row.status as RecurringOccurrenceStatus,
      amount: Number(row.amount),
      transactionId: row.transactionId,
      ruleName: row.rule.name,
      ruleType: row.rule.type as CategoryType,
      currency: row.rule.currency,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
