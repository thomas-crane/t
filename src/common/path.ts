export interface Path<T> {
  value: T;
  next: Array<Path<T>>;
  expand(): void;
}
