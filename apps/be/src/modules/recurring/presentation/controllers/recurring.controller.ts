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
import {
  type RecurringOccurrenceDto,
  type RecurringRuleDto,
} from '@repo/shared';

import { CurrentDbUser } from '@/libs/decorators';
import { RecurringService } from '@/modules/recurring/application/services/recurring.service';
import {
  ConfirmOccurrenceDto,
  CreateRecurringRuleDto,
  ListOccurrencesQueryDto,
  UpdateRecurringRuleDto,
} from '@/modules/recurring/presentation/DTOs/recurring.dto';
import { User } from '@/modules/user/domain';

@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get('rules')
  async listRules(@CurrentDbUser() user: User): Promise<RecurringRuleDto[]> {
    const rules = await this.recurringService.listRules(user);
    return rules.map((rule) => rule.toDto());
  }

  @Post('rules')
  async createRule(
    @CurrentDbUser() user: User,
    @Body() dto: CreateRecurringRuleDto,
  ): Promise<RecurringRuleDto> {
    const rule = await this.recurringService.createRule(user, {
      name: dto.name,
      accountId: dto.accountId,
      categoryId: dto.categoryId,
      type: dto.type,
      amount: dto.amount,
      cadence: dto.cadence,
      interval: dto.interval,
      nextDueAt: new Date(dto.nextDueAt),
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      autoConfirm: dto.autoConfirm,
      isEssential: dto.isEssential,
    });
    return rule.toDto();
  }

  @Patch('rules/:id')
  async updateRule(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecurringRuleDto,
  ): Promise<RecurringRuleDto> {
    const rule = await this.recurringService.updateRule(user, id, {
      name: dto.name,
      accountId: dto.accountId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      cadence: dto.cadence,
      interval: dto.interval,
      nextDueAt: dto.nextDueAt ? new Date(dto.nextDueAt) : undefined,
      endsAt:
        dto.endsAt === null
          ? null
          : dto.endsAt
            ? new Date(dto.endsAt)
            : undefined,
      autoConfirm: dto.autoConfirm,
      isEssential: dto.isEssential,
      isPaused: dto.isPaused,
    });
    return rule.toDto();
  }

  @Delete('rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRule(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.recurringService.deleteRule(user, id);
  }

  @Get('occurrences')
  async listOccurrences(
    @CurrentDbUser() user: User,
    @Query() query: ListOccurrencesQueryDto,
  ): Promise<RecurringOccurrenceDto[]> {
    const occurrences = await this.recurringService.listOccurrences(
      user,
      {
        statuses: query.status,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
      },
      query.limit ?? 50,
    );
    return occurrences.map((occurrence) => occurrence.toDto());
  }

  @Post('occurrences/:id/confirm')
  async confirmOccurrence(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmOccurrenceDto,
  ): Promise<RecurringOccurrenceDto> {
    const occurrence = await this.recurringService.confirmOccurrence(
      user,
      id,
      {
        amount: dto.amount,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
      },
    );
    return occurrence.toDto();
  }

  @Post('occurrences/:id/skip')
  async skipOccurrence(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RecurringOccurrenceDto> {
    const occurrence = await this.recurringService.skipOccurrence(user, id);
    return occurrence.toDto();
  }
}
