<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { OTab, OTabPane, OTag, isString } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT, MaintainerT, DetailItemT } from '@/@types/app';
import type { ImageDetailT } from '@/@types/detail';
import { getDetails, getTags, getVer } from '@/api/api-domain';
import { OPENEULER_CONTACT } from '@/data/config';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/DetailHeader.vue';
import DetailAside from '@/components/DetailAside.vue';
import defaultImg from '@/assets/default-logo.png';
import { columnTags, tagList } from '@/data/detail/index';
import { useViewStore } from '@/stores/common';
import { useI18n } from 'vue-i18n';

const tabValue = ref('apppkg');
const { t } = useI18n();
const route = useRoute();
const { mkit } = useMarkdown();
const activeName = ref(tagList[0].lable);
const basicInfo = ref<DetailItemT[]>([]);
const version = ref();
const installation = ref('');
const downloadData = ref('');
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });
const upStream = ref();
const security = ref();
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
  getDetails(tabValue.value, pkgId.value)
    .then((res) => {
      const data = res.data.list[0];
      getDetailValue(data);
    })
    .catch(() => {
      // useViewStore().showNotFound();
    });
};

const pkgId = ref('');
if (isString(route.query?.pkgId)) {
  pkgId.value = encodeURIComponent(route.query?.pkgId.toString());
}
onMounted(() => {
  queryPkg();
});

const imageUsage = ref();
const summary = ref();
const latestOsSupport = ref();
const license = ref();
const tagVer = ref();
const getDetailValue = (data: ImageDetailT) => {
  basicInfo.value = [
    { name: '架构', value: data.arch || '' },
    { name: '软件包分类', value: data.category || '' },
    { name: '版本支持情况', value: data.osSupport || '' },
  ];
  summary.value = data.description;
  appData.value.size = data.appSize || '';
  maintainer.value = {
    maintainerId: data?.maintainerId || 'openEuler community',
    maintainerEmail: data?.maintainerEmail || OPENEULER_CONTACT,
    maintainerGiteeId: data?.maintainerGiteeId || 'openeuler-ci-bot',
  };
  tagVer.value = [data.osSupport, data.arch];
  license.value = data.license;
  version.value = data?.appVer;
  latestOsSupport.value = data.latestOsSupport;
  upStream.value = data?.upStream;
  security.value = data?.securityLevel;
  description.value = data?.description;
  downloadData.value = mkit(data?.download || '', { isCopy: true, Tag: data.appVer });
  installation.value = mkit(data?.installation || '', { isCopy: true, Tag: data.appVer });
  imageUsage.value = mkit(data?.imageUsage || '', { isCopy: true, Tag: data.appVer });
  appData.value.name = data.name;
  appData.value.source_code = data.srcDownloadUrl;
  appData.value.bin_code = data.binDownloadUrl;
  appData.value.cover = data?.iconUrl || defaultImg;
  appData.value.repository = data.srcRepo;
  if (data.name) {
    queryVer();
  }
};

const tagsValue = ref([]);
const queryTags = () => {
  getTags(encodeURIComponent(appData.value.name)).then((res) => {
    tagsValue.value = res.data.list;
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
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <!-- 锚点 -->
    <AppBreadcrumb id="image" :name="appData.name" />

    <DetailHead :data="appData" :basicInfo="summary" :maintainer="maintainer" />

    <div class="detail-row">
      <div class="detail-row-main" :class="{ tags: isTags }">
        <AppSection>
          <OTab variant="text" @change="onChange" :line="false" class="domain-tabs tabs-switch" v-model="activeName">
            <OTabPane class="tab-pane" v-for="item in tagList" :key="item" :label="item.lable">
              <div v-if="item.lable === tagList[0].lable">
                <div class="title">
                  <p>> 基本信息</p>
                  <p v-if="version" class="ver">版本号：{{ version }}</p>
                </div>
                <div class="basic-info">
                  <p v-for="item in basicInfo" :key="item.name">
                    <span class="label markdown download">{{ item.name }}</span>

                    <span class="markdown-body mymarkdown-body">
                      {{ item.value }}
                      <OTag v-if="item.name === t('detail.support') && latestOsSupport" color="primary" size="small"> 最新版本</OTag>
                    </span>
                  </p>
                </div>
                <p class="sp">> 安装指引</p>
                <div v-if="imageUsage" v-dompurify-html="imageUsage" v-copy-code="true" class="markdown-body download"></div>
              </div>
              <div v-else>
                <OTableItemNew :data="tagsValue" :columns="columnTags" />
              </div>
            </OTabPane>
          </OTab>
        </AppSection>
        <AppFeedback v-if="!isTags" :email="maintainer.maintainerEmail" />
      </div>
      <div v-if="!isTags" class="detail-row-side">
        <DetailAside
          :data="appData"
          :basicInfo="basicInfo"
          :maintainer="maintainer"
          :type="'IMAGE'"
          :downloadData="downloadData"
          :ver-data="verData"
          :license="license"
          :tagVer="tagVer"
        />
      </div>
    </div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/detail/index.scss';
</style>
