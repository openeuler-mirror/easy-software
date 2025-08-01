<script lang="ts" setup>
import { ref, onMounted, provide, computed } from 'vue';
import { isString, OTag } from '@opensig/opendesign';
import { maintainerDefaults } from '@/data/query';
import { useRoute } from 'vue-router';
import type { MaintainerT, DetailItemT, MoreMessgeT } from '@/@types/app';
import { useI18n } from 'vue-i18n';
import { getDetails, getVer } from '@/api/api-domain';
import { useViewStore } from '@/stores/common';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/detail/DetailHeader.vue';
import DetailAside from '@/components/detail/DetailAside.vue';

import { pkgIdInjection } from '@/data/injectionKeys';
import useDetailPageAnalytics from '@/composables/useDetailPageAnalytics';

const route = useRoute();
const { t } = useI18n();

const tabValue = ref('oepkg');
const basicInfo = ref<DetailItemT[]>([]);

const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });
const moreMessge = ref<MoreMessgeT[]>([]);
const appData = ref({});

const { reportAnalytics, goFeedback, reportFeedback } = useDetailPageAnalytics(appData, basicInfo, 'OEPKG');

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

const tagVer = ref();

const getDetailValue = (data: any) => {
  basicInfo.value = [
    { name: '版本支持情况', value: data.osSupport },
    { name: '架构', value: data.arch },
    { name: '软件包分类', value: data.category || '其他' },
  ];

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

  tagVer.value = [data.osSupport, data.arch];
  // 维护者信息
  maintainer.value = {
    maintainerId: data?.maintainerId || maintainerDefaults.name,
    maintainerEmail: data?.maintainerEmail || maintainerDefaults.email,
    maintainerGiteeId: data?.maintainerGiteeId || maintainerDefaults.gitee_id,
  };

  if (data.name) {
    queryVer(data.name);
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
      installation: appData.value.installation,
    },
    {
      name: '下载安装',
      type: 'download',
      size: appData.value.rpmSize,
      children: [
        {
          href: appData.value.binDownloadUrl,
          type: 'binary',
          label: '源码包下载',
        },
        {
          href: appData.value.srcDownloadUrl,
          type: 'source_code',
          label: '二进制包下载',
        },
      ],
    },
  ];
});

//获取支持
const versionSupportData = ref();
const queryVer = (name: string) => {
  getVer(tabValue.value, encodeURIComponent(name)).then((res) => {
    versionSupportData.value = res.data.list;
  });
};
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <DetailSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 锚点 -->
      <AppBreadcrumb id="oepkg" :name="appData.name" />
      <!-- 头部信息 -->
      <DetailHead @go-feedback="goFeedback" :data="appData" />

      <div class="detail-row">
        <div class="detail-row-main">
          <AppSection :line="false">
            <div v-if="appData.version" class="version-title">
              <h2>{{ appData.version }}</h2>
              <OTag v-if="appData.isLatestAppVer" color="success">最新版本</OTag>
            </div>

            <!-- 安装指引 -->
            <DetailInstall :title="`> ${t('detail.installation')}`" :options="installTabs" @report-analytics="reportAnalytics" />

            <!-- 更多信息 -->
            <p class="sp">> {{ t('detail.more') }}</p>
            <DetailMoreInfo :options="moreMessge" />
          </AppSection>

          <!-- 反馈 -->
          <AppFeedback
            @report-analytics="reportFeedback"
            :name="appData.name"
            :version="appData.version"
            type="OEPKG"
            :maintainer="maintainer"
            :srcRepo="srcRepo"
          />
        </div>
        <div class="detail-row-side">
          <DetailAside :data="appData" :ver-data="versionSupportData" :tagVer="tagVer" :maintainer="maintainer" :type="'OEPKG'" />
        </div></div
    ></template>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
