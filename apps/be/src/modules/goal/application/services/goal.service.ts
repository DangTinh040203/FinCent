import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  formatMoney,
  type GoalPlanDto,
  GoalStatus,
  NotificationType,
  TransactionSource,
  TransactionType,
} from '@repo/shared';

import {
  ACCOUNT_REPOSITORY_TOKEN,
  type IAccountRepository,
} from '@/modules/account/application/interfaces/account-repo.interface';
import {
  type CreateGoalCommand,
  type CreateGoalContributionCommand,
  type UpdateGoalCommand,
} from '@/modules/goal/application/commands/goal.command';
import {
  GOAL_REPOSITORY_TOKEN,
  type IGoalRepository,
} from '@/modules/goal/application/interfaces/goal-repo.interface';
import { type Goal, type GoalContribution } from '@/modules/goal/domain/goal.domain';
import {
  GoalChangedEvent,
  GoalEventName,
} from '@/modules/goal/domain/goal.events';
import { GoalPlanner } from '@/modules/goal/domain/goal-planner';
import { NotificationService } from '@/modules/notification/application/services/notification.service';
import { TransactionService } from '@/modules/transaction/application/services/transaction.service';
import { type User } from '@/modules/user/domain';

const CASH_FLOW_LOOKBACK_MONTHS = 3;

@Injectable()
export class GoalService {
  private readonly planner = new GoalPlanner();

  constructor(
    @Inject(GOAL_REPOSITORY_TOKEN)
    private readonly goalRepository: IGoalRepository,
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: IAccountRepository,
    private readonly transactionService: TransactionService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(user: User): Promise<Goal[]> {
    return this.goalRepository.findAllByUser(user.id);
  }

  async listActive(user: User): Promise<Goal[]> {
    return this.goalRepository.findActiveByUser(user.id);
  }

  async get(user: User, id: string): Promise<Goal> {
    const goal = await this.goalRepository.findById(user.id, id);
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    return goal;
  }

  async create(user: User, command: CreateGoalCommand): Promise<Goal> {
    if (command.deadline <= new Date()) {
      throw new BadRequestException('Deadline must be in the future');
    }
    if (command.linkedAccountId) {
      await this.requireAccount(user, command.linkedAccountId);
    }
    const goal = await this.goalRepository.create(
      user.id,
      user.displayCurrency,
      command,
    );
    this.emitChanged(user.id);
    return goal;
  }

  async update(
    user: User,
    id: string,
    command: UpdateGoalCommand,
  ): Promise<Goal> {
    await this.get(user, id);
    if (command.linkedAccountId) {
      await this.requireAccount(user, command.linkedAccountId);
    }
    const goal = await this.goalRepository.update(id, command);
    this.emitChanged(user.id);
    return goal;
  }

  async remove(user: User, id: string): Promise<void> {
    await this.get(user, id);
    await this.goalRepository.delete(id);
    this.emitChanged(user.id);
  }

  async plan(user: User, id: string): Promise<GoalPlanDto> {
    const goal = await this.get(user, id);
    const avgMonthlyNet = await this.averageMonthlyNet(user);
    return this.planner.plan(goal, avgMonthlyNet);
  }

  async addContribution(
    user: User,
    goalId: string,
    command: CreateGoalContributionCommand,
  ): Promise<GoalContribution> {
    const goal = await this.get(user, goalId);
    if (!goal.isActive) {
      throw new BadRequestException('Goal is not active');
    }

    let transactionId: string | null = null;
    if (command.accountId && goal.linkedAccountId) {
      if (command.accountId === goal.linkedAccountId) {
        throw new BadRequestException(
          'Contribution source must differ from the linked goal account',
        );
      }
      const transaction = await this.transactionService.create(user, {
        accountId: command.accountId,
        type: TransactionType.TRANSFER,
        amount: command.amount,
        occurredAt: command.occurredAt ?? new Date(),
        counterAccountId: goal.linkedAccountId,
        note: `Contribution to ${goal.name}`,
        source: TransactionSource.MANUAL,
      });
      transactionId = transaction.id;
    }

    const contribution = await this.goalRepository.addContribution(
      goalId,
      user.id,
      command.amount,
      command.occurredAt ?? new Date(),
      transactionId,
    );

    const updated = await this.get(user, goalId);
    if (updated.isFunded) {
      await this.goalRepository.update(goalId, {
        status: GoalStatus.ACHIEVED,
      });
      await this.notificationService.notify(user.id, {
        type: NotificationType.GOAL_ACHIEVED,
        title: `Goal achieved: ${updated.name}`,
        body: `You reached ${formatMoney(updated.targetAmount, updated.currency)}. Congratulations!`,
        link: '/goals',
        dedupeKey: `goal-achieved:${goalId}`,
      });
    }

    this.emitChanged(user.id);
    return contribution;
  }

  async listContributions(
    user: User,
    goalId: string,
    limit: number,
  ): Promise<GoalContribution[]> {
    await this.get(user, goalId);
    return this.goalRepository.listContributions(user.id, goalId, limit);
  }

  async committedContributionsForPeriod(
    user: User,
    from: Date,
    to: Date,
  ): Promise<number> {
    const goals = await this.goalRepository.findActiveByUser(user.id);
    let committed = 0;
    for (const goal of goals) {
      const required = this.planner.requiredPerMonth(goal);
      const contributed = await this.goalRepository.sumContributionsInRange(
        user.id,
        goal.id,
        from,
        to,
      );
      committed += Math.max(0, required - contributed);
    }
    return committed;
  }

  async firstActiveRequiredPerMonth(user: User): Promise<number> {
    const goals = await this.goalRepository.findActiveByUser(user.id);
    if (goals.length === 0) {
      return 0;
    }
    return this.planner.requiredPerMonth(goals[0]);
  }

  private async averageMonthlyNet(user: User): Promise<number> {
    const from = new Date();
    from.setMonth(from.getMonth() - CASH_FLOW_LOOKBACK_MONTHS);
    const { income, expense } = await this.goalRepository.netCashFlowSince(
      user.id,
      user.displayCurrency,
      from,
    );
    return Math.max(0, (income - expense) / CASH_FLOW_LOOKBACK_MONTHS);
  }

  private async requireAccount(user: User, accountId: string): Promise<void> {
    const account = await this.accountRepository.findById(user.id, accountId);
    if (!account) {
      throw new NotFoundException('Linked account not found');
    }
  }

  private emitChanged(userId: string): void {
    this.eventEmitter.emit(
      GoalEventName.CHANGED,
      new GoalChangedEvent(userId),
    );
  }
}
