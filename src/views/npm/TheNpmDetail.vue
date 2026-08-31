<script lang="ts" setup>
import { ref, onMounted, provide, computed } from 'vue';
import { isString, OTag, OSelect, OOption } from '@opensig/opendesign';
import { maintainerDefaults } from '@/data/query';
import { useRoute } from 'vue-router';
import type { MaintainerT, DetailItemT } from '@/@types/app';
import type { ImageTagsT } from '@/@types/detail';
import { useI18n } from 'vue-i18n';
import { getDetails, getVer, getTags } from '@/api/api-domain';
import { windowOpen } from '@/utils/common';
import { useViewStore } from '@/stores/common';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/detail/DetailHeader.vue';
import DetailAside from '@/components/detail/DetailAside.vue';
import DetailInstall from '@/components/detail/DetailInstall.vue';

import { pkgIdInjection } from '@/data/injectionKeys';
import useDetailPageAnalytics from '@/composables/useDetailPageAnalytics';

const route = useRoute();
const { t } = useI18n();

const basicInfo = ref<DetailItemT[]>([]);

const tabValue = ref('npmpkg');
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });

const appData = ref({});
const { reportAnalytics, goFeedback, reportFeedback } = useDetailPageAnalytics(appData, basicInfo, 'RPM');

const isLoading = ref(true);

//详情请求
const queryPkg = async () => {
  if (pkgId.value !== '') {
    try {
      const res = await getDetails(tabValue.value, pkgId.value);
      const data = res.data.list[0];
      appData.value = data;
      tagsValue.value = data.appVer;
      getDetailValue(data);
      isLoading.value = false;
    } catch {
      isLoading.value = false;
      useViewStore().showNotFound();
    }
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

  tagVer.value = [data.os, data.arch];

  maintainer.value = {
    maintainerId: data?.maintainerId || maintainerDefaults.name,
    maintainerEmail: data?.maintainerEmail || maintainerDefaults.email,
    maintainerGiteeId: data?.maintainerGiteeId || maintainerDefaults.id,
  };

  queryVer();
  if (data.name) {
    queryTags();
  }
};

provide('BASE_INFO', basicInfo);

// 安装指引
const installTabs = computed(() => {
  return [
    {
      name: '在线安装',
      type: 'online',
      tag: appData.value.appVer,
      installation: appData.value.npmUsage,
    },
  ];
});

//获取支持
const versionSupportData = ref();
const queryVer = async () => {
  if (appData.value.name) {
    try {
      const res = await getVer(tabValue.value, encodeURIComponent(appData.value.name));
      versionSupportData.value = res.data.list;
    } catch {
      versionSupportData.value = [];
    }
  }
};

const tagsList = ref<ImageTagsT[]>([]);
const tagsValue = ref('');
const queryTags = async () => {
  try {
    const res = await getTags(encodeURIComponent(appData.value.name), tabValue.value);
    tagsList.value = res.data.list;
  } catch {
    tagsList.value = [];
  }
};
const changePkgVersion = (v: string) => {
  if (v === appData.value?.appVer) {
    return;
  }
  const current = tagsList.value.find((item: ImageTagsT) => item.appVer === v);
  windowOpen(`/zh/npm/detail?pkgId=${current.pkgId}`, '_self');
};
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <DetailSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 锚点 -->
      <AppBreadcrumb id="npm" :name="appData.name" />
      <!-- 头部信息 -->
      <DetailHead @go-feedback="goFeedback" :data="appData" />

      <div class="detail-row">
        <div class="detail-row-main">
          <AppSection :line="false">
            <div v-if="appData.appVer" class="version-title">
              <h2>{{ appData.appVer }}</h2>
              <OTag v-if="appData.isLatestAppVer" color="success">最新版本</OTag>
              <div class="software-version">
                软件版本
                <OSelect v-model="tagsValue" @change="changePkgVersion">
                  <OOption v-for="item in tagsList" :key="item.pkgId" :value="item.appVer" :label="item.appVer">{{ item.appVer }}</OOption>
                </OSelect>
              </div>
            </div>

            <!-- 安装指引 -->
            <DetailInstall :title="`> ${t('detail.installation')}`" :options="installTabs" @report-analytics="reportAnalytics" />
          </AppSection>

          <!-- 反馈 -->
          <AppFeedback
            @report-analytics="reportFeedback"
            :name="appData.name"
            :version="appData.version"
            type="NPM"
            :maintainer="maintainer"
            :srcRepo="srcRepo"
          />
        </div>
        <div class="detail-row-side">
          <DetailAside :data="appData" :ver-data="versionSupportData" :tagVer="tagVer" :maintainer="maintainer" type="NPM" />
        </div>
      </div>
    </template>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
.software-version {
  color: var(--o-color-info2);
}
:deep(.markdown-body.download ul > li::after) {
  display: none;
}
:deep(.markdown-body.download ul > li) {
  padding-left: 16px;
}
</style>
