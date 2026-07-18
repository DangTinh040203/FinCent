'use client';

import {
  formatDate,
  type TransactionDto,
  TransactionSource,
  TransactionType,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { ArrowRightLeft, MoreHorizontal, ReceiptText, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { TransactionForm } from '@/app/(admin)/transactions/transaction-form';
import { DatePicker } from '@/components/finance/date-picker';
import { Money } from '@/components/finance/money';
import { AccountSelect, CategorySelect } from '@/components/finance/selectors';
import { useApi } from '@/components/providers/app-providers';
import {
  useAccounts,
  useCategories,
  useFinancialMutation,
  useTransactions,
} from '@/libs/api/hooks';

const ALL = 'ALL';

export function TransactionsView() {
  const searchParams = useSearchParams();
  const api = useApi();

  const router = useRouter();
  const pathname = usePathname();

  const [accountId, setAccountId] = useState<string | undefined>(
    searchParams.get('accountId') ?? undefined,
  );
  const [categoryId, setCategoryId] = useState<string | undefined>(
    searchParams.get('categoryId') ?? undefined,
  );
  const [type, setType] = useState<string>(searchParams.get('type') ?? ALL);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState(searchParams.get('from') ?? '');
  const [to, setTo] = useState(searchParams.get('to') ?? '');

  const invalidRange = Boolean(from && to && from > to);

  useEffect(() => {
    const params = new URLSearchParams();
    if (accountId) params.set('accountId', accountId);
    if (categoryId) params.set('categoryId', categoryId);
    if (type !== ALL) params.set('type', type);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [accountId, categoryId, type, from, to, pathname, router]);

  const query = useMemo(
    () => ({
      accountId,
      categoryId,
      type: type === ALL ? undefined : (type as TransactionType),
      search: search || undefined,
      from: from && !invalidRange ? new Date(from).toISOString() : undefined,
      to:
        to && !invalidRange
          ? new Date(`${to}T23:59:59.999`).toISOString()
          : undefined,
      limit: 25,
    }),
    [accountId, categoryId, type, search, from, to, invalidRange],
  );

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTransactions(query);
  const { data: accounts } = useAccounts(true);
  const { data: categories } = useCategories();

  const accountNames = useMemo(
    () => new Map((accounts ?? []).map((account) => [account.id, account.name])),
    [accounts],
  );
  const categoryNames = useMemo(
    () =>
      new Map(
        (categories ?? []).map((category) => [category.id, category.name]),
      ),
    [categories],
  );

  const transactions = data?.pages.flatMap((page) => page.items) ?? [];

  const [editing, setEditing] = useState<TransactionDto | null>(null);
  const [deleting, setDeleting] = useState<TransactionDto | null>(null);

  const deleteMutation = useFinancialMutation(
    async (id: string) => api.transactions.remove(id),
    { successMessage: 'Transaction deleted', onSuccess: () => setDeleting(null) },
  );

  const duplicateMutation = useFinancialMutation(
    async (transaction: TransactionDto) =>
      api.transactions.create({
        accountId: transaction.accountId,
        type: transaction.type,
        amount: transaction.amount,
        occurredAt: new Date().toISOString(),
        categoryId: transaction.categoryId ?? undefined,
        counterAccountId: transaction.counterAccountId ?? undefined,
        note: transaction.note ?? undefined,
      }),
    { successMessage: 'Transaction duplicated' },
  );

  const hasFilters =
    accountId || categoryId || type !== ALL || search || from || to;

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>Quick add</CardTitle>
          <CardDescription>
            Record income, expenses and transfers in a few keystrokes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm compact />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='space-y-4'>
          <CardTitle>Transactions</CardTitle>
          <div
            className={`
              grid grid-cols-2 gap-2
              lg:grid-cols-6
            `}
          >
            <AccountSelect
              value={accountId}
              onChange={setAccountId}
              placeholder='All accounts'
              className='w-full'
            />
            <CategorySelect
              value={categoryId}
              onChange={setCategoryId}
              placeholder='All categories'
              className='w-full'
            />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='All types' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All types</SelectItem>
                <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
                <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
                <SelectItem value={TransactionType.TRANSFER}>
                  Transfer
                </SelectItem>
              </SelectContent>
            </Select>
            <DatePicker
              value={from}
              onChange={setFrom}
              placeholder='From date'
              allowClear
            />
            <DatePicker
              value={to}
              onChange={setTo}
              placeholder='To date'
              allowClear
            />
            <div className='flex gap-2'>
              <Input
                type='search'
                aria-label='Search notes'
                placeholder='Search notes…'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {hasFilters && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => {
                    setAccountId(undefined);
                    setCategoryId(undefined);
                    setType(ALL);
                    setSearch('');
                    setFrom('');
                    setTo('');
                  }}
                >
                  <X className='size-4' />
                  <span className='sr-only'>Clear filters</span>
                </Button>
              )}
            </div>
          </div>
          {invalidRange && (
            <p className='text-destructive text-xs' role='alert'>
              The from date must be on or before the to date — the range is
              being ignored.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-2'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : transactions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <ReceiptText />
                </EmptyMedia>
                <EmptyTitle>No transactions found</EmptyTitle>
                <EmptyDescription>
                  {hasFilters
                    ? 'Try clearing the filters above.'
                    : 'Use quick add above to record your first transaction.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className={`
                      hidden
                      md:table-cell
                    `}>
                      Note
                    </TableHead>
                    <TableHead className={`
                      hidden
                      sm:table-cell
                    `}>
                      Account
                    </TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className='whitespace-nowrap'>
                        {formatDate(transaction.occurredAt)}
                      </TableCell>
                      <TableCell>
                        {transaction.type === TransactionType.TRANSFER ? (
                          <span className='flex items-center gap-1'>
                            <ArrowRightLeft className='size-3' />
                            Transfer
                          </span>
                        ) : (
                          (categoryNames.get(transaction.categoryId ?? '') ??
                          'Uncategorized')
                        )}
                        {transaction.source !== TransactionSource.MANUAL && (
                          <Badge variant='outline' className='ml-2 text-[10px]'>
                            {transaction.source.toLowerCase()}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={`
                        text-muted-foreground hidden max-w-48 truncate
                        md:table-cell
                      `}>
                        {transaction.note}
                      </TableCell>
                      <TableCell className={`
                        text-muted-foreground hidden
                        sm:table-cell
                      `}>
                        {accountNames.get(transaction.accountId)}
                        {transaction.counterAccountId && (
                          <>
                            {' → '}
                            {accountNames.get(transaction.counterAccountId)}
                          </>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Money
                          amount={
                            transaction.type === TransactionType.EXPENSE
                              ? -transaction.amount
                              : transaction.amount
                          }
                          currency={transaction.currency}
                          signed={transaction.type !== TransactionType.TRANSFER}
                        />
                      </TableCell>
                      <TableCell className='w-10'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              aria-label='Transaction actions'
                            >
                              <MoreHorizontal className='size-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() => setEditing(transaction)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                duplicateMutation.mutate(transaction)
                              }
                            >
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant='destructive'
                              onClick={() => setDeleting(transaction)}
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
              {hasNextPage && (
                <div className='mt-4 flex justify-center'>
                  <Button
                    variant='outline'
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={editing}
            onDone={() => setEditing(null)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Account balances will be recalculated. This cannot be undone.
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
