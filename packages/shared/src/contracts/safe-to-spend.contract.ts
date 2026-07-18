import { type PeriodDto } from './common.contract';

export enum StsLineKey {
  AVAILABLE_BALANCE = 'AVAILABLE_BALANCE',
  CONFIRMED_REMAINING_INCOME = 'CONFIRMED_REMAINING_INCOME',
  REMAINING_BILLS = 'REMAINING_BILLS',
  COMMITTED_GOAL_CONTRIBUTIONS = 'COMMITTED_GOAL_CONTRIBUTIONS',
  SAFETY_BUFFER = 'SAFETY_BUFFER',
}

export interface StsLineDto {
  key: StsLineKey;
  label: string;
  amount: number;
  link: string | null;
}

export interface SafeToSpendDto {
  period: PeriodDto;
  currency: string;
  amount: number;
  lines: StsLineDto[];
  warnings: string[];
  computedAt: string;
}

export interface SimulateSpendPayload {
  amount: number;
}

export interface SimulateSpendResultDto {
  current: SafeToSpendDto;
  simulatedAmount: number;
  simulatedSts: number;
  goalDelayMonths: number | null;
}
