export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PeriodDto {
  start: string;
  end: string;
  label: string;
}
