import { Module } from '@nestjs/common';

import { NOTIFICATION_REPOSITORY_TOKEN } from '@/modules/notification/application/interfaces/notification-repo.interface';
import { NotificationService } from '@/modules/notification/application/services/notification.service';
import { PrismaAdapterNotificationRepository } from '@/modules/notification/infrastructure/repositories/prisma-notification.repo';
import { NotificationController } from '@/modules/notification/presentation/controllers/notification.controller';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useClass: PrismaAdapterNotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
