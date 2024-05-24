<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { OBreadcrumb, OBreadcrumbItem, OTab, OTabPane, OTable, OLink, OIcon, OTag } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { getDetails, getDetail, getTags, getVer } from '@/api/api-domain';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT } from '@/@types/app';
import { OPENEULER_CONTACT } from '@/data/config';
import { useLocale } from '@/composables/useLocale';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '../applicationsPackage/components/DetailNewHead.vue';
import ExternalLink from '@/components/ExternalLink.vue';
import DetailAside from '../applicationsPackage/components/DetailAside.vue';
import defaultImg from '@/assets/default-logo.png';
import IconEpkg from '~icons/pkg/epkg.svg';
import IconImage from '~icons/pkg/image.svg';
import IconRpm from '~icons/pkg/rpm.svg';
import { columnTags } from '@/data/detail/index';
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();
const route = useRoute();
const { mkit } = useMarkdown();

const activeName = ref();
const typePkg = ref();
const basicInfo = ref<DetailItem[]>([]);
const version = ref();
const installation = ref('');
const downloadData = ref('');
const files = ref([]);
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
  getDetails(tabValue, pkgId).then((res) => {
    const data = res.data.list[0];
    getDetailValue(data);
    
  });
};

// 获取tab分类
const tabList = ref<string[]>([]);
const pkgId = ref('');
const epkgData = ref();
const rpmData = ref();
const imgData = ref();
const queryEntity = () => {
  activeName.value = route.query.type as string;
  if (pkgId.value) {
    getDetail({
      appPkgId: encodeURIComponent(route.query.appPkgId as string) || '',
      epkgPkgId: encodeURIComponent(route.query.epkgPkgId as string) || '',
      rpmPkgId:encodeURIComponent(route.query.rpmPkgId as string) || '',
    })
      .then((res) => {
        const data = res.data;
        tabList.value = data.tags;
        epkgData.value = data['EPKG'];
        rpmData.value = data['RPM'];
        imgData.value = data['IMAGE'];
        onChange(activeName.value);
      })
      .catch(() => {
        useViewStore().showNotFound();
      });
  } else {
    getChange(activeName.value);
    tabList.value = [activeName.value];
  }
};

//tab切换
const tabValue = ref();
const onChange = (tab: string) => {
  if (tab === 'RPM') {
    tabValue.value = 'rpmpkg';
    typePkg.value = 'RPM';
    getDetailValue(rpmData.value);
    queryVer();
    
  } else if (tab === 'EPKG') {
    tabValue.value = 'epkgpkg';
    typePkg.value = 'EPKG';
    getDetailValue(epkgData.value);
    queryVer();
  } else if (tab === 'IMAGE') {
    tabValue.value = 'apppkg';
    typePkg.value = 'IMAGE';
    getDetailValue(imgData.value);
    queryVer();
  } else {
    useViewStore().showNotFound();
  }
 
};
const getChange = (tab: string) => {
  if (tab === 'RPM') {
    tabValue.value = 'rpmpkg';
    typePkg.value = 'RPM';
  } else if (tab === 'EPKG') {
    tabValue.value = 'epkgpkg';
    typePkg.value = 'EPKG';
  } else if (tab === 'IMAGE') {
    tabValue.value = 'apppkg';
    typePkg.value = 'IMAGE';
  }
  getPkg(tabValue.value);
};
const getPkg = (tabValue: string) => {
  queryPkg(tabValue, pkgId.value);
};

