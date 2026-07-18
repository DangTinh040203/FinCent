import {
  type AccountDto,
  type AuditLogDto,
  type BudgetStatusDto,
  type CategoryDto,
  type ConfirmOccurrencePayload,
  type CreateAccountPayload,
  type CreateBudgetPayload,
  type CreateCategoryPayload,
  type CreateGoalContributionPayload,
  type CreateGoalPayload,
  type CreateRecurringRulePayload,
  type CreateTransactionPayload,
  type CursorPage,
  type GoalContributionDto,
  type GoalDto,
  type GoalPlanDto,
  type NotificationDto,
  type OnboardingStateDto,
  type OverviewDto,
  type RecurringOccurrenceDto,
  type RecurringOccurrenceStatus,
  type RecurringRuleDto,
  type SafeToSpendDto,
  type SimulateSpendResultDto,
  type TransactionDto,
  type TransactionListQuery,
  type UpdateAccountPayload,
  type UpdateBudgetPayload,
  type UpdateCategoryPayload,
  type UpdateGoalPayload,
  type UpdateOnboardingStatePayload,
  type UpdateRecurringRulePayload,
  type UpdateTransactionPayload,
  type UpdateUserSettingsPayload,
  type UserProfileDto,
  type UserSettingsDto,
} from '@repo/shared';

import { type HttpClient } from '@/libs/api/http-client';

export class UsersApi {
  constructor(private readonly http: HttpClient) {}

  me(): Promise<UserProfileDto> {
    return this.http.get('/users/me');
  }

  updateSettings(payload: UpdateUserSettingsPayload): Promise<UserSettingsDto> {
    return this.http.patch('/users/me/settings', payload);
  }

  updateOnboarding(
    payload: UpdateOnboardingStatePayload,
  ): Promise<OnboardingStateDto> {
    return this.http.patch('/users/me/onboarding', payload);
  }
}

export class AccountsApi {
  constructor(private readonly http: HttpClient) {}

  list(includeArchived = false): Promise<AccountDto[]> {
    return this.http.get('/accounts', {
      includeArchived: includeArchived ? 'true' : undefined,
    });
  }

  create(payload: CreateAccountPayload): Promise<AccountDto> {
    return this.http.post('/accounts', payload);
  }

  update(id: string, payload: UpdateAccountPayload): Promise<AccountDto> {
    return this.http.patch(`/accounts/${id}`, payload);
  }

  archive(id: string): Promise<AccountDto> {
    return this.http.post(`/accounts/${id}/archive`);
  }

  unarchive(id: string): Promise<AccountDto> {
    return this.http.post(`/accounts/${id}/unarchive`);
  }
}

export class CategoriesApi {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<CategoryDto[]> {
    return this.http.get('/categories');
  }

  create(payload: CreateCategoryPayload): Promise<CategoryDto> {
    return this.http.post('/categories', payload);
  }

  update(id: string, payload: UpdateCategoryPayload): Promise<CategoryDto> {
    return this.http.patch(`/categories/${id}`, payload);
  }
}

export class TransactionsApi {
  constructor(private readonly http: HttpClient) {}

  list(query: TransactionListQuery): Promise<CursorPage<TransactionDto>> {
    return this.http.get('/transactions', { ...query });
  }

  create(payload: CreateTransactionPayload): Promise<TransactionDto> {
    return this.http.post('/transactions', payload);
  }

