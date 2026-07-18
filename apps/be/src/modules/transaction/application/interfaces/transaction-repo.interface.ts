import { type TransactionSource } from '@repo/shared';

import { type TransactionListFilters } from '@/modules/transaction/application/commands/transaction.command';
import { type BalanceImpact } from '@/modules/transaction/domain/balance-impact';
import { type Transaction } from '@/modules/transaction/domain/transaction.domain';

export const TRANSACTION_REPOSITORY_TOKEN = Symbol(
  'TRANSACTION_REPOSITORY_TOKEN',
);

export interface TransactionPersistenceData {
  accountId: string;
  categoryId: string | null;
  counterAccountId: string | null;
  type: string;
  amount: number;
  currency: string;
  occurredAt: Date;
  note: string | null;
  source: TransactionSource;
}

export interface TransactionCursor {
  occurredAt: Date;
  id: string;
}

export interface TransactionPage {
  items: Transaction[];
  nextCursor: TransactionCursor | null;
}

export interface ITransactionRepository {
  createWithBalanceUpdate(
    userId: string,
    data: TransactionPersistenceData,
    impact: BalanceImpact,
  ): Promise<Transaction>;
  updateWithBalanceUpdate(
    id: string,
    data: TransactionPersistenceData,
    impact: BalanceImpact,
  ): Promise<Transaction>;
  softDeleteWithBalanceUpdate(
    id: string,
    impact: BalanceImpact,
  ): Promise<Transaction>;
  findById(userId: string, id: string): Promise<Transaction | null>;
  list(
    userId: string,
    filters: TransactionListFilters,
    cursor: TransactionCursor | null,
    limit: number,
  ): Promise<TransactionPage>;
}
