export interface SelectedItemT {
  value: string | number;
  label: string;
  // 路由跳转 router.push
  path?: string;
  // 外链跳转 window.open
  herf?: string;
  // 外链跳转参数
  target?: string;
}
