import { Injectable } from '@nestjs/common';

import { Period } from '@/libs/periods/period';
import { type IPeriodResolver } from '@/libs/periods/period-resolver.interface';

@Injectable()
export class CyclePeriodResolver implements IPeriodResolver {
  resolveMonthly(cycleStartDay: number, reference = new Date()): Period {
    const day = Math.min(Math.max(cycleStartDay, 1), 28);
    const anchor =
      reference.getDate() >= day
        ? new Date(reference.getFullYear(), reference.getMonth(), day)
        : new Date(reference.getFullYear(), reference.getMonth() - 1, day);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, day);
    return new Period(anchor, end, this.monthlyLabel(anchor, end, day));
  }

  resolveWeekly(reference = new Date()): Period {
    const weekday = (reference.getDay() + 6) % 7;
    const start = new Date(
      reference.getFullYear(),
      reference.getMonth(),
      reference.getDate() - weekday,
    );
    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 7,
    );
    const label = `Week of ${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
    return new Period(start, end, label);
  }

  private monthlyLabel(start: Date, end: Date, day: number): string {
    if (day === 1) {
      return start.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
    const from = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const lastDay = new Date(end.getTime() - 86_400_000);
    const to = lastDay.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${from} – ${to}`;
  }
}
