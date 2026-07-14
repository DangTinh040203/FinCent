import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui/components/empty';

import { getAdminNavItem } from '@/components/admin/nav';

export function PagePlaceholder({ href }: { href: string }) {
  const { title, description, icon: Icon } = getAdminNavItem(href);

  return (
    <Empty className='flex-1 border'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
