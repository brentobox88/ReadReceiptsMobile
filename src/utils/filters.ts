// src/utils/filters.ts
export type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'merchant_asc';

export interface ReceiptFilters {
  startDate: string | null;
  endDate: string | null;
  category: string | null;
  sort: SortOption;
}

export const DEFAULT_FILTERS: ReceiptFilters = {
  startDate: null,
  endDate: null,
  category: null,
  sort: 'date_desc',
};

export const CATEGORIES = ['Meals', 'Travel', 'Office', 'Utilities', 'Entertainment', 'Uncategorized'];

export function activeFilterCount(f: ReceiptFilters): number {
  let n = 0;
  if (f.startDate) n++;
  if (f.endDate) n++;
  if (f.category) n++;
  if (f.sort !== 'date_desc') n++;
  return n;
}

export function toQueryParams(f: ReceiptFilters): Record<string, string> {
  const p: Record<string, string> = { sort: f.sort };
  if (f.startDate) p.start_date = f.startDate;
  if (f.endDate) p.end_date = f.endDate;
  if (f.category) p.category = f.category;
  return p;
}