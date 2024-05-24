export interface SearchAppT {
  pageNum: number;
  pageSize: number;
  os?: string | string[];
  arch?: string | string[]
  category?: string | string[];
  timeOrder?: string;
  nameOrder?: string;
}

export interface SearchSQLT extends SearchAppT {
  name: string;
}

export interface SearchESParamsT extends SearchAppT {
  keyword: string;
  keywordType: string;
  dataType: string;
}

export interface SearchUpstreamT extends SearchAppT {
  eulerOsVersion: string;
}