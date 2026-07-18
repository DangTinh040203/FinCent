import {
  type TransactionSource,
  type TransactionType,
} from '@repo/shared';

export interface CreateTransactionCommand {
  accountId: string;
  type: TransactionType;
  amount: number;
  occurredAt: Date;
  categoryId?: string | null;
  counterAccountId?: string | null;
  note?: string | null;
  source?: TransactionSource;
}

export interface UpdateTransactionCommand {
  accountId?: string;
  type?: TransactionType;
  amount?: number;
  occurredAt?: Date;
  categoryId?: string | null;
  counterAccountId?: string | null;
  note?: string | null;
}

export interface TransactionListFilters {
  from?: Date;
  to?: Date;
  accountId?: string;
  categoryIds?: string[];
  type?: TransactionType;
  search?: string;
}
