<script lang="ts" setup>
import { ref, onMounted, type PropType, computed, provide, reactive } from 'vue';
import { OTab, OTabPane, OIcon, isString, OTag, OSelect, OOption } from '@opensig/opendesign';
import { useRoute, useRouter } from 'vue-router';
import { getDetail, getTags, getVer } from '@/api/api-domain';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT, MaintainerT, DetailItemT, MoreMessgeT, PkgTypeT } from '@/@types/app';
import { maintainerDefaults, TAGS_OPTIONS } from '@/data/query';
import { tagList } from '@/data/detail/index';
import { useI18n } from 'vue-i18n';
import { useLocale } from '@/composables/useLocale';
import { useViewStore } from '@/stores/common';
import { getCode, getParamsRules, pkgSortMap } from '@/utils/common';
import type { ImageTagsT } from '@/@types/detail';
import useDetailPageAnalytics from '@/composables/useDetailPageAnalytics';

import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/detail/DetailHeader.vue';
import ImageTags from '@/views/image/ImageTags.vue';

import DetailAside from '@/components/detail/DetailAside.vue';
import defaultImg from '@/assets/default-logo.png';
import IconEpkg from '~icons/pkg/epkg.svg';
import IconOEpkg from '~icons/pkg/oepkg.svg';
import IconImage from '~icons/pkg/image.svg';
import IconRpm from '~icons/pkg/rpm.svg';
import IconCanda from '~icons/pkg/conda.svg';
import { currentFieldDetailTabInjection, pkgIdInjection } from '@/data/injectionKeys';
import { oaReport } from '@/shared/analytics';

const { locale } = useLocale();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { mkit } = useMarkdown();

const activeName = ref();
const typePkg = ref();
const basicInfo = ref<DetailItemT[]>([]);
const installation = ref('');
const downloadData = ref('');

const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });

const moreMessge = ref<MoreMessgeT[]>([]);

const appData = ref<AppInfoT>({
  name: '',
  iconUrl: '',
  license: '',
  version: '',
  repository: '',
  size: '',
  srcDownloadUrl: '',
  binDownloadUrl: '',
  security: '',
});

function isValidTags(val: unknown) {
  if (!isString(val)) {
    return false;
  }
  return TAGS_OPTIONS.find((option: string) => option === val);
}

// 获取tab分类
const tabList = ref([] as PropType<PkgTypeT>);
const pkgId = ref('');
const srcRepos = reactive<Record<string, string | undefined>>({});
const currentSrcRepo = computed(() => srcRepos[activeName.value]);
const appDataName = ref('');
const epkgData = ref();
const oepkgData = ref();
const rpmData = ref();
const imgData = ref();
const condaData = ref();
const isLoading = ref(true);
provide(pkgIdInjection, pkgId);
provide(currentFieldDetailTabInjection, activeName);

const queryEntity = () => {
  const query = route.query;
  const { type, appPkgId, epkgPkgId, rpmPkgId, oepkgPkgId, condaPkgId } = query;

  const params = {
    appPkgId: (appPkgId as string) || '',
    epkgPkgId: (epkgPkgId as string) || '',
    rpmPkgId: (rpmPkgId as string) || '',
    oepkgPkgId: (oepkgPkgId as string) || '',
    condaPkgId: (condaPkgId as string) || '',
  };

  const newData = getParamsRules(params);

  getDetail(newData)
    .then((res) => {
      const data = res.data;
      tabList.value = data.tags.sort((a, b) => pkgSortMap[a] - pkgSortMap[b]);

      for (const tag of data.tags) {
        srcRepos[tag] = data[tag].srcRepo;
      }
      epkgData.value = data['EPKG'];
      rpmData.value = data['RPM'];
      imgData.value = data['IMAGE'];
      oepkgData.value = data['OEPKG'];
      condaData.value = data['CONDA'];
      appDataName.value = data[data.tags[0]].name;
      pkgId.value = data[data.tags[0]].pkgId;
      if (isValidTags(type)) {
        activeName.value = type?.toString();
      } else {
        activeName.value = data.tags[0];
      }

      onChange(activeName.value, true);
      isLoading.value = false;
    })
    .catch(() => {
      isLoading.value = false;
      useViewStore().showNotFound();
    });
};

//tab切换
const tabValue = ref();

const { reportAnalytics, goFeedback, reportFeedback } = useDetailPageAnalytics(appData, basicInfo, activeName);

const onChange = (tab: string, noReport?: boolean) => {
  isTags.value = false;
  imgName.value = tagList[0].value;
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
  } else if (tab === 'OEPKG') {
    tabValue.value = 'oepkg';
    typePkg.value = 'OEPKG';
    queryVer();
    getDetailValue(oepkgData.value);
  } else if (tab === 'IMAGE') {
    tabValue.value = 'apppkg';
    typePkg.value = 'IMAGE';
    if (tagsList.value.length === 0) {
      queryTags();
    }
    getDetailValue(imgData.value);
  } else if (tab === 'CONDA') {
    tabValue.value = 'condapkg';
    typePkg.value = 'CONDA';
    queryVer();
    getDetailValue(condaData.value);
  } else {
    useViewStore().showNotFound();
  }
  if (noReport !== true) {
    reportAnalytics({
      type: 'switch_app_type',
      target: tab,
    });
  }
  // 切换url参数
  if (route.query.type) {
    handleQueryData(tab);
  }
};

