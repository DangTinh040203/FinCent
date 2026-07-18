import { Injectable, Logger } from '@nestjs/common';
import { type NotificationType } from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import { type Notification as NotificationRow } from '@/libs/databases/prisma/generated/client';
import {
  type CreateNotificationCommand,
  type INotificationRepository,
} from '@/modules/notification/application/interfaces/notification-repo.interface';
import { Notification } from '@/modules/notification/domain/notification.domain';

const UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class PrismaAdapterNotificationRepository
  implements INotificationRepository
{
  private readonly logger = new Logger(
    PrismaAdapterNotificationRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async createIfAbsent(
    userId: string,
    command: CreateNotificationCommand,
  ): Promise<Notification | null> {
    try {
      const row = await this.prisma.notification.create({
        data: {
          userId,
          type: command.type,
          title: command.title,
          body: command.body,
          link: command.link ?? null,
          dedupeKey: command.dedupeKey ?? null,
        },
      });
      return this.toDomain(row);
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code?: string }).code === UNIQUE_VIOLATION
      ) {
        this.logger.debug(
          `Notification deduplicated: ${command.dedupeKey ?? 'unknown'}`,
        );
        return null;
      }
      throw error;
    }
  }

  async list(userId: string, limit: number): Promise<Notification[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((row) => this.toDomain(row));
  }

  async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  private toDomain(row: NotificationRow): Notification {
    return new Notification({
      id: row.id,
      userId: row.userId,
      type: row.type as NotificationType,
      title: row.title,
      body: row.body,
      link: row.link,
      dedupeKey: row.dedupeKey,
      isRead: row.isRead,
      createdAt: row.createdAt,
    });
  }
}
