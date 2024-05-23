export default [
  {
    id: 'os',
    name: 'openEuler版本选择',
    children: [
      'openEuler-20.03-LTS-SP1',
      'openEuler-20.03-LTS-SP2',
      'openEuler-20.03-LTS-SP3',
      'openEuler-20.03-LTS-SP4',
      'openEuler-20.03-LTS',
      'openEuler-20.09',
      'openEuler-21.03',
      'openEuler-21.09',
      'openEuler-22.03-LTS-SP1',
      'openEuler-22.03-LTS-SP2',
      'openEuler-22.03-LTS-SP3',
      'openEuler-22.03-LTS',
      'openEuler-22.09',
      'openEuler-23.03',
      'openEuler-23.09',
      'openEuler-preview',
    ],
  },
  {
    id: 'arch',
    name: '架构',
    children: ['aarch64', 'noarch', 'x86_64', 'src', 'loongarch64', 'riscv64', 'sw_64'],
  },
];
