export enum RecurringEventName {
  CHANGED = 'recurring.changed',
}

export class RecurringChangedEvent {
  constructor(readonly userId: string) {}
}
