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
import {
  type GoalContributionDto,
  type GoalDto,
  type GoalPlanDto,
} from '@repo/shared';

import { CurrentDbUser } from '@/libs/decorators';
import { GoalService } from '@/modules/goal/application/services/goal.service';
import {
  CreateGoalContributionDto,
  CreateGoalDto,
  UpdateGoalDto,
} from '@/modules/goal/presentation/DTOs/goal.dto';
import { User } from '@/modules/user/domain';

@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get()
  async list(@CurrentDbUser() user: User): Promise<GoalDto[]> {
    const goals = await this.goalService.list(user);
    return goals.map((goal) => goal.toDto());
  }

  @Get(':id')
  async get(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GoalDto> {
    const goal = await this.goalService.get(user, id);
    return goal.toDto();
  }

  @Get(':id/plan')
  async plan(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GoalPlanDto> {
    return this.goalService.plan(user, id);
  }

  @Get(':id/contributions')
  async contributions(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GoalContributionDto[]> {
    const contributions = await this.goalService.listContributions(
      user,
      id,
      50,
    );
    return contributions.map((contribution) => contribution.toDto());
  }

  @Post()
  async create(
    @CurrentDbUser() user: User,
    @Body() dto: CreateGoalDto,
  ): Promise<GoalDto> {
    const goal = await this.goalService.create(user, {
      name: dto.name,
      targetAmount: dto.targetAmount,
      deadline: new Date(dto.deadline),
      priority: dto.priority,
      linkedAccountId: dto.linkedAccountId,
    });
    return goal.toDto();
  }

  @Post(':id/contributions')
  async addContribution(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateGoalContributionDto,
  ): Promise<GoalContributionDto> {
    const contribution = await this.goalService.addContribution(user, id, {
      amount: dto.amount,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
      accountId: dto.accountId,
    });
    return contribution.toDto();
  }

  @Patch(':id')
  async update(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<GoalDto> {
    const goal = await this.goalService.update(user, id, {
      name: dto.name,
      targetAmount: dto.targetAmount,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      priority: dto.priority,
      status: dto.status,
      linkedAccountId: dto.linkedAccountId,
    });
    return goal.toDto();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.goalService.remove(user, id);
  }
}
