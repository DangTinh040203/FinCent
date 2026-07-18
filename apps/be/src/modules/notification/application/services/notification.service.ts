import { Inject, Injectable } from '@nestjs/common';

import {
  type CreateNotificationCommand,
  type INotificationRepository,
  NOTIFICATION_REPOSITORY_TOKEN,
} from '@/modules/notification/application/interfaces/notification-repo.interface';
import { type Notification } from '@/modules/notification/domain/notification.domain';
import { type User } from '@/modules/user/domain';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async notify(
    userId: string,
    command: CreateNotificationCommand,
  ): Promise<Notification | null> {
    return this.notificationRepository.createIfAbsent(userId, command);
  }

  async list(user: User, limit: number): Promise<Notification[]> {
    return this.notificationRepository.list(user.id, limit);
  }

  async unreadCount(user: User): Promise<number> {
    return this.notificationRepository.unreadCount(user.id);
  }

  async markRead(user: User, id: string): Promise<void> {
    await this.notificationRepository.markRead(user.id, id);
  }

  async markAllRead(user: User): Promise<void> {
    await this.notificationRepository.markAllRead(user.id);
  }
}
