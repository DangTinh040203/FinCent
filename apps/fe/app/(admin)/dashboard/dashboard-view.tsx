'use client';

import {
  BudgetRiskLevel,
  formatDate,
  formatMoney,
  GoalStatus,
  RecurringOccurrenceStatus,
  toDateInputValue,
  TransactionType,
} from '@repo/shared';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/ui/components/chart';
import { Progress } from '@repo/ui/components/progress';
import { Skeleton } from '@repo/ui/components/skeleton';
import { ArrowRight, Plus, Rocket } from 'lucide-react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { StsCard } from '@/app/(admin)/dashboard/sts-card';
import { Money } from '@/components/finance/money';
import {
  useBudgets,
  useGoals,
  useOccurrences,
  useOverview,
  useProfile,
  useTransactions,
} from '@/libs/api/hooks';

const spendChartConfig = {
  amount: {
    label: 'Spent',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function DashboardView() {
  const { data: profile } = useProfile();
  const { data: overview, isLoading: overviewLoading } = useOverview();
  const { data: budgets } = useBudgets();
  const { data: goals } = useGoals();
  const { data: upcoming } = useOccurrences({
    scope: 'dashboard-upcoming',
    status: [
      RecurringOccurrenceStatus.DUE,
      RecurringOccurrenceStatus.PROJECTED,
    ],
    to: nextDays(14),
    limit: 5,
  });
  const { data: recentPages } = useTransactions({ limit: 5 });

  const recent = recentPages?.pages[0]?.items ?? [];
  const atRisk = (budgets ?? []).filter(
    (budget) => budget.riskLevel !== BudgetRiskLevel.ON_TRACK,
  );
  const activeGoal = (goals ?? []).find(
    (goal) => goal.status === GoalStatus.ACTIVE,
  );
  const currency = overview?.currency ?? 'VND';
  const periodQuery = overview
    ? `from=${overview.period.start.slice(0, 10)}&to=${overview.period.end.slice(0, 10)}`
    : '';

  const showOnboardingBanner =
    profile && !profile.onboarding.isCompleted;

  return (
    <div className='flex flex-col gap-4'>
      {showOnboardingBanner && (
        <Card className='border-dashed'>
          <CardContent
            className={`
              flex flex-col items-start justify-between gap-3 py-4
              sm:flex-row sm:items-center
            `}
          >
            <div className='flex items-center gap-3'>
              <Rocket className='text-primary size-5' />
              <div>
                <p className='font-medium'>Finish setting up FinCent</p>
                <p className='text-muted-foreground text-sm'>
                  Add accounts, recurring bills and a goal to unlock a real
                  Safe-to-Spend number.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href='/onboarding'>Continue setup</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div
        className={`
          grid gap-4
          xl:grid-cols-2
        `}
      >
        <StsCard />
        <div
          className={`grid grid-cols-2 gap-4`}
        >
          <StatCard
            label='Total balance'
            hint='Across active accounts'
            href='/accounts'
            loading={overviewLoading}
            value={
              overview ? formatMoney(overview.totalBalance, currency) : null
            }
          />
          <StatCard
            label='Net cash flow'
            hint={overview?.period.label ?? 'This cycle'}
            href={`/transactions?${periodQuery}`}
            loading={overviewLoading}
            value={overview ? formatMoney(overview.net, currency) : null}
            negative={(overview?.net ?? 0) < 0}
          />
          <StatCard
            label='Income'
            hint={overview?.period.label ?? 'This cycle'}
            href={`/transactions?type=INCOME&${periodQuery}`}
            loading={overviewLoading}
            value={overview ? formatMoney(overview.income, currency) : null}
          />
          <StatCard
            label='Expenses'
            hint={overview?.period.label ?? 'This cycle'}
            href={`/transactions?type=EXPENSE&${periodQuery}`}
            loading={overviewLoading}
            value={overview ? formatMoney(overview.expense, currency) : null}
          />
        </div>
      </div>

      <div
        className={`
          grid gap-4
          lg:grid-cols-3
        `}
      >
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Upcoming bills</CardTitle>
            <CardDescription>Next 14 days</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {(upcoming ?? []).length === 0 && (
              <p className='text-muted-foreground text-sm'>
                Nothing due.{' '}
                <Link href='/recurring' className='hover:underline'>
                  Set up recurring bills →
                </Link>
              </p>
            )}
            {(upcoming ?? []).map((occurrence) => (
              <div
                key={occurrence.id}
                className='flex items-center justify-between text-sm'
              >
                <div>
                  <p className='font-medium'>{occurrence.ruleName}</p>
                  <p className='text-muted-foreground text-xs'>
                    {formatDate(occurrence.dueAt)}
                    {occurrence.status === RecurringOccurrenceStatus.DUE && (
                      <Badge variant='destructive' className='ml-2 text-[10px]'>
                        Due
                      </Badge>
                    )}
                  </p>
                </div>
                <Money
                  amount={occurrence.amount}
                  currency={occurrence.currency}
                />
              </div>
            ))}
            <Button variant='ghost' size='sm' asChild className='-ml-2'>
              <Link href='/recurring'>
                All recurring
                <ArrowRight className='size-3' />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Budgets at risk</CardTitle>
            <CardDescription>
              {atRisk.length === 0
                ? 'All budgets on track'
                : `${atRisk.length} need attention`}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {(budgets ?? []).length === 0 && (
              <p className='text-muted-foreground text-sm'>
                No budgets yet.{' '}
                <Link href='/budgets' className='hover:underline'>
                  Create one →
                </Link>
              </p>
            )}
            {atRisk.slice(0, 3).map((budget) => (
              <div key={budget.id} className='space-y-1'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium'>{budget.categoryName}</span>
                  <span className='text-muted-foreground text-xs'>
                    {Math.round(budget.percentUsed)}%
                  </span>
                </div>
                <Progress value={Math.min(100, budget.percentUsed)} />
              </div>
            ))}
            <Button variant='ghost' size='sm' asChild className='-ml-2'>
              <Link href='/budgets'>
                All budgets
                <ArrowRight className='size-3' />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Goal progress</CardTitle>
            <CardDescription>
              {activeGoal ? activeGoal.name : 'No active goal'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {activeGoal ? (
              <>
                <div className='flex items-baseline justify-between'>
                  <Money
                    amount={activeGoal.contributedAmount}
                    currency={activeGoal.currency}
                  />
                  <span className='text-muted-foreground text-xs'>
                    of{' '}
                    {formatMoney(activeGoal.targetAmount, activeGoal.currency)}
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    (activeGoal.contributedAmount / activeGoal.targetAmount) *
                      100,
                  )}
                />
                <p className='text-muted-foreground text-xs'>
                  Deadline {formatDate(activeGoal.deadline)}
                </p>
              </>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Give your savings a direction.{' '}
                <Link href='/goals' className='hover:underline'>
                  Create a goal →
                </Link>
              </p>
            )}
            <Button variant='ghost' size='sm' asChild className='-ml-2'>
              <Link href='/goals'>
                Goals
                <ArrowRight className='size-3' />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div
        className={`
          grid gap-4
          lg:grid-cols-2
        `}
      >
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Daily spending</CardTitle>
            <CardDescription>{overview?.period.label}</CardDescription>
          </CardHeader>
          <CardContent>
            {(overview?.dailySpend ?? []).length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                No expenses recorded this period yet.
              </p>
            ) : (
              <ChartContainer
                config={spendChartConfig}
                className='h-56 w-full'
              >
                <BarChart data={overview?.dailySpend ?? []}>
                  <CartesianGrid vertical={false} strokeOpacity={0.35} />
                  <XAxis
                    dataKey='date'
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: string) => value.slice(8)}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(value: number) =>
                      Intl.NumberFormat('en-US', {
                        notation: 'compact',
                      }).format(value)
                    }
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(label) => formatDate(String(label))}
                        formatter={(value) => (
                          <Money amount={Number(value)} currency={currency} />
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey='amount'
                    fill='var(--color-amount)'
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base'>Recent transactions</CardTitle>
              <CardDescription>Latest activity</CardDescription>
            </div>
            <Button size='sm' asChild>
              <Link href='/transactions'>
                <Plus className='size-4' />
                Quick add
              </Link>
            </Button>
          </CardHeader>
          <CardContent className='space-y-2'>
            {recent.length === 0 && (
              <p className='text-muted-foreground text-sm'>
                Nothing recorded yet.
              </p>
            )}
            {recent.map((transaction) => (
              <div
                key={transaction.id}
                className='flex items-center justify-between text-sm'
              >
                <div>
                  <p className='font-medium'>
                    {transaction.note ||
                      (transaction.type === TransactionType.TRANSFER
                        ? 'Transfer'
                        : transaction.type === TransactionType.INCOME
                          ? 'Income'
                          : 'Expense')}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {formatDate(transaction.occurredAt)}
                  </p>
                </div>
                <Money
                  amount={
                    transaction.type === TransactionType.EXPENSE
                      ? -transaction.amount
                      : transaction.amount
                  }
                  currency={transaction.currency}
                  signed={transaction.type !== TransactionType.TRANSFER}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  hint: string;
  href: string;
  value: string | null;
  loading: boolean;
  negative?: boolean;
}

function StatCard({ label, hint, href, value, loading, negative }: StatCardProps) {
  return (
    <Link href={href}>
      <Card
        className={`
          hover:bg-accent/40
          h-full gap-0 py-5 transition-colors
        `}
      >
        <CardContent className='px-5'>
          <span
            className={`
              text-muted-foreground font-mono text-[11px] tracking-[0.14em]
              uppercase
            `}
          >
            {label}
          </span>
          {loading || value === null ? (
            <Skeleton className='mt-3 h-8 w-28' />
          ) : (
            <div
              className={`
                font-display mt-3 text-2xl font-semibold tracking-[-0.02em]
                tabular-nums
                ${negative ? 'text-red-500' : 'text-foreground'}
              `}
            >
              {value}
            </div>
          )}
          <p className='text-muted-foreground mt-1 text-[13px]'>{hint}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function nextDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${toDateInputValue(date)}T23:59:59.999`;
}
