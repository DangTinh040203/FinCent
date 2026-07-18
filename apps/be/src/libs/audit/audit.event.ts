export const AUDIT_EVENT = 'audit.record';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ARCHIVE = 'ARCHIVE',
  EXPORT = 'EXPORT',
  BALANCE_EDIT = 'BALANCE_EDIT',
}

export class AuditEvent {
  constructor(
    readonly userId: string,
    readonly action: AuditAction,
    readonly entity: string,
    readonly entityId: string | null = null,
    readonly detail: Record<string, unknown> | null = null,
  ) {}
}
