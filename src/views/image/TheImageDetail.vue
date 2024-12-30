<script lang="ts" setup>
import { ref, onMounted, computed, provide } from 'vue';
import { OTab, OTabPane, isString } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT, MaintainerT, DetailItemT } from '@/@types/app';
import type { ImageDetailT } from '@/@types/detail';
import { getDetails, getTags, getVer } from '@/api/api-domain';
import { OPENEULER_CONTACT } from '@/data/config';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/detail/DetailHeader.vue';
import DetailAside from '@/components/detail/DetailAside.vue';
import ImageTags from './ImageTags.vue';

import { tagList } from '@/data/detail/index';
import { useViewStore } from '@/stores/common';
import { useI18n } from 'vue-i18n';
import { getCode } from '@/utils/common';

import defaultImg from '@/assets/default-logo.png';
import { pkgIdInjection } from '@/data/injectionKeys';
import { oa } from '@/shared/analytics';

const tabValue = ref('apppkg');
const { t } = useI18n();
const route = useRoute();
const { mkit } = useMarkdown();
const activeName = ref(tagList[0].lable);
const basicInfo = ref<DetailItemT[]>([]);
const installation = ref('');
const downloadData = ref('');
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });
const appData = ref<AppInfoT>({
  name: '',
  license: '',
  version: '',
  cover: '',
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
        srcRepo.value = data.srcRepo;
        getDetailValue(data);
        isLoading.value = false;
      })
      .catch(() => {
        isLoading.value = false;
        useViewStore().showNotFound();
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

const imageUsage = ref();
const summary = ref();
const latestSupportOs = ref();
const tagVer = ref();
const getDetailValue = (data: ImageDetailT) => {
  const {
    category = '',
    description,
    maintainerId = 'openEuler community',
    maintainerEmail = OPENEULER_CONTACT,
    maintainerGiteeId = 'openeuler-ci-bot',
    license,
    appVer,
    latestOsSupport = false,
    securityLevel,
    name,
    srcDownloadUrl,
    binDownloadUrl,
    iconUrl,
    srcRepo,
    security,
    osSupport,
    arch,
    appSize,
  } = data;

  tagVer.value = [osSupport, arch];

  basicInfo.value = [
    { name: '版本支持情况', value: osSupport },
    { name: '架构', value: arch },
    { name: t('detail.epkgCategory'), value: category },
  ];

  maintainer.value = {
    maintainerId,
    maintainerEmail,
    maintainerGiteeId,
  };

  summary.value = description;
  latestSupportOs.value = latestOsSupport;

  downloadData.value = mkit(data?.download || '', { isCopy: true, Tag: data.appVer });
  installation.value = mkit(data?.installation || '', { isCopy: true, Tag: data.appVer });
  imageUsage.value = mkit(data?.imageUsage || '', { isCopy: true, Tag: data.appVer });

  appData.value = {
    name: name,
    source_code: srcDownloadUrl,
    bin_code: binDownloadUrl,
    cover: iconUrl || defaultImg,
    repository: srcRepo,
    size: appSize,
    license: license,
    version: appVer,
    security: security,
  };

  if (name) {
    queryVer();
  }
};

const tagsValue = ref([]);
const isTagLoading = ref(false);
const queryTags = () => {
  isTagLoading.value = true;
  getTags(encodeURIComponent(appData.value.name)).then((res) => {
    tagsValue.value = res.data.list;
    isTagLoading.value = false;
  });
};

// tags切换功能
const isTags = ref(false);
const onChange = (v: string) => {
  isTags.value = v === 'Tags' ? true : false;

  if (tagsValue.value.length === 0) {
    queryTags();
  }
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

const tagsOptions = computed(() => {
  return {
    name: appData.value.name,
    os: tagVer.value[0],
    arch: tagVer.value[1],
  };
});

// ---------------------下载埋点--------------------
const onCodeSuccess = () => {
  const { href } = window.location;
  const downloadTime = new Date();
  oa.report('download', () => ({
    origin: href,
    softwareName: appData.value.name,
    version: appData.value.version,
    pkgId: route.query.pkgId as string,
    type: 'IMAGE',
    downloadTime,
  }));
};
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <DetailSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 锚点 -->
      <AppBreadcrumb id="image" :name="appData.name" />

      <DetailHead :data="appData" :basicInfo="summary" :maintainer="maintainer" />

      <div class="detail-row">
        <div class="detail-row-main" :class="{ tags: isTags }">
          <AppSection>
            <OTab variant="text" @change="onChange" :line="false" class="domain-tabs tabs-switch" v-model="activeName">
              <OTabPane class="tab-pane" v-for="item in tagList" :key="item.value" :label="item.lable">
                <template v-if="item.value === tagList[0].value">
                  <!-- 基本信息 -->
                  <AppSection :title="`> ${t('detail.information')}`">
                    <template #append>
                      <span v-if="appData.version" class="ver">{{ t('detail.number') }}:{{ appData.version }}</span>
                    </template>

                    <DetailBasicInfo :options="basicInfo" />
                  </AppSection>

                  <!-- 使用方式 -->
                  <DetailInstall :title="`> ${t('detail.usage')}`">
                    <div v-if="downloadData" class="image-code">
                      <p class="text">获取应用镜像</p>
                      <OCodeCopy :code="getCode(downloadData)" @success="onCodeSuccess" />
                    </div>
                    <div v-if="imageUsage" v-dompurify-html="imageUsage" v-copy-code="true" class="markdown-body download"></div>
                  </DetailInstall>
                </template>
                <ImageTags v-else :data="tagsValue" :options="tagsOptions" :loading="isTagLoading" />
              </OTabPane>
            </OTab>
          </AppSection>
          <AppFeedback v-if="!isTags" :name="appData.name" :version="appData.version" type="应用镜像" :maintainer="maintainer" :srcRepo="srcRepo" />
        </div>
        <div v-if="!isTags" class="detail-row-side">
          <DetailAside :data="appData" :type="'IMAGE'" :downloadData="downloadData" :ver-data="verData" :tagVer="tagVer" />
        </div>
      </div>
    </template>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
