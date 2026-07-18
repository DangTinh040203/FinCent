import { type DataExportDto } from '@repo/shared';

import { type AuditEvent } from '@/libs/audit';
import { type AuditLog } from '@/modules/privacy/domain/audit-log.domain';

export const AUDIT_REPOSITORY_TOKEN = Symbol('AUDIT_REPOSITORY_TOKEN');
export const DATA_EXPORT_QUERY_TOKEN = Symbol('DATA_EXPORT_QUERY_TOKEN');

export interface IAuditRepository {
  record(event: AuditEvent): Promise<void>;
  list(userId: string, limit: number): Promise<AuditLog[]>;
}

export type ExportEntity =
  | 'accounts'
  | 'categories'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'recurringRules';

export interface IDataExportQuery {
  collect(userId: string): Promise<DataExportDto>;
}
