import type { OScroller } from '@opensig/opendesign';
import { type Ref, onUnmounted, onMounted, nextTick } from 'vue';

const useScrollBottom = (scrollerRef: Ref<InstanceType<typeof OScroller>>, callback: () => void) => {
  const onScroll = (event: Event) => {
    const el = event.target as HTMLDivElement;
    if (el.scrollHeight - Math.round(el.scrollTop) <= el.clientHeight) {
      callback();
    }
  };

  onMounted(() => {
    nextTick(() => {
      const container = scrollerRef.value?.getContainerEl() as HTMLDivElement;
      container && container.addEventListener('scroll', onScroll);
    });
  });

  onUnmounted(() => {
    const container = scrollerRef.value?.getContainerEl() as HTMLDivElement;
    container && container.removeEventListener('scroll', onScroll);
  });
};
export default useScrollBottom;
