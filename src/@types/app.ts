export interface AppItemT {
  category: string | null;
  description: string | null;
  iconUrl: string | null;
  name: string;
  tags: string[];
  pkgIds: PkgIdsT;
}
export interface PkgIdsT {
  EPKG: string;
  IMAGE: string;
  RPM: string;
};

export interface AppT {
  name: string;
  children: AppItemT[];
}

export interface AppInfoT {
  name: string;
  cover: string;
  repository: string;
  size: string;
  source_code: string;
  bin_code: string;
}
