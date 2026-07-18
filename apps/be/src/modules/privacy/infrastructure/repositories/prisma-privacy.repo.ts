import { Injectable } from '@nestjs/common';
import { type DataExportDto } from '@repo/shared';

import { type AuditEvent } from '@/libs/audit';
import { PrismaService } from '@/libs/databases/prisma.service';
import { type AuditLog as AuditLogRow } from '@/libs/databases/prisma/generated/client';
import {
  type IAuditRepository,
  type IDataExportQuery,
} from '@/modules/privacy/application/interfaces/privacy-repo.interface';
import { AuditLog } from '@/modules/privacy/domain/audit-log.domain';

function toJsonSafe<T>(value: T): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, val: unknown) =>
      typeof val === 'bigint' ? Number(val) : val,
    ),
  );
}

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(event: AuditEvent): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: event.userId,
        action: event.action,
        entity: event.entity,
        entityId: event.entityId,
        detail: event.detail
          ? (toJsonSafe(event.detail) as object)
          : undefined,
      },
    });
  }

  async list(userId: string, limit: number): Promise<AuditLog[]> {
    const rows = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: AuditLogRow): AuditLog {
    return new AuditLog({
      id: row.id,
      userId: row.userId,
      action: row.action,
      entity: row.entity,
      entityId: row.entityId,
      detail: (row.detail as Record<string, unknown> | null) ?? null,
      createdAt: row.createdAt,
    });
  }
}

@Injectable()
export class PrismaDataExportQuery implements IDataExportQuery {
  constructor(private readonly prisma: PrismaService) {}

  async collect(userId: string): Promise<DataExportDto> {
    const [accounts, categories, transactions, budgets, goals, recurringRules] =
      await Promise.all([
        this.prisma.account.findMany({ where: { userId } }),
        this.prisma.category.findMany({
          where: { OR: [{ userId }, { userId: null }] },
        }),
        this.prisma.transaction.findMany({
          where: { userId, deletedAt: null },
          orderBy: { occurredAt: 'asc' },
        }),
        this.prisma.budget.findMany({ where: { userId } }),
        this.prisma.goal.findMany({
          where: { userId },
          include: { contributions: true },
        }),
        this.prisma.recurringRule.findMany({ where: { userId } }),
      ]);

    return {
      exportedAt: new Date().toISOString(),
      accounts: toJsonSafe(accounts) as unknown[],
      categories: toJsonSafe(categories) as unknown[],
      transactions: toJsonSafe(transactions) as unknown[],
      budgets: toJsonSafe(budgets) as unknown[],
      goals: toJsonSafe(goals) as unknown[],
      recurringRules: toJsonSafe(recurringRules) as unknown[],
    };
  }
}
