<script lang="ts" setup>
import { ref, onMounted, provide } from 'vue';
import { isString } from '@opensig/opendesign';
import { maintainerDefaults } from '@/data/query';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT, MaintainerT, DetailItemT, MoreMessgeT } from '@/@types/app';
import { useI18n } from 'vue-i18n';
import { getDetails, getVer } from '@/api/api-domain';
import { useViewStore } from '@/stores/common';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/detail/DetailHeader.vue';
import DetailAside from '@/components/detail/DetailAside.vue';
import DetailInstall from '@/components/detail/DetailInstall.vue';

import defaultImg from '@/assets/default-logo.png';
import { pkgIdInjection } from '@/data/injectionKeys';

const route = useRoute();
const { mkit } = useMarkdown();
const { t } = useI18n();

const basicInfo = ref<DetailItemT[]>([]);
const installation = ref('');
const tabValue = ref('condapkg');
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });

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

const isLoading = ref(true);

//详情请求
const queryPkg = () => {
  if (pkgId.value !== '') {
    getDetails(tabValue.value, pkgId.value)
      .then((res) => {
        const data = res.data.list[0];
        srcRepo.value = data.homepage || '';
        getDetailValue(data);
        isLoading.value = false;
      })
      .catch(() => {
        isLoading.value = false;
        useViewStore().showNotFound();
      });
  } else {
    isLoading.value = false;
    useViewStore().showNotFound();
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
  try {
    basicInfo.value = [
      { name: t('detail.osSupport'), value: data.os },
      { name: t('detail.arch'), value: data.arch },
      { name: t('detail.epkgCategory'), value: data.category || '其他' },
    ];
  } catch (res) {
    basicInfo.value = [];
  }
  summary.value = data.description;

  tagVer.value = [data.os, data.arch];

  maintainer.value = {
    maintainerId: data?.maintainerId || maintainerDefaults.name,
    maintainerEmail: data?.maintainerEmail || maintainerDefaults.email,
    maintainerGiteeId: data?.maintainerGiteeId || maintainerDefaults.gitee_id,
  };

  security.value = data?.security;
  description.value = data?.description;
  installation.value = mkit(data?.condaUsage || '', { isCopy: true, Tag: data.appVer });
  appData.value.name = data.name;
  appData.value.cover = data?.iconUrl || defaultImg;
  appData.value.repository = data.srcRepo;
  appData.value.size = 0;
  appData.value.version = data.appVer;
  appData.value.license = data.license;
  appData.value.security = data.security;
  queryVer();
};

//获取支持
const verData = ref();
const queryVer = () => {
  if (appData.value.name) {
    getVer(tabValue.value, encodeURIComponent(appData.value.name))
      .then((res) => {
        verData.value = res.data.list;
      })
      .catch(() => {
        verData.value = [];
      });
  }
};
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <DetailSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 锚点 -->
      <AppBreadcrumb id="conda" :name="appData.name" />
      <!-- 头部信息 -->
      <DetailHead :data="appData" :basicInfo="summary" :maintainer="maintainer" />

      <div class="detail-row">
        <div class="detail-row-main">
          <AppSection :title="`> ${t('detail.information')}`">
            <template #append>
              <span v-if="appData.version" class="ver">{{ t('detail.number') }}:{{ appData.version }}</span>
            </template>
            <!-- 基本信息 -->
            <DetailBasicInfo :options="basicInfo" />
            <!-- 安装指引 -->
            <DetailInstall :title="`> ${t('detail.installation')}`">
              <div v-if="installation" v-dompurify-html="installation" v-copy-code="true" class="markdown-body installation"></div>
            </DetailInstall>
          </AppSection>

          <!-- 反馈 -->
          <AppFeedback :name="appData.name" :version="appData.version" type="CONDA" :maintainer="maintainer" :srcRepo="srcRepo" />
        </div>
        <div class="detail-row-side">
          <DetailAside :data="appData" :ver-data="verData" :tagVer="tagVer" type="CONDA" />
        </div>
      </div>
    </template>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
