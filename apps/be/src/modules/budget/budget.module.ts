import { Module } from '@nestjs/common';

import { BUDGET_REPOSITORY_TOKEN } from '@/modules/budget/application/interfaces/budget-repo.interface';
import { BudgetService } from '@/modules/budget/application/services/budget.service';
import { BudgetThresholdWatcher } from '@/modules/budget/application/services/budget-threshold.watcher';
import { PrismaAdapterBudgetRepository } from '@/modules/budget/infrastructure/repositories/prisma-budget.repo';
import { BudgetController } from '@/modules/budget/presentation/controllers/budget.controller';
import { CategoryModule } from '@/modules/category/category.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule, CategoryModule, NotificationModule],
  controllers: [BudgetController],
  providers: [
    BudgetService,
    BudgetThresholdWatcher,
    {
      provide: BUDGET_REPOSITORY_TOKEN,
      useClass: PrismaAdapterBudgetRepository,
    },
  ],
  exports: [BudgetService],
})
export class BudgetModule {}