const handleQueryData = (tab: string) => {
  const query = route.query;
  const { appPkgId, rpmPkgId, epkgPkgId, oepkgPkgId, condaPkgId } = query;
  router.push({
    path: `/${locale.value}/field/detail`,
    query: {
      type: tab,
      appPkgId,
      rpmPkgId,
      epkgPkgId,
      oepkgPkgId,
      condaPkgId,
    },
  });
};

onMounted(() => {
  queryEntity();
});
const imageUsage = ref();
const tagVer = ref();

const getDetailValue = (data: any) => {
  pkgId.value = data.pkgId;

  appData.value.size = data.rpmSize || 0;
  appData.value.version = data.version;

  if (typePkg.value === 'RPM' || typePkg.value === 'OEPKG' || typePkg.value === 'OEPKG') {
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
  }

  downloadData.value = mkit(data?.download || '', { isCopy: true, Tag: data.appVer });
  installation.value = mkit(data?.installation || '', { isCopy: true, Tag: data.appVer });

  if (typePkg.value === 'RPM') {
    basicInfo.value = [
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.rpmCategory || '其他' },
      { name: '所属仓库', value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
      { name: 'Repo源', value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
    ];

    appData.value.size = data.rpmSize || 0;
  } else if (typePkg.value === 'EPKG') {
    basicInfo.value = [
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.epkgCategory || '其他' },
      { name: '所属仓库', value: JSON.parse(data?.repo).url, type: JSON.parse(data?.repo).type },
      { name: 'Repo源', value: JSON.parse(data?.repoType).url, type: JSON.parse(data?.repoType).type },
    ];
    appData.value.size = data.size || 0;
  } else if (typePkg.value === 'OEPKG') {
    basicInfo.value = [
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.category || '其他' },
    ];
    appData.value.size = data.rpmSize || 0;
  } else if (typePkg.value === 'IMAGE') {
    basicInfo.value = [
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.category || '' },
    ];

    tagsValue.value = data.appVer;

    appData.value.size = data.appSize || 0;
    appData.value.version = data.appVer;
    imageUsage.value = mkit(data?.imageUsage || '', { isCopy: true, Tag: data.appVer });

    moreMessge.value = [];
  } else if (typePkg.value === 'CONDA') {
    basicInfo.value = [
      { name: t('detail.osSupport'), value: data.os },
      { name: t('detail.arch'), value: data.arch },
      { name: t('detail.epkgCategory'), value: data.category || '其他' },
    ];

    appData.value.version = data.appVer;
    moreMessge.value = [];

    installation.value = mkit(data?.condaUsage || '', { isCopy: true, Tag: data.appVer });
  }
  tagVer.value = [data.osSupport, data.arch];
  maintainer.value = {
    maintainerId: data?.maintainerId || maintainerDefaults.name,
    maintainerEmail: data?.maintainerEmail || maintainerDefaults.email,
    maintainerGiteeId: data?.maintainerGiteeId || maintainerDefaults.gitee_id,
  };

  appData.value.name = data.name;
  appData.value.srcDownloadUrl = data.srcDownloadUrl;
  appData.value.binDownloadUrl = data.binDownloadUrl;
  appData.value.iconUrl = data?.iconUrl || defaultImg;
  appData.value.repository = data.srcRepo;
  appData.value.license = data.license;
  appData.value.security = data.security;
  appData.value.description = data.description;
};

// 获取img分类
const imgName = ref(tagList[0].value);
const tagsList = ref([]);
const tagsValue = ref('');
const queryTags = () => {
  getTags(encodeURIComponent(appDataName.value)).then((res) => {
    tagsList.value = res.data.list;
  });
};

const getTabIcon = (tab: string) => {
  const icon: Record<string, any> = {
    RPM: IconRpm,
    EPKG: IconEpkg,
    IMAGE: IconImage,
    OEPKG: IconOEpkg,
    CONDA: IconCanda,
  };
  return icon[tab];
};

//获取支持
const verData = ref();
const queryVer = () => {
  getVer(tabValue.value, encodeURIComponent(appDataName.value)).then((res) => {
    verData.value = res.data.list;
  });
};

const repeatTags = (v: string) => {
  return v.toLocaleLowerCase() === 'image' ? t('software.apppkg') : v;
};
// 应用镜像切换版本
const changeImageVerion = (v: string) => {
  if (v === appData.value?.appVer) {
    return;
  }
  const current = tagsList.value.find((item: ImageTagsT) => item.appVer === v);
  const query = route.query;
  router
    .replace({
      path: `/${locale.value}/field/detail`,
      query: {
        ...query,
        type: 'IMAGE',
        appPkgId: current?.pkgId || appPkgId,
      },
    })
    .then(() => {
      window.location.reload();
    });
};

