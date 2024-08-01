export interface RecommendSubItemT {
  name: string;
  pkgId: string;
  version?: string;
}

export interface RecommendItemT {
  docCount: number;
  key: string;
  nameDocs?: RecommendSubItemT[];
}

export interface SearchParamsT {
  value: string;
  filter: string;
}

export interface MenuCountT {
  key: string;
  docCount: number;
}
