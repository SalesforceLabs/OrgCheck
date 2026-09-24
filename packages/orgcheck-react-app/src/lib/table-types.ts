export type TableCellData = {
  id?: string;
  name?: string;
  value?: unknown;
  label?: string;
  decoration?: unknown;
  values?: unknown[];
};

export type TableCell = {
  key?: string;
  cssClass?: string;
  isbad?: boolean;
  decoration?: unknown;
  tostring?: string;
  typeofindex?: boolean;
  typeofscore?: boolean;
  typeofdependencies?: boolean;
  typeofid?: boolean;
  typeofids?: boolean;
  typeofpercentage?: boolean;
  typeofnumeric?: boolean;
  typeofboolean?: boolean;
  typeofdatetime?: boolean;
  typeoftext?: boolean;
  typeoftexts?: boolean;
  typeofobjects?: boolean;
  editable?: boolean;
  onChange?: (next: boolean) => void;
  data?: TableCellData;
};

export type TableRowView = {
  key: string;
  cssClass: string;
  index?: number;
  score?: number;
  name?: string;
  badFields?: string[];
  badReasonIds?: number[];
  isVisible: boolean;
  cells: TableCell[];
};

export function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value !== null && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return '';
  return String(value);
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
}

export function asBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === 'true' || value === 'TRUE';
}
