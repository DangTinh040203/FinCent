import { type Period } from '@/libs/periods/period';

export const PERIOD_RESOLVER_TOKEN = Symbol('PERIOD_RESOLVER_TOKEN');

export interface IPeriodResolver {
  resolveMonthly(cycleStartDay: number, reference?: Date): Period;
  resolveWeekly(reference?: Date): Period;
}
