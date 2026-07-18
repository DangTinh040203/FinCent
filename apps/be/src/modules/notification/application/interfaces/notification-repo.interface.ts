import { type NotificationType } from '@repo/shared';

import { type Notification } from '@/modules/notification/domain/notification.domain';

export const NOTIFICATION_REPOSITORY_TOKEN = Symbol(
  'NOTIFICATION_REPOSITORY_TOKEN',
);

export interface CreateNotificationCommand {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  dedupeKey?: string;
}

export interface INotificationRepository {
  createIfAbsent(
    userId: string,
    command: CreateNotificationCommand,
  ): Promise<Notification | null>;
  list(userId: string, limit: number): Promise<Notification[]>;
  unreadCount(userId: string): Promise<number>;
  markRead(userId: string, id: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
}
