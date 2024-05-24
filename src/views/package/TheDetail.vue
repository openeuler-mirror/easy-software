<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { OBreadcrumb, OBreadcrumbItem, OTab, OTabPane, OTable, OLink } from '@opensig/opendesign';
import { OPENEULER_CONTACT } from '@/data/config';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT } from '@/@types/app';
import { useLocale } from '@/composables/useLocale';
import { getDetails, getVer } from '@/api/api-domain';
import defaultImg from '@/assets/default-logo.png';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/DetailHeader.vue';
import DetailAside from '@/components/DetailAside.vue';
import ExternalLink from '@/components/ExternalLink.vue';
import { moreColumns } from '@/data/detail/index';
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
const basicInfo = ref<DetailItem[]>([]);
const version = ref();
const installation = ref('');
const downloadData = ref('');
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });
const upStream = ref();
const security = ref();
const moreMessge = ref<DetailItem[]>([]);
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

const pkgId = (route.query.pkgId as string);
const queryEntity = () => {
  getChange();
};

const getChange = () => {
  getPkg('rpmpkg');
};
const getPkg = (tabValue: string) => {
  queryPkg(tabValue, pkgId);
};

onMounted(() => {
  queryEntity();
  getTitle();
});
const summary = ref();
const license = ref();
const tagVer = ref();
const getDetailValue = (data: any) => {
  basicInfo.value = [
    { name: '详细描述', value: data?.description },
    { name: '版本支持情况', value: data.osSupport },
    { name: '架构', value: data.arch },
    { name: '软件包分类', value: data.epkgCategory || '其他' },
    { name: '所属仓库', value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
    { name: 'Repo源', value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
  ];
  summary.value = data.summary;
  moreMessge.value = [
    { name: 'Requires', value: JSON.parse(data?.requires || '') },
    { name: 'Provides', value: JSON.parse(data?.provides || '') },
    { name: 'Conflicts', value: JSON.parse(data?.conflicts || '') },
  ];
  appData.value.size = data.rpmSize;
  tagVer.value = [data.osSupport, data.arch];
  maintainer.value = {
    maintainerId: data?.maintainerId || 'openEuler community',
    maintainerEmail: data?.maintainerEmail || OPENEULER_CONTACT,
    maintainerGiteeId: data?.maintainerGiteeId || 'openeuler-ci-bot',
  };
  version.value = data?.version;
  license.value = data.license;
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
  queryVer();
};

const { locale } = useLocale();

const breadcrumbInfo = ref({ name: '', path: '' });
const getTitle = () => {
  breadcrumbInfo.value = { path: `/${locale.value}/package`, name: 'RPM' };
};
const home = ref({ name: '软件市场', path: `/${locale.value}/` });

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  showExternalDlg.value = true;
};

//获取支持
const verData = ref();
const queryVer = () => {
  getVer('rpmpkg', appData.value.name).then((res) => {
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
      <div class="detail-row-main">
        <AppSection>
          <div class="title">
            <p>> 基本信息</p>
            <p class="ver">版本号：{{ version }}</p>
          </div>
          <div class="basic-info">
            <p v-for="item in basicInfo" :key="item.name">
              <span class="label markdown download">{{ item.name }}</span>
              <OLink
                @click="onExternalDialog(item.value)"
                color="primary"
                v-if="item.name === '所属仓库' || item.name === 'Repo源'"
                target="_blank"
                rel="noopener noreferrer"
                class="mymarkdown-body"
                >{{ item.type }}</OLink
              >
              <span class="markdown-body installation mymarkdown-body" v-dompurify-html="item.value" v-copy-code="true" v-else></span>
            </p>
          </div>
          <p class="sp">> 安装指引</p>
          <div v-if="installation" v-dompurify-html="installation" v-copy-code="true" class="markdown-body installation"></div>
          <p class="sp">> 更多信息</p>
          <OTab variant="text" :line="false" class="domain-tabs switch">
            <template v-for="item in moreMessge" :key="item">
              <OTabPane class="tab-pane" v-if="item.value.length > 0" :label="item.name">
                <OTable :columns="moreColumns" :data="item.value" :small="true"> </OTable>
              </OTabPane>
            </template>
          </OTab>
        </AppSection>
        <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
        <AppFeedback :email="maintainer.maintainerEmail" />
      </div>
      <div class="detail-row-side">
        <DetailAside :data="appData" :basicInfo="basicInfo" :maintainer="maintainer" :ver-data="verData" :license="license" :tagVer="tagVer" :type="'RPM'" />
      </div>
    </div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/detail/index.scss';
</style>
