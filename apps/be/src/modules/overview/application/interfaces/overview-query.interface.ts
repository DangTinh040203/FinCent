export const OVERVIEW_QUERY_TOKEN = Symbol('OVERVIEW_QUERY_TOKEN');

export interface PeriodTotals {
  income: number;
  expense: number;
}

export interface CategorySpendRow {
  categoryId: string;
  name: string;
  icon: string | null;
  amount: number;
}

export interface DailySpendRow {
  date: string;
  amount: number;
}

export interface IOverviewQuery {
  totalsForPeriod(
    userId: string,
    currency: string,
    start: Date,
    end: Date,
  ): Promise<PeriodTotals>;
  topExpenseCategories(
    userId: string,
    currency: string,
    start: Date,
    end: Date,
    limit: number,
  ): Promise<CategorySpendRow[]>;
  dailyExpenseSeries(
    userId: string,
    currency: string,
    start: Date,
    end: Date,
  ): Promise<DailySpendRow[]>;
}