  update(
    id: string,
    payload: UpdateTransactionPayload,
  ): Promise<TransactionDto> {
    return this.http.patch(`/transactions/${id}`, payload);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/transactions/${id}`);
  }
}

export class OverviewApi {
  constructor(private readonly http: HttpClient) {}

  get(): Promise<OverviewDto> {
    return this.http.get('/overview');
  }
}

export class SafeToSpendApi {
  constructor(private readonly http: HttpClient) {}

  get(): Promise<SafeToSpendDto> {
    return this.http.get('/safe-to-spend');
  }

  simulate(amount: number): Promise<SimulateSpendResultDto> {
    return this.http.post('/safe-to-spend/simulate', { amount });
  }
}

export class RecurringApi {
  constructor(private readonly http: HttpClient) {}

  listRules(): Promise<RecurringRuleDto[]> {
    return this.http.get('/recurring/rules');
  }

  createRule(payload: CreateRecurringRulePayload): Promise<RecurringRuleDto> {
    return this.http.post('/recurring/rules', payload);
  }

  updateRule(
    id: string,
    payload: UpdateRecurringRulePayload,
  ): Promise<RecurringRuleDto> {
    return this.http.patch(`/recurring/rules/${id}`, payload);
  }

  deleteRule(id: string): Promise<void> {
    return this.http.delete(`/recurring/rules/${id}`);
  }

  listOccurrences(params: {
    status?: RecurringOccurrenceStatus[];
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<RecurringOccurrenceDto[]> {
    return this.http.get('/recurring/occurrences', {
      status: params.status?.join(','),
      from: params.from,
      to: params.to,
      limit: params.limit,
    });
  }

  confirmOccurrence(
    id: string,
    payload: ConfirmOccurrencePayload,
  ): Promise<RecurringOccurrenceDto> {
    return this.http.post(`/recurring/occurrences/${id}/confirm`, payload);
  }

  skipOccurrence(id: string): Promise<RecurringOccurrenceDto> {
    return this.http.post(`/recurring/occurrences/${id}/skip`);
  }
}

export class BudgetsApi {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<BudgetStatusDto[]> {
    return this.http.get('/budgets');
  }

  atRisk(): Promise<BudgetStatusDto[]> {
    return this.http.get('/budgets/at-risk');
  }

  create(payload: CreateBudgetPayload): Promise<BudgetStatusDto> {
    return this.http.post('/budgets', payload);
  }

  update(id: string, payload: UpdateBudgetPayload): Promise<BudgetStatusDto> {
    return this.http.patch(`/budgets/${id}`, payload);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/budgets/${id}`);
  }
}

export class GoalsApi {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<GoalDto[]> {
    return this.http.get('/goals');
  }

  plan(id: string): Promise<GoalPlanDto> {
    return this.http.get(`/goals/${id}/plan`);
  }

  contributions(id: string): Promise<GoalContributionDto[]> {
    return this.http.get(`/goals/${id}/contributions`);
  }

  create(payload: CreateGoalPayload): Promise<GoalDto> {
    return this.http.post('/goals', payload);
  }

  update(id: string, payload: UpdateGoalPayload): Promise<GoalDto> {
    return this.http.patch(`/goals/${id}`, payload);
  }

  contribute(
    id: string,
    payload: CreateGoalContributionPayload,
  ): Promise<GoalContributionDto> {
    return this.http.post(`/goals/${id}/contributions`, payload);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/goals/${id}`);
  }
}

export class NotificationsApi {
  constructor(private readonly http: HttpClient) {}

  list(limit = 30): Promise<NotificationDto[]> {
    return this.http.get('/notifications', { limit });
  }

  unreadCount(): Promise<{ count: number }> {
    return this.http.get('/notifications/unread-count');
  }

  markRead(id: string): Promise<void> {
    return this.http.post(`/notifications/${id}/read`);
  }

  markAllRead(): Promise<void> {
    return this.http.post('/notifications/read-all');
  }
}

export class PrivacyApi {
  constructor(private readonly http: HttpClient) {}

  exportJson(): Promise<Blob> {
    return this.http.requestBlob('/privacy/export');
  }

  exportCsv(entity: string): Promise<Blob> {
    return this.http.requestBlob(`/privacy/export/csv/${entity}`);
  }

  audit(limit = 50): Promise<AuditLogDto[]> {
    return this.http.get('/privacy/audit', { limit });
  }
}

export class FinCentApi {
  readonly users: UsersApi;
  readonly accounts: AccountsApi;
  readonly categories: CategoriesApi;
  readonly transactions: TransactionsApi;
  readonly overview: OverviewApi;
  readonly safeToSpend: SafeToSpendApi;
  readonly recurring: RecurringApi;
  readonly budgets: BudgetsApi;
  readonly goals: GoalsApi;
  readonly notifications: NotificationsApi;
  readonly privacy: PrivacyApi;

  constructor(http: HttpClient) {
    this.users = new UsersApi(http);
    this.accounts = new AccountsApi(http);
    this.categories = new CategoriesApi(http);
    this.transactions = new TransactionsApi(http);
    this.overview = new OverviewApi(http);
    this.safeToSpend = new SafeToSpendApi(http);
    this.recurring = new RecurringApi(http);
    this.budgets = new BudgetsApi(http);
    this.goals = new GoalsApi(http);
    this.notifications = new NotificationsApi(http);
    this.privacy = new PrivacyApi(http);
  }
}
