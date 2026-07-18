import { Module } from '@nestjs/common';

import { AccountModule } from '@/modules/account/account.module';
import { GoalModule } from '@/modules/goal/goal.module';
import { RecurringModule } from '@/modules/recurring/recurring.module';
import { STS_SNAPSHOT_REPOSITORY_TOKEN } from '@/modules/safe-to-spend/application/interfaces/sts-snapshot-repo.interface';
import { SafeToSpendService } from '@/modules/safe-to-spend/application/services/safe-to-spend.service';
import { PrismaStsSnapshotRepository } from '@/modules/safe-to-spend/infrastructure/repositories/prisma-sts-snapshot.repo';
import { SafeToSpendController } from '@/modules/safe-to-spend/presentation/controllers/safe-to-spend.controller';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule, AccountModule, RecurringModule, GoalModule],
  controllers: [SafeToSpendController],
  providers: [
    SafeToSpendService,
    {
      provide: STS_SNAPSHOT_REPOSITORY_TOKEN,
      useClass: PrismaStsSnapshotRepository,
    },
  ],
  exports: [SafeToSpendService],
})
export class SafeToSpendModule {}
