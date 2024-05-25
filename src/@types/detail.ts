interface PackageDetailT {
  name: string;
  version: string;
  os: string;
  arch: string;
  category: string;
  srcRepo: string;
  binDownloadUrl: string;
  srcDownloadUrl: string;
  summary: string;
  osSupport: string;
  repo: { type: string; url: string };
  repoType: { type: string; url: string };
  installation: string;
  description: string;
  requires: RequiresT[];
  provides: string[];
  conflicts: string[];
  changeLog: string;
  files: FilesT[];
  maintainerId: string | null;
  maintainerEmail: string | null;
  maintainerGiteeId: string | null;
  maintainerUpdateAt: string | null;
  maintainerStatus: string | null;
  upStream: string;
  security: string;
  similarPkgs: string;
  downloadCount: number | null;
  pkgId: string;
  subPath: string | null;
  license: string;
}

interface RequiresT {
  name: string;
  flags: string;
  rel: string;
  ver: string;
  epoch: string;
}
interface FilesT {
  fileName: string;
}

export interface EpkgDetailT extends PackageDetailT {
  epkgSize: string;
  epkgUpdateAt: string;
  iconUrl: string | null;
  securityLevel: string | null;
}

export interface RpmDetailT extends PackageDetailT {
  id: string;
  rpmSize: string;
  rpmUpdateAt: string;
}

export interface ImageDetailT extends PackageDetailT {
  id: string;
  type: string;
  download: string;
  appSize: string | null;
  environment: string;
  iconUrl: string | null;
  dependencyPkgs: string[];
  appVer: string;
  safeLabel: string | null;
  imageTags: string;
  imageUsage: string;
  securityLevel: string | null;
  latestOsSupport: boolean;
}

export interface ParamsKeyT {
  appPkgId: string | null;
  epkgPkgId: string | null;
  rpmPkgId: string | null;
}
