import { type GoalPriority, type GoalStatus } from '@repo/shared';

export interface CreateGoalCommand {
  name: string;
  targetAmount: number;
  deadline: Date;
  priority?: GoalPriority;
  linkedAccountId?: string;
}

export interface UpdateGoalCommand {
  name?: string;
  targetAmount?: number;
  deadline?: Date;
  priority?: GoalPriority;
  status?: GoalStatus;
  linkedAccountId?: string | null;
}

export interface CreateGoalContributionCommand {
  amount: number;
  occurredAt?: Date;
  accountId?: string;
}
