import {
  type GoalContributionDto,
  type GoalDto,
  type GoalPriority,
  GoalStatus,
} from '@repo/shared';

export class Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  contributedAmount: number;
  currency: string;
  deadline: Date;
  priority: GoalPriority;
  status: GoalStatus;
  linkedAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Goal>) {
    Object.assign(this, partial);
  }

  get isActive(): boolean {
    return this.status === GoalStatus.ACTIVE;
  }

  get remainingAmount(): number {
    return Math.max(0, this.targetAmount - this.contributedAmount);
  }

  get isFunded(): boolean {
    return this.contributedAmount >= this.targetAmount;
  }

  toDto(): GoalDto {
    return {
      id: this.id,
      name: this.name,
      targetAmount: this.targetAmount,
      contributedAmount: this.contributedAmount,
      currency: this.currency,
      deadline: this.deadline.toISOString(),
      priority: this.priority,
      status: this.status,
      linkedAccountId: this.linkedAccountId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

export class GoalContribution {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  occurredAt: Date;
  transactionId: string | null;

  constructor(partial: Partial<GoalContribution>) {
    Object.assign(this, partial);
  }

  toDto(): GoalContributionDto {
    return {
      id: this.id,
      goalId: this.goalId,
      amount: this.amount,
      occurredAt: this.occurredAt.toISOString(),
      transactionId: this.transactionId,
    };
  }
}
