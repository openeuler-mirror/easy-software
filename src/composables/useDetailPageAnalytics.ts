import type { AppInfoT, DetailItemT } from '@/@types/app';
import { oaReport } from '@/shared/analytics';
import { computed, unref, type Directive, type MaybeRef, type Ref } from 'vue';

const useDetailPageAnalytics = (appData: Ref<AppInfoT>, basicInfo: Ref<DetailItemT[]>, tab?: MaybeRef<string>) => {
  const archAndOs = computed(() => ({
    architecture: basicInfo.value.find((item) => item.name === '架构')?.value,
    os_version: basicInfo.value.find((item) => item.name === '版本支持情况')?.value,
  }));

  const reportAnalytics = (data: Record<string, any>, event = 'click') => {
    oaReport(event, {
      module: 'detail_page',
      app_name: appData.value.name,
      version: appData.value.version,
      ...(tab ? { tab: unref(tab).toLowerCase() } : {}),
      ...archAndOs.value,
      ...data,
    });
  };

  const reportCopyInstallation = (e: Event) => {
    reportAnalytics({
      type: 'install_guide',
      target: (e as CustomEvent).detail.stepName,
    });
  };

  const vCopyInstallation: Directive<HTMLDivElement> = {
    mounted(el) {
      el.addEventListener('reportCopyInstallation', reportCopyInstallation);
    },
    beforeUnmount(el) {
      el.removeEventListener('reportCopyInstallation', reportCopyInstallation);
    },
  };

  const goFeedback = () => {
    reportAnalytics({
      module: 'feedback',
      type: 'want_feedback',
    });
  };

  const reportFeedback = (data: any, event: string) => {
    reportAnalytics(
      {
        module: 'feedback',
        ...data,
      },
      event
    );
  };

  return {
    reportAnalytics,
    reportCopyInstallation,
    vCopyInstallation,
    goFeedback,
    reportFeedback,
  };
};

export default useDetailPageAnalytics;
