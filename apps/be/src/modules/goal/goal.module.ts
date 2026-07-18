import { Module } from '@nestjs/common';

import { AccountModule } from '@/modules/account/account.module';
import { GOAL_REPOSITORY_TOKEN } from '@/modules/goal/application/interfaces/goal-repo.interface';
import { GoalService } from '@/modules/goal/application/services/goal.service';
import { PrismaAdapterGoalRepository } from '@/modules/goal/infrastructure/repositories/prisma-goal.repo';
import { GoalController } from '@/modules/goal/presentation/controllers/goal.controller';
import { NotificationModule } from '@/modules/notification/notification.module';
import { TransactionModule } from '@/modules/transaction/transaction.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule, AccountModule, TransactionModule, NotificationModule],
  controllers: [GoalController],
  providers: [
    GoalService,
    {
      provide: GOAL_REPOSITORY_TOKEN,
      useClass: PrismaAdapterGoalRepository,
    },
  ],
  exports: [GoalService],
})
export class GoalModule {}
