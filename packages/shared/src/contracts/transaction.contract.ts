import {
  type TransactionSource,
  type TransactionType,
} from '../enums/transaction.enum';

export interface TransactionDto {
  id: string;
  accountId: string;
  categoryId: string | null;
  counterAccountId: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  occurredAt: string;
  note: string | null;
  source: TransactionSource;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  accountId: string;
  type: TransactionType;
  amount: number;
  occurredAt: string;
  categoryId?: string;
  counterAccountId?: string;
  note?: string;
}

export interface UpdateTransactionPayload {
  accountId?: string;
  type?: TransactionType;
  amount?: number;
  occurredAt?: string;
  categoryId?: string | null;
  counterAccountId?: string | null;
  note?: string | null;
}

export interface TransactionListQuery {
  cursor?: string;
  limit?: number;
  from?: string;
  to?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  search?: string;
}
