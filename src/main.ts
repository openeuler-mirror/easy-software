import { createApp } from 'vue';
import { createPinia } from 'pinia';
import directives from './directives';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import ElementPlus from 'element-plus';
import { initOpenDesignAnalytics } from '@opendesign-plus/plugins/analytics';

import '@/assets/style/base.scss';
import 'element-plus/theme-chalk/src/index.scss';
import '@opensig/opendesign/es/index.scss';
import '@opendesign-plus/components/styles';
import '@/assets/style/theme/default-light.token.css';
import '@/assets/style/theme/dark.token.css';
import '@/assets/style/markdown.scss';
import '@/assets/style/theme/index.scss';
import '@/assets/style/global.scss';
import '@/assets/style/element-plus/index.scss';

import { initRound } from '@opensig/opendesign';

import App from './App.vue';
import router from './router';
import i18n from './i18n';
import { BAIDU_HM } from './data/config';
import { removeCustomCookie } from './utils/cookie';
import { reportAnalytics } from './api/api-analytics';

initRound('pill');

const app = createApp(App);

// 国际化
app.use(i18n);
// 状态存储
app.use(createPinia());
app.use(ElementPlus);

app.use(initOpenDesignAnalytics, {
  appKey: 'openEuler',
  service: 'software',
  request(data) {
    reportAnalytics(data);
  },
  isCookieAgreed() {
    return i18n.global.locale.value === 'zh' ? true : document.cookie.includes('agreed-cookiepolicy-en=1');
  },
  onEnable() {
    const hm = document.createElement('script');
    hm.src = BAIDU_HM;
    hm.classList.add('analytics-script');
    const s = document.getElementsByTagName('HEAD')[0];
    s.appendChild(hm);
  },
  onDisable() {
    const scripts = document.querySelectorAll('script.analytics-script');
    scripts.forEach((script) => {
      script.remove();
    });
    const hm = /^hm/i;
    document.cookie
      .split(';')
      .map((c) => c.trim())
      .forEach((c) => {
        const key = decodeURIComponent(c.split('=')[0]);
        if (hm.test(key)) {
          removeCustomCookie(key);
        }
      });
  },
});
// 路由
app.use(router);

app.use(VueDOMPurifyHTML);

// 指令
Object.keys(directives).forEach((directive) => {
  app.directive(directive, directives[directive]);
});

app.mount('#app');
