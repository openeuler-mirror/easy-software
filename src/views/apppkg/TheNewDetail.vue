<script lang="ts" setup>
import { ref, onMounted, type PropType } from 'vue';
import { OTab, OTabPane, OTable, OLink, OIcon, OTag } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { getDetail, getTags, getVer } from '@/api/api-domain';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT, MaintainerT, DetailItemT, MoreMessgeT, PkgTypeT } from '@/@types/app';
import { OPENEULER_CONTACT } from '@/data/config';
import { isValidTags } from '@/utils/query';
import { columnTags, tagList } from '@/data/detail/index';
import { useI18n } from 'vue-i18n';
import { useViewStore } from '@/stores/common';
import { getDetailRules } from '@/utils/common';

import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/DetailHeader.vue';
import ExternalLink from '@/components/ExternalLink.vue';
import DetailAside from '@/components/DetailAside.vue';
import defaultImg from '@/assets/default-logo.png';
import IconEpkg from '~icons/pkg/epkg.svg';
import IconImage from '~icons/pkg/image.svg';
import IconRpm from '~icons/pkg/rpm.svg';

const { t } = useI18n();
const route = useRoute();
const { mkit } = useMarkdown();

const activeName = ref();
const typePkg = ref();
const basicInfo = ref<DetailItemT[]>([]);
const version = ref();
const installation = ref('');
const downloadData = ref('');
const files = ref([]);
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });
const upStream = ref();
const security = ref();
const moreMessge = ref<MoreMessgeT[]>([]);
const description = ref();
const appData = ref<AppInfoT>({
  name: '',
  cover: '',
  repository: '',
  size: '',
  source_code: '',
  bin_code: '',
});

// 获取tab分类
const tabList = ref([] as PropType<PkgTypeT>);
const pkgId = ref('');
const epkgData = ref();
const rpmData = ref();
const imgData = ref();
const queryEntity = () => {
  const query = route.query;
  const { type, appPkgId, epkgPkgId, rpmPkgId } = query;

  getDetail(
    getDetailRules({
      appPkgId: (appPkgId as string) || '',
      epkgPkgId: (epkgPkgId as string) || '',
      rpmPkgId: (rpmPkgId as string) || '',
    })
  )
    .then((res) => {
      const data = res.data;
      tabList.value = data.tags;
      epkgData.value = data['EPKG'];
      rpmData.value = data['RPM'];
      imgData.value = data['IMAGE'];
      pkgId.value = data[data.tags[0]].name;
      if (isValidTags(type)) {
        activeName.value = type?.toString();
      } else {
        activeName.value = data.tags[0];
      }

      onChange(activeName.value);
    })
    .catch(() => {
      useViewStore().showNotFound();
    });
};

//tab切换
const tabValue = ref();
const onChange = (tab: string) => {
  if (tab === 'RPM') {
    tabValue.value = 'rpmpkg';
    typePkg.value = 'RPM';
    queryVer();
    getDetailValue(rpmData.value);
  } else if (tab === 'EPKG') {
    tabValue.value = 'epkgpkg';
    typePkg.value = 'EPKG';
    queryVer();
    getDetailValue(epkgData.value);
  } else if (tab === 'IMAGE') {
    tabValue.value = 'apppkg';
    typePkg.value = 'IMAGE';
    queryVer();
    getDetailValue(imgData.value);
  } else {
    useViewStore().showNotFound();
  }
};

