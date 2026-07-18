'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  fromMinorUnits,
  SUPPORTED_CURRENCIES,
  toMinorUnits,
} from '@repo/shared';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
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

import { CategoryManager } from '@/app/(admin)/settings/category-manager';
import { useApi } from '@/components/providers/app-providers';
import { useFinancialMutation, useProfile } from '@/libs/api/hooks';

const settingsSchema = z.object({
  displayCurrency: z.string().min(1),
  cycleStartDay: z.coerce.number<number>().int().min(1).max(28),
  safetyBuffer: z.coerce.number<number>().min(0),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsView() {
  const api = useApi();
  const { data: profile } = useProfile();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayCurrency: 'VND',
      cycleStartDay: 1,
      safetyBuffer: 0,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayCurrency: profile.settings.displayCurrency,
        cycleStartDay: profile.settings.cycleStartDay,
        safetyBuffer: fromMinorUnits(
          profile.settings.safetyBuffer,
          profile.settings.displayCurrency,
        ),
      });
    }
  }, [profile, form]);

  const mutation = useFinancialMutation(
    async (values: SettingsFormValues) =>
      api.users.updateSettings({
        displayCurrency: values.displayCurrency,
        cycleStartDay: values.cycleStartDay,
        safetyBuffer: toMinorUnits(values.safetyBuffer, values.displayCurrency),
      }),
    { successMessage: 'Settings saved' },
  );

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            These drive your budgeting period and Safe-to-Spend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-4'
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <div
                className={`
                  grid gap-4
                  sm:grid-cols-3
                `}
              >
                <FormField
                  control={form.control}
                  name='displayCurrency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display currency</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                  name='cycleStartDay'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle starts on day</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          inputMode='numeric'
                          min={1}
                          max={28}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        1 = calendar month; set your payday for payday cycles.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='safetyBuffer'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety buffer</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          inputMode='decimal'
                          min={0}
                          step='any'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Always kept aside in Safe-to-Spend.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit' disabled={mutation.isPending}>
                Save preferences
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <CategoryManager />
    </div>
  );
}
