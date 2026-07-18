import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { type AuditLogDto, type DataExportDto } from '@repo/shared';

import { AUDIT_EVENT, AuditAction, AuditEvent } from '@/libs/audit';
import {
  AUDIT_REPOSITORY_TOKEN,
  DATA_EXPORT_QUERY_TOKEN,
  type ExportEntity,
  type IAuditRepository,
  type IDataExportQuery,
} from '@/modules/privacy/application/interfaces/privacy-repo.interface';
import { CsvSerializer } from '@/modules/privacy/application/services/csv-serializer';
import { type User } from '@/modules/user/domain';

const EXPORT_ENTITIES: ExportEntity[] = [
  'accounts',
  'categories',
  'transactions',
  'budgets',
  'goals',
  'recurringRules',
];

@Injectable()
export class PrivacyService {
  private readonly csvSerializer = new CsvSerializer();

  constructor(
    @Inject(AUDIT_REPOSITORY_TOKEN)
    private readonly auditRepository: IAuditRepository,
    @Inject(DATA_EXPORT_QUERY_TOKEN)
    private readonly dataExportQuery: IDataExportQuery,
  ) {}

  @OnEvent(AUDIT_EVENT)
  async onAuditEvent(event: AuditEvent): Promise<void> {
    await this.auditRepository.record(event);
  }

  async exportJson(user: User): Promise<DataExportDto> {
    const data = await this.dataExportQuery.collect(user.id);
    await this.auditRepository.record(
      new AuditEvent(user.id, AuditAction.EXPORT, 'data-export', null, {
        format: 'json',
      }),
    );
    return data;
  }

  async exportCsv(user: User, entity: string): Promise<string> {
    if (!EXPORT_ENTITIES.includes(entity as ExportEntity)) {
      throw new BadRequestException(
        `Unknown export entity. Use one of: ${EXPORT_ENTITIES.join(', ')}`,
      );
    }
    const data = await this.dataExportQuery.collect(user.id);
    await this.auditRepository.record(
      new AuditEvent(user.id, AuditAction.EXPORT, 'data-export', null, {
        format: 'csv',
        entity,
      }),
    );
    return this.csvSerializer.serialize(data[entity as ExportEntity]);
  }

  async auditTrail(user: User, limit: number): Promise<AuditLogDto[]> {
    const logs = await this.auditRepository.list(user.id, limit);
    return logs.map((log) => log.toDto());
  }
}
