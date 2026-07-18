import { type CreateAccountCommand } from '@/modules/account/application/commands/account.command';
import { type Account } from '@/modules/account/domain/account.domain';

export const ACCOUNT_REPOSITORY_TOKEN = Symbol('ACCOUNT_REPOSITORY_TOKEN');

export interface AccountUpdateData {
  name?: string;
  type?: string;
  openingBalance?: number;
  currentBalanceDelta?: number;
  archivedAt?: Date | null;
}

export interface IAccountRepository {
  create(userId: string, payload: CreateAccountCommand): Promise<Account>;
  findById(userId: string, id: string): Promise<Account | null>;
  findAllByUser(userId: string, includeArchived: boolean): Promise<Account[]>;
  update(userId: string, id: string, data: AccountUpdateData): Promise<Account>;
}
