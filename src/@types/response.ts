export interface ResponseT<T> {
  code: string | number;
  msg: string;
  data: T;
}