onMounted(() => {
  queryEntity();
});
const imageUsage = ref();
const license = ref();
const latestOsSupport = ref();
const tagVer = ref();
const summary = ref();
const getDetailValue = (data: any) => {
  if (typePkg.value === 'RPM') {
    basicInfo.value = [
      { name: '详细描述', value: data?.description },
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.rpmCategory || '其他' },
      { name: '所属仓库', value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
      { name: 'Repo源', value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
    ];
    const newData = [
      { name: 'Requires', value: JSON.parse(data?.requires || '') },
      { name: 'Provides', value: JSON.parse(data?.provides || '') },
      { name: 'Conflicts', value: JSON.parse(data?.conflicts || '') },
    ];
    moreMessge.value = [];
    // 过滤空数据
    newData.forEach((item) => {
      if (item.value.length > 0) {
        moreMessge.value.push(item);
      }
    });

    appData.value.size = data.rpmSize || 0;
    summary.value = data.summary;
    version.value = data?.version;
  } else if (typePkg.value === 'EPKG') {
    basicInfo.value = [
      { name: '详细描述', value: data?.description },
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.epkgCategory || '其他' },
      { name: '所属仓库', value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
      { name: 'Repo源', value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
    ];
    files.value = JSON.parse(data?.files);
    const newData = [
      { name: 'Requires', value: JSON.parse(data?.requires || '') },
      { name: 'Provides', value: JSON.parse(data?.provides || '') },
      { name: 'Conflicts', value: JSON.parse(data?.conflicts || '') },
    ];
    moreMessge.value = [];
    // 过滤空数据
    newData.forEach((item) => {
      if (item.value.length > 0) {
        moreMessge.value.push(item);
      }
    });

    appData.value.size = data.epkgSize || 0;
    summary.value = data.summary;
    version.value = data?.version;
  } else if (typePkg.value === 'IMAGE') {
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
const imgName = ref(tagList[0].lable);
const tagsValue = ref([]);
const queryTags = () => {
  getTags(encodeURIComponent(pkgId.value)).then((res) => {
    tagsValue.value = res.data.list;
  });
};

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
  getVer(tabValue.value, encodeURIComponent(pkgId.value)).then((res) => {
    verData.value = res.data.list;
  });
};

// tags切换功能
const isTags = ref(false);
const onChangeImage = (v: string) => {
  isTags.value = v === 'Tags' ? true : false;
  if (tagsValue.value.length === 0) {
    queryTags();
  }
};

const repeatTags = (v: string) => {
  return v.toLocaleLowerCase() === 'image' ? t('software.apppkg') : v;
};
</script>
<template>
  <ContentWrapper vertical-padding="24px">
    <AppBreadcrumb id="apppkg" :name="appData.name" />

    <DetailHead :data="appData" :basicInfo="summary" :maintainer="maintainer" />

    <OTab variant="text" @change="onChange" :line="false" class="domain-tabs" :class="tabList.length === 1 ? 'apppkg' : ''" v-model="activeName" size="large">
      <OTabPane class="tab-pane" v-for="item in tabList" :key="item" :label="item">
        <template #nav><OIcon :icon="getTabIcon(item)" class="tabs-icon" /> {{ repeatTags(item) }}</template>
        <div class="detail-row">
          <div class="detail-row-main" :class="{ tags: isTags }">
            <AppSection v-if="item !== 'IMAGE'">
              <div class="title">
                <p>> 基本信息</p>
                <p v-if="item === 'RPM' || version" class="ver">版本号：{{ version }}</p>
              </div>
              <div class="basic-info">
                <p v-for="item in basicInfo" :key="item.name">
                  <span class="label markdown download">{{ item.name }}</span>
                  <OLink
                    @click="onExternalDialog(item.value)"
                    color="primary"
                    v-if="item.name === t('detail.warehouse') || item.name === t('detail.source')"
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
              <OTab variant="text" :line="false" class="domain-tabs" v-if="item !== 'IMAGE'" :class="moreMessge.length > 1 ? 'tabs-switch' : 'tabs-one'">
                <template v-for="it in moreMessge" :key="it">
                  <OTabPane class="tab-pane" v-if="it.value.length > 0" :label="it.name">
                    <OTable :columns="moreColumns" :data="it.value" :small="true" border="all"> </OTable>
                  </OTabPane>
                </template>
              </OTab>
            </AppSection>
            <AppSection v-else>
              <OTab variant="text" @change="onChangeImage" :line="false" class="domain-tabs tabs-switch" v-model="imgName">
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
