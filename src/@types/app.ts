export interface AppItemT {
  category: string | null;
  description: string | null;
  iconUrl: string | null;
  name: string;
  tags: PkgTypeT[];
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


export interface MaintainerT {
  maintainerId: string;
  maintainerEmail: string;
  maintainerGiteeId: string;
};

export interface DetailItemT {
  name: string;
  value: string | any;
  type?: string;
}


export interface HomeInfoT {
  id: string;
  name: string;
  desc: string;
  icon: string;
  href: string;
}


export type PkgTypeT = 'RPM' | 'IMAGE' | 'EPKG';