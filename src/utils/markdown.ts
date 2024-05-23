import { onUnmounted, nextTick } from 'vue';

import { useClipboard } from '@/composables/useClipboard.js';

/**
 * markdown 区域添加复制按钮
 */
export const addCopyBtn = () => {
  let copyDom: NodeListOf<HTMLElement>;
  const copyText = (e: MouseEvent) => {
    const dom = e.currentTarget as HTMLElement;
    useClipboard({
      text: dom?.getAttribute('data-clipboard-text') || '', // 渲染markdown时加入了data-clipboard-text，用于 copy
      target: e,
    });
  };

  nextTick(() => {
    copyDom = document.querySelectorAll('.pre-copy'); //获取所有代码块元素，添加监听事件
    copyDom.forEach((item) => {
      item.addEventListener('click', copyText);
    });
  });
  onUnmounted(() => {
    copyDom.forEach((item) => {
      item.removeEventListener('click', copyText);
    });
  });
};
