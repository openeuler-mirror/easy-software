
import { HIASCEND, OPENEULER } from '@/data/config';

import ApppkgIcon from '~icons/pkg/apppkg.svg';
import EpkgIcon from '~icons/pkg/epkg.svg';
import ImageIcon from '~icons/pkg/image.svg';
import RpmIcon from '~icons/pkg/rpm.svg';


export const resourceData = [
  {
    id: 'apppkg',
    name: '领域应用',
    desc: 'openEuler操作系统支持的软件包集合(包括RPM、容器镜像、EPKG软件包等）',
    icon: ApppkgIcon,
    href: "/apppkg"
  },
  {
    id: 'rpm',
    name: 'RPM',
    desc: '一系列基于openEuler操作系统预编译的二进制软件包',
    icon: RpmIcon,
    href: "/package"
  },
  {
    id: 'image',
    name: '容器镜像',
    desc: '一系列基于openEuler操作系统安装特定应用的容器镜像，提供开箱即用的部署体验',
    icon: ImageIcon,
    href: "/image"
  },
  {
    id: 'epkg',
    name: 'EPKG',
    desc: '一种支持多版本多环境，一次适配，处处运行的新型软件包',
    icon: EpkgIcon,
    href: "/epkg"
  },
]

// 首页 解决方案
export const solutionData = [
  {
    title: 'OpenStack',
    desc: '以人工智能计算机集群为基础，涵盖基建、硬件和软件基础设施的完整系统，提供从底层芯片算力释放到顶层应用使能的人工智能全栈能力',
    tags: ['RPM', 'EPKG'],
    img: HIASCEND + '/_static3/img_fangan_1.DQt7q5qZ.jpg',
    href: ''
  },
  {
    title: 'OpenHPC',
    desc: 'OpenHPC是Linux基金会开源的超算项目，致力于为高性能计算（HPC）构建一个开源框架，以适应现在工业和学术研究的需求。',
    tags: ['RPM', 'EPKG'],
    img: HIASCEND + '/_static3/img_fangan_1.DQt7q5qZ.jpg',
    href: ''
  }
]



// 首页新闻
export const homeNewsData = [
  {
    date: '2024-02-28',
    summary: '近日，在 RISC-V 架构上完成了对 UniProton进行的初步适配工作，目前项目已经可以在 QEMU 上启动运行 Demo 程序。',
    archives: '2024-02',
    articleName: '20240306-riscv.md',
    author: ['openEuler'],
    banner: 'img/banners/20240306-risc.png',
    type: 'news',
    title: '新突破！openEuler UniProton 实时操作系统成功适配 RISC-V 架构',
    tags: ['兼容性更新'],
    path: 'zh/news/openEuler/20240306-riscv/20240306-riscv',
    lang: 'zh',
    category: 'news',
    url: OPENEULER + '/zh/news/openEuler/20240306-riscv/20240306-riscv.html',
  },
  {
    date: '2023-11-19',
    summary: '2023年11月17日，OpenCV社区正式接纳openEuler作为持续集成系统的操作系统之一。',
    archives: '2023-11',
    articleName: '20231120-cv.md',
    author: ['openEuler'],
    banner: 'img/banners/1120-cv.jpg',
    type: 'news',
    title: 'OpenCV原生支持openEuler',
    tags: ['软件拓展'],
    path: 'zh/news/20231120-cv/20231120-cv',
    lang: 'zh',
    category: 'news',
    url: OPENEULER + '/zh/news/20231120-cv/20231120-cv.html',
  },
  {
    date: '2023-07-13',
    summary:
      '近日，RISC-V SIG 发布了 Eulaceura 版本23H1，这是发行版的一次重大更新，新版本搭建了 linux kernel 6.1版本内核，适用于矽速科技 LicheePi 4A 的映像也已公布。',
    archives: '2023-07',
    articleName: '20230713-Eulaceura.md',
    author: ['openEuler'],
    banner: 'img/banners/20230714-riscv.jpeg',
    type: 'news',
    title: 'Eulaceura 版本 23H1：RISC-V 架构新的里程碑',
    tags: ['版本升级'],
    path: 'zh/news/20230713-Eulaceura/20230713-Eulaceura',
    lang: 'zh',
    category: 'news',
    url: OPENEULER + '/zh/news/20230713-Eulaceura/20230713-Eulaceura.html',
  },
];
