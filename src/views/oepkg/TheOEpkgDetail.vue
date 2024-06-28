<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { OTab, OTabPane, OLink, isString } from '@opensig/opendesign';
import { OPENEULER_CONTACT } from '@/data/config';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT, MaintainerT, DetailItemT, MoreMessgeT } from '@/@types/app';
import { useI18n } from 'vue-i18n';
import { getDetails, getVer } from '@/api/api-domain';
import { moreColumns } from '@/data/detail/index';
import { useViewStore } from '@/stores/common';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/DetailHeader.vue';
import ExternalLink from '@/components/ExternalLink.vue';
import DetailAside from '@/components/DetailAside.vue';

import defaultImg from '@/assets/default-logo.png';

const route = useRoute();
const { mkit } = useMarkdown();
const { t } = useI18n();

const basicInfo = ref<DetailItemT[]>([]);
const version = ref();
const installation = ref('');
const tabValue = ref('oepkg');
const downloadData = ref('');
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });
const upStream = ref();
const security = ref();
const moreMessge = ref<MoreMessgeT[]>([]);
const description = ref();
const appData = ref<AppInfoT>({
  name: '',
  cover: '',
  repository: '',
  size: '',
  source_code: '',
  bin_code: '',
});
//详情请求
const queryPkg = () => {
  if (pkgId.value !== '') {
    getDetails(tabValue.value, pkgId.value)
      .then((res) => {
        const data = res.data.list[0];
        getDetailValue(data);
      })
      .catch(() => {
        useViewStore().showNotFound();
      });
  } else {
    useViewStore().showNotFound();
  }
};

const pkgId = ref('');
if (isString(route.query?.pkgId)) {
  pkgId.value = encodeURIComponent(route.query?.pkgId.toString());
}

onMounted(() => {
  queryPkg();
});
const summary = ref();
const license = ref();
const tagVer = ref();
const getDetailValue = (data: any) => {
  try {
    basicInfo.value = [
      { name: '详细描述', value: data?.description },
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.category || '其他' },
      { name: '所属仓库', value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
      { name: 'Repo源', value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
    ];
  } catch (res) {
    basicInfo.value = [];
  }
  summary.value = data.summary;

  const newData = [
    { name: 'Requires', value: JSON.parse(data?.requires || []) },
    { name: 'Provides', value: JSON.parse(data?.provides || []) },
    { name: 'Conflicts', value: JSON.parse(data?.conflicts || []) },
  ];
  // 过滤空数据
  newData.forEach((item) => {
    if (item.value.length > 0) {
      moreMessge.value.push(item);
    }
  });

  appData.value.size = data.rpmSize;
  tagVer.value = [data.osSupport, data.arch];
  maintainer.value = {
    maintainerId: data?.maintainerId || 'openEuler community',
    maintainerEmail: data?.maintainerEmail || OPENEULER_CONTACT,
    maintainerGiteeId: data?.maintainerGiteeId || 'openeuler-ci-bot',
  };
  version.value = data?.version;
  license.value = data.license;
  upStream.value = data?.upStream;
  security.value = data?.securityLevel;
  description.value = data?.description;
  downloadData.value = mkit(data?.download || '', { isCopy: true, Tag: data.appVer });
  installation.value = mkit(data?.installation || '', { isCopy: true, Tag: data.appVer });
  appData.value.name = data.name;
  appData.value.source_code = data.srcDownloadUrl;
  appData.value.bin_code = data.binDownloadUrl;
  appData.value.cover = data?.iconUrl || defaultImg;
  appData.value.repository = data.srcRepo;
  queryVer();
};

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  showExternalDlg.value = true;
};

//获取支持
const verData = ref();
const queryVer = () => {
  if (appData.value.name) {
    getVer(tabValue.value, encodeURIComponent(appData.value.name)).then((res) => {
      verData.value = res.data.list;
    });
  }
};
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <!-- 锚点 -->
    <AppBreadcrumb id="oepkg" :name="appData.name" />

    <DetailHead :data="appData" :basicInfo="summary" :maintainer="maintainer" />

    <div class="detail-row">
      <div class="detail-row-main">
        <AppSection>
          <div class="title">
            <p>> 基本信息</p>
            <p v-if="version" class="ver">版本号：{{ version }}</p>
          </div>
          <div class="basic-info">
            <div v-for="item in basicInfo" :key="item.name" class="basic-info-item">
              <span class="label markdown download">{{ item.name }}</span>
              <div v-if="item.name === t('detail.warehouse') || item.name === t('detail.source')" class="markdown-body installation mymarkdown-body">
                <OLink @click="onExternalDialog(item.value)" color="primary" class="" target="_blank" rel="noopener noreferrer">{{ item.type }}</OLink>
              </div>
              <div v-dompurify-html="item.value" v-copy-code="true" class="markdown-body installation mymarkdown-body" v-else></div>
            </div>
          </div>
          <p class="sp">> 安装指引</p>
          <div v-if="downloadData" v-dompurify-html="downloadData" v-copy-code="true" class="markdown-body download"></div>
          <div v-if="installation" v-dompurify-html="installation" v-copy-code="true" class="markdown-body installation"></div>
          <p class="sp">> 更多信息</p>
          <OTab variant="text" :line="false" class="domain-tabs" :class="moreMessge.length > 1 ? 'tabs-switch' : 'tabs-one'">
            <template v-for="item in moreMessge" :key="item">
              <OTabPane class="tab-pane" v-if="item.value.length > 0" :label="item.name">
                <AppTableToggle :columns="moreColumns" :data="item.value" />
              </OTabPane>
            </template>
          </OTab>
        </AppSection>
        <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
        <AppFeedback :name="appData.name" :version="version" type="OEPKG" />
      </div>
      <div class="detail-row-side">
        <DetailAside :data="appData" :basicInfo="basicInfo" :maintainer="maintainer" :ver-data="verData" :license="license" :tagVer="tagVer" :type="'OEPKG'" />
      </div>
    </div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
