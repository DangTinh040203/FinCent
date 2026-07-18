import { Module } from '@nestjs/common';

import {
  AUDIT_REPOSITORY_TOKEN,
  DATA_EXPORT_QUERY_TOKEN,
} from '@/modules/privacy/application/interfaces/privacy-repo.interface';
import { PrivacyService } from '@/modules/privacy/application/services/privacy.service';
import {
  PrismaAuditRepository,
  PrismaDataExportQuery,
} from '@/modules/privacy/infrastructure/repositories/prisma-privacy.repo';
import { PrivacyController } from '@/modules/privacy/presentation/controllers/privacy.controller';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [PrivacyController],
  providers: [
    PrivacyService,
    {
      provide: AUDIT_REPOSITORY_TOKEN,
      useClass: PrismaAuditRepository,
    },
    {
      provide: DATA_EXPORT_QUERY_TOKEN,
      useClass: PrismaDataExportQuery,
    },
  ],
  exports: [PrivacyService],
})
export class PrivacyModule {}
