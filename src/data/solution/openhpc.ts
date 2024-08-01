import openHPC from '@/assets/solution/openhpc/cover.png';
import img1 from '@/assets/solution/openhpc/img1.png';
import hpc1 from '~icons/pkg/openhpc1.svg';
import hpc2 from '~icons/pkg/openhpc2.svg';
import hpc3 from '~icons/pkg/openhpc3.svg';
import hpc4 from '~icons/pkg/openhpc4.svg';
import hpc5 from '~icons/pkg/openhpc5.svg';
import openhpcLogo from '@/assets/solution/openhpc/openhpc-logo.png';
import Add from '@/assets/solution/openhpc/add.png';
import openeulerLogo from '@/assets/solution/openhpc/openeuler-logo.png';

export default {
  overview: {
    cover: openHPC,
    desc: 'OpenHPC是Linux基金会开源的超算项目，致力于为高性能计算（HPC）构建一个开源框架，以适应现在工业和学术研究的需求。同时，OpenHPC也是一套基于Linux的HPC社区驱动的FOSS（Free and open source software）工具，提供了一个集成且经过测试的软件组件集合，以及支持的标准Linux发行版，可用于实现功能齐全的计算集群。',
  },
  coreImg: img1,
  coreList: [
    {
      icon: hpc1,
      name: '软件包管理',
      desc: '简化HPC集群上的软件安装、更新和卸载过程',
    },
    {
      icon: hpc2,
      name: '集群管理',
      desc: '提供集群的监控、管理和调度功能，确保资源的高校利用',
    },
    {
      icon: hpc3,
      name: '容器化部署',
      desc: '支持在HPC集群上运行容器化应用，提高应用的部署效率和可移植性',
    },
  ],
  advImg: [openhpcLogo, Add, openeulerLogo],
  advInfo: [
    {
      name: '持续集成',
      desc: 'openEuler社区与OpenHPC社区共同合作，开发、测试CI深度集成，OpenHPC社区的每个新增特性、问题修复在合入前均会自动进行单元测试、集成测试。从而保证OpenHPC所有组件在openEuler上持续可用',
    },
    {
      name: '支持多样性算力',
      desc: '在HPC领域，openEuler社区全面支持多样性算力，包括ARM64，X86等各种架构的处理器。在CICD流程中已经融入了鲲鹏，intel等芯片的支持',
    },
    {
      name: '合作创新',
      desc: '未来， openEuler 开源社区将继续与用户、上下游伙伴等携手并进，积极融入全球HPC开源体系，深入HPC场景创新，加速行业应用',
    },
  ],
  infoList: [
    {
      icon: hpc4,
      name: 'OpenHPC 3.x 版本开始支持openEuler',
      desc: '3.1版本支持openEuler 22.03 LTS SP3',
      href: '/openhpc/ohpc/releases/tag/v3.1.GA',
    },
    {
      icon: hpc5,
      name: 'OpenHPC社区发布openEuler集群部署文档',
      desc: 'OpenHPC社区提供在openEuler集群上的官方安装指南',
      href: '/openhpc/ohpc/wiki/3.x#openeuler-2203-lts-sp3',
    },
  ],
};
