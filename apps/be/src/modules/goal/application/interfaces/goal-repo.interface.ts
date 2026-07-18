import {
  type CreateGoalCommand,
  type UpdateGoalCommand,
} from '@/modules/goal/application/commands/goal.command';
import {
  type Goal,
  type GoalContribution,
} from '@/modules/goal/domain/goal.domain';

export const GOAL_REPOSITORY_TOKEN = Symbol('GOAL_REPOSITORY_TOKEN');

export interface NetCashFlow {
  income: number;
  expense: number;
}

export interface IGoalRepository {
  create(
    userId: string,
    currency: string,
    command: CreateGoalCommand,
  ): Promise<Goal>;
  findById(userId: string, id: string): Promise<Goal | null>;
  findAllByUser(userId: string): Promise<Goal[]>;
  findActiveByUser(userId: string): Promise<Goal[]>;
  update(id: string, command: UpdateGoalCommand): Promise<Goal>;
  delete(id: string): Promise<void>;
  addContribution(
    goalId: string,
    userId: string,
    amount: number,
    occurredAt: Date,
    transactionId: string | null,
  ): Promise<GoalContribution>;
  listContributions(
    userId: string,
    goalId: string,
    limit: number,
  ): Promise<GoalContribution[]>;
  sumContributionsInRange(
    userId: string,
    goalId: string,
    from: Date,
    to: Date,
  ): Promise<number>;
  netCashFlowSince(
    userId: string,
    currency: string,
    from: Date,
  ): Promise<NetCashFlow>;
}
