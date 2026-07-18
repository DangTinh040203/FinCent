import { type AccountType } from '@repo/shared';

export interface CreateAccountCommand {
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
}

export interface UpdateAccountCommand {
  name?: string;
  type?: AccountType;
  openingBalance?: number;
}
