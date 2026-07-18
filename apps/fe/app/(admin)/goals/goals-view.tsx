'use client';

import {
  formatDate,
  formatMoney,
  GoalAdjustmentKind,
  type GoalDto,
  GoalStatus,
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
import { Input } from '@repo/ui/components/input';
import { Progress } from '@repo/ui/components/progress';
import { Separator } from '@repo/ui/components/separator';
import { MoreHorizontal, Plus, Target } from 'lucide-react';
import { useState } from 'react';

import { GoalDialog } from '@/app/(admin)/goals/goal-dialog';
import { Money } from '@/components/finance/money';
import { AccountSelect } from '@/components/finance/selectors';
import { useApi } from '@/components/providers/app-providers';
import {
  useFinancialMutation,
  useGoalContributions,
  useGoalPlan,
  useGoals,
} from '@/libs/api/hooks';

export function GoalsView() {
  const api = useApi();
  const { data: goals, isLoading } = useGoals();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GoalDto | null>(null);
  const [contributing, setContributing] = useState<GoalDto | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionAccount, setContributionAccount] = useState<
    string | undefined
  >(undefined);
  const [deleting, setDeleting] = useState<GoalDto | null>(null);

  const activeGoal =
    (goals ?? []).find((goal) => goal.status === GoalStatus.ACTIVE) ?? null;
  const { data: plan } = useGoalPlan(activeGoal?.id ?? null);
  const { data: contributions } = useGoalContributions(activeGoal?.id ?? null);

  const removeMutation = useFinancialMutation(
    async (id: string) => api.goals.remove(id),
    { successMessage: 'Goal deleted', onSuccess: () => setDeleting(null) },
  );

  const adjustMutation = useFinancialMutation(
    async ({
      goal,
      kind,
      newDeadline,
      newTargetAmount,
    }: {
      goal: GoalDto;
      kind: GoalAdjustmentKind;
      newDeadline: string | null;
      newTargetAmount: number | null;
    }) => {
      if (kind === GoalAdjustmentKind.EXTEND_DEADLINE && newDeadline) {
        return api.goals.update(goal.id, { deadline: newDeadline });
      }
      if (kind === GoalAdjustmentKind.REDUCE_TARGET && newTargetAmount) {
        return api.goals.update(goal.id, { targetAmount: newTargetAmount });
      }
      return goal;
    },
    { successMessage: 'Goal plan updated' },
  );

  const contributeMutation = useFinancialMutation(
    async ({ goal, amount }: { goal: GoalDto; amount: number }) =>
      api.goals.contribute(goal.id, {
        amount,
        accountId: contributionAccount,
      }),
    {
      successMessage: 'Contribution recorded',
      onSuccess: () => {
        setContributing(null);
        setContributionAmount('');
        setContributionAccount(undefined);
      },
    },
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h1 className='font-display text-xl font-semibold'>Savings goals</h1>
          <p className='text-muted-foreground text-sm'>
            A goal turns Safe-to-Spend into a plan.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className='size-4' />
          New goal
        </Button>
      </div>

      {!isLoading && (goals ?? []).length === 0 ? (
        <Empty className='border'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Target />
            </EmptyMedia>
            <EmptyTitle>No goals yet</EmptyTitle>
            <EmptyDescription>
              Set one savings goal — an emergency fund is a great start.
              FinCent computes the monthly contribution and protects it in
              Safe-to-Spend.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className='size-4' />
            Create a goal
          </Button>
        </Empty>
      ) : (
        <div
          className={`
            grid gap-4
            lg:grid-cols-2
          `}
        >
          {(goals ?? []).map((goal) => {
            const percent = Math.min(
              100,
              (goal.contributedAmount / goal.targetAmount) * 100,
            );
            const isActive = goal.status === GoalStatus.ACTIVE;
            return (
              <Card key={goal.id}>
                <CardHeader className={`
                  flex flex-row items-start justify-between
                `}>
                  <div>
                    <CardTitle className='text-base'>{goal.name}</CardTitle>
                    <CardDescription>
                      Deadline {formatDate(goal.deadline)} · Priority{' '}
                      {goal.priority.toLowerCase()}
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Badge
                      variant={
                        goal.status === GoalStatus.ACHIEVED
                          ? 'secondary'
                          : goal.status === GoalStatus.CANCELLED
                            ? 'outline'
                            : 'default'
                      }
                    >
                      {goal.status.toLowerCase()}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label='Goal actions'
                        >
                          <MoreHorizontal className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(goal);
                            setDialogOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant='destructive'
                          onClick={() => setDeleting(goal)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-baseline justify-between'>
                    <Money
                      amount={goal.contributedAmount}
                      currency={goal.currency}
                    />
                    <span className='text-muted-foreground text-xs'>
                      of {formatMoney(goal.targetAmount, goal.currency)} (
                      {Math.round(percent)}%)
                    </span>
                  </div>
                  <Progress value={percent} />

                  {isActive && plan && plan.goalId === goal.id && (
                    <>
                      <Separator />
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center justify-between'>
                          <span className='text-muted-foreground'>
                            Needed per month
                          </span>
                          <Money
                            amount={plan.requiredPerMonth}
                            currency={goal.currency}
                          />
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-muted-foreground'>
                            Months left
                          </span>
                          <span>{plan.monthsLeft}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-muted-foreground'>Status</span>
                          <Badge
                            variant={plan.onTrack ? 'secondary' : 'destructive'}
                          >
                            {plan.onTrack ? 'On track' : 'Behind schedule'}
                          </Badge>
                        </div>
                      </div>
                      {!plan.onTrack && plan.options.length > 0 && (
                        <div className='space-y-2'>
                          <p className='text-muted-foreground text-xs'>
                            Ways to get back on track:
                          </p>
                          {plan.options.map((option) => (
                            <div
                              key={option.kind}
                              className={`
                                flex items-center justify-between gap-2
                                rounded-md border p-2 text-xs
                              `}
                            >
                              <span>
                                {option.label} —{' '}
                                {formatMoney(
                                  option.requiredPerMonth,
                                  goal.currency,
                                )}
                                /month
                                {option.newDeadline &&
                                  ` until ${formatDate(option.newDeadline)}`}
                                {option.newTargetAmount &&
                                  ` for ${formatMoney(option.newTargetAmount, goal.currency)}`}
                              </span>
                              {option.kind !==
                                GoalAdjustmentKind.RAISE_CONTRIBUTION && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='h-6 shrink-0 px-2 text-xs'
                                  onClick={() =>
                                    adjustMutation.mutate({
                                      goal,
                                      kind: option.kind,
                                      newDeadline: option.newDeadline,
                                      newTargetAmount: option.newTargetAmount,
                                    })
                                  }
                                >
                                  Apply
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {isActive && (
                    <Button
                      size='sm'
                      onClick={() => setContributing(goal)}
                      className='w-full'
                    >
                      <Plus className='size-4' />
                      Add contribution
                    </Button>
                  )}

                  {isActive &&
                    contributions &&
                    contributions.length > 0 && (
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-xs font-medium'>
                          Recent contributions
                        </p>
                        {contributions.slice(0, 5).map((contribution) => (
                          <div
                            key={contribution.id}
                            className={`
                              text-muted-foreground flex justify-between text-xs
                            `}
                          >
                            <span>{formatDate(contribution.occurredAt)}</span>
                            <Money
                              amount={contribution.amount}
                              currency={goal.currency}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={editing}
      />

      <Dialog
        open={contributing !== null}
        onOpenChange={(open) => !open && setContributing(null)}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Contribute to {contributing?.name}</DialogTitle>
            <DialogDescription>
              {contributing?.linkedAccountId
                ? 'Pick a source account to record a transfer into the earmarked account, or leave empty to log the contribution only.'
                : 'The contribution is tracked against the goal.'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <Input
              type='number'
              inputMode='decimal'
              min={0}
              step='any'
              aria-label='Contribution amount'
              placeholder={`Amount (${contributing?.currency ?? ''})`}
              value={contributionAmount}
              onChange={(event) => setContributionAmount(event.target.value)}
            />
            {contributing?.linkedAccountId && (
              <AccountSelect
                value={contributionAccount}
                onChange={setContributionAccount}
                placeholder='Source account (optional)'
                excludeId={contributing.linkedAccountId}
                className='w-full'
              />
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setContributing(null)}>
              Cancel
            </Button>
            <Button
              disabled={contributeMutation.isPending}
              onClick={() => {
                const parsed = Number(contributionAmount);
                if (!contributing || !Number.isFinite(parsed) || parsed <= 0) {
                  return;
                }
                contributeMutation.mutate({
                  goal: contributing,
                  amount: toMinorUnits(parsed, contributing.currency),
                });
              }}
            >
              Contribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The goal and its contribution history will be removed. Recorded
              transfer transactions stay in your ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && removeMutation.mutate(deleting.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
