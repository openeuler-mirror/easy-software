export interface SearchAppT {
  name: string;
  os: string;
  arch: string;
  category: string;
  timeOrder: string;
}

export interface PkgPageSizeT {
  pageNum?: number;
  pageSize?: number;
  timeOrder?: string;
  name: string;
}
