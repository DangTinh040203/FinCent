import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { type CursorPage, type TransactionDto } from '@repo/shared';

import { CurrentDbUser } from '@/libs/decorators';
import { CursorCodec } from '@/modules/transaction/application/services/cursor-codec';
import { TransactionService } from '@/modules/transaction/application/services/transaction.service';
import {
  CreateTransactionDto,
  ListTransactionsQueryDto,
  UpdateTransactionDto,
} from '@/modules/transaction/presentation/DTOs/transaction.dto';
import { User } from '@/modules/user/domain';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async list(
    @CurrentDbUser() user: User,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<CursorPage<TransactionDto>> {
    const page = await this.transactionService.list(
      user,
      {
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        accountId: query.accountId,
        categoryIds: query.categoryId ? [query.categoryId] : undefined,
        type: query.type,
        search: query.search,
      },
      query.cursor ? CursorCodec.decode(query.cursor) : null,
      query.limit ?? 20,
    );

    return {
      items: page.items.map((transaction) => transaction.toDto()),
      nextCursor: page.nextCursor ? CursorCodec.encode(page.nextCursor) : null,
    };
  }

  @Get(':id')
  async get(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionService.get(user, id);
    return transaction.toDto();
  }

  @Post()
  async create(
    @CurrentDbUser() user: User,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionService.create(user, {
      accountId: dto.accountId,
      type: dto.type,
      amount: dto.amount,
      occurredAt: new Date(dto.occurredAt),
      categoryId: dto.categoryId,
      counterAccountId: dto.counterAccountId,
      note: dto.note,
    });
    return transaction.toDto();
  }

  @Patch(':id')
  async update(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionService.update(user, id, {
      accountId: dto.accountId,
      type: dto.type,
      amount: dto.amount,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
      categoryId: dto.categoryId,
      counterAccountId: dto.counterAccountId,
      note: dto.note,
    });
    return transaction.toDto();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.transactionService.remove(user, id);
  }
}
