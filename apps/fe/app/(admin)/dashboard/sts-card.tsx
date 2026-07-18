'use client';

import { formatMoney } from '@repo/shared';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui/components/collapsible';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import { ChevronDown, Info } from 'lucide-react';
import Link from 'next/link';

import { Money } from '@/components/finance/money';
import { useSafeToSpend } from '@/libs/api/hooks';

export function StsCard() {
  const { data: sts, isLoading } = useSafeToSpend();

  return (
    <Card className='border-primary/30'>
      <CardHeader>
        <CardTitle
          className={`
            text-muted-foreground font-mono text-[11px] tracking-[0.14em]
            uppercase
          `}
        >
          Safe-to-Spend
        </CardTitle>
        <CardDescription>
          {sts ? `${sts.period.label} · until the cycle ends` : 'This cycle'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !sts ? (
          <Skeleton className='h-12 w-48' />
        ) : (
          <div className='space-y-3'>
            <div
              className={cn(
                `
                  font-display text-4xl font-semibold tracking-[-0.02em]
                  tabular-nums
                `,
                sts.amount < 0 && 'text-red-500',
              )}
            >
              {formatMoney(sts.amount, sts.currency)}
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='sm' className='-ml-2 gap-1'>
                  How was this calculated?
                  <ChevronDown className='size-3' />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className='mt-2 space-y-1 text-sm'>
                  {sts.lines.map((line) => (
                    <li
                      key={line.key}
                      className='flex items-center justify-between gap-4'
                    >
                      {line.link ? (
                        <Link
                          href={line.link}
                          className={`
                            text-muted-foreground
                            hover:underline
                          `}
                        >
                          {line.label}
                        </Link>
                      ) : (
                        <span className='text-muted-foreground'>
                          {line.label}
                        </span>
                      )}
                      <Money
                        amount={line.amount}
                        currency={sts.currency}
                        signed
                      />
                    </li>
                  ))}
                  <li
                    className={`
                      flex items-center justify-between gap-4 border-t pt-1
                      font-medium
                    `}
                  >
                    <span>Safe-to-Spend</span>
                    <Money amount={sts.amount} currency={sts.currency} />
                  </li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            {sts.warnings.length > 0 && (
              <ul className='text-muted-foreground space-y-1 text-xs'>
                {sts.warnings.map((warning) => (
                  <li key={warning} className='flex items-start gap-1'>
                    <Info className='mt-0.5 size-3 shrink-0' />
                    {warning}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
