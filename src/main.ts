import { createApp } from 'vue';
import { createPinia } from 'pinia';
import directives from './directives';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import ElementPlus from 'element-plus'


import '@/assets/style/base.scss';
import '@opensig/opendesign/es/index.scss';
import '@/assets/style/theme/default-light.token.css';
import '@/assets/style/theme/dark.token.css';
import '@/assets/style/markdown.scss';
import '@/assets/style/theme/index.scss';
import '@/assets/style/element-plus/index.scss';

import { initRound } from '@opensig/opendesign';

import App from './App.vue';
import router from './router';
import i18n from './i18n';

initRound('pill');

const app = createApp(App);

// 国际化
app.use(i18n);
// 状态存储
app.use(createPinia());
// 路由
app.use(router);
app.use(ElementPlus)

app.use(VueDOMPurifyHTML);

// 指令
Object.keys(directives).forEach((directive) => {
  app.directive(directive, directives[directive]);
});

app.mount('#app');
