import { type PeriodDto } from '@repo/shared';

export class Period {
  constructor(
    readonly start: Date,
    readonly end: Date,
    readonly label: string,
  ) {}

  get totalDays(): number {
    return Math.round(
      (this.end.getTime() - this.start.getTime()) / 86_400_000,
    );
  }

  contains(date: Date): boolean {
    return date >= this.start && date < this.end;
  }

  elapsedFraction(now = new Date()): number {
    const total = this.end.getTime() - this.start.getTime();
    const elapsed = now.getTime() - this.start.getTime();
    return Math.min(1, Math.max(0, elapsed / total));
  }

  remainingDays(now = new Date()): number {
    return Math.max(
      0,
      Math.ceil((this.end.getTime() - now.getTime()) / 86_400_000),
    );
  }

  toDto(): PeriodDto {
    return {
      start: this.start.toISOString(),
      end: this.end.toISOString(),
      label: this.label,
    };
  }
}
