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

const route = useRoute();
const { t } = useI18n();

const basicInfo = ref<DetailItemT[]>([]);
const installation = ref('');
const tabValue = ref('epkgpkg');
const downloadData = ref('');
const files = ref([]);
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });
const moreMessge = ref<MoreMessgeT[]>([]);
const appData = ref({});

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
      { name: t('detail.osSupport'), value: data.osSupport },
      { name: t('detail.arch'), value: data.arch },
      { name: t('detail.epkgCategory'), value: data.epkgCategory || '其他' },
      { name: t('detail.repo'), value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
      { name: t('detail.repoType'), value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
    ];
  } catch (res) {
    basicInfo.value = [];
  }
  files.value = JSON.parse(data?.files);

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

  maintainer.value = {
    maintainerId: data?.maintainerId || maintainerDefaults.name,
    maintainerEmail: data?.maintainerEmail || maintainerDefaults.email,
    maintainerGiteeId: data?.maintainerGiteeId || maintainerDefaults.id,
  };

  downloadData.value = mkit(data?.download || '', { isCopy: true, Tag: data.appVer });
  installation.value = mkit(data?.installation || '', { isCopy: true, Tag: data.appVer });

  queryVer();
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
          href: appData.value.srcDownloadUrl,
          type: 'source_code',
          label: '源码包下载',
        },
        {
          href: appData.value.binDownloadUrl,
          type: 'binary',
          label: '二进制包下载',
        },
      ],
    },
  ];
});
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <DetailSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 锚点 -->
      <AppBreadcrumb id="epkg" :name="appData.name" />
      <!-- 头部信息 -->
      <DetailHead :data="appData" />

      <div class="detail-row">
        <div class="detail-row-main">
          <AppSection>
            <div v-if="appData.version" class="version-title">
              <h2>{{ appData.version }}</h2>
              <OTag color="success">最新版本</OTag>
            </div>

            <!-- 安装指引 -->
            <DetailInstall :title="`> ${t('detail.installation')}`" :options="installTabs" />

            <!-- 更多信息 -->
            <p class="sp">> {{ t('detail.more') }}</p>
            <DetailMoreInfo :options="moreMessge" />
          </AppSection>

          <!-- 反馈 -->
          <AppFeedback :name="appData.name" :version="appData.version" type="EPKG" :maintainer="maintainer" :srcRepo="srcRepo" />
        </div>
        <div class="detail-row-side">
          <DetailAside :data="appData" :ver-data="verData" :tagVer="tagVer" :type="'EPKG'" />
        </div>
      </div>
    </template>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
