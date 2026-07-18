import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { type NotificationDto } from '@repo/shared';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { CurrentDbUser } from '@/libs/decorators';
import { NotificationService } from '@/modules/notification/application/services/notification.service';
import { User } from '@/modules/user/domain';

class ListNotificationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async list(
    @CurrentDbUser() user: User,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<NotificationDto[]> {
    const notifications = await this.notificationService.list(
      user,
      query.limit ?? 30,
    );
    return notifications.map((notification) => notification.toDto());
  }

  @Get('unread-count')
  async unreadCount(
    @CurrentDbUser() user: User,
  ): Promise<{ count: number }> {
    return { count: await this.notificationService.unreadCount(user) };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markRead(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.notificationService.markRead(user, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllRead(@CurrentDbUser() user: User): Promise<void> {
    await this.notificationService.markAllRead(user);
  }
}
