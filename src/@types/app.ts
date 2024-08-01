export interface AppItemT {
  category: string | null;
  description: string | null;
  iconUrl: string | null;
  name: string;
  tags: PkgTypeT[];
  pkgIds: PkgIdsT;
  maintainers?: PkgIdsT;
  arch?: string;
  os?: string;
}

export interface PkgIdsT {
  RPM: string;
  IMAGE: string;
  EPKG: string;
  OEPKG: string;
}

export interface AppT {
  name: string;
  children: AppItemT[];
}

export interface AppInfoT {
  name: string;
  cover: string;
  repository: string;
  size: string | null;
  source_code: string;
  bin_code: string;
}

export interface MaintainerT {
  maintainerId: string | null;
  maintainerEmail: string | null;
  maintainerGiteeId: string | null;
}

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

export interface MoreMessgeT {
  name: string;
  value: MoreMessgeItemT[];
}
export interface MoreMessgeItemT {
  name: string;
  flags: string;
  rel: string;
  ver: string;
  epoch: string;
}

export type PkgTypeT = 'RPM' | 'IMAGE' | 'EPKG' | 'OEPKG';
