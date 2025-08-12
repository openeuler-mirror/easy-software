<script lang="ts" setup>
import { ref, onMounted, computed, provide } from 'vue';
import { OTab, OTabPane, isString, OTag, OSelect, OOption } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { MaintainerT, DetailItemT } from '@/@types/app';
import type { ImageDetailT, ImageTagsT } from '@/@types/detail';
import { getDetails, getTags } from '@/api/api-domain';
import { OPENEULER_CONTACT } from '@/data/config';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/detail/DetailHeader.vue';
import DetailAside from '@/components/detail/DetailAside.vue';
import ImageTags from './ImageTags.vue';

import { tagList } from '@/data/detail/index';
import { useViewStore } from '@/stores/common';
import { useI18n } from 'vue-i18n';
import { getCode, windowOpen } from '@/utils/common';

import { pkgIdInjection } from '@/data/injectionKeys';
import useDetailPageAnalytics from '@/composables/useDetailPageAnalytics';

const tabValue = ref('apppkg');
const { t } = useI18n();
const route = useRoute();
const { mkit } = useMarkdown();
const activeName = ref(tagList[0].value);
const basicInfo = ref<DetailItemT[]>([]);

const downloadData = ref('');
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });
const appData = ref({});

const isLoading = ref(true);
const { reportAnalytics, vCopyInstallation, reportFeedback, goFeedback } = useDetailPageAnalytics(appData, basicInfo, 'IMAGE');

//详情请求
const queryPkg = () => {
  if (pkgId.value !== '') {
    getDetails(tabValue.value, pkgId.value)
      .then((res) => {
        const data = res.data.list[0];
        appData.value = data;
        tagsValue.value = data.appVer;
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
const tagVer = ref();
const getDetailValue = (data: ImageDetailT) => {
  const {
    category = '',
    maintainerId = 'openEuler community',
    maintainerEmail = OPENEULER_CONTACT,
    maintainerGiteeId = 'openeuler-ci-bot',
    name,
    osSupport,
    arch,
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

  downloadData.value = mkit(data?.download || '', { isCopy: true, Tag: data.appVer });
  imageUsage.value = mkit(data?.imageUsage || '', { isCopy: true, Tag: data.appVer });

  if (name) {
    queryTags();
  }
};

const tagsList = ref<ImageTagsT[]>([]);
const tagsValue = ref('');
const isTagLoading = ref(false);
const queryTags = () => {
  isTagLoading.value = true;
  getTags(encodeURIComponent(appData.value.name)).then((res) => {
    tagsList.value = res.data.list;
    isTagLoading.value = false;
  });
};
const changeImageVerion = (v: string) => {
  if (v === appData.value?.appVer) {
    return;
  }
  const current = tagsList.value.find((item: ImageTagsT) => item.appVer === v);
  windowOpen(`/zh/image/detail?pkgId=${current.pkgId}`, '_self');
};

// tags切换功能
const isTags = ref(false);
const onChange = (v: string) => {
  isTags.value = v === 'tags' ? true : false;
  reportAnalytics({
    type: 'switch_tab',
    target: v,
  });
  if (tagsList.value.length === 0) {
    queryTags();
  }
};

provide('BASE_INFO', basicInfo);

const tagsOptions = computed(() => {
  return {
    name: appData.value.name,
    os: tagVer.value[0],
    arch: tagVer.value[1],
  };
});

// ---------------------下载埋点--------------------
const onCodeSuccess = () => {
  reportAnalytics({
    type: 'install_guide',
    target: '获取应用镜像',
  });
};

const onImageTagsCmdCopy = (data: Record<string, any>) => {
  reportAnalytics({
    ...data,
    type: 'tags_cmd_copy',
  });
};
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <DetailSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 锚点 -->
      <AppBreadcrumb id="image" :name="appData.name" />

      <DetailHead @go-feedback="goFeedback" :data="appData" />

      <div class="detail-row">
        <div class="detail-row-main" :class="{ tags: isTags }">
          <AppSection>
            <div v-if="appData.appVer" class="version-title">
              <h2>{{ appData.appVer }}</h2>
              <OTag v-if="appData.isLatestAppVer" color="success">最新版本</OTag>
              <div class="software-version">
                软件版本
                <OSelect v-model="tagsValue" @change="changeImageVerion">
                  <OOption v-for="item in tagsList" :key="item.pkgId" :value="item.appVer" :label="item.appVer">{{ item.appVer }}</OOption>
                </OSelect>
              </div>
            </div>

            <OTab variant="text" @change="onChange" :line="false" class="domain-tabs tabs-switch" v-model="activeName">
              <OTabPane class="tab-pane" v-for="item in tagList" :key="item.value" :label="item.lable" :value="item.value">
                <template v-if="item.value === tagList[0].value">
                  <!-- 使用方式 -->

                  <div v-if="downloadData" class="image-code">
                    <p class="sp">> 获取应用镜像</p>
                    <OCodeCopy :code="getCode(downloadData)" @success="onCodeSuccess" />
                  </div>

                  <p class="sp">> {{ t('detail.usage') }}</p>
                  <div v-if="imageUsage" v-copy-installation v-dompurify-html="imageUsage" v-copy-code="true" class="markdown-body download"></div>
                </template>
                <ImageTags @copy="onImageTagsCmdCopy" v-else :data="tagsList" :options="tagsOptions" :loading="isTagLoading" />
              </OTabPane>
            </OTab>
          </AppSection>

          <AppFeedback
            v-if="!isTags"
            @report-analytics="reportFeedback"
            :name="appData.name"
            :version="appData.version"
            type="应用镜像"
            :maintainer="maintainer"
            :srcRepo="appData.srcRepo"
          />
        </div>
        <div v-if="!isTags" class="detail-row-side">
          <DetailAside :data="appData" :type="'IMAGE'" :downloadData="downloadData" :maintainer="maintainer" :tagVer="tagVer" />
        </div>
      </div>
    </template>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
.tabs-switch {
  margin-top: 24px;
}
.software-version {
  color: var(--o-color-info2);
}
</style>
