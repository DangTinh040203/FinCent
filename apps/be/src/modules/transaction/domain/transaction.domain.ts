import {
  type TransactionDto,
  type TransactionSource,
  type TransactionType,
} from '@repo/shared';

export class Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  counterAccountId: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  occurredAt: Date;
  note: string | null;
  source: TransactionSource;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  toDto(): TransactionDto {
    return {
      id: this.id,
      accountId: this.accountId,
      categoryId: this.categoryId,
      counterAccountId: this.counterAccountId,
      type: this.type,
      amount: this.amount,
      currency: this.currency,
      occurredAt: this.occurredAt.toISOString(),
      note: this.note,
      source: this.source,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
