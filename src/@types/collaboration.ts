export interface CollaborationT {
  name: string;
  pageSize?: number;
  pageNum?: number;
}

export interface AdminAppryT extends CollaborationT {
  applyId?: number;
  applyStatus?: string;
  repo?: string;
  metric?: string;
  timeOrder?: string;
}

export interface CollaborationRepoT {
  pageNum: number;
  pageSize: number;
  repo?: string;
  kind?: string;
  sigName?: string;
  status?: string;
}
