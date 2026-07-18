import { Module } from '@nestjs/common';

import { AccountModule } from '@/modules/account/account.module';
import { OVERVIEW_QUERY_TOKEN } from '@/modules/overview/application/interfaces/overview-query.interface';
import { OverviewService } from '@/modules/overview/application/services/overview.service';
import { PrismaOverviewQuery } from '@/modules/overview/infrastructure/queries/prisma-overview.query';
import { OverviewController } from '@/modules/overview/presentation/controllers/overview.controller';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule, AccountModule],
  controllers: [OverviewController],
  providers: [
    OverviewService,
    {
      provide: OVERVIEW_QUERY_TOKEN,
      useClass: PrismaOverviewQuery,
    },
  ],
  exports: [OverviewService],
})
export class OverviewModule {}
