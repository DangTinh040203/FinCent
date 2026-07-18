import { type AuditLogDto } from '@repo/shared';

export class AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  detail: Record<string, unknown> | null;
  createdAt: Date;

  constructor(partial: Partial<AuditLog>) {
    Object.assign(this, partial);
  }

  toDto(): AuditLogDto {
    return {
      id: this.id,
      action: this.action,
      entity: this.entity,
      entityId: this.entityId,
      detail: this.detail ? JSON.stringify(this.detail) : null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
