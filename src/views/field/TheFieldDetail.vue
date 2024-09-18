<script lang="ts" setup>
import { ref, onMounted, type PropType, computed, provide, reactive } from 'vue';
import { OTab, OTabPane, OIcon } from '@opensig/opendesign';
import { useRoute, useRouter } from 'vue-router';
import { getDetail, getTags, getVer } from '@/api/api-domain';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT, MaintainerT, DetailItemT, MoreMessgeT, PkgTypeT } from '@/@types/app';
import { maintainerDefaults } from '@/data/query';
import { isValidTags } from '@/utils/query';
import { tagList } from '@/data/detail/index';
import { useI18n } from 'vue-i18n';
import { useLocale } from '@/composables/useLocale';
import { useViewStore } from '@/stores/common';
import type { ParamsKeyT } from '@/@types/detail';
import { getCode } from '@/utils/common';

import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '@/components/detail/DetailHeader.vue';
import DetailBasicInfo from '@/components/detail/DetailBasicInfo.vue';
import ImageTags from '@/views/image/ImageTags.vue';

import DetailAside from '@/components/detail/DetailAside.vue';
import defaultImg from '@/assets/default-logo.png';
import IconEpkg from '~icons/pkg/epkg.svg';
import IconOEpkg from '~icons/pkg/oepkg.svg';
import IconImage from '~icons/pkg/image.svg';
import IconRpm from '~icons/pkg/rpm.svg';
import { currentFieldDetailTabInjection, pkgIdInjection } from '@/data/injectionKeys';

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
const files = ref([]);
const maintainer = ref<MaintainerT>({ maintainerId: '', maintainerEmail: '', maintainerGiteeId: '' });
const upStream = ref();
const security = ref();
const moreMessge = ref<MoreMessgeT[]>([]);
const description = ref();
const appData = ref<AppInfoT>({
  name: '',
  cover: '',
  license: '',
  version: '',
  repository: '',
  size: '',
  source_code: '',
  bin_code: '',
});

// 过滤空参数
const filterEmptyParams = (data: any) => {
  const newData = {} as any;
  Object.keys(data).forEach((key) => {
    const value = data[key as keyof ParamsKeyT];
    if (value) {
      newData[key] = value;
    }
  });
  return newData;
};

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
const isLoading = ref(true);
provide(pkgIdInjection, pkgId);
provide(currentFieldDetailTabInjection, activeName);

const queryEntity = () => {
  const query = route.query;
  const { type, appPkgId, epkgPkgId, rpmPkgId, oepkgPkgId } = query;
  getDetail(
    filterEmptyParams({
      appPkgId: (appPkgId as string) || '',
      epkgPkgId: (epkgPkgId as string) || '',
      rpmPkgId: (rpmPkgId as string) || '',
      oepkgPkgId: (oepkgPkgId as string) || '',
    })
  )
    .then((res) => {
      const data = res.data;
      tabList.value = data.tags;
      for (const tag of data.tags) {
        srcRepos[tag] = data[tag].srcRepo;
      }
      epkgData.value = data['EPKG'];
      rpmData.value = data['RPM'];
      imgData.value = data['IMAGE'];
      oepkgData.value = data['OEPKG'];
      appDataName.value = data[data.tags[0]].name;
      pkgId.value = data[data.tags[0]].pkgId;
      if (isValidTags(type)) {
        activeName.value = type?.toString();
      } else {
        activeName.value = data.tags[0];
      }

      onChange(activeName.value);
      isLoading.value = false;
    })
    .catch(() => {
      isLoading.value = false;
      useViewStore().showNotFound();
    });
};

//tab切换
const tabValue = ref();
const onChange = (tab: string) => {
  isTags.value = false;
  imgName.value = tagList[0].lable;
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
    queryVer();
    getDetailValue(imgData.value);
  } else {
    useViewStore().showNotFound();
  }
  // 切换url参数
  if (route.query.type) {
    handleQueryData(tab);
  }
};

const handleQueryData = (tab: string) => {
  const query = route.query;
  const { appPkgId, rpmPkgId, epkgPkgId, oepkgPkgId } = query;
  router.push({
    path: `/${locale.value}/field/detail`,
    query: {
      type: tab,
      appPkgId,
      rpmPkgId,
      epkgPkgId,
      oepkgPkgId,
    },
  });
};

