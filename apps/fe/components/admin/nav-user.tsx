'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from '@repo/ui/components/sidebar';
import { ChevronsUpDown, LogOut, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function initialsOf(name: string) {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'FC'
  );
}

export function NavUser() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const name = user.fullName ?? user.username ?? 'Account';
  const email = user.primaryEmailAddress?.emailAddress ?? '';

  const identity = (
    <>
      <Avatar className='size-8 rounded-lg'>
        <AvatarImage src={user.imageUrl} alt={name} />
        <AvatarFallback className='rounded-lg'>
          {initialsOf(name)}
        </AvatarFallback>
      </Avatar>
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-medium'>{name}</span>
        <span className='text-muted-foreground truncate text-xs'>{email}</span>
      </div>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className={`
                data-[state=open]:bg-sidebar-accent
                data-[state=open]:text-sidebar-accent-foreground
              `}
            >
              {identity}
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={`
              w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg
            `}
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div
                className={`
                  flex items-center gap-2 px-1 py-1.5 text-left text-sm
                `}
              >
                {identity}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href='/settings' onClick={() => setOpenMobile(false)}>
                  <Settings />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/data-privacy'
                  onClick={() => setOpenMobile(false)}
                >
                  <ShieldCheck />
                  Data &amp; privacy
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void signOut({ redirectUrl: '/sign-in' })}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
