import { type AccountType } from '../enums/account.enum';

export interface AccountDto {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  currency?: string;
  openingBalance?: number;
}

export interface UpdateAccountPayload {
  name?: string;
  type?: AccountType;
  openingBalance?: number;
}
