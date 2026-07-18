'use client';

import {
  type RecurringOccurrenceStatus,
  type TransactionListQuery,
} from '@repo/shared';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { useApi } from '@/components/providers/app-providers';
import { ApiError } from '@/libs/api/http-client';
import {
  FINANCIAL_KEYS_TO_INVALIDATE,
  queryKeys,
} from '@/libs/api/query-keys';

export function useInvalidateFinancials() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all(
      FINANCIAL_KEYS_TO_INVALIDATE.map((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      ),
    );
  };
}

export function showApiError(error: unknown, fallback = 'Something went wrong') {
  toast.error(error instanceof ApiError ? error.message : fallback);
}

export function useProfile() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => api.users.me(),
  });
}

export function useAccounts(includeArchived = false) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.accounts(includeArchived),
    queryFn: () => api.accounts.list(includeArchived),
    placeholderData: keepPreviousData,
  });
}

export function useCategories() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.categories.list(),
  });
}

export function useTransactions(query: TransactionListQuery) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.transactions(query),
    queryFn: ({ pageParam }) =>
      api.transactions.list({ ...query, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });
}

export function useOverview() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: () => api.overview.get(),
  });
}

export function useSafeToSpend() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.safeToSpend,
    queryFn: () => api.safeToSpend.get(),
  });
}

export function useRecurringRules() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.recurringRules,
    queryFn: () => api.recurring.listRules(),
  });
}

export function useOccurrences(params: {
  scope: string;
  status?: RecurringOccurrenceStatus[];
  from?: string;
  to?: string;
  limit?: number;
}) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.occurrences(params.scope),
    queryFn: () =>
      api.recurring.listOccurrences({
        status: params.status,
        from: params.from,
        to: params.to,
        limit: params.limit,
      }),
  });
}

export function useBudgets() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.budgets,
    queryFn: () => api.budgets.list(),
  });
}

export function useGoals() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: () => api.goals.list(),
  });
}

export function useGoalPlan(goalId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.goalPlan(goalId ?? 'none'),
    queryFn: () => api.goals.plan(goalId as string),
    enabled: goalId !== null,
  });
}

export function useGoalContributions(goalId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.goalContributions(goalId ?? 'none'),
    queryFn: () => api.goals.contributions(goalId as string),
    enabled: goalId !== null,
  });
}

export function useNotifications() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => api.notifications.list(),
  });
}

export function useUnreadCount() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.notificationCount,
    queryFn: () => api.notifications.unreadCount(),
    refetchInterval: 60_000,
  });
}

export function useAuditTrail() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.audit,
    queryFn: () => api.privacy.audit(),
  });
}

export function useFinancialMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  options: { successMessage?: string; onSuccess?: () => void } = {},
) {
  const invalidate = useInvalidateFinancials();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await invalidate();
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      options.onSuccess?.();
    },
    onError: (error) => showApiError(error),
  });
}