onMounted(() => {
  pkgId.value = location.pathname.split('/')[3];
  queryEntity();
  getTitle();
});
const imageUsage = ref();
const license = ref();
const latestOsSupport = ref();
const tagVer = ref();
const summary = ref();
const getDetailValue = (data: any) => {
  if (typePkg.value === 'RPM') {
    basicInfo.value = [
      { name: 'Description', value: data?.description },
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.rpmCategory || '其他' },
      { name: '所属仓库', value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
      { name: 'Repo源', value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
    ];
    moreMessge.value = [
      { name: 'Requires', value: JSON.parse(data?.requires || '') },
      { name: 'Provides', value: JSON.parse(data?.provides || '') },
      { name: 'Conflicts', value: JSON.parse(data?.conflicts || '') },
    ];
    appData.value.size = data.rpmSize || 0;
    summary.value = data.summary;
    version.value = data?.version;
  } else if (typePkg.value === 'EPKG') {
    basicInfo.value = [
      { name: 'Description', value: data?.description },
      { name: '版本号', value: data.version },
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.epkgCategory || '其他' },
      { name: '所属仓库', value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
      { name: 'Repo源', value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
    ];
    files.value = JSON.parse(data?.files);
    moreMessge.value = [
      { name: 'Requires', value: JSON.parse(data?.requires || '') },
      { name: 'Provides', value: JSON.parse(data?.provides || '') },
      { name: 'Conflicts', value: JSON.parse(data?.conflicts || '') },
    ];
    appData.value.size = data.epkgSize || 0;
    summary.value = data.summary;
    version.value = data?.version;
  } else {
    basicInfo.value = [
      { name: '架构', value: data.arch || '' },

      { name: '软件包分类', value: data.category || '' },

      { name: '版本支持情况', value: data.osSupport || '' },
    ];
    appData.value.size = data.appSize || 0;
    latestOsSupport.value = data.latestOsSupport;
    summary.value = data.description;
    version.value = data?.appVer;
  }
  tagVer.value = [data.osSupport, data.arch];
  maintainer.value = {
    maintainerId: data?.maintainerId || 'openEuler community',
    maintainerEmail: data?.maintainerEmail || OPENEULER_CONTACT,
    maintainerGiteeId: data?.maintainerGiteeId || 'openeuler-ci-bot',
  };

  upStream.value = data?.upStream;
  security.value = data?.securityLevel;
  description.value = data?.description;
  license.value = data.license;
  downloadData.value = mkit(data?.download || '', { isCopy: true, Tag: data.appVer });
  installation.value = mkit(data?.installation || '', { isCopy: true, Tag: data.appVer });

  imageUsage.value = mkit(data?.imageUsage || '', { isCopy: true, Tag: data.appVer });
  appData.value.name = data.name;
  appData.value.source_code = data.srcDownloadUrl;
  appData.value.bin_code = data.binDownloadUrl;
  appData.value.cover = data?.iconUrl || defaultImg;
  appData.value.repository = data.srcRepo;
  queryTags();
};

// 更多信息表头
const moreColumns = [
  { label: 'Name', key: 'name' },
  { label: 'Flags', key: 'flags' },
  { label: 'Rel', key: 'rel' },
  { label: 'Ver', key: 'ver' },
  { label: 'Epoch', key: 'epoch' },
];
// 获取img分类
const imgList = ref<string[]>(['概览', 'Tags']);
const imgName = ref('概览');
const tagsValue = ref();
const queryTags = () => {
  getTags(appData.value.name).then((res) => {
    tagsValue.value = res.data.list;
  });
};
const { locale } = useLocale();
const breadcrumbInfo = ref({ name: '', path: '' });
const getTitle = () => {
  breadcrumbInfo.value = { path: `/${locale.value}/applicationsPackage`, name: '领域应用' };
};
const home = ref({ name: '软件市场', path: `/${locale.value}/` });

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  showExternalDlg.value = true;
};

const getTabIcon = (tab: string) => {
  if (tab === 'RPM') {
    return IconRpm;
  } else if (tab === 'EPKG') {
    return IconEpkg;
  } else if (tab === 'IMAGE') {
    return IconImage;
  }
};

//获取支持
const verData = ref();
const queryVer = () => {
  getVer(tabValue.value, appData.value.name).then((res) => {
    verData.value = res.data.list;
  });
};

// tags切换功能
const isTags = ref(false);
const onChangeImage = (v: string) => {
  isTags.value = v === 'Tags' ? true : false;
};

const repeatTags = (v: string) => {
  return v.toLocaleLowerCase() === 'image' ? t('software.apppkg') : v;
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

    <OTab variant="text" @change="onChange" :line="false" class="domain-tabs" v-model="activeName" size="large">
      <OTabPane class="tab-pane" v-for="item in tabList" :key="item" :label="item">
        <template #nav><OIcon :icon="getTabIcon(item)" class="tabs-icon" /> {{ repeatTags(item) }}</template>
        <div class="detail-row">
          <div class="detail-row-main" :class="{ tags: isTags }">
            <AppSection v-if="item !== 'IMAGE'">
              <div class="title">
                <p>> 基本信息</p>
                <p v-if="item === 'RPM'" class="ver">版本号：{{ version }}</p>
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
              <p class="sp" v-if="item !== 'IMAGE'">> 更多信息</p>
              <OTab variant="text" :line="false" class="domain-tabs switch" v-if="item !== 'IMAGE'">
                <template v-for="it in moreMessge" :key="it">
                  <OTabPane class="tab-pane" v-if="it.value.length > 0" :label="it.name">
                    <OTable :columns="moreColumns" :data="it.value" :small="true"> </OTable>
                  </OTabPane>
                </template>
              </OTab>
            </AppSection>
            <AppSection v-else>
              <OTab variant="text" @change="onChangeImage" :line="false" class="domain-tabs switch" v-model="imgName">
                <OTabPane class="tab-pane" v-for="item in imgList" :key="item" :label="item">
                  <div v-if="item === '概览'">
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
                          class="markdown-body"
                          >{{ item.type }}</OLink
                        >
                        <span class="markdown-body installation mymarkdown-body" v-dompurify-html="item.value" v-copy-code="true" v-else>
                          <OTag v-if="item.name === '版本支持情况' && latestOsSupport" color="primary"> 最新版本</OTag>
                        </span>
                      </p>
                    </div>
                    <p class="sp">> 使用方式</p>
                    <div v-if="imageUsage" v-dompurify-html="imageUsage" v-copy-code="true" class="markdown-body download"></div>
                  </div>
                  <div v-else>
                    <OTableItemNew :data="tagsValue" :columns="columnTags" />
                  </div>
                </OTabPane>
              </OTab>
            </AppSection>
            <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
            <AppFeedback v-if="!isTags" :email="maintainer.maintainerEmail" />
          </div>
          <div v-if="!isTags" class="detail-row-side">
            <DetailAside
              :data="appData"
              :basicInfo="basicInfo"
              :maintainer="maintainer"
              :type="item"
              :downloadData="downloadData"
              :all-show="true"
              :ver-data="verData"
              :license="license"
              :tagVer="tagVer"
            />
          </div>
        </div>
      </OTabPane>
    </OTab>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/detail/index.scss';
</style>
