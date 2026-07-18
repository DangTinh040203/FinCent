'use client';

import {
  formatMoney,
  type SimulateSpendResultDto,
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
import { Input } from '@repo/ui/components/input';
import { Separator } from '@repo/ui/components/separator';
import { cn } from '@repo/ui/lib/utils';
import { Calculator } from 'lucide-react';
import { useState } from 'react';

import { Money } from '@/components/finance/money';
import { useApi } from '@/components/providers/app-providers';
import { showApiError, useProfile, useSafeToSpend } from '@/libs/api/hooks';

export function ScenariosView() {
  const api = useApi();
  const { data: profile } = useProfile();
  const { data: sts } = useSafeToSpend();
  const currency = profile?.settings.displayCurrency ?? 'VND';

  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<SimulateSpendResultDto | null>(null);
  const [loading, setLoading] = useState(false);

  const simulate = async () => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    setLoading(true);
    try {
      setResult(
        await api.safeToSpend.simulate(toMinorUnits(parsed, currency)),
      );
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`mx-auto flex w-full max-w-2xl flex-col gap-4`}
    >
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calculator className='size-4' />
            Can I afford it?
          </CardTitle>
          <CardDescription>
            A deterministic what-if: if you spend this today, here is your new
            Safe-to-Spend and what it means for your goal. Nothing is saved.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-2'>
            <Input
              type='number'
              inputMode='decimal'
              min={0}
              step='any'
              placeholder={`Purchase amount (${currency})`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && simulate()}
            />
            <Button onClick={simulate} disabled={loading}>
              {loading ? 'Computing…' : 'Simulate'}
            </Button>
          </div>

          {sts && !result && (
            <p className='text-muted-foreground text-sm'>
              Current Safe-to-Spend:{' '}
              <Money amount={sts.amount} currency={sts.currency} /> for{' '}
              {sts.period.label}.
            </p>
          )}

          {result && (
            <div className='space-y-3'>
              <Separator />
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-muted-foreground text-xs uppercase'>
                    Safe-to-Spend now
                  </p>
                  <p className={`
                    font-display text-2xl font-semibold tabular-nums
                  `}>
                    {formatMoney(result.current.amount, currency)}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs uppercase'>
                    After spending{' '}
                    {formatMoney(result.simulatedAmount, currency)}
                  </p>
                  <p
                    className={cn(
                      'font-display text-2xl font-semibold tabular-nums',
                      result.simulatedSts < 0 && 'text-red-500',
                    )}
                  >
                    {formatMoney(result.simulatedSts, currency)}
                  </p>
                </div>
              </div>
              <p className='text-sm'>
                {result.simulatedSts >= 0 ? (
                  <>
                    You can afford it — you would still have{' '}
                    <Money
                      amount={result.simulatedSts}
                      currency={currency}
                    />{' '}
                    to spend safely this period.
                  </>
                ) : result.goalDelayMonths !== null ? (
                  <>
                    This would eat{' '}
                    <Money
                      amount={-result.simulatedSts}
                      currency={currency}
                    />{' '}
                    into money reserved for bills, your goal or your buffer —
                    your goal would slip roughly{' '}
                    <strong>
                      {result.goalDelayMonths} month
                      {result.goalDelayMonths > 1 ? 's' : ''}
                    </strong>
                    .
                  </>
                ) : (
                  <>
                    This exceeds your Safe-to-Spend by{' '}
                    <Money amount={-result.simulatedSts} currency={currency} />{' '}
                    — it would cut into reserved bills or your safety buffer.
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
