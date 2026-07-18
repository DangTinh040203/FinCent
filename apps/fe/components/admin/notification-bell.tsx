'use client';

import { formatDateTime } from '@repo/shared';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { cn } from '@repo/ui/lib/utils';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useApi } from '@/components/providers/app-providers';
import {
  useInvalidateFinancials,
  useNotifications,
  useUnreadCount,
} from '@/libs/api/hooks';

export function NotificationBell() {
  const api = useApi();
  const router = useRouter();
  const invalidate = useInvalidateFinancials();
  const { data: notifications } = useNotifications();
  const { data: unread } = useUnreadCount();
  const count = unread?.count ?? 0;

  const openNotification = async (
    id: string,
    link: string | null,
    isRead: boolean,
  ) => {
    if (!isRead) {
      await api.notifications.markRead(id);
      await invalidate();
    }
    if (link) {
      router.push(link);
    }
  };

  const markAllRead = async () => {
    await api.notifications.markAllRead();
    await invalidate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='size-4' />
          {count > 0 && (
            <Badge
              className={`
                absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1
                text-[10px]
              `}
            >
              {count > 9 ? '9+' : count}
            </Badge>
          )}
          <span className='sr-only'>Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel className='flex items-center justify-between'>
          Notifications
          {count > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-xs'
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className='max-h-96 overflow-y-auto'>
          {(notifications ?? []).length === 0 && (
            <div className='text-muted-foreground p-4 text-center text-sm'>
              Nothing yet — bill reminders and budget warnings show up here.
            </div>
          )}
          {(notifications ?? []).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className='flex flex-col items-start gap-1 py-2'
              onClick={() =>
                openNotification(
                  notification.id,
                  notification.link,
                  notification.isRead,
                )
              }
            >
              <span
                className={cn(
                  'text-sm',
                  !notification.isRead && 'font-semibold',
                )}
              >
                {notification.title}
              </span>
              <span className='text-muted-foreground line-clamp-2 text-xs'>
                {notification.body}
              </span>
              <span className='text-muted-foreground text-[10px]'>
                {formatDateTime(notification.createdAt)}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
