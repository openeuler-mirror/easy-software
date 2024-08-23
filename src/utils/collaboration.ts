import { applicationType, applyStatusType } from '@/data/todo/'

// 申请类型转换
export const applicationTypeConvert = (v: string) => {
  const index = applicationType.findIndex((item) => item.id === v);
  if (index === -1) {
    return v;
  }
  return applicationType[index].label;
}


// 仓库活跃度
export const repoStatusArr = ['健康', '活跃', '静止', '缺人维护', '没有人维护'];
export const repoStatusIndex = (v: string) => {
  return repoStatusArr.findIndex((item) => item === v);
};


// 申请状态
export const applyStatusConvert = (v: string) => {
  const index = applyStatusType.findIndex((item) => item.value === v);
  if (index === -1) {
    return v;
  }
  return applyStatusType[index].label;
};
