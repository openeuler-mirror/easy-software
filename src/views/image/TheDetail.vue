<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { OBreadcrumb, OBreadcrumbItem, OTab, OTabPane, OTag } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT } from '@/@types/app';
import { getDetails, getTags, getVer } from '@/api/api-domain';
import { OPENEULER_CONTACT } from '@/data/config';
import { useLocale } from '@/composables/useLocale';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/DetailHeader.vue';
import DetailAside from '@/components/DetailAside.vue';
import defaultImg from '@/assets/default-logo.png';
import { columnTags, tabList } from '@/data/detail/index';
import { useViewStore } from '@/stores/common';
type MaintainerT = {
  maintainerId: string;
  maintainerEmail: string;
  maintainerGiteeId: string;
};

interface DetailItem {
  name: string;
  value: string | any;
  type?: string;
}

const route = useRoute();
const { mkit } = useMarkdown();
const activeName = ref(tabList[0]);
const basicInfo = ref<DetailItem[]>([]);
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
const queryPkg = (tabValue: string, pkgId: any) => {
  getDetails(tabValue, pkgId)
    .then((res) => {
      const data = res.data.list[0];
      getDetailValue(data);
    })
    .catch(() => {
      useViewStore().showNotFound();
    });
};

// 获取tab分类
const pkgId = encodeURIComponent(route.query.pkgId as string);
const queryEntity = () => {
  getChange();
};
//tab切换

const getChange = () => {
  getPkg('apppkg');
};
const getPkg = (tabValue: string) => {
  queryPkg(tabValue, pkgId);
};

onMounted(() => {
  queryEntity();
  getTitle();
});
const imageUsage = ref();
const summary = ref();
const latestOsSupport = ref();
const license = ref();
const tagVer = ref();
const getDetailValue = (data: any) => {
  basicInfo.value = [
    { name: '架构', value: data.arch || '' },

    { name: '软件包分类', value: data.category || '' },

    { name: '版本支持情况', value: data.osSupport || '' },
  ];
  summary.value = data.description;
  appData.value.size = data.appSize || 0;
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
  queryTags();
  queryVer();
};

const tagsValue = ref();
const queryTags = () => {
  getTags(appData.value.name).then((res) => {
    tagsValue.value = res.data.list;
  });
};
const { locale } = useLocale();

const breadcrumbInfo = ref({ name: '', path: '' });
const getTitle = () => {
  breadcrumbInfo.value = { path: `/${locale.value}/image`, name: '容器镜像' };
};
const home = ref({ name: '软件市场', path: `/${locale.value}/` });

// tags切换功能
const isTags = ref(false);
const onChange = (v: string) => {
  isTags.value = v === 'Tags' ? true : false;
};

//获取支持
const verData = ref();
const queryVer = () => {
  getVer('apppkg', appData.value.name).then((res) => {
    verData.value = res.data.list;
  });
};
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <OBreadcrumb>
      <OBreadcrumbItem :to="home.path">{{ home.name }}</OBreadcrumbItem>
      <OBreadcrumbItem :to="breadcrumbInfo.path">{{ breadcrumbInfo.name }}</OBreadcrumbItem>
      <OBreadcrumbItem>{{ appData.name }} </OBreadcrumbItem>
    </OBreadcrumb>
    <DetailHead :data="appData" :basicInfo="summary" :maintainer="maintainer" />

    <div class="detail-row">
      <div class="detail-row-main" :class="{ tags: isTags }">
        <AppSection>
          <OTab variant="text" @change="onChange" :line="false" class="domain-tabs switch" v-model="activeName">
            <OTabPane class="tab-pane" v-for="item in tabList" :key="item" :label="item">
              <div v-if="item === '概览'">
                <div class="title">
                  <p>> 基本信息</p>
                  <p class="ver">版本号：{{ version }}</p>
                </div>
                <div class="basic-info">
                  <p v-for="item in basicInfo" :key="item.name">
                    <span class="label markdown download">{{ item.name }}</span>
                    <a :href="item.value" v-if="item.name === '所属仓库' || item.name === 'Repo源'" target="_blank">{{ item.type }}</a>
                    <span class="markdown-body mymarkdown-body" v-dompurify-html="item.value" v-copy-code="true">
                      <OTag v-if="item.name === '版本支持情况' && latestOsSupport" color="primary"> 最新版本</OTag>
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
