'use client';

import {
  CategoryType,
  formatDate,
  fromMinorUnits,
  RecurringCadence,
  type RecurringOccurrenceDto,
  RecurringOccurrenceStatus,
  type RecurringRuleDto,
  toMinorUnits,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { CalendarClock, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';

import { RuleDialog } from '@/app/(admin)/recurring/rule-dialog';
import { Money } from '@/components/finance/money';
import { useApi } from '@/components/providers/app-providers';
import {
  useFinancialMutation,
  useOccurrences,
  useRecurringRules,
} from '@/libs/api/hooks';

const CADENCE_LABELS: Record<RecurringCadence, string> = {
  [RecurringCadence.DAILY]: 'day(s)',
  [RecurringCadence.WEEKLY]: 'week(s)',
  [RecurringCadence.MONTHLY]: 'month(s)',
  [RecurringCadence.YEARLY]: 'year(s)',
};

export function RecurringView() {
  const api = useApi();
  const { data: rules, isLoading } = useRecurringRules();
  const { data: dueNow } = useOccurrences({
    scope: 'due-inbox',
    status: [RecurringOccurrenceStatus.DUE],
    limit: 20,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringRuleDto | null>(null);
  const [confirming, setConfirming] = useState<RecurringOccurrenceDto | null>(
    null,
  );
  const [confirmAmount, setConfirmAmount] = useState('');

  const pauseMutation = useFinancialMutation(
    async (rule: RecurringRuleDto) =>
      api.recurring.updateRule(rule.id, { isPaused: !rule.isPaused }),
    { successMessage: 'Rule updated' },
  );

  const deleteMutation = useFinancialMutation(
    async (id: string) => api.recurring.deleteRule(id),
    { successMessage: 'Rule deleted' },
  );

  const skipMutation = useFinancialMutation(
    async (id: string) => api.recurring.skipOccurrence(id),
    { successMessage: 'Occurrence skipped' },
  );

  const confirmMutation = useFinancialMutation(
    async ({
      occurrence,
      amount,
    }: {
      occurrence: RecurringOccurrenceDto;
      amount: number | undefined;
    }) => api.recurring.confirmOccurrence(occurrence.id, { amount }),
    {
      successMessage: 'Transaction recorded',
      onSuccess: () => setConfirming(null),
    },
  );

  return (
    <div className='flex flex-col gap-4'>
      {(dueNow ?? []).length > 0 && (
        <Card className='border-destructive/40'>
          <CardHeader>
            <CardTitle className='text-base'>Due now</CardTitle>
            <CardDescription>
              Confirm to record the transaction, adjust the amount, or skip
              this cycle. Nothing is recorded without your confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {(dueNow ?? []).map((occurrence) => (
              <div
                key={occurrence.id}
                className={`
                  flex flex-col justify-between gap-2 rounded-md border p-3
                  sm:flex-row sm:items-center
                `}
              >
                <div>
                  <p className='font-medium'>{occurrence.ruleName}</p>
                  <p className='text-muted-foreground text-xs'>
                    Due {formatDate(occurrence.dueAt)} ·{' '}
                    <Money
                      amount={occurrence.amount}
                      currency={occurrence.currency}
                    />
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    onClick={() => {
                      setConfirming(occurrence);
                      setConfirmAmount(
                        String(
                          fromMinorUnits(
                            occurrence.amount,
                            occurrence.currency,
                          ),
                        ),
                      );
                    }}
                  >
                    Confirm
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => skipMutation.mutate(occurrence.id)}
                  >
                    Skip
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className='flex flex-row items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle>Recurring rules</CardTitle>
            <CardDescription>
              Salaries, rent, subscriptions — projected into your cash flow.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className='size-4' />
            New rule
          </Button>
        </CardHeader>
        <CardContent>
          {!isLoading && (rules ?? []).length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <CalendarClock />
                </EmptyMedia>
                <EmptyTitle>No recurring rules</EmptyTitle>
                <EmptyDescription>
                  Add your salary and fixed bills so FinCent can project what
                  is coming and compute Safe-to-Spend.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className='size-4' />
                Add your first rule
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Repeats</TableHead>
                  <TableHead>Next due</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(rules ?? []).map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <span className='font-medium'>{rule.name}</span>
                      <span className='ml-2 space-x-1'>
                        <Badge
                          variant={
                            rule.type === CategoryType.INCOME
                              ? 'secondary'
                              : 'outline'
                          }
                          className='text-[10px]'
                        >
                          {rule.type === CategoryType.INCOME
                            ? 'Income'
                            : 'Bill'}
                        </Badge>
                        {rule.isPaused && (
                          <Badge variant='outline' className='text-[10px]'>
                            Paused
                          </Badge>
                        )}
                        {rule.autoConfirm && (
                          <Badge variant='outline' className='text-[10px]'>
                            Auto
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      Every {rule.interval > 1 ? `${rule.interval} ` : ''}
                      {CADENCE_LABELS[rule.cadence]}
                    </TableCell>
                    <TableCell>{formatDate(rule.nextDueAt)}</TableCell>
                    <TableCell className='text-right'>
                      <Money amount={rule.amount} currency={rule.currency} />
                    </TableCell>
                    <TableCell className='w-10'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreHorizontal className='size-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(rule);
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => pauseMutation.mutate(rule)}
                          >
                            {rule.isPaused ? 'Resume' : 'Pause'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant='destructive'
                            onClick={() => deleteMutation.mutate(rule.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editing}
      />

      <Dialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Confirm {confirming?.ruleName}</DialogTitle>
            <DialogDescription>
              Adjust the amount if this cycle differs, then confirm to record
              the transaction.
            </DialogDescription>
          </DialogHeader>
          <Input
            type='number'
            min={0}
            step='any'
            value={confirmAmount}
            onChange={(event) => setConfirmAmount(event.target.value)}
          />
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button
              disabled={confirmMutation.isPending}
              onClick={() => {
                if (!confirming) {
                  return;
                }
                const parsed = Number(confirmAmount);
                confirmMutation.mutate({
                  occurrence: confirming,
                  amount:
                    Number.isFinite(parsed) && parsed > 0
                      ? toMinorUnits(parsed, confirming.currency)
                      : undefined,
                });
              }}
            >
              Confirm & record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
