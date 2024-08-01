import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export const useLocale = () => {
  const { t, locale } = useI18n();

  const isZh = computed(() => locale.value === 'zh');
  const isEn = computed(() => locale.value === 'en');

  watch(
    () => isZh.value,
    () => {
      if (isZh.value) {
        document.documentElement.lang = 'zh';
      } else {
        document.documentElement.lang = 'en';
      }
    },
    {
      immediate: true,
    }
  );

  return {
    t,
    locale,
    isZh,
    isEn,
  };
};
