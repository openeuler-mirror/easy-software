<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { isString } from '@opensig/opendesign';
import { maintainerDefaults } from '@/data/query';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT, MaintainerT, DetailItemT, MoreMessgeT } from '@/@types/app';
import { getDetails, getVer } from '@/api/api-domain';
import { useViewStore } from '@/stores/common';
import { useI18n } from 'vue-i18n';
import { TABNAME_OPTIONS } from '@/data/query';

import DetailBasicInfo from '@/components/detail/DetailBasicInfo.vue';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/detail/DetailHeader.vue';
import DetailAside from '@/components/detail/DetailAside.vue';

import defaultImg from '@/assets/default-logo.png';
import { provide } from 'vue';
import { pkgIdInjection } from '@/data/injectionKeys';
import useDetailPageAnalytics from '@/composables/useDetailPageAnalytics';

const { t } = useI18n();
const route = useRoute();
const { mkit } = useMarkdown();
const tabValue = ref(TABNAME_OPTIONS[1]);
const basicInfo = ref<DetailItemT[]>([]);
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
  license: '',
  version: '',
  repository: '',
  size: '',
  source_code: '',
  bin_code: '',
  security: '',
});
const srcRepo = ref('');
const { reportAnalytics, goFeedback, vCopyInstallation, reportFeedback } = useDetailPageAnalytics(appData, basicInfo, 'RPM');

const isLoading = ref(true);
//详情请求
const queryPkg = () => {
  if (pkgId.value !== '') {
    getDetails(tabValue.value, pkgId.value)
      .then((res) => {
        const data = res.data.list[0];
        srcRepo.value = data.srcRepo;
        getDetailValue(data);
        isLoading.value = false;
      })
      .catch(() => {
        useViewStore().showNotFound();
        isLoading.value = false;
      });
  } else {
    useViewStore().showNotFound();
    isLoading.value = false;
  }
};
const pkgId = ref('');
provide(pkgIdInjection, pkgId);
if (isString(route.query?.pkgId)) {
  pkgId.value = encodeURIComponent(route.query?.pkgId.toString());
}

onMounted(() => {
  queryPkg();
});

const summary = ref();
const tagVer = ref();
const getDetailValue = (data: any) => {
  basicInfo.value = [
    { name: t('detail.description'), value: data?.description },
    { name: t('detail.osSupport'), value: data.osSupport },
    { name: t('detail.arch'), value: data.arch },
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
    maintainerId: data?.maintainerId || maintainerDefaults.name,
    maintainerEmail: data?.maintainerEmail || maintainerDefaults.email,
    maintainerGiteeId: data?.maintainerGiteeId || maintainerDefaults.gitee_id,
  };
  appData.value.version = data?.version;
  appData.value.license = data.license;
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
  appData.value.security = data.security;
  if (data.name) {
    queryVer();
  }
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
    <DetailSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 锚点 -->
      <AppBreadcrumb id="rpm" :name="appData.name" />
      <!-- 头部信息 -->
      <DetailHead @go-feedback="goFeedback" :data="appData" :basicInfo="summary" :maintainer="maintainer" />

      <div class="detail-row">
        <div class="detail-row-main">
          <AppSection :title="`> ${t('detail.information')}`">
            <template #append>
              <span v-if="appData.version" class="ver">{{ t('detail.number') }}: {{ appData.version }}</span>
            </template>
            <!-- 基本信息 -->
            <DetailBasicInfo :options="basicInfo" />

            <!-- 安装指引 -->
            <DetailInstall :title="`> ${t('detail.installation')}`">
              <div v-if="downloadData" v-dompurify-html="downloadData" v-copy-code="true" class="markdown-body download"></div>
              <div v-if="installation" v-copy-installation v-dompurify-html="installation" v-copy-code="true" class="markdown-body installation"></div>
            </DetailInstall>

            <!-- 更多信息 -->
            <p class="sp">> {{ t('detail.more') }}</p>
            <DetailMoreInfo :options="moreMessge" />
          </AppSection>

          <!-- 反馈 -->
          <AppFeedback
            @report-analytics="reportFeedback"
            :name="appData.name"
            :version="appData.version"
            type="RPM"
            :maintainer="maintainer"
            :srcRepo="srcRepo"
          />
        </div>
        <div class="detail-row-side">
          <DetailAside @report-analytics="reportAnalytics" :data="appData" :ver-data="verData" :tagVer="tagVer" :type="'RPM'" />
        </div>
      </div>
    </template>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
