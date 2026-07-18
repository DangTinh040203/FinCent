'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CategoryType,
  fromMinorUnits,
  toDateInputValue,
  toMinorUnits,
  type TransactionDto,
  TransactionType,
} from '@repo/shared';
import { Button } from '@repo/ui/components/button';
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

import { DatePicker } from '@/components/finance/date-picker';
import { AccountSelect, CategorySelect } from '@/components/finance/selectors';
import { useApi } from '@/components/providers/app-providers';
import { useAccounts, useFinancialMutation } from '@/libs/api/hooks';

const transactionSchema = z
  .object({
    type: z.enum(TransactionType),
    amount: z.coerce.number<number>().positive('Amount must be positive'),
    accountId: z.string().min(1, 'Pick an account'),
    categoryId: z.string().optional(),
    counterAccountId: z.string().optional(),
    occurredAt: z.string().min(1),
    note: z.string().max(500).optional(),
  })
  .refine(
    (values) =>
      values.type === TransactionType.TRANSFER || !!values.categoryId,
    { message: 'Pick a category', path: ['categoryId'] },
  )
  .refine(
    (values) =>
      values.type !== TransactionType.TRANSFER || !!values.counterAccountId,
    { message: 'Pick a destination account', path: ['counterAccountId'] },
  );

export type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: TransactionDto | null;
  compact?: boolean;
  onDone?: () => void;
}

export function TransactionForm({
  transaction,
  compact = false,
  onDone,
}: TransactionFormProps) {
  const api = useApi();
  const { data: accounts } = useAccounts();

  const defaultValues: TransactionFormValues = {
    type: TransactionType.EXPENSE,
    amount: 0,
    accountId: accounts?.[0]?.id ?? '',
    categoryId: undefined,
    counterAccountId: undefined,
    occurredAt: toDateInputValue(new Date()),
    note: '',
  };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });

  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        amount: fromMinorUnits(transaction.amount, transaction.currency),
        accountId: transaction.accountId,
        categoryId: transaction.categoryId ?? undefined,
        counterAccountId: transaction.counterAccountId ?? undefined,
        occurredAt: toDateInputValue(new Date(transaction.occurredAt)),
        note: transaction.note ?? '',
      });
    }
  }, [transaction, form]);

  useEffect(() => {
    const firstAccount = accounts?.[0];
    if (!transaction && firstAccount && !form.getValues('accountId')) {
      form.setValue('accountId', firstAccount.id);
    }
  }, [accounts, transaction, form]);

  const type = form.watch('type');
  const accountId = form.watch('accountId');
  const currency =
    accounts?.find((account) => account.id === accountId)?.currency ?? 'VND';

  const mutation = useFinancialMutation(
    async (values: TransactionFormValues) => {
      const payload = {
        accountId: values.accountId,
        type: values.type,
        amount: toMinorUnits(values.amount, currency),
        occurredAt: new Date(values.occurredAt).toISOString(),
        categoryId:
          values.type === TransactionType.TRANSFER
            ? undefined
            : values.categoryId,
        counterAccountId:
          values.type === TransactionType.TRANSFER
            ? values.counterAccountId
            : undefined,
        note: values.note || undefined,
      };
      if (transaction) {
        return api.transactions.update(transaction.id, {
          ...payload,
          categoryId: payload.categoryId ?? null,
          counterAccountId: payload.counterAccountId ?? null,
          note: values.note || null,
        });
      }
      return api.transactions.create(payload);
    },
    {
      successMessage: transaction ? 'Transaction updated' : 'Transaction added',
      onSuccess: () => {
        if (!transaction) {
          form.reset({ ...defaultValues, accountId });
        }
        onDone?.();
      },
    },
  );

  const categoryType =
    type === TransactionType.INCOME
      ? CategoryType.INCOME
      : CategoryType.EXPENSE;

  return (
    <Form {...form}>
      <form
        className={
          compact
            ? `
              grid grid-cols-2 items-end gap-2
              lg:grid-cols-7
            `
            : 'space-y-4'
        }
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel className={compact ? 'sr-only' : undefined}>
                Type
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={TransactionType.EXPENSE}>
                    Expense
                  </SelectItem>
                  <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
                  <SelectItem value={TransactionType.TRANSFER}>
                    Transfer
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel className={compact ? 'sr-only' : undefined}>
                Amount ({currency})
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min={0}
                  step='any'
                  placeholder={`Amount (${currency})`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type !== TransactionType.TRANSFER ? (
          <FormField
            control={form.control}
            name='categoryId'
            render={({ field }) => (
              <FormItem>
                <FormLabel className={compact ? 'sr-only' : undefined}>
                  Category
                </FormLabel>
                <FormControl>
                  <CategorySelect
                    value={field.value}
                    onChange={field.onChange}
                    type={categoryType}
                    className='w-full'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name='counterAccountId'
            render={({ field }) => (
              <FormItem>
                <FormLabel className={compact ? 'sr-only' : undefined}>
                  To account
                </FormLabel>
                <FormControl>
                  <AccountSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='To account'
                    excludeId={accountId}
                    className='w-full'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name='accountId'
          render={({ field }) => (
            <FormItem>
              <FormLabel className={compact ? 'sr-only' : undefined}>
                {type === TransactionType.TRANSFER ? 'From account' : 'Account'}
              </FormLabel>
              <FormControl>
                <AccountSelect
                  value={field.value}
                  onChange={field.onChange}
                  className='w-full'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='occurredAt'
          render={({ field }) => (
            <FormItem>
              <FormLabel className={compact ? 'sr-only' : undefined}>
                Date
              </FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='note'
          render={({ field }) => (
            <FormItem>
              <FormLabel className={compact ? 'sr-only' : undefined}>
                Note
              </FormLabel>
              <FormControl>
                <Input placeholder='Note (optional)' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={mutation.isPending}>
          {transaction ? 'Save changes' : 'Add'}
        </Button>
      </form>
    </Form>
  );
}
