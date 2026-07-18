import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { type AccountDto } from '@repo/shared';

import { CurrentDbUser } from '@/libs/decorators';
import { AccountService } from '@/modules/account/application/services/account.service';
import {
  CreateAccountDto,
  ListAccountsQueryDto,
  UpdateAccountDto,
} from '@/modules/account/presentation/DTOs/account.dto';
import { User } from '@/modules/user/domain';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async list(
    @CurrentDbUser() user: User,
    @Query() query: ListAccountsQueryDto,
  ): Promise<AccountDto[]> {
    const accounts = await this.accountService.list(
      user,
      query.includeArchived === 'true',
    );
    return accounts.map((account) => account.toDto());
  }

  @Get(':id')
  async get(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AccountDto> {
    const account = await this.accountService.get(user, id);
    return account.toDto();
  }

  @Post()
  async create(
    @CurrentDbUser() user: User,
    @Body() dto: CreateAccountDto,
  ): Promise<AccountDto> {
    const account = await this.accountService.create(user, {
      name: dto.name,
      type: dto.type,
      currency: dto.currency ?? user.displayCurrency,
      openingBalance: dto.openingBalance ?? 0,
    });
    return account.toDto();
  }

  @Patch(':id')
  async update(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountDto,
  ): Promise<AccountDto> {
    const account = await this.accountService.update(user, id, dto);
    return account.toDto();
  }

  @Post(':id/archive')
  async archive(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AccountDto> {
    const account = await this.accountService.setArchived(user, id, true);
    return account.toDto();
  }

  @Post(':id/unarchive')
  async unarchive(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AccountDto> {
    const account = await this.accountService.setArchived(user, id, false);
    return account.toDto();
  }
}
