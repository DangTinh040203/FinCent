import { Injectable } from '@nestjs/common';
import {
  type GoalPriority,
  GoalStatus,
  TransactionType,
} from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import {
  type Goal as GoalRow,
  type GoalContribution as ContributionRow,
} from '@/libs/databases/prisma/generated/client';
import {
  type CreateGoalCommand,
  type UpdateGoalCommand,
} from '@/modules/goal/application/commands/goal.command';
import {
  type IGoalRepository,
  type NetCashFlow,
} from '@/modules/goal/application/interfaces/goal-repo.interface';
import { Goal, GoalContribution } from '@/modules/goal/domain/goal.domain';

type GoalRowWithSum = GoalRow & { contributedAmount: number };

@Injectable()
export class PrismaAdapterGoalRepository implements IGoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    currency: string,
    command: CreateGoalCommand,
  ): Promise<Goal> {
    const row = await this.prisma.goal.create({
      data: {
        userId,
        name: command.name,
        targetAmount: BigInt(command.targetAmount),
        currency,
        deadline: command.deadline,
        priority: command.priority,
        linkedAccountId: command.linkedAccountId ?? null,
      },
    });
    return this.toDomain({ ...row, contributedAmount: 0 });
  }

  async findById(userId: string, id: string): Promise<Goal | null> {
    const row = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!row) {
      return null;
    }
    return this.toDomain(await this.withContributedAmount(row));
  }

  async findAllByUser(userId: string): Promise<Goal[]> {
    const rows = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    });
    return Promise.all(
      rows.map(async (row) => this.toDomain(await this.withContributedAmount(row))),
    );
  }

  async findActiveByUser(userId: string): Promise<Goal[]> {
    const rows = await this.prisma.goal.findMany({
      where: { userId, status: GoalStatus.ACTIVE },
      orderBy: { createdAt: 'asc' },
    });
    return Promise.all(
      rows.map(async (row) => this.toDomain(await this.withContributedAmount(row))),
    );
  }

  async update(id: string, command: UpdateGoalCommand): Promise<Goal> {
    const row = await this.prisma.goal.update({
      where: { id },
      data: {
        ...(command.name !== undefined && { name: command.name }),
        ...(command.targetAmount !== undefined && {
          targetAmount: BigInt(command.targetAmount),
        }),
        ...(command.deadline !== undefined && { deadline: command.deadline }),
        ...(command.priority !== undefined && { priority: command.priority }),
        ...(command.status !== undefined && { status: command.status }),
        ...(command.linkedAccountId !== undefined && {
          linkedAccountId: command.linkedAccountId,
        }),
      },
    });
    return this.toDomain(await this.withContributedAmount(row));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.goal.delete({ where: { id } });
  }

  async addContribution(
    goalId: string,
    userId: string,
    amount: number,
    occurredAt: Date,
    transactionId: string | null,
  ): Promise<GoalContribution> {
    const row = await this.prisma.goalContribution.create({
      data: {
        goalId,
        userId,
        amount: BigInt(amount),
        occurredAt,
        transactionId,
      },
    });
    return this.contributionToDomain(row);
  }

  async listContributions(
    userId: string,
    goalId: string,
    limit: number,
  ): Promise<GoalContribution[]> {
    const rows = await this.prisma.goalContribution.findMany({
      where: { goalId, userId },
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });
    return rows.map((row) => this.contributionToDomain(row));
  }

  async sumContributionsInRange(
    userId: string,
    goalId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const result = await this.prisma.goalContribution.aggregate({
      where: { goalId, userId, occurredAt: { gte: from, lt: to } },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  async netCashFlowSince(
    userId: string,
    currency: string,
    from: Date,
  ): Promise<NetCashFlow> {
    const grouped = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        currency,
        deletedAt: null,
        type: { in: [TransactionType.INCOME, TransactionType.EXPENSE] },
        occurredAt: { gte: from },
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

  private async withContributedAmount(row: GoalRow): Promise<GoalRowWithSum> {
    const result = await this.prisma.goalContribution.aggregate({
      where: { goalId: row.id },
      _sum: { amount: true },
    });
    return { ...row, contributedAmount: Number(result._sum.amount ?? 0) };
  }

  private toDomain(row: GoalRowWithSum): Goal {
    return new Goal({
      id: row.id,
      userId: row.userId,
      name: row.name,
      targetAmount: Number(row.targetAmount),
      contributedAmount: row.contributedAmount,
      currency: row.currency,
      deadline: row.deadline,
      priority: row.priority as GoalPriority,
      status: row.status as GoalStatus,
      linkedAccountId: row.linkedAccountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private contributionToDomain(row: ContributionRow): GoalContribution {
    return new GoalContribution({
      id: row.id,
      goalId: row.goalId,
      userId: row.userId,
      amount: Number(row.amount),
      occurredAt: row.occurredAt,
      transactionId: row.transactionId,
    });
  }
}
