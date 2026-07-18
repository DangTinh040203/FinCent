import {
  type NotificationDto,
  type NotificationType,
} from '@repo/shared';

export class Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  dedupeKey: string | null;
  isRead: boolean;
  createdAt: Date;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }

  toDto(): NotificationDto {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      body: this.body,
      link: this.link,
      isRead: this.isRead,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
