import { Card, CardContent } from '@repo/ui/components/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui/components/empty';
import { Sparkles } from 'lucide-react';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard · FinCent',
  description:
    'Balances, cash flow, Safe-to-Spend, upcoming bills, and your top insights.',
};

const STATS = [
  { label: 'Safe-to-Spend', hint: 'Until next income' },
  { label: 'Total balance', hint: 'Across all accounts' },
  { label: 'Income', hint: 'This cycle' },
  { label: 'Expenses', hint: 'This cycle' },
];

export default function DashboardPage() {
  return (
    <>
      <div
        className={`
          grid gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        `}
      >
        {STATS.map((stat) => (
          <Card key={stat.label} className='gap-0 py-5'>
            <CardContent className='px-5'>
              <span
                className={`
                  text-muted-foreground font-mono text-[11px] tracking-[0.14em]
                  uppercase
                `}
              >
                {stat.label}
              </span>
              <div
                className={`
                  text-foreground font-display mt-3 text-[2rem] font-semibold
                  tracking-[-0.02em] tabular-nums
                `}
              >
                &mdash;
              </div>
              <p className='text-muted-foreground mt-1 text-[13px]'>
                {stat.hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Empty className='flex-1 border'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>No insights yet</EmptyTitle>
          <EmptyDescription>
            Add your accounts and record a few transactions. FinCent will
            calculate your Safe-to-Spend and surface the one to three insights
            that matter most.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </>
  );
}
