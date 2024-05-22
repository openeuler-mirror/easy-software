<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { OBreadcrumb, OBreadcrumbItem, OTab, OTabPane, OTable, OLink } from '@opensig/opendesign';
import { OPENEULER_CONTACT } from '@/data/config';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import type { AppInfoT } from '@/@types/app';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';
import { getDetails} from '@/api/api-domain';
import AppFeedback from '@/components/AppFeedback.vue';
import DetailHead from '../applicationsPackage/components/DetailNewHead.vue';
import ExternalLink from '@/components/ExternalLink.vue';
import DetailAside from '../applicationsPackage/components/DetailAside.vue';
import { moreColumns} from '@/data/detail/index';
import defaultImg from '@/assets/default.png';

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
const { t } = useI18n();

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
const pkgId = route.query.pkgId;
const queryEntity = () => {
  getChange();
};
//tab切换
const getChange = () => {
  getPkg('epkgpkg');
};
const getPkg = (tabValue: string) => {
  queryPkg(tabValue, pkgId);
};

onMounted(() => {
  queryEntity();
  getTitle();
});
const getDetailValue = (data: any) => {
  basicInfo.value = [
    { name: '简介', value: data.summary },
    { name: 'Description', value: data?.description },
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
  appData.value.size = data.epkgSize;

  maintainer.value = {
    maintainerId: data?.maintainerId || 'openEuler community',
    maintainerEmail: data?.maintainerEmail || OPENEULER_CONTACT,
    maintainerGiteeId: data?.maintainerGiteeId || 'openeuler-ci-bot',
  };
  version.value = data?.version;
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
};

const { locale } = useLocale();

const breadcrumbInfo = ref({ name: '', path: '' });
const getTitle = () => {
  breadcrumbInfo.value = { path: `/${locale.value}/epkg`, name: 'EPKG' };
};
const home = ref({ name: t('software.softwareHome'), path: `/${locale.value}/` });

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  showExternalDlg.value = true;
};
</script>

<template>
  <ContentWrapper vertical-padding="24px">
    <OBreadcrumb>
      <OBreadcrumbItem :to="home.path">{{ home.name }}</OBreadcrumbItem>
      <OBreadcrumbItem :to="breadcrumbInfo.path">{{ breadcrumbInfo.name }}</OBreadcrumbItem>
      <OBreadcrumbItem>{{ appData.name }} </OBreadcrumbItem>
    </OBreadcrumb>
    <DetailHead :data="appData" :basicInfo="basicInfo" :maintainer="maintainer" />
    <div class="detail-row">
      <div class="detail-row-main">
        <AppSection>
          <div class="title">
            <p>基本信息</p>
            <p>软件包版本号：{{ version }}</p>
          </div>
          <ul class="basic-info">
            <li v-for="item in basicInfo" :key="item.name">
              <span class="label download">{{ item.name }}</span>
              <OLink
                @click="onExternalDialog(item.value)"
                color="primary"
                v-if="item.name === '所属仓库' || item.name === 'Repo源'"
                target="_blank"
                rel="noopener noreferrer"
                >{{ item.type }}</OLink
              >
              <span class="markdown-body installation mymarkdown-body" v-dompurify-html="item.value" v-copy-code="true" v-else></span>
            </li>
          </ul>
          <p class="sp">安装指引</p>
          <div v-if="downloadData" v-dompurify-html="downloadData" v-copy-code="true" class="markdown-body download"></div>
          <div v-if="installation" v-dompurify-html="installation" v-copy-code="true" class="markdown-body installation"></div>
          <p class="sp">更多信息</p>
          <OTab variant="text" :line="false" class="domain-tabs">
            <template v-for="item in moreMessge" :key="item">
              <OTabPane class="tab-pane" v-if="item.value.length > 0" :label="item.name">
                <OTable :columns="moreColumns" :data="item.value"> </OTable>
              </OTabPane>
            </template>
            <!-- <OTabPane label="Description">{{ description }}</OTabPane> -->
          </OTab>
        </AppSection>
        <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
        <AppFeedback :email="maintainer.maintainerEmail" />
      </div>
      <div class="detail-row-side">
        <DetailAside :data="appData" :basicInfo="basicInfo" :maintainer="maintainer" />
      </div>
    </div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/detail/index.scss';
</style>
