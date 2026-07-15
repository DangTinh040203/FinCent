'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb';
import { Separator } from '@repo/ui/components/separator';
import { SidebarTrigger } from '@repo/ui/components/sidebar';
import { ThemeSelect } from '@repo/ui/components/theme-select';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { findAdminNavItem } from '@/components/admin/nav';

export function SiteHeader() {
  const pathname = usePathname();
  const item = findAdminNavItem(pathname);

  return (
    <header
      className={`
        bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2
        border-b px-4
      `}
    >
      <SidebarTrigger className='-ml-1' />
      <Separator
        orientation='vertical'
        className={`
          mr-2
          data-[orientation=vertical]:h-4
        `}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className={`
            hidden
            md:block
          `}>
            <BreadcrumbLink asChild>
              <Link href='/dashboard'>FinCent</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {item && (
            <>
              <BreadcrumbSeparator className={`
                hidden
                md:block
              `} />
              <BreadcrumbItem>
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className='ml-auto'>
        <ThemeSelect />
      </div>
    </header>
  );
}
