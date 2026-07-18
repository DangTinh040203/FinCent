'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CategoryType,
  fromMinorUnits,
  RecurringCadence,
  type RecurringRuleDto,
  toDateInputValue,
  toMinorUnits,
} from '@repo/shared';
import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
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

import { AccountSelect, CategorySelect } from '@/components/finance/selectors';
import { useApi } from '@/components/providers/app-providers';
import { useAccounts, useFinancialMutation } from '@/libs/api/hooks';

const CADENCE_LABELS: Record<RecurringCadence, string> = {
  [RecurringCadence.DAILY]: 'Daily',
  [RecurringCadence.WEEKLY]: 'Weekly',
  [RecurringCadence.MONTHLY]: 'Monthly',
  [RecurringCadence.YEARLY]: 'Yearly',
};

const ruleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  type: z.enum(CategoryType),
  amount: z.coerce.number<number>().positive(),
  accountId: z.string().min(1, 'Pick an account'),
  categoryId: z.string().min(1, 'Pick a category'),
  cadence: z.enum(RecurringCadence),
  interval: z.coerce.number<number>().int().min(1).max(12),
  nextDueAt: z.string().min(1),
  endsAt: z.string().optional(),
  autoConfirm: z.boolean(),
  isEssential: z.boolean(),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: RecurringRuleDto | null;
}

export function RuleDialog({ open, onOpenChange, rule }: RuleDialogProps) {
  const api = useApi();
  const { data: accounts } = useAccounts();

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: '',
      type: CategoryType.EXPENSE,
      amount: 0,
      accountId: '',
      categoryId: '',
      cadence: RecurringCadence.MONTHLY,
      interval: 1,
      nextDueAt: toDateInputValue(new Date()),
      endsAt: '',
      autoConfirm: false,
      isEssential: true,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    if (rule) {
      form.reset({
        name: rule.name,
        type: rule.type,
        amount: fromMinorUnits(rule.amount, rule.currency),
        accountId: rule.accountId,
        categoryId: rule.categoryId,
        cadence: rule.cadence,
        interval: rule.interval,
        nextDueAt: toDateInputValue(new Date(rule.nextDueAt)),
        endsAt: rule.endsAt
          ? toDateInputValue(new Date(rule.endsAt))
          : '',
        autoConfirm: rule.autoConfirm,
        isEssential: rule.isEssential,
      });
    } else {
      form.reset({
        name: '',
        type: CategoryType.EXPENSE,
        amount: 0,
        accountId: accounts?.[0]?.id ?? '',
        categoryId: '',
        cadence: RecurringCadence.MONTHLY,
        interval: 1,
        nextDueAt: toDateInputValue(new Date()),
        endsAt: '',
        autoConfirm: false,
        isEssential: true,
      });
    }
  }, [open, rule, accounts, form]);

  const accountId = form.watch('accountId');
  const type = form.watch('type');
  const currency =
    accounts?.find((account) => account.id === accountId)?.currency ?? 'VND';

  const mutation = useFinancialMutation(
    async (values: RuleFormValues) => {
      const payload = {
        name: values.name,
        accountId: values.accountId,
        categoryId: values.categoryId,
        amount: toMinorUnits(values.amount, currency),
        cadence: values.cadence,
        interval: values.interval,
        nextDueAt: new Date(values.nextDueAt).toISOString(),
        endsAt: values.endsAt
          ? new Date(values.endsAt).toISOString()
          : undefined,
        autoConfirm: values.autoConfirm,
        isEssential: values.isEssential,
      };
      if (rule) {
        return api.recurring.updateRule(rule.id, {
          ...payload,
          endsAt: payload.endsAt ?? null,
        });
      }
      return api.recurring.createRule({ ...payload, type: values.type });
    },
    {
      successMessage: rule ? 'Rule updated' : 'Rule created',
      onSuccess: () => onOpenChange(false),
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Edit recurring rule' : 'New recurring rule'}
          </DialogTitle>
          <DialogDescription>
            Bills and income that repeat feed your projections and
            Safe-to-Spend.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Rent' {...field} />
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
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('categoryId', '');
                      }}
                      disabled={rule !== null}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CategoryType.EXPENSE}>
                          Expense / bill
                        </SelectItem>
                        <SelectItem value={CategoryType.INCOME}>
                          Income
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ({currency})</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} step='any' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='accountId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
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
            </div>
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
                      type={type}
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='cadence'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeats</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(RecurringCadence).map((cadence) => (
                          <SelectItem key={cadence} value={cadence}>
                            {CADENCE_LABELS[cadence]}
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
                name='interval'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Every</FormLabel>
                    <FormControl>
                      <Input type='number' min={1} max={12} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nextDueAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next due</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='endsAt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ends (optional)</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex flex-col gap-2'>
              <FormField
                control={form.control}
                name='isEssential'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      Essential — reserve it in Safe-to-Spend
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='autoConfirm'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      Auto-confirm on the due date (opt-in)
                    </FormLabel>
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
                {rule ? 'Save changes' : 'Create rule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
