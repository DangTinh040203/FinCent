import { formatMoney } from '@repo/shared';
import { cn } from '@repo/ui/lib/utils';

interface MoneyProps {
  amount: number;
  currency: string;
  signed?: boolean;
  className?: string;
}

export function Money({ amount, currency, signed = false, className }: MoneyProps) {
  const formatted = formatMoney(Math.abs(amount), currency);
  const prefix = signed ? (amount > 0 ? '+' : amount < 0 ? '−' : '') : amount < 0 ? '−' : '';

  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        signed && amount > 0 && 'text-emerald-500',
        signed && amount < 0 && 'text-red-500',
        className,
      )}
    >
      {prefix}
      {formatted}
    </span>
  );
}
