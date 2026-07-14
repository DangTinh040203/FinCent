import {
  SidebarInset,
  SidebarProvider,
} from '@repo/ui/components/sidebar';
import { cookies } from 'next/headers';
import { type ReactNode } from 'react';

import { AppSidebar } from '@/components/admin/app-sidebar';
import { SiteHeader } from '@/components/admin/site-header';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main
          className={`
            flex flex-1 flex-col gap-4 p-4
            md:gap-6 md:p-6
          `}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
