import { createI18n } from 'vue-i18n';

import common from './common';
import software from './software';
import upstream from './upstream';

import { getCurrentLocale } from '@/utils/locale';

const messages = {
  zh: {
    common: common.zh,
    software: software.zh,
    upstream: upstream.zh,
  },
  en: {
    common: common.en,
    software: software.en,
    upstream: upstream.en,
  },
};

const locale = getCurrentLocale();

const i18n = createI18n({
  globalInjection: true,
  locale,
  legacy: false,
  fallbackLocale: 'zh',
  messages,
});

export default i18n;
