import { Injectable } from '@nestjs/common';
import { type AccountType } from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import { type Account as AccountRow } from '@/libs/databases/prisma/generated/client';
import { type CreateAccountCommand } from '@/modules/account/application/commands/account.command';
import {
  type AccountUpdateData,
  type IAccountRepository,
} from '@/modules/account/application/interfaces/account-repo.interface';
import { Account } from '@/modules/account/domain/account.domain';

@Injectable()
export class PrismaAdapterAccountRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, payload: CreateAccountCommand): Promise<Account> {
    const row = await this.prisma.account.create({
      data: {
        userId,
        name: payload.name,
        type: payload.type,
        currency: payload.currency,
        openingBalance: BigInt(payload.openingBalance),
        currentBalance: BigInt(payload.openingBalance),
      },
    });
    return this.toDomain(row);
  }

  async findById(userId: string, id: string): Promise<Account | null> {
    const row = await this.prisma.account.findFirst({ where: { id, userId } });
    return row ? this.toDomain(row) : null;
  }

  async findAllByUser(
    userId: string,
    includeArchived: boolean,
  ): Promise<Account[]> {
    const rows = await this.prisma.account.findMany({
      where: { userId, ...(includeArchived ? {} : { archivedAt: null }) },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async update(
    userId: string,
    id: string,
    data: AccountUpdateData,
  ): Promise<Account> {
    const row = await this.prisma.account.update({
      where: { id, userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type as AccountRow['type'] }),
        ...(data.openingBalance !== undefined && {
          openingBalance: BigInt(data.openingBalance),
        }),
        ...(data.currentBalanceDelta !== undefined && {
          currentBalance: { increment: BigInt(data.currentBalanceDelta) },
        }),
        ...(data.archivedAt !== undefined && { archivedAt: data.archivedAt }),
      },
    });
    return this.toDomain(row);
  }

  private toDomain(row: AccountRow): Account {
    return new Account({
      id: row.id,
      userId: row.userId,
      name: row.name,
      type: row.type as AccountType,
      currency: row.currency,
      openingBalance: Number(row.openingBalance),
      currentBalance: Number(row.currentBalance),
      archivedAt: row.archivedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
