
import img1 from '@/assets/solution/openstack/img1.png';
import img2 from '@/assets/solution/openstack/img2.png';
import img3 from '@/assets/solution/openstack/img3.png';

import openstack1 from '~icons/pkg/openstack1.svg';
import openstack2 from '~icons/pkg/openstack2.svg';
import openstack3 from '~icons/pkg/openstack3.svg';
import openstackLogo from '@/assets/solution/openstack/openstacklogo.png';
import Add from '@/assets/solution/openstack/add.png';
import openeulerLogo from '@/assets/solution/openstack/openEulerlogo.png';

export default {
  overview: {
    cover: img1,
    desc: ['OpenStack是一个开源的云计算管理平台，它主要作为基础设施即服务（IaaS）部署在公用云和私有云中，提供虚拟服务器和其他资源给用户。',
      '在虚拟化环境中，存储、CPU 和 RAM 等资源大多来自于不同供应商，由虚拟机监控程序对这些资源进行拆分并按需进行分配。OpenStack 使用一组一致的编程接口（API）进一步将这些虚拟资源提取为离散池，用于辅助标准云计算工具，供管理员和用户直接交互使用。']
  },

  coreList: [
    {
      icon: openstack1,
      name: '计算资源管理',
      desc: 'OpenStack可以创建并管理大量虚拟机，从而允许企业或服务提供商按需提供计算资源。开发者可以通过API访问计算资源从而创建云应用，管理员与用户则可以通过web访问这些资源'
    },
    {
      icon: openstack2,
      name: '存储资源管理',
      desc: 'OpenStack可以可以根据用户需求为云服务或云应用提供所需的对象及块存储资源'
    },
    {
      icon: openstack3,
      name: '网络资源管理',
      desc: 'OpenStack 提供了插件式、可扩展、API 驱动型的网络及IP管理功能，能够高自动化地管理网络'
    }
  ],
  advImg: [openstackLogo, Add, openeulerLogo],
  advInfo: [
    {
      name: '快速部署',
      desc: 'openEuler社区提供了opensd等快速部署OpenStack的开发工具，解决了OpenStack企业级部署复杂度高的问题，可以让交付人员使用管理文本的方式，实现主机配置管理、OpenStack及其依赖的基础组件的安装与配置管理，极大地简化了OpenStack服务的部署过程'
    },
    {
      name: '持续创新',
      desc: 'openEuler OpenStack跟随上游社区演进，支持多版本部署，如2203支持Train/Wallaby，2403支持Wallaby/Antelope，同时吸引国内开源爱好者，在OpenStack原有基础上开源了一些新特性'
    },
    {
      name: '广泛应用',
      desc: 'OpenStack可以用作构建私有云和混合云、云计算服务提供商、学术研究和开发、测试和评估云计算技术和应用程序等众多方面'
    },
  ],
  caseList: [
    {
      img: img2,
      name: '联通沃云信创云建设项目',
      desc: '沃云信创云基于 OpenStack、Kubernetes 等开源代码自主研发，打造自主、安全可靠的强大云平台',
      href: '/zh/showcase/cloud-computing/woyun/'
    },
    {
      img: img3,
      name: '联通数科自动化部署',
      desc: '联通数科为解决 OpenStack 企业级部署的复杂性，针对自身OpenStack 产品开发的一套自动化部署工具，可以让交付人员使用管理文本的方式，实现主机配置管理、OpenStack',
      href: '/zh/blog/2022-11-12-02/02.html'
    },
  ],
}