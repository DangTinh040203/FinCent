import { Injectable } from '@nestjs/common';
import { BudgetPeriodType, TransactionType } from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import {
  type Budget as BudgetRow,
  type Category as CategoryRow,
} from '@/libs/databases/prisma/generated/client';
import {
  type CreateBudgetCommand,
  type UpdateBudgetCommand,
} from '@/modules/budget/application/commands/budget.command';
import { type IBudgetRepository } from '@/modules/budget/application/interfaces/budget-repo.interface';
import { Budget } from '@/modules/budget/domain/budget.domain';

type BudgetWithCategory = BudgetRow & {
  category: Pick<CategoryRow, 'name' | 'icon'>;
};

const CATEGORY_SELECT = {
  category: { select: { name: true, icon: true } },
} as const;

@Injectable()
export class PrismaAdapterBudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    currency: string,
    command: CreateBudgetCommand,
  ): Promise<Budget> {
    const row = await this.prisma.budget.create({
      data: {
        userId,
        categoryId: command.categoryId,
        amount: BigInt(command.amount),
        currency,
        periodType: command.periodType ?? BudgetPeriodType.MONTHLY,
        startDate: command.startDate ?? new Date(),
        rollover: command.rollover ?? false,
      },
      include: CATEGORY_SELECT,
    });
    return this.toDomain(row);
  }

  async findById(userId: string, id: string): Promise<Budget | null> {
    const row = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: CATEGORY_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async findAllByUser(
    userId: string,
    includeArchived: boolean,
  ): Promise<Budget[]> {
    const rows = await this.prisma.budget.findMany({
      where: { userId, ...(includeArchived ? {} : { isArchived: false }) },
      orderBy: { createdAt: 'asc' },
      include: CATEGORY_SELECT,
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findActiveByCategoryIds(
    userId: string,
    categoryIds: string[],
  ): Promise<Budget[]> {
    const rows = await this.prisma.budget.findMany({
      where: {
        userId,
        isArchived: false,
        categoryId: { in: categoryIds },
      },
      include: CATEGORY_SELECT,
    });
    return rows.map((row) => this.toDomain(row));
  }

  async update(id: string, command: UpdateBudgetCommand): Promise<Budget> {
    const row = await this.prisma.budget.update({
      where: { id },
      data: {
        ...(command.amount !== undefined && {
          amount: BigInt(command.amount),
        }),
        ...(command.rollover !== undefined && { rollover: command.rollover }),
        ...(command.isArchived !== undefined && {
          isArchived: command.isArchived,
        }),
      },
      include: CATEGORY_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.budget.delete({ where: { id } });
  }

  async sumExpenses(
    userId: string,
    categoryIds: string[],
    currency: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        currency,
        deletedAt: null,
        type: TransactionType.EXPENSE,
        categoryId: { in: categoryIds },
        occurredAt: { gte: from, lt: to },
      },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  private toDomain(row: BudgetWithCategory): Budget {
    return new Budget({
      id: row.id,
      userId: row.userId,
      categoryId: row.categoryId,
      categoryName: row.category.name,
      categoryIcon: row.category.icon,
      amount: Number(row.amount),
      currency: row.currency,
      periodType: row.periodType as BudgetPeriodType,
      startDate: row.startDate,
      rollover: row.rollover,
      isArchived: row.isArchived,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
