import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TransactionSource, TransactionType } from '@repo/shared';

import { AUDIT_EVENT, AuditAction, AuditEvent } from '@/libs/audit';
import {
  ACCOUNT_REPOSITORY_TOKEN,
  type IAccountRepository,
} from '@/modules/account/application/interfaces/account-repo.interface';
import { type Account } from '@/modules/account/domain/account.domain';
import { CategoryService } from '@/modules/category/application/services/category.service';
import {
  type CreateTransactionCommand,
  type TransactionListFilters,
  type UpdateTransactionCommand,
} from '@/modules/transaction/application/commands/transaction.command';
import {
  type ITransactionRepository,
  TRANSACTION_REPOSITORY_TOKEN,
  type TransactionCursor,
  type TransactionPage,
  type TransactionPersistenceData,
} from '@/modules/transaction/application/interfaces/transaction-repo.interface';
import { BalanceImpact } from '@/modules/transaction/domain/balance-impact';
import { Transaction } from '@/modules/transaction/domain/transaction.domain';
import {
  TransactionChangedEvent,
  TransactionEventName,
} from '@/modules/transaction/domain/transaction.events';
import { type User } from '@/modules/user/domain';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_TOKEN)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: IAccountRepository,
    private readonly categoryService: CategoryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    user: User,
    command: CreateTransactionCommand,
  ): Promise<Transaction> {
    const data = await this.validateAndBuild(user, command);
    const impact = BalanceImpact.of(
      command.type,
      command.amount,
      command.accountId,
      command.counterAccountId ?? null,
    );

    const transaction = await this.transactionRepository.createWithBalanceUpdate(
      user.id,
      data,
      impact,
    );

    this.eventEmitter.emit(
      TransactionEventName.CREATED,
      new TransactionChangedEvent(user.id, transaction),
    );

    return transaction;
  }

  async update(
    user: User,
    id: string,
    command: UpdateTransactionCommand,
  ): Promise<Transaction> {
    const existing = await this.get(user, id);

    const merged: CreateTransactionCommand = {
      accountId: command.accountId ?? existing.accountId,
      type: command.type ?? existing.type,
      amount: command.amount ?? existing.amount,
      occurredAt: command.occurredAt ?? existing.occurredAt,
      categoryId:
        command.categoryId !== undefined
          ? command.categoryId
          : existing.categoryId,
      counterAccountId:
        command.counterAccountId !== undefined
          ? command.counterAccountId
          : existing.counterAccountId,
      note: command.note !== undefined ? command.note : existing.note,
      source: existing.source,
    };

    const data = await this.validateAndBuild(user, merged);

    const previousImpact = BalanceImpact.of(
      existing.type,
      existing.amount,
      existing.accountId,
      existing.counterAccountId,
    );
    const nextImpact = BalanceImpact.of(
      merged.type,
      merged.amount,
      merged.accountId,
      merged.counterAccountId ?? null,
    );
    const impact = previousImpact.inverse().merge(nextImpact);

    const transaction = await this.transactionRepository.updateWithBalanceUpdate(
      id,
      data,
      impact,
    );

    this.eventEmitter.emit(
      TransactionEventName.UPDATED,
      new TransactionChangedEvent(user.id, transaction),
    );

    return transaction;
  }

  async remove(user: User, id: string): Promise<void> {
    const existing = await this.get(user, id);

    const impact = BalanceImpact.of(
      existing.type,
      existing.amount,
      existing.accountId,
      existing.counterAccountId,
    ).inverse();

    await this.transactionRepository.softDeleteWithBalanceUpdate(id, impact);

    this.eventEmitter.emit(
      TransactionEventName.DELETED,
      new TransactionChangedEvent(user.id, existing),
    );

    this.eventEmitter.emit(
      AUDIT_EVENT,
      new AuditEvent(user.id, AuditAction.DELETE, 'transaction', id, {
        amount: existing.amount,
        type: existing.type,
        occurredAt: existing.occurredAt.toISOString(),
      }),
    );
  }

  async get(user: User, id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(user.id, id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async list(
    user: User,
    filters: TransactionListFilters,
    cursor: TransactionCursor | null,
    limit: number,
  ): Promise<TransactionPage> {
    if (filters.from && filters.to && filters.from > filters.to) {
      throw new BadRequestException(
        'The from date must be on or before the to date',
      );
    }
    let categoryIds = filters.categoryIds;
    if (categoryIds?.length === 1) {
      categoryIds = await this.categoryService.resolveCategoryIdsIncludingChildren(
        user,
        categoryIds[0],
      );
    }
    return this.transactionRepository.list(
      user.id,
      { ...filters, categoryIds },
      cursor,
      limit,
    );
  }

  private async validateAndBuild(
    user: User,
    command: CreateTransactionCommand,
  ): Promise<TransactionPersistenceData> {
    if (command.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const account = await this.requireActiveAccount(user, command.accountId);

    let counterAccountId: string | null = null;
    let categoryId: string | null = null;

    if (command.type === TransactionType.TRANSFER) {
      if (!command.counterAccountId) {
        throw new BadRequestException(
          'Transfers require a destination account',
        );
      }
      if (command.counterAccountId === command.accountId) {
        throw new BadRequestException(
          'Transfers require two different accounts',
        );
      }
      const counterAccount = await this.requireActiveAccount(
        user,
        command.counterAccountId,
      );
      if (counterAccount.currency !== account.currency) {
        throw new BadRequestException(
          'Transfers between different currencies are not supported yet',
        );
      }
      counterAccountId = counterAccount.id;
    } else {
      if (!command.categoryId) {
        throw new BadRequestException(
          'Income and expense transactions require a category',
        );
      }
      const category = await this.categoryService.get(user, command.categoryId);
      if (category.type.toString() !== command.type.toString()) {
        throw new BadRequestException(
          'Category type does not match transaction type',
        );
      }
      categoryId = category.id;
    }

    return {
      accountId: account.id,
      categoryId,
      counterAccountId,
      type: command.type,
      amount: command.amount,
      currency: account.currency,
      occurredAt: command.occurredAt,
      note: command.note ?? null,
      source: command.source ?? TransactionSource.MANUAL,
    };
  }

  private async requireActiveAccount(
    user: User,
    accountId: string,
  ): Promise<Account> {
    const account = await this.accountRepository.findById(user.id, accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (account.isArchived) {
      throw new BadRequestException('Account is archived');
    }
    return account;
  }
}
