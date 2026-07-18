export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  ACHIEVED = 'ACHIEVED',
  CANCELLED = 'CANCELLED',
}

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum GoalAdjustmentKind {
  RAISE_CONTRIBUTION = 'RAISE_CONTRIBUTION',
  EXTEND_DEADLINE = 'EXTEND_DEADLINE',
  REDUCE_TARGET = 'REDUCE_TARGET',
}
