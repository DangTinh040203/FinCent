export interface DataExportDto {
  exportedAt: string;
  accounts: unknown[];
  categories: unknown[];
  transactions: unknown[];
  budgets: unknown[];
  goals: unknown[];
  recurringRules: unknown[];
}

export interface AuditLogDto {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  detail: string | null;
  createdAt: string;
}
