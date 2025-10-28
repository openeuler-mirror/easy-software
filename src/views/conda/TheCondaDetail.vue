<script lang="ts" setup>
import { ref, onMounted, provide, computed } from 'vue';
import { isString, OTag } from '@opensig/opendesign';
import { maintainerDefaults } from '@/data/query';
import { useRoute } from 'vue-router';
import type { MaintainerT, DetailItemT } from '@/@types/app';
import { useI18n } from 'vue-i18n';
import { getDetails, getVer } from '@/api/api-domain';
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

const tabValue = ref('condapkg');
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });

const appData = ref({});
const { reportAnalytics, goFeedback, reportFeedback } = useDetailPageAnalytics(appData, basicInfo, 'RPM');

const isLoading = ref(true);

//详情请求
const queryPkg = () => {
  if (pkgId.value !== '') {
    getDetails(tabValue.value, pkgId.value)
      .then((res) => {
        const data = res.data.list[0];
        appData.value = data;
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
};

provide('BASE_INFO', basicInfo);

// 安装指引
const installTabs = computed(() => {
  return [
    {
      name: '在线安装',
      type: 'online',
      tag: appData.value.appVer,
      installation: appData.value.condaUsage,
    },
  ];
});

//获取支持
const versionSupportData = ref();
const queryVer = () => {
  if (appData.value.name) {
    getVer(tabValue.value, encodeURIComponent(appData.value.name))
      .then((res) => {
        versionSupportData.value = res.data.list;
      })
      .catch(() => {
        versionSupportData.value = [];
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
      <DetailHead @go-feedback="goFeedback" :data="appData" />

      <div class="detail-row">
        <div class="detail-row-main">
          <AppSection :line="false">
            <div v-if="appData.appVer" class="version-title">
              <h2>{{ appData.appVer }}</h2>
              <OTag v-if="appData.isLatestAppVer" color="success">最新版本</OTag>
            </div>

            <!-- 安装指引 -->
            <DetailInstall :title="`> ${t('detail.installation')}`" :options="installTabs" @report-analytics="reportAnalytics" />
          </AppSection>

          <!-- 反馈 -->
          <AppFeedback
            @report-analytics="reportFeedback"
            :name="appData.name"
            :version="appData.version"
            type="CONDA"
            :maintainer="maintainer"
            :srcRepo="srcRepo"
          />
        </div>
        <div class="detail-row-side">
          <DetailAside :data="appData" :ver-data="versionSupportData" :tagVer="tagVer" :maintainer="maintainer" type="CONDA" />
        </div>
      </div>
    </template>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
