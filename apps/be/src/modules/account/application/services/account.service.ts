import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AUDIT_EVENT, AuditAction, AuditEvent } from '@/libs/audit';
import {
  type CreateAccountCommand,
  type UpdateAccountCommand,
} from '@/modules/account/application/commands/account.command';
import {
  ACCOUNT_REPOSITORY_TOKEN,
  type IAccountRepository,
} from '@/modules/account/application/interfaces/account-repo.interface';
import { Account } from '@/modules/account/domain/account.domain';
import { type User } from '@/modules/user/domain';

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: IAccountRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(user: User, includeArchived: boolean): Promise<Account[]> {
    return this.accountRepository.findAllByUser(user.id, includeArchived);
  }

  async get(user: User, id: string): Promise<Account> {
    const account = await this.accountRepository.findById(user.id, id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async create(user: User, command: CreateAccountCommand): Promise<Account> {
    return this.accountRepository.create(user.id, command);
  }

  async update(
    user: User,
    id: string,
    command: UpdateAccountCommand,
  ): Promise<Account> {
    const account = await this.get(user, id);

    const openingBalanceDelta =
      command.openingBalance !== undefined
        ? command.openingBalance - account.openingBalance
        : 0;

    const updated = await this.accountRepository.update(user.id, id, {
      name: command.name,
      type: command.type,
      openingBalance: command.openingBalance,
      currentBalanceDelta: openingBalanceDelta || undefined,
    });

    if (openingBalanceDelta !== 0) {
      this.eventEmitter.emit(
        AUDIT_EVENT,
        new AuditEvent(user.id, AuditAction.BALANCE_EDIT, 'account', id, {
          previousOpeningBalance: account.openingBalance,
          newOpeningBalance: command.openingBalance,
        }),
      );
    }

    return updated;
  }

  async setArchived(
    user: User,
    id: string,
    archived: boolean,
  ): Promise<Account> {
    await this.get(user, id);
    const updated = await this.accountRepository.update(user.id, id, {
      archivedAt: archived ? new Date() : null,
    });

    this.eventEmitter.emit(
      AUDIT_EVENT,
      new AuditEvent(user.id, AuditAction.ARCHIVE, 'account', id, {
        archived,
      }),
    );

    return updated;
  }
}
