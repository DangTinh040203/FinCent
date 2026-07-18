export enum GoalEventName {
  CHANGED = 'goal.changed',
}

export class GoalChangedEvent {
  constructor(readonly userId: string) {}
}
