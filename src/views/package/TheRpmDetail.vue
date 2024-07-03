<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { OTab, OTabPane, OLink, isString } from '@opensig/opendesign';
import { OPENEULER_CONTACT } from '@/data/config';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT, MaintainerT, DetailItemT, MoreMessgeT } from '@/@types/app';
import { getDetails, getVer } from '@/api/api-domain';
import { moreColumns } from '@/data/detail/index';
import { useViewStore } from '@/stores/common';
import { useI18n } from 'vue-i18n';
import { TABNAME_OPTIONS } from '@/data/query';
import OCodeDown from '@/components/OCodeDown.vue';
import defaultImg from '@/assets/default-logo.png';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/DetailHeader.vue';
import DetailAside from '@/components/DetailAside.vue';
import ExternalLink from '@/components/ExternalLink.vue';

const { t } = useI18n();
const route = useRoute();
const { mkit } = useMarkdown();
const tabValue = ref(TABNAME_OPTIONS[1]);
const basicInfo = ref<DetailItemT[]>([]);
const version = ref();
const installation = ref('');
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
  basicInfo.value = [
    { name: t('detail.description'), value: data?.description },
    // { name: t('detail.osSupport'), value: data.osSupport },
    // { name: t('detail.arch'), value: data.arch },
    { name: t('detail.number'), value: data?.version },
    { name: t('detail.epkgCategory'), value: data.epkgCategory || '其他' },
    { name: t('detail.repo'), value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
    { name: t('detail.repoType'), value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
  ];
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
  if (data.name) {
    queryVer();
  }
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
  getVer(tabValue.value, encodeURIComponent(appData.value.name)).then((res) => {
    verData.value = res.data.list;
  });
};
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <!-- 锚点 -->
    <AppBreadcrumb id="rpm" :name="appData.name" />
    <DetailHead :data="appData" :basicInfo="summary" :maintainer="maintainer" />

    <div class="detail-row">
      <div class="detail-row-main">
        <AppSection>
          <div class="title">
            <p>> {{ t('detail.information') }}</p>
            <!-- <p v-if="version" class="ver">{{ t('detail.number') }}：{{ version }}</p> -->
            <!-- <OCodeDown :verData="verData" :tagVer="tagVer" :type="'RPM'"></OCodeDown> -->
          </div>
          <div class="basic-info">
            <div v-for="item in basicInfo" :key="item.name" class="basic-info-item">
              <span class="label markdown download">{{ item.name }}</span>
              <div v-if="item.name === t('detail.warehouse') || item.name === t('detail.source')" class="markdown-body installation mymarkdown-body">
                <OLink @click="onExternalDialog(item.value)" color="primary" class="" target="_blank" rel="noopener noreferrer">{{ item.type }}</OLink>
              </div> 
              <div v-copy-code="true" class="markdown-body installation mymarkdown-body" v-else>
                <span :class="item.name === t('detail.number') ? 'ver' : ''">{{ item.value }}</span>
              </div>
            </div>
          </div>
          <p class="sp">> {{ t('detail.installation') }}</p>
          <div v-if="installation" v-dompurify-html="installation" v-copy-code="true" class="markdown-body installation"></div>
          <p class="sp">> {{ t('detail.more') }}</p>
          <OTab variant="text" :line="false" class="domain-tabs" :class="moreMessge.length > 1 ? 'tabs-switch' : 'tabs-one'">
            <template v-for="item in moreMessge" :key="item">
              <OTabPane class="tab-pane" v-if="item.value.length > 0" :label="item.name">
                <AppTableToggle :columns="moreColumns" :data="item.value" />
              </OTabPane>
            </template>
          </OTab>
        </AppSection>
        <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
        <AppFeedback :name="appData.name" :version="version" type="RPM" />
      </div>
      <div class="detail-row-side">
        <DetailAside :data="appData" :basicInfo="basicInfo" :maintainer="maintainer" :ver-data="verData" :license="license" :tagVer="tagVer" :type="'RPM'" />
      </div>
    </div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
