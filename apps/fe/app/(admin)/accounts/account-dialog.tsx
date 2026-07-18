'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  type AccountDto,
  AccountType,
  fromMinorUnits,
  SUPPORTED_CURRENCIES,
  toMinorUnits,
} from '@repo/shared';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useApi } from '@/components/providers/app-providers';
import { useFinancialMutation, useProfile } from '@/libs/api/hooks';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.CASH]: 'Cash',
  [AccountType.BANK]: 'Bank account',
  [AccountType.E_WALLET]: 'E-wallet',
  [AccountType.CREDIT_CARD]: 'Credit card',
  [AccountType.OTHER]: 'Other',
};

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  type: z.enum(AccountType),
  currency: z.string().min(1),
  openingBalance: z.coerce.number<number>().min(0),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountDto | null;
}

export function AccountDialog({
  open,
  onOpenChange,
  account,
}: AccountDialogProps) {
  const api = useApi();
  const { data: profile } = useProfile();
  const defaultCurrency = profile?.settings.displayCurrency ?? 'VND';

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: AccountType.CASH,
      currency: defaultCurrency,
      openingBalance: 0,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(
      account
        ? {
            name: account.name,
            type: account.type,
            currency: account.currency,
            openingBalance: fromMinorUnits(
              account.openingBalance,
              account.currency,
            ),
          }
        : {
            name: '',
            type: AccountType.CASH,
            currency: defaultCurrency,
            openingBalance: 0,
          },
    );
  }, [open, account, defaultCurrency, form]);

  const mutation = useFinancialMutation(
    async (values: AccountFormValues) => {
      const openingBalance = toMinorUnits(values.openingBalance, values.currency);
      if (account) {
        return api.accounts.update(account.id, {
          name: values.name,
          type: values.type,
          openingBalance,
        });
      }
      return api.accounts.create({
        name: values.name,
        type: values.type,
        currency: values.currency,
        openingBalance,
      });
    },
    {
      successMessage: account ? 'Account updated' : 'Account created',
      onSuccess: () => onOpenChange(false),
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{account ? 'Edit account' : 'Add account'}</DialogTitle>
          <DialogDescription>
            {account
              ? 'Changing the opening balance recalculates the current balance.'
              : 'Track cash, bank accounts, e-wallets and credit cards.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Vietcombank' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(AccountType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {ACCOUNT_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={account !== null}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='openingBalance'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening balance</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} step='any' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={mutation.isPending}>
                {account ? 'Save changes' : 'Create account'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