// tags切换功能
const isTags = ref(false);
const onChangeImage = (v: string) => {
  isTags.value = v === 'tags' ? true : false;
  reportAnalytics({
    type: 'switch_tab',
    target: v,
  });
  if (tagsList.value.length === 0) {
    queryTags();
  }
};

const tagsOptions = computed(() => {
  return {
    name: appData.value.name,
    os: tagVer.value[0] || '',
    arch: tagVer.value[1] || '',
  };
});

// ---------------------下载埋点--------------------
const onCodeSuccess = () => {
  const { href } = window.location;
  const downloadTime = new Date();
  oaReport('download', {
    origin: href,
    softwareName: appData.value.name,
    version: appData.value.version,
    pkgId: route.query.pkgId as string,
    type: 'IMAGE',
    downloadTime,
  });
};

provide('BASE_INFO', basicInfo);

// 安装指引
const installTabs = computed(() => {
  let options = [
    {
      name: '在线安装',
      type: 'online',
      tag: appData.value.appVer,
      installation: installation.value,
    },
    {
      name: '下载安装',
      type: 'download',
      size: appData.value.size,
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

  if (typePkg.value === 'CONDA') {
    options.splice(1, 1);
  }

  return options;
});
</script>
<template>
  <ContentWrapper vertical-padding="24px">
    <DetailSkeleton v-if="isLoading" />
    <template v-else>
      <AppBreadcrumb id="field" :name="appData.name" />
    </template>
  </ContentWrapper>
  <OTab
    variant="text"
    @change="onChange"
    class="field-tabs domain-tabs"
    :class="tabList.length > 1 ? 'max' : 'min'"
    v-model="activeName"
    size="large"
    :style="{ '--tab-nav-justify': 'flex-start' }"
  >
    <OTabPane class="tab-pane" v-for="item in tabList" :key="item" :label="item">
      <template #nav><OIcon :icon="getTabIcon(item)" class="tabs-icon" /> {{ repeatTags(item) }}</template>
      <ContentWrapper>
        <DetailHead @go-feedback="goFeedback" :data="appData" />
        <div class="detail-row">
          <div class="detail-row-main" :class="{ tags: isTags }">
            <AppSection v-if="item !== 'IMAGE'">
              <div v-if="appData.version" class="version-title">
                <h2>{{ appData.version }}</h2>
                <OTag v-if="appData.isLatestAppVer" color="success">最新版本</OTag>
              </div>

              <!-- 安装指引 -->
              <DetailInstall :title="`> ${t('detail.installation')}`" :options="installTabs" @report-analytics="reportAnalytics" />

              <!-- 更多信息 -->
              <template v-if="moreMessge.length !== 0">
                <p class="sp">> {{ t('detail.more') }}</p>
                <DetailMoreInfo :options="moreMessge" />
              </template>
            </AppSection>
            <AppSection v-else>
              <div v-if="appData.version" class="version-title">
                <h2>{{ appData.version }}</h2>
                <OTag v-if="appData.isLatestAppVer" color="success">最新版本</OTag>
                <div class="software-version">
                  软件版本
                  <OSelect v-model="tagsValue" @change="changeImageVerion">
                    <OOption v-for="item in tagsList" :key="item.pkgId" :value="item.appVer" :label="item.appVer">{{ item.appVer }}</OOption>
                  </OSelect>
                </div>
              </div>

              <!-- 应用镜像 -->
              <OTab variant="text" @change="onChangeImage" :line="false" class="domain-tabs tabs-switch" v-model="imgName">
                <OTabPane class="tab-pane" v-for="item in tagList" :key="item.value" :value="item.value" :label="item.lable">
                  <template v-if="item.value === tagList[0].value">
                    <!-- 使用方式 -->

                    <div v-if="downloadData" class="image-code">
                      <p class="sp">> 获取应用镜像</p>
                      <OCodeCopy :code="getCode(downloadData)" @success="onCodeSuccess" />
                    </div>
                    <template v-if="imageUsage">
                      <p class="sp">> {{ t('detail.usage') }}</p>
                      <div v-dompurify-html="imageUsage" v-copy-code="true" class="markdown-body download"></div>
                    </template>
                  </template>
                  <ImageTags v-else :data="tagsList" :options="tagsOptions" />
                </OTabPane>
              </OTab>
            </AppSection>

            <!-- 反馈 -->
            <AppFeedback
              @report-analytics="reportFeedback"
              v-if="!isTags"
              :name="appData.name"
              :version="appData.version"
              :type="typePkg"
              :srcRepo="currentSrcRepo"
              :maintainer="maintainer"
              :fieldDetailTab="item"
            />
          </div>
          <div v-if="!isTags" class="detail-row-side">
            <DetailAside :data="appData" :type="item" :downloadData="downloadData" :ver-data="verData" :maintainer="maintainer" :tagVer="tagVer" />
          </div>
        </div>
      </ContentWrapper>
    </OTabPane>
  </OTab>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
