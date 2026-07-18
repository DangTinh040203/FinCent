import { type Transaction } from '@/modules/transaction/domain/transaction.domain';

export enum TransactionEventName {
  CREATED = 'transaction.created',
  UPDATED = 'transaction.updated',
  DELETED = 'transaction.deleted',
}

export class TransactionChangedEvent {
  constructor(
    readonly userId: string,
    readonly transaction: Transaction,
  ) {}
}
