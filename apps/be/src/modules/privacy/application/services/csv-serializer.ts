export class CsvSerializer {
  serialize(records: unknown[]): string {
    if (records.length === 0) {
      return '';
    }

    const rows = records.filter(
      (record): record is Record<string, unknown> =>
        typeof record === 'object' && record !== null,
    );
    const headers = Array.from(
      rows.reduce<Set<string>>((keys, row) => {
        Object.keys(row).forEach((key) => keys.add(key));
        return keys;
      }, new Set<string>()),
    );

    const lines = [headers.map((header) => this.escape(header)).join(',')];
    for (const row of rows) {
      lines.push(
        headers.map((header) => this.escape(this.stringify(row[header]))).join(','),
      );
    }
    return lines.join('\n');
  }

  private stringify(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return value.toString();
    }
    return JSON.stringify(value);
  }

  private escape(value: string): string {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
