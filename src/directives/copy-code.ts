import { useMessage } from '@opensig/opendesign';

const message = useMessage();

export default {
  mounted(el: HTMLElement, binding: { value: boolean }) {
    if (binding.value) {
      el.addEventListener('click', function (event: MouseEvent) {
        const target = event?.target as HTMLElement;
        if (target?.className.includes('copy')) {
          message.success({
            content: '复制成功',
            duration: 1000,
          });
        }
      });
    }
  },
};
