'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  BudgetRiskLevel,
  type BudgetStatusDto,
  CategoryType,
  formatDate,
  formatMoney,
  fromMinorUnits,
  toMinorUnits,
} from '@repo/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui/components/empty';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Progress } from '@repo/ui/components/progress';
import { MoreHorizontal, PiggyBank, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Money } from '@/components/finance/money';
import { CategorySelect } from '@/components/finance/selectors';
import { useApi } from '@/components/providers/app-providers';
import {
  useBudgets,
  useFinancialMutation,
  useProfile,
} from '@/libs/api/hooks';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Pick a category'),
  amount: z.coerce.number<number>().positive(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

const RISK_BADGES: Record<
  BudgetRiskLevel,
  { label: string; variant: 'secondary' | 'outline' | 'destructive' }
> = {
  [BudgetRiskLevel.ON_TRACK]: { label: 'On track', variant: 'secondary' },
  [BudgetRiskLevel.AT_RISK]: { label: 'At risk', variant: 'outline' },
  [BudgetRiskLevel.OVER_BUDGET]: {
    label: 'Over budget',
    variant: 'destructive',
  },
};

export function BudgetsView() {
  const api = useApi();
  const { data: budgets, isLoading } = useBudgets();
  const { data: profile } = useProfile();
  const currency = profile?.settings.displayCurrency ?? 'VND';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetStatusDto | null>(null);
  const [deleting, setDeleting] = useState<BudgetStatusDto | null>(null);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { categoryId: '', amount: '' as unknown as number },
  });

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }
    form.reset(
      editing
        ? {
            categoryId: editing.categoryId,
            amount: fromMinorUnits(editing.amount, editing.currency),
          }
        : { categoryId: '', amount: '' as unknown as number },
    );
  }, [dialogOpen, editing, form]);

  const saveMutation = useFinancialMutation(
    async (values: BudgetFormValues) => {
      const amount = toMinorUnits(values.amount, currency);
      if (editing) {
        return api.budgets.update(editing.id, { amount });
      }
      return api.budgets.create({ categoryId: values.categoryId, amount });
    },
    {
      successMessage: editing ? 'Budget updated' : 'Budget created',
      onSuccess: () => setDialogOpen(false),
    },
  );

  const deleteMutation = useFinancialMutation(
    async (id: string) => api.budgets.remove(id),
    { successMessage: 'Budget deleted', onSuccess: () => setDeleting(null) },
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h1 className='font-display text-xl font-semibold'>Budgets</h1>
          <p className='text-muted-foreground text-sm'>
            Spending limits per category, computed straight from the ledger.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className='size-4' />
          New budget
        </Button>
      </div>

      {!isLoading && (budgets ?? []).length === 0 ? (
        <Empty className='border'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <PiggyBank />
            </EmptyMedia>
            <EmptyTitle>No budgets yet</EmptyTitle>
            <EmptyDescription>
              Set a monthly limit on the categories that matter — FinCent warns
              you before you cross it.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className='size-4' />
            Create your first budget
          </Button>
        </Empty>
      ) : (
        <div
          className={`
            grid gap-4
            md:grid-cols-2
            xl:grid-cols-3
          `}
        >
          {(budgets ?? []).map((budget) => {
            const badge = RISK_BADGES[budget.riskLevel];
            return (
              <Card key={budget.id}>
                <CardHeader className={`
                  flex flex-row items-start justify-between
                `}>
                  <div>
                    <CardTitle className='text-base'>
                      {budget.categoryName}
                    </CardTitle>
                    <CardDescription>{budget.period.label}</CardDescription>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label='Budget actions'
                        >
                          <MoreHorizontal className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/transactions?categoryId=${budget.categoryId}&from=${budget.period.start.slice(0, 10)}&to=${budget.period.end.slice(0, 10)}`}
                          >
                            View transactions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(budget);
                            setDialogOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant='destructive'
                          onClick={() => setDeleting(budget)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div className='flex items-baseline justify-between'>
                    <Money amount={budget.spent} currency={budget.currency} />
                    <span className='text-muted-foreground text-xs'>
                      of {formatMoney(budget.amount, budget.currency)}
                    </span>
                  </div>
                  <Progress value={Math.min(100, budget.percentUsed)} />
                  <p className='text-muted-foreground text-xs'>
                    {budget.remaining >= 0 ? (
                      <>
                        {formatMoney(budget.remaining, budget.currency)} left ·
                        pace {formatMoney(budget.pace, budget.currency)}/day
                      </>
                    ) : (
                      <>
                        {formatMoney(-budget.remaining, budget.currency)} over
                        the limit
                      </>
                    )}
                  </p>
                </CardContent>
                {budget.riskLevel !== BudgetRiskLevel.ON_TRACK && (
                  <CardFooter>
                    <p className='text-muted-foreground text-xs'>
                      {budget.projectedOverrunAt ? (
                        <>
                          At this pace you will exceed this budget by{' '}
                          <strong>
                            {formatMoney(
                              Math.max(0, budget.projected - budget.amount),
                              budget.currency,
                            )}
                          </strong>{' '}
                          around {formatDate(budget.projectedOverrunAt)}. Keep
                          daily spend under{' '}
                          {formatMoney(
                            budget.suggestedDailySpend,
                            budget.currency,
                          )}{' '}
                          to stay within budget.
                        </>
                      ) : (
                        'The limit has been reached for this period.'
                      )}
                    </p>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit budget' : 'New budget'}</DialogTitle>
            <DialogDescription>
              Monthly limit for one expense category.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className='space-y-4'
              onSubmit={form.handleSubmit((values) =>
                saveMutation.mutate(values),
              )}
            >
              <FormField
                control={form.control}
                name='categoryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CategorySelect
                        value={field.value}
                        onChange={field.onChange}
                        type={CategoryType.EXPENSE}
                        className='w-full'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit ({currency})</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        inputMode='decimal'
                        min={0}
                        step='any'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={saveMutation.isPending}>
                  {editing ? 'Save changes' : 'Create budget'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete the {deleting?.categoryName} budget?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will stop getting warnings for this category. Transactions
              are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
