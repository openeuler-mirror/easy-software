<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { OBreadcrumb, OBreadcrumbItem, OButton, ORow, OCol, OTable, OLink, ODialog, OInput } from '@opensig/opendesign';
import { getUpstream } from '@/api/api-upstream';
const route = useRoute();
const upstreamName = ref<any>('');

const statusColumns = [
  { label: 'Status', key: 'status' },
  { label: 'Supported', key: 'supported' },
  { label: 'Descrption', key: 'descrption' },
];

const statusTable = {
  columns: statusColumns,
  data: [
    {
      status: 'ok',
      supported: '2024-01-27 04:13:01 (UTC)',
      descrption: 'No new version found',
    },
    {
      status: 'ok',
      supported: '2024-01-27 04:13:01 (UTC)',
      descrption: 'No new version found',
    },
  ],
};
const versionColumns = [{ label: 'Version', key: 'version' }];
const versionTable = {
  columns: versionColumns,
  data: [
    {
      version: '23-06',
    },
  ],
};

const upstreamData = ref([] as any);
const homepage = ref('');
const id = ref();
const queryAppVersion = () => {
  getUpstream(upstreamName.value).then((res) => {
    upstreamData.value = res.items.slice(0, 1);
    homepage.value = upstreamData.value[0].homepage;
    id.value = upstreamData.value[0].id;
  });
};

onMounted(() => {
  if (route.params?.name) {
    upstreamName.value = decodeURIComponent(String(route.params.name));
    queryAppVersion();
  }
});
//编辑功能
const showDlg = ref(false);
const dialogInput = ref();
const postDialog = () => {
  showDlg.value = false;
};

// 详情
const basicInfo = ref();
basicInfo.value = [
  { name: 'Latest version', value: '' },
  { name: 'Homepage', value: '' },
  { name: 'Backend', value: '' },
  { name: 'Version scheme', value: '' },
  { name: 'Version check url', value: '' },
];
</script>

<template>
  <ContentWrapper vertical-padding="40px">
    <OBreadcrumb>
      <OBreadcrumbItem to="/upstream">上游兼容应用全景</OBreadcrumbItem>
      <OBreadcrumbItem>{{ upstreamName }} 状态详情</OBreadcrumbItem>
    </OBreadcrumb>
    <div class="domain-head-box">
      <h3 class="title">{{ upstreamName }} 状态详情</h3>
    </div>
  </ContentWrapper>
  <ODialog v-model:visible="showDlg" :unmount-on-hide="true" :hide-close="true">
    <template #header>
      <p class="feedback-title">Apahce Spark</p>
    </template>
    <div class="nss-dialog">
      <ul class="basic-info">
        <li>
          <span class="label">Homepage</span>
          <OInput v-model="dialogInput" round="0" clearable :placeholder="homepage" class="search-input"> </OInput>
        </li>
      </ul>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <OButton class="feedback-title" @click="postDialog()" color="primary">确认</OButton>
      </div>
    </template>
  </ODialog>

  <ContentWrapper>
    <ORow gap="32px" flex-wrap="wrap">
      <OCol flex="0 1 50%" :laptop="{ flex: '0 1 50%' }" :pad="{ flex: '0 1 50%' }" :pad-v="{ flex: '0 1 50%' }" :phone="{ flex: '0 1 100%' }">
        <AppSection :title="upstreamName">
          <div class="latest-box">
            <OButton size="small" class="edit-latest" color="primary" @click="showDlg = true">编辑</OButton>
            <ul class="basic-info">
              <li v-for="item in basicInfo" :key="item.name">
                <span class="label markdown download">{{ item.name }}</span>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </div>
        </AppSection>
      </OCol>
      <OCol flex="0 1 50%" :laptop="{ flex: '0 1 50%' }" :pad="{ flex: '0 1 50%' }" :pad-v="{ flex: '0 1 50%' }" :phone="{ flex: '0 1 100%' }">
        <AppSection title="Status">
          <OTable :columns="statusTable.columns" :data="statusTable.data" size="small">
            <template #td_latest="{ row }">
              {{ row.latest }} (<OLink color="primary">{{ row.commit }}</OLink
              >)
            </template>
          </OTable>
        </AppSection>
        <AppSection title="Versions">
          <OTable :columns="versionTable.columns" :data="versionTable.data" size="small">
            <template #td_latest="{ row }">
              {{ row.latest }} (<OLink color="primary">{{ row.commit }}</OLink
              >)
            </template>
          </OTable>
        </AppSection>
      </OCol>
    </ORow>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.domain-head-box {
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    @include h1;
    font-weight: 500;
    color: var(--o-color-info1);
  }
}

:deep(.app-section) {
  padding: 40px;
}
.latest-box {
  position: relative;
  .edit-latest {
    position: absolute;
    top: -48px;
    right: 0;
  }
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--o-color-fill1);
  margin-bottom: 24px;
  .el-table__cell {
    font-weight: 500;
    color: var(--o-color-info1);
  }
}
.basic-info {
  li {
    padding: 12px 0;
    @include tip1;
    color: var(--o-color-info2);
    display: flex;
    align-items: top;

    .label {
      min-width: 100px;
    }
  }
}
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}
.nss-dialog {
  min-width: 500px;
  min-height: 100px;
  display: flex;
  align-items: center;
  .search-input {
    min-width: 500px;
  }
}
</style>
