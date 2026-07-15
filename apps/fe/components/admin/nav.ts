import {
  ArrowLeftRight,
  Calculator,
  CalendarClock,
  ChartPie,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  ShieldCheck,
  Target,
  Wallet,
} from 'lucide-react';

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description:
          'Balances, cash flow, Safe-to-Spend, upcoming bills, and your top insights.',
      },
      {
        title: 'Can I afford it?',
        href: '/scenarios',
        icon: Calculator,
        description:
          'Evaluate a purchase before you spend — its impact on Safe-to-Spend, budgets, and goals.',
      },
    ],
  },
  {
    label: 'Money',
    items: [
      {
        title: 'Transactions',
        href: '/transactions',
        icon: ArrowLeftRight,
        description:
          'Record income and expenses manually or in natural language, and confirm AI drafts before they are saved.',
      },
      {
        title: 'Accounts',
        href: '/accounts',
        icon: Wallet,
        description:
          'Cash, bank accounts, and wallets with opening balances and reconciliation warnings.',
      },
      {
        title: 'Budgets',
        href: '/budgets',
        icon: ChartPie,
        description:
          'Category limits with spent, remaining, spending pace, and overspend forecasts.',
      },
      {
        title: 'Recurring & bills',
        href: '/recurring',
        icon: CalendarClock,
        description:
          'Recurring income and bills with reminders and projected cash flow.',
      },
      {
        title: 'Goals',
        href: '/goals',
        icon: Target,
        description:
          'Your priority savings goal with a feasible contribution plan and progress tracking.',
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Data & privacy',
        href: '/data-privacy',
        icon: ShieldCheck,
        description:
          'Export transactions, control AI data usage, review the audit log, and delete your data.',
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description:
          'Currency, financial cycle, and profile preferences.',
      },
    ],
  },
];

const NAV_ITEMS = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export function findAdminNavItem(pathname: string): AdminNavItem | undefined {
  return NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export function getAdminNavItem(href: string): AdminNavItem {
  const item = NAV_ITEMS.find((navItem) => navItem.href === href);
  if (!item) throw new Error(`Unknown admin nav item: ${href}`);
  return item;
}
