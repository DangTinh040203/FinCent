import {
  type GoalAdjustmentKind,
  type GoalPriority,
  type GoalStatus,
} from '../enums/goal.enum';

export interface GoalDto {
  id: string;
  name: string;
  targetAmount: number;
  contributedAmount: number;
  currency: string;
  deadline: string;
  priority: GoalPriority;
  status: GoalStatus;
  linkedAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalContributionDto {
  id: string;
  goalId: string;
  amount: number;
  occurredAt: string;
  transactionId: string | null;
}

export interface GoalAdjustmentOptionDto {
  kind: GoalAdjustmentKind;
  label: string;
  requiredPerMonth: number;
  newDeadline: string | null;
  newTargetAmount: number | null;
}

export interface GoalPlanDto {
  goalId: string;
  remainingAmount: number;
  monthsLeft: number;
  requiredPerMonth: number;
  onTrack: boolean;
  options: GoalAdjustmentOptionDto[];
}

export interface CreateGoalPayload {
  name: string;
  targetAmount: number;
  deadline: string;
  priority?: GoalPriority;
  linkedAccountId?: string;
}

export interface UpdateGoalPayload {
  name?: string;
  targetAmount?: number;
  deadline?: string;
  priority?: GoalPriority;
  status?: GoalStatus;
  linkedAccountId?: string | null;
}

export interface CreateGoalContributionPayload {
  amount: number;
  occurredAt?: string;
  accountId?: string;
}
