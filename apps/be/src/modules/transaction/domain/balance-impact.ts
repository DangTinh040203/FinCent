import { TransactionType } from '@repo/shared';

export class BalanceImpact {
  private readonly deltas = new Map<string, number>();

  static none(): BalanceImpact {
    return new BalanceImpact();
  }

  static of(
    type: TransactionType,
    amount: number,
    accountId: string,
    counterAccountId: string | null,
  ): BalanceImpact {
    const impact = new BalanceImpact();
    switch (type) {
      case TransactionType.INCOME:
        impact.add(accountId, amount);
        break;
      case TransactionType.EXPENSE:
        impact.add(accountId, -amount);
        break;
      case TransactionType.TRANSFER:
        impact.add(accountId, -amount);
        if (counterAccountId) {
          impact.add(counterAccountId, amount);
        }
        break;
    }
    return impact;
  }

  add(accountId: string, delta: number): this {
    this.deltas.set(accountId, (this.deltas.get(accountId) ?? 0) + delta);
    return this;
  }

  inverse(): BalanceImpact {
    const inverted = new BalanceImpact();
    for (const [accountId, delta] of this.deltas) {
      inverted.add(accountId, -delta);
    }
    return inverted;
  }

  merge(other: BalanceImpact): BalanceImpact {
    const merged = new BalanceImpact();
    for (const [accountId, delta] of this.deltas) {
      merged.add(accountId, delta);
    }
    for (const [accountId, delta] of other.deltas) {
      merged.add(accountId, delta);
    }
    return merged;
  }

  entries(): Array<{ accountId: string; delta: number }> {
    return Array.from(this.deltas.entries())
      .filter(([, delta]) => delta !== 0)
      .map(([accountId, delta]) => ({ accountId, delta }));
  }
}
