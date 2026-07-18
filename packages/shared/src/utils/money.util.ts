const CURRENCY_EXPONENTS: Record<string, number> = {
  VND: 0,
  JPY: 0,
  KRW: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
  SGD: 2,
  AUD: 2,
};

export const DEFAULT_CURRENCY = 'VND';

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_EXPONENTS);

export function getCurrencyExponent(currency: string): number {
  return CURRENCY_EXPONENTS[currency.toUpperCase()] ?? 2;
}

export function toMinorUnits(amount: number, currency: string): number {
  return Math.round(amount * 10 ** getCurrencyExponent(currency));
}

export function fromMinorUnits(minorUnits: number, currency: string): number {
  return minorUnits / 10 ** getCurrencyExponent(currency);
}

export function formatMoney(
  minorUnits: number,
  currency: string,
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: getCurrencyExponent(currency),
  }).format(fromMinorUnits(minorUnits, currency));
}

export function formatCompactMoney(
  minorUnits: number,
  currency: string,
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(fromMinorUnits(minorUnits, currency));
}