onMounted(() => {
  queryEntity();
});
const imageUsage = ref();
const latestOsSupport = ref();
const tagVer = ref();
const summary = ref();
const getDetailValue = (data: any) => {
  pkgId.value = data.pkgId;
  if (typePkg.value === 'RPM' || typePkg.value === 'OEPKG') {
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
    appData.value.version = data.version;
    summary.value = data.summary;
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
    appData.value.version = data.version;
    summary.value = data.summary;
  } else if (typePkg.value === 'IMAGE') {
    basicInfo.value = [
      { name: '版本支持情况', value: data.osSupport },
      { name: '架构', value: data.arch },
      { name: '软件包分类', value: data.category || '' },
    ];

    appData.value.size = data.appSize || 0;
    latestOsSupport.value = data.latestOsSupport === 'true';
    summary.value = data.description;
    appData.value.version = data.appVer;
  }
  tagVer.value = [data.osSupport, data.arch];
  maintainer.value = {
    maintainerId: data?.maintainerId || maintainerDefaults.name,
    maintainerEmail: data?.maintainerEmail || maintainerDefaults.email,
    maintainerGiteeId: data?.maintainerGiteeId || maintainerDefaults.gitee_id,
  };

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
  appData.value.license = data.license;
};

// 获取img分类
const imgName = ref(tagList[0].lable);
const tagsValue = ref([]);
const queryTags = () => {
  getTags(encodeURIComponent(appDataName.value)).then((res) => {
    tagsValue.value = res.data.list;
  });
};

const getTabIcon = (tab: string) => {
  if (tab === 'RPM') {
    return IconRpm;
  } else if (tab === 'EPKG') {
    return IconEpkg;
  } else if (tab === 'IMAGE') {
    return IconImage;
  } else if (tab === 'OEPKG') {
    return IconOEpkg;
  }
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

// tags切换功能
const isTags = ref(false);
const onChangeImage = (v: string) => {
  isTags.value = v === 'Tags' ? true : false;
  if (tagsValue.value.length === 0) {
    queryTags();
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
  const sensors = (window as any)['sensorsDataAnalytic201505'];
  const { href } = window.location;
  const downloadTime = new Date();
  sensors?.setProfile({
    ...(window as any)['sensorsCustomBuriedData'],
    profileType: 'download',
    origin: href,
    softwareName: appData.value.name,
    version: appData.value.version,
    pkgId: route.query.pkgId as string,
    type: 'IMAGE',
    downloadTime,
  });
};
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
        <DetailHead :data="appData" :basicInfo="summary" :maintainer="maintainer" />
        <div class="detail-row">
          <div class="detail-row-main" :class="{ tags: isTags }">
            <AppSection :title="`> ${t('detail.information')}`" v-if="item !== 'IMAGE'">
              <template #append>
                <span v-if="appData.version" class="ver"> {{ t('detail.number') }}: {{ appData.version }}</span>
              </template>
              <!-- 基本信息 -->
              <DetailBasicInfo :options="basicInfo" />

              <!-- 安装指引 -->
              <DetailInstall :title="`> ${t('detail.installation')}`">
                <div v-if="installation" v-dompurify-html="installation" v-copy-code="true" class="markdown-body installation"></div>
              </DetailInstall>

              <!-- 更多信息 -->
              <template v-if="item !== 'IMAGE'">
                <p class="sp">> {{ t('detail.more') }}</p>
                <DetailMoreInfo :options="moreMessge" />
              </template>
            </AppSection>
            <AppSection v-else>
              <!-- 应用镜像 -->
              <OTab variant="text" @change="onChangeImage" :line="false" class="domain-tabs tabs-switch" v-model="imgName">
                <OTabPane class="tab-pane" v-for="item in tagList" :key="item.value" :label="item.lable">
                  <template v-if="item.value === tagList[0].value">
                    <!-- 基本信息 -->
                    <AppSection :title="`> ${t('detail.information')}`">
                      <template #append>
                        <span v-if="appData.version" class="ver">{{ t('detail.number') }}: {{ appData.version }}</span>
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
                  <ImageTags v-else :data="tagsValue" :options="tagsOptions" />
                </OTabPane>
              </OTab>
            </AppSection>

            <!-- 反馈 -->
            <AppFeedback
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
            <DetailAside :data="appData" :type="item" :downloadData="downloadData" :ver-data="verData" :tagVer="tagVer" />
          </div>
        </div>
      </ContentWrapper>
    </OTabPane>
  </OTab>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
