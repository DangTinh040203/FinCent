import { type AccountDto, AccountType } from '@repo/shared';

export class Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Account>) {
    Object.assign(this, partial);
  }

  get isArchived(): boolean {
    return this.archivedAt !== null;
  }

  get isCreditCard(): boolean {
    return this.type === AccountType.CREDIT_CARD;
  }

  toDto(): AccountDto {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      currency: this.currency,
      openingBalance: this.openingBalance,
      currentBalance: this.currentBalance,
      archivedAt: this.archivedAt ? this.archivedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
