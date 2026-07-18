'use client';

import { type AccountDto, AccountType } from '@repo/shared';
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
import { Label } from '@repo/ui/components/label';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Switch } from '@repo/ui/components/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { Landmark, MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AccountDialog } from '@/app/(admin)/accounts/account-dialog';
import { Money } from '@/components/finance/money';
import { useApi } from '@/components/providers/app-providers';
import { useAccounts, useFinancialMutation } from '@/libs/api/hooks';

const TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.CASH]: 'Cash',
  [AccountType.BANK]: 'Bank',
  [AccountType.E_WALLET]: 'E-wallet',
  [AccountType.CREDIT_CARD]: 'Credit card',
  [AccountType.OTHER]: 'Other',
};

export function AccountsView() {
  const api = useApi();
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data: accounts, isLoading } = useAccounts(includeArchived);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AccountDto | null>(null);

  const archiveMutation = useFinancialMutation(
    async ({ id, archived }: { id: string; archived: boolean }) =>
      archived ? api.accounts.unarchive(id) : api.accounts.archive(id),
    { successMessage: 'Account updated' },
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (account: AccountDto) => {
    setEditing(account);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div className='space-y-1'>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>
            Balances always reconcile with your transaction log.
          </CardDescription>
        </div>
        <div className='flex items-center gap-4'>
          <Label
            className={`
              text-muted-foreground flex items-center gap-2 text-sm font-normal
            `}
          >
            <Switch
              checked={includeArchived}
              onCheckedChange={setIncludeArchived}
            />
            Show archived
          </Label>
          <Button onClick={openCreate}>
            <Plus className='size-4' />
            Add account
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        ) : (accounts ?? []).length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Landmark />
              </EmptyMedia>
              <EmptyTitle>No accounts yet</EmptyTitle>
              <EmptyDescription>
                Add your cash, bank and e-wallet accounts with opening balances
                to start tracking.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={openCreate}>
              <Plus className='size-4' />
              Add your first account
            </Button>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className='text-right'>Opening balance</TableHead>
                <TableHead className='text-right'>Current balance</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(accounts ?? []).map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Link
                      href={`/transactions?accountId=${account.id}`}
                      className={`
                        font-medium
                        hover:underline
                      `}
                    >
                      {account.name}
                    </Link>
                    {account.archivedAt && (
                      <Badge variant='outline' className='ml-2'>
                        Archived
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {TYPE_LABELS[account.type]}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Money
                      amount={account.openingBalance}
                      currency={account.currency}
                    />
                  </TableCell>
                  <TableCell className='text-right'>
                    <Money
                      amount={account.currentBalance}
                      currency={account.currency}
                    />
                  </TableCell>
                  <TableCell className='w-10'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                          <Link href={`/transactions?accountId=${account.id}`}>
                            View transactions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(account)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            archiveMutation.mutate({
                              id: account.id,
                              archived: account.archivedAt !== null,
                            })
                          }
                        >
                          {account.archivedAt ? 'Unarchive' : 'Archive'}
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
      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editing}
      />
    </Card>
  );
}
