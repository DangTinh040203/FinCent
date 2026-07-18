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
} from '@nestjs/common';
import { type BudgetStatusDto } from '@repo/shared';

import { CurrentDbUser } from '@/libs/decorators';
import { BudgetService } from '@/modules/budget/application/services/budget.service';
import {
  CreateBudgetDto,
  UpdateBudgetDto,
} from '@/modules/budget/presentation/DTOs/budget.dto';
import { User } from '@/modules/user/domain';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  async list(@CurrentDbUser() user: User): Promise<BudgetStatusDto[]> {
    const statuses = await this.budgetService.listStatuses(user);
    return statuses.map((status) => status.toDto());
  }

  @Get('at-risk')
  async atRisk(@CurrentDbUser() user: User): Promise<BudgetStatusDto[]> {
    const statuses = await this.budgetService.budgetsAtRisk(user);
    return statuses.map((status) => status.toDto());
  }

  @Get(':id')
  async get(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BudgetStatusDto> {
    const status = await this.budgetService.getStatus(user, id);
    return status.toDto();
  }

  @Post()
  async create(
    @CurrentDbUser() user: User,
    @Body() dto: CreateBudgetDto,
  ): Promise<BudgetStatusDto> {
    const budget = await this.budgetService.create(user, {
      categoryId: dto.categoryId,
      amount: dto.amount,
      periodType: dto.periodType,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      rollover: dto.rollover,
    });
    const status = await this.budgetService.computeStatus(user, budget);
    return status.toDto();
  }

  @Patch(':id')
  async update(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBudgetDto,
  ): Promise<BudgetStatusDto> {
    const budget = await this.budgetService.update(user, id, dto);
    const status = await this.budgetService.computeStatus(user, budget);
    return status.toDto();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.budgetService.remove(user, id);
  }
}
