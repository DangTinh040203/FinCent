import { RecurringCadence } from '@repo/shared';

export interface ICadenceStrategy {
  getCadence(): RecurringCadence;
  next(from: Date, interval: number): Date;
}

export class DailyCadenceStrategy implements ICadenceStrategy {
  getCadence(): RecurringCadence {
    return RecurringCadence.DAILY;
  }

  next(from: Date, interval: number): Date {
    const next = new Date(from);
    next.setDate(next.getDate() + interval);
    return next;
  }
}

export class WeeklyCadenceStrategy implements ICadenceStrategy {
  getCadence(): RecurringCadence {
    return RecurringCadence.WEEKLY;
  }

  next(from: Date, interval: number): Date {
    const next = new Date(from);
    next.setDate(next.getDate() + 7 * interval);
    return next;
  }
}

export class MonthlyCadenceStrategy implements ICadenceStrategy {
  getCadence(): RecurringCadence {
    return RecurringCadence.MONTHLY;
  }

  next(from: Date, interval: number): Date {
    return addMonthsClamped(from, interval);
  }
}

export class YearlyCadenceStrategy implements ICadenceStrategy {
  getCadence(): RecurringCadence {
    return RecurringCadence.YEARLY;
  }

  next(from: Date, interval: number): Date {
    return addMonthsClamped(from, 12 * interval);
  }
}

export class CadenceCalculator {
  private readonly strategies = new Map<RecurringCadence, ICadenceStrategy>();

  constructor(
    strategies: ICadenceStrategy[] = [
      new DailyCadenceStrategy(),
      new WeeklyCadenceStrategy(),
      new MonthlyCadenceStrategy(),
      new YearlyCadenceStrategy(),
    ],
  ) {
    strategies.forEach((strategy) => {
      this.strategies.set(strategy.getCadence(), strategy);
    });
  }

  next(cadence: RecurringCadence, from: Date, interval: number): Date {
    const strategy = this.strategies.get(cadence);
    if (!strategy) {
      throw new Error(`Unsupported cadence: ${cadence}`);
    }
    return strategy.next(from, Math.max(1, interval));
  }
}

function addMonthsClamped(from: Date, months: number): Date {
  const day = from.getDate();
  const anchor = new Date(from);
  anchor.setDate(1);
  anchor.setMonth(anchor.getMonth() + months);
  const daysInTargetMonth = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0,
  ).getDate();
  anchor.setDate(Math.min(day, daysInTargetMonth));
  return anchor;
}
