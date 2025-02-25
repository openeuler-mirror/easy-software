import { createI18n } from 'vue-i18n';

import common from './common';
import software from './software';
import upstream from './upstream';
import detail from '@/i18n/detail';
import collaboration from '@/i18n/collaboration';
import cookie from './cookie';

const messages = {
  zh: {
    common: common.zh,
    software: software.zh,
    upstream: upstream.zh,
    detail: detail.zh,
    collaboration: collaboration.zh,
    cookie: cookie.zh,
  },
  en: {
    common: common.en,
    software: software.en,
    upstream: upstream.en,
    detail: detail.en,
    collaboration: collaboration.en,
    cookie: cookie.en,
  },
};

const locale = 'zh';

const i18n = createI18n({
  globalInjection: true,
  locale,
  legacy: false,
  fallbackLocale: 'zh',
  messages,
});

export default i18n;
