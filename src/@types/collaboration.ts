export interface CollaborationT {
  name?: string;
  pageSize?: number;
  pageNum?: number;
}

export interface AdminAppryT extends CollaborationT {
  applyId?: string | number;
  applyIdString?: string;
  applyStatus?: string;
  repo?: string;
  metric?: string;
}

export interface CollaborationRepoT {
  pageNum: number;
  pageSize: number;
  repo?: string;
  kind?: string;
  sigName?: string;
  status?: string;
  cveStatus?: string;
  issueStatus?: string;
  prStatus?: string;
  versionStatus?: string;
  orgStatus?: string;
  contributorStatus?: string;
}


export interface RevokeT {
  applyIdString: string;
  applyStatus: string;
}

export type PlatformPermission = ('maintainer' | 'admin')[]


export interface CollaborationColumnsT {
  label: string;
  key: string;
  type: string;
  width?: string;
  fixed?: string;
  isFilter?: boolean;
  isDefault?: boolean;
  isChecked?: boolean;
  children?: CollaborationColumnsT[];
}

