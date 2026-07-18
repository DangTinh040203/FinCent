import { Module } from '@nestjs/common';

import { AccountModule } from '@/modules/account/account.module';
import { CategoryModule } from '@/modules/category/category.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { RECURRING_REPOSITORY_TOKEN } from '@/modules/recurring/application/interfaces/recurring-repo.interface';
import { RecurringService } from '@/modules/recurring/application/services/recurring.service';
import { RecurringMaterializerService } from '@/modules/recurring/application/services/recurring-materializer.service';
import { RecurringSchedulerService } from '@/modules/recurring/application/services/recurring-scheduler.service';
import { CadenceCalculator } from '@/modules/recurring/domain/cadence.strategy';
import { PrismaAdapterRecurringRepository } from '@/modules/recurring/infrastructure/repositories/prisma-recurring.repo';
import { RecurringController } from '@/modules/recurring/presentation/controllers/recurring.controller';
import { TransactionModule } from '@/modules/transaction/transaction.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    UserModule,
    AccountModule,
    CategoryModule,
    TransactionModule,
    NotificationModule,
  ],
  controllers: [RecurringController],
  providers: [
    RecurringService,
    RecurringMaterializerService,
    RecurringSchedulerService,
    {
      provide: CadenceCalculator,
      useValue: new CadenceCalculator(),
    },
    {
      provide: RECURRING_REPOSITORY_TOKEN,
      useClass: PrismaAdapterRecurringRepository,
    },
  ],
  exports: [RecurringService],
})
export class RecurringModule {}
