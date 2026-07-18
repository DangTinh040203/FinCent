import { type TransactionListQuery } from '@repo/shared';

export const queryKeys = {
  profile: ['profile'] as const,
  accounts: (includeArchived: boolean) =>
    ['accounts', includeArchived] as const,
  allAccounts: ['accounts'] as const,
  categories: ['categories'] as const,
  transactions: (query: TransactionListQuery) =>
    ['transactions', query] as const,
  allTransactions: ['transactions'] as const,
  overview: ['overview'] as const,
  safeToSpend: ['safe-to-spend'] as const,
  recurringRules: ['recurring', 'rules'] as const,
  occurrences: (scope: string) => ['recurring', 'occurrences', scope] as const,
  allOccurrences: ['recurring', 'occurrences'] as const,
  budgets: ['budgets'] as const,
  goals: ['goals'] as const,
  goalPlan: (id: string) => ['goals', id, 'plan'] as const,
  goalContributions: (id: string) => ['goals', id, 'contributions'] as const,
  notifications: ['notifications'] as const,
  notificationCount: ['notifications', 'unread-count'] as const,
  audit: ['audit'] as const,
} as const;

export const FINANCIAL_KEYS_TO_INVALIDATE = [
  ['profile'],
  ['accounts'],
  ['transactions'],
  ['overview'],
  ['safe-to-spend'],
  ['budgets'],
  ['goals'],
  ['recurring'],
  ['notifications'],
] as const;
