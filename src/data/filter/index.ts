export const os = [
  'openEuler-24.03-LTS',
  'openEuler-23.09',
  'openEuler-23.03',
  'openEuler-22.09',
  'openEuler-22.03-LTS-SP4',
  'openEuler-22.03-LTS-SP3',
  'openEuler-22.03-LTS-SP2',
  'openEuler-22.03-LTS-SP1',
  'openEuler-22.03-LTS',
  'openEuler-21.09',
  'openEuler-21.03',
  'openEuler-20.09',
  'openEuler-20.03-LTS-SP4',
  'openEuler-20.03-LTS-SP3',
  'openEuler-20.03-LTS-SP2',
  'openEuler-20.03-LTS-SP1',
  'openEuler-20.03-LTS',
  'openEuler-preview',
]

export const arch = [
  "x86_64",
  "aarch64",
  "noarch",
  "riscv64",
  "loongarch64",
  "sw_64",
]

export const collaborationFilter: Record<string, string[]> = {
  cveStatus: [
    '有CVE且全部未修复',
    '有CVE部分修复',
    '有CVE且全部修复',
    '没有CVE问题',
  ],
  issueStatus: [
    '没有ISSUE修复',
    '有部分ISSUE修复',
    '全部ISSUE修复',
  ],
  prStatus: [
    '没有PR提交',
    '有PR提交未合入',
    '有PR合入',
  ],
  versionStatus: [
    '最新版本',
    '落后版本',
  ],
  orgStatus: [
    '贡献组织多',
    '贡献组织少',
  ],
  contributorStatus: [
    '贡献人员多',
    '贡献人员少',
  ],
}