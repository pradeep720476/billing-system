export interface PageResult<T> {
  total: number;
  page?: number;
  limit?: number;
  items: T[];
}
