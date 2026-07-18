import {
  GoalAdjustmentKind,
  type GoalAdjustmentOptionDto,
  type GoalPlanDto,
} from '@repo/shared';

import { type Goal } from '@/modules/goal/domain/goal.domain';

const MS_PER_MONTH = 30.44 * 86_400_000;

export class GoalPlanner {
  plan(goal: Goal, avgMonthlyNet: number, now = new Date()): GoalPlanDto {
    const remaining = goal.remainingAmount;
    const monthsLeft = Math.max(
      0,
      Math.ceil((goal.deadline.getTime() - now.getTime()) / MS_PER_MONTH),
    );
    const requiredPerMonth = this.requiredPerMonth(goal, now);
    const onTrack =
      remaining === 0 || (monthsLeft > 0 && requiredPerMonth <= avgMonthlyNet);

    return {
      goalId: goal.id,
      remainingAmount: remaining,
      monthsLeft,
      requiredPerMonth,
      onTrack,
      options: onTrack ? [] : this.adjustmentOptions(goal, now),
    };
  }

  requiredPerMonth(goal: Goal, now = new Date()): number {
    const remaining = goal.remainingAmount;
    if (remaining === 0) {
      return 0;
    }
    const monthsLeft = Math.max(
      0,
      Math.ceil((goal.deadline.getTime() - now.getTime()) / MS_PER_MONTH),
    );
    return monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : remaining;
  }

  private adjustmentOptions(
    goal: Goal,
    now: Date,
  ): GoalAdjustmentOptionDto[] {
    const options: GoalAdjustmentOptionDto[] = [
      {
        kind: GoalAdjustmentKind.RAISE_CONTRIBUTION,
        label: 'Raise the monthly contribution',
        requiredPerMonth: this.requiredPerMonth(goal, now),
        newDeadline: null,
        newTargetAmount: null,
      },
    ];

    const monthsElapsed = Math.max(
      1,
      (now.getTime() - goal.createdAt.getTime()) / MS_PER_MONTH,
    );
    const currentMonthlyRate = goal.contributedAmount / monthsElapsed;

    if (currentMonthlyRate > 0) {
      const monthsNeeded = Math.ceil(
        goal.remainingAmount / currentMonthlyRate,
      );
      options.push({
        kind: GoalAdjustmentKind.EXTEND_DEADLINE,
        label: 'Keep the current pace and extend the deadline',
        requiredPerMonth: Math.ceil(currentMonthlyRate),
        newDeadline: new Date(
          now.getTime() + monthsNeeded * MS_PER_MONTH,
        ).toISOString(),
        newTargetAmount: null,
      });

      const monthsLeft = Math.max(
        0,
        Math.ceil((goal.deadline.getTime() - now.getTime()) / MS_PER_MONTH),
      );
      options.push({
        kind: GoalAdjustmentKind.REDUCE_TARGET,
        label: 'Reduce the target to match the current pace',
        requiredPerMonth: Math.ceil(currentMonthlyRate),
        newDeadline: null,
        newTargetAmount: Math.round(
          goal.contributedAmount + currentMonthlyRate * monthsLeft,
        ),
      });
    }

    return options;
  }
}
