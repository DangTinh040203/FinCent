import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { HealthController } from '@/app/health.controller';
import { CacheModule } from '@/libs/cache';
import { AppConfigModule } from '@/libs/configs/config.module';
import { DatabaseModule } from '@/libs/databases/database.module';
import { GlobalExceptionFilter } from '@/libs/filters';
import { ClerkAuthGuard } from '@/libs/guards';
import { RequestIdMiddleware } from '@/libs/middlewares/request-id.middleware';
import { PeriodsModule } from '@/libs/periods';
import { AccountModule } from '@/modules/account/account.module';
import { BudgetModule } from '@/modules/budget/budget.module';
import { CategoryModule } from '@/modules/category/category.module';
import { GoalModule } from '@/modules/goal/goal.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { OverviewModule } from '@/modules/overview/overview.module';
import { PrivacyModule } from '@/modules/privacy/privacy.module';
import { RecurringModule } from '@/modules/recurring/recurring.module';
import { SafeToSpendModule } from '@/modules/safe-to-spend/safe-to-spend.module';
import { TransactionModule } from '@/modules/transaction/transaction.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    UserModule,
    AccountModule,
    CategoryModule,
    TransactionModule,
    OverviewModule,
    RecurringModule,
    NotificationModule,
    BudgetModule,
    GoalModule,
    SafeToSpendModule,
    PrivacyModule,
    DatabaseModule,
    AppConfigModule,
    CacheModule,
    PeriodsModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('{*splat}');
  }
}
