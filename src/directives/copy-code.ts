import { useMessage } from '@opensig/opendesign';

const message = useMessage();

export default {
  mounted(el: HTMLElement, binding: { value: boolean }) {
    if (binding.value) {
      el.addEventListener('click', function (event: MouseEvent) {
        const target = event?.target as HTMLElement;
        const currentTarget = event.currentTarget as HTMLElement;
        if (target?.className.includes('copy')) {
          message.success({
            content: '复制成功',
            duration: 1000,
          });
        }
        if (currentTarget?.classList.contains('installation')) {
          const findStepName = (el: HTMLElement) => {
            const parent = el.parentElement;
            if (parent) {
              if (parent.tagName.toUpperCase() === 'UL') {
                return;
              }
              if (parent.tagName.toUpperCase() === 'PRE') {
                return parent.previousElementSibling?.textContent;
              }
              return findStepName(parent);
            }
          };
          const stepName = findStepName(target);
          if (stepName) {
            target.dispatchEvent(
              new CustomEvent('reportCopyInstallation', {
                bubbles: true,
                detail: { stepName },
              })
            );
          }
        }
      });
    }
  },
};
