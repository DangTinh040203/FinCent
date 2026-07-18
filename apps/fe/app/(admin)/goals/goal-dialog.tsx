'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  fromMinorUnits,
  type GoalDto,
  GoalPriority,
  toDateInputValue,
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
  FormDescription,
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

import { AccountSelect } from '@/components/finance/selectors';
import { useApi } from '@/components/providers/app-providers';
import { useFinancialMutation, useProfile } from '@/libs/api/hooks';

const NONE = 'NONE';

const goalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  targetAmount: z.coerce.number<number>().positive(),
  deadline: z.string().min(1),
  priority: z.enum(GoalPriority),
  linkedAccountId: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: GoalDto | null;
}

export function GoalDialog({ open, onOpenChange, goal }: GoalDialogProps) {
  const api = useApi();
  const { data: profile } = useProfile();
  const currency = goal?.currency ?? profile?.settings.displayCurrency ?? 'VND';

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      deadline: '',
      priority: GoalPriority.MEDIUM,
      linkedAccountId: undefined,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(
      goal
        ? {
            name: goal.name,
            targetAmount: fromMinorUnits(goal.targetAmount, goal.currency),
            deadline: toDateInputValue(new Date(goal.deadline)),
            priority: goal.priority,
            linkedAccountId: goal.linkedAccountId ?? undefined,
          }
        : {
            name: '',
            targetAmount: 0,
            deadline: '',
            priority: GoalPriority.MEDIUM,
            linkedAccountId: undefined,
          },
    );
  }, [open, goal, form]);

  const mutation = useFinancialMutation(
    async (values: GoalFormValues) => {
      const payload = {
        name: values.name,
        targetAmount: toMinorUnits(values.targetAmount, currency),
        deadline: new Date(`${values.deadline}T00:00:00`).toISOString(),
        priority: values.priority,
        linkedAccountId:
          values.linkedAccountId === NONE ? undefined : values.linkedAccountId,
      };
      if (goal) {
        return api.goals.update(goal.id, {
          ...payload,
          linkedAccountId: payload.linkedAccountId ?? null,
        });
      }
      return api.goals.create(payload);
    },
    {
      successMessage: goal ? 'Goal updated' : 'Goal created',
      onSuccess: () => onOpenChange(false),
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit goal' : 'New savings goal'}</DialogTitle>
          <DialogDescription>
            FinCent computes the monthly contribution needed to hit it on time.
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
                    <Input placeholder='e.g. Emergency fund' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='targetAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target ({currency})</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} step='any' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='deadline'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
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
              name='priority'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={GoalPriority.HIGH}>High</SelectItem>
                      <SelectItem value={GoalPriority.MEDIUM}>
                        Medium
                      </SelectItem>
                      <SelectItem value={GoalPriority.LOW}>Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='linkedAccountId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Earmarked account (optional)</FormLabel>
                  <FormControl>
                    <AccountSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='No linked account'
                      className='w-full'
                    />
                  </FormControl>
                  <FormDescription>
                    Contributions from another account are recorded as
                    transfers into it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={mutation.isPending}>
                {goal ? 'Save changes' : 'Create goal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
