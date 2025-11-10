import opea from '@/assets/home/opea.jpg';
import hpc1 from '~icons/pkg/opea1.svg';
import hpc2 from '~icons/pkg/opea2.svg';
import hpc3 from '~icons/pkg/opea3.svg';
import hpc4 from '~icons/pkg/openhpc4.svg';
import hpc5 from '~icons/pkg/opea4.svg';

export default {
  overview: {
    cover: opea,
    desc: 'OPEA 是 Linux 基金会 AI & Data 子基金会（LF AI & Data Foundation）孵化的一项开源项目，其核心目标是解决当前企业在部署生成式 AI 过程中面临的工具和流程碎片化挑战。通过提供一套模块化的微服务组件，OPEA 致力于帮助企业客户更快速、安全、高效地构建完整的端到端生成式 AI 解决方案。',
  },
  coreList: [
    {
      icon: hpc1,
      name: '微服务架构',
      desc: '采用容器化微服务架构，支持独立开发、部署和扩展各个应用组件，提供灵活、可扩展的企业级AI解决方案',
    },
    {
      icon: hpc2,
      name: '可组合构建块',
      desc: '提供标准化的模块化组件，包括LLM、数据存储、提示引擎等，支持快速构建复杂的AI工作流',
    },
    {
      icon: hpc3,
      name: '企业级安全',
      desc: '内置端到端加密、VPC支持和行业标准合规性，确保AI驱动应用的安全性和可信度',
    },
  ],
  advInfo: [
    {
      name: '原生支持',
      desc: 'openEuler社区与OPEA社区共同合作，开发、测试深度集成，在云场景下内存潮汐调度技术显著提升容器速度，为AI应用提供极致性能体验',
    },
    {
      name: '硬件优化',
      desc: 'openEuler原生支持Arm、x86、RISC-V、LoongArch等架构，兼容NVIDIA、Ascend等AI加速器，并且针对鲲鹏、昇腾等国产硬件进行深度优化，在AI推理、训练等关键场景实现显著性能提升',
    },
    {
      name: '生态协同',
      desc: '未来，openEuler社区将继续联合AI领域社区伙伴，确保持续的技术创新和生态发展',
    },
  ],
  infoList: [
    {
      icon: hpc4,
      name: 'OPEA 1.4版本开始支持openEuler',
      href: 'https://mp.weixin.qq.com/s/VvtlXSc7pJMELU3qEenT-Q',
    },
    {
      icon: hpc5,
      name: 'openEuler社区与OPEA社区建立伙伴关系',
      href: 'https://opea.dev',
    },
  ],
};
