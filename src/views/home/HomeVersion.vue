<script lang="ts" setup>
import { OTag, OLink, OIcon } from '@opensig/opendesign';
import { ref, onMounted, watch, computed } from 'vue';
import { getSearchAllFiled, getVersionInfo } from '@/api/api-domain';
import { formatDateTime } from '@/utils/common';
import { useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';

import IconChevronDown from '~icons/app/icon-chevron-down.svg';

interface DataSubT {
  name: string;
  value: number;
}

interface DataT {
  type: string;
  id: string;
  children: DataSubT[];
}

interface DataItem {
  [key: string]: number;
}

interface CommunityColumnsT {
  actualMaintenanceEndtime: string;
  maintenanceDuration: string;
  os: string;
  plannedMaintenanceEndtime: string;
  releaseTime: string;
  remarks: string;
  status: string;
  osAlias: string;
  children?: DataT[];
}

const { t } = useI18n();
const router = useRouter();
const { locale } = useLocale();
const loading = ref(false);
const versionData = ref<CommunityColumnsT[]>([]);
const pkgInfo = ref({});
const queryEulerVersion = () => {
  const params = {
    name: 'eulerLifecycle',
  };
  loading.value = true;
  getSearchAllFiled(params)
    .then((res) => {
      versionData.value = res.data.list;
      queryVersionInfo();
      loading.value = false;
    })
    .catch(() => {
      versionData.value = [];
      loading.value = false;
    });
};

// 合并版本架构数据到版本列表
const mergeData = () => {
  versionData.value.forEach((item) => {
    item.children = [];
    Object.entries(pkgInfo.value).forEach(([key, value]) => {
      if (item.osAlias === key) {
        item?.children && item?.children.push(...formatArchData(value));
      }
    });
  });
};

// 设置默认架构参数
const arch: string[] = ['aarch64', 'noarch', 'riscv64', 'loongarch64', 'x86_64', 'sw_64'];

const formatArchItem = (items: DataItem) => {
  // 创建一个映射，以 arch 数组中的架构作为键
  const archMap = new Map(arch.map((item) => [item, 0]));

  // 更新archMap值
  Object.keys(items).forEach((key) => {
    archMap.set(key, items[key]);
  });
  return Array.from(archMap).map(([arch, value]) => ({
    name: arch,
    value: value,
  }));
};

const formatArchData = (data: { [key: string]: DataItem }) => {
  const newChildren: DataT[] = Object.entries(data).reduce((acc, [type, items]) => {
    acc.push({
      id: type,
      children: formatArchItem(items),
    });
    return acc;
  }, []);
  return newChildren;
};

const queryVersionInfo = () => {
  getVersionInfo()
    .then((res) => {
      pkgInfo.value = res.data;
      mergeData();
    })
    .catch(() => {});
};

const currentVersion = ref('');
const expandChangeData = (row: CommunityColumnsT) => {
  currentVersion.value = row.osAlias;
};

const expands = ref<string[]>([]);
const getRowKeys = (row: CommunityColumnsT) => {
  return row.osAlias;
};

const statusType = (v: string) => {
  if (v === '停止维护') {
    return 'warning';
  } else if (v === '开发中') {
    return 'primary';
  } else if (v === '正常') {
    return 'success';
  }
};

// 格式化时间
const timeFormat = (t: string) => {
  if (t.startsWith('0000-00-00')) {
    return '-';
  } else {
    return formatDateTime(t);
  }
};

const goJump = (id: string, item: DataSubT) => {
  if (item.value === 0) {
    return;
  }

  router.push({
    path: `/${locale.value}/${id.toLocaleLowerCase()}`,
    query: {
      os: currentVersion.value,
      arch: item.name,
    },
  });
};

const goFieldJump = (v: string) => {
  router.push({
    path: `/${locale.value}/field`,
    query: {
      os: v,
    },
  });
};

onMounted(() => {
  queryEulerVersion();
});

watch(
  () => versionData.value,
  () => {
    if (versionData.value && versionData.value.length > 0) {
      expands.value.push(versionData.value[0]?.osAlias);
      currentVersion.value = versionData.value[0].osAlias;
    }
  }
);

// ------------------------默认展示10条数据 展开收起-----------------------------
const isToggle = ref(false);
const tableLen = ref(10);
const tableAllData = computed(() => {
  let tableVerData = [];
  if (isToggle.value && versionData.value.length > tableLen.value) {
    tableVerData = versionData.value;
  } else {
    tableVerData = versionData.value.slice(0, tableLen.value);
  }
  return tableVerData;
});
const showMore = () => {
  isToggle.value = !isToggle.value;
};
</script>

<template>
  <el-table
    :data="tableAllData"
    :row-key="getRowKeys"
    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    :expand-row-keys="expands"
    @expand-change="expandChangeData"
    style="width: 100%"
    class="community-table"
  >
    <el-table-column type="expand">
      <template #default="props">
        <div class="expand-data">
          <el-table :data="props.row.children">
            <el-table-column label="软件包分类" width="220px">
              <template #default="scope">
                <div class="name">{{ t(`software.${scope.row.id.toLocaleLowerCase()}`) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="架构 (软件包个数)">
              <template #default="scope">
                <div class="arch-box">
                  <OLink
                    v-for="item in scope.row.children"
                    @click="goJump(scope.row.id, item)"
                    :key="item.name"
                    :color="item.value !== 0 ? 'primary' : 'normal'"
                    >{{ item.name }}({{ item.value }})</OLink
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="openEuler社区版本">
      <template #default="scope">
        <OLink color="primary" @click="goFieldJump(scope.row.osAlias)">{{ scope.row.osAlias }}</OLink>
      </template>
    </el-table-column>
    <el-table-column label="发布时间" width="200">
      <template #default="scope">
        {{ timeFormat(scope.row.releaseTime) }}
      </template>
    </el-table-column>
    <el-table-column label="计划维护时长" prop="maintenanceDuration" width="200" />
    <el-table-column label="计划维护停止时间" width="220">
      <template #default="scope">
        {{ timeFormat(scope.row.plannedMaintenanceEndtime) }}
      </template>
    </el-table-column>
    <el-table-column label="实际维护停止时间" width="220">
      <template #default="scope">
        {{ timeFormat(scope.row.actualMaintenanceEndtime) }}
      </template>
    </el-table-column>
    <el-table-column label="状态" width="120">
      <template #default="scope">
        <OTag v-if="scope.row.status" class="app-tag" :color="statusType(scope.row.status)">{{ scope.row.status }} </OTag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="100">
      <template #default="scope">
        <OLink color="primary" target="_blank" rel="noopener noreferrer" :href="scope.row.osUrl">下载</OLink>
      </template>
    </el-table-column>
  </el-table>
  <p v-if="tableAllData.length >= tableLen" class="view-all">
    <OLink :class="isToggle ? 'up' : 'down'" @click="showMore">
      {{ isToggle ? t('software.upList') : t('software.viewAll') }}
      <template #suffix>
        <OIcon><IconChevronDown /></OIcon>
      </template>
    </OLink>
  </p>
</template>

<style lang="scss" scoped>
.view-all {
  text-align: center;
  margin-top: 20px;
  .o-link:hover {
    color: var(--o-color-primary1);
    cursor: pointer;
  }
  svg {
    transition: 0.3s ease-in-out;
  }
  .up svg {
    transform: rotate(180deg);
  }
}

.expand-data {
  margin: 12px 48px 12px 64px;
  border: 1px solid var(--el-table-border-color);
  border-radius: 4px;
  .arch-box {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    justify-content: space-between;
    gap: 8px;
    :deep(.o-link) {
      &.o-link-normal {
        color: var(--o-color-info4) !important;
        cursor: default;
      }
    }
  }
  .name {
    @include text1;
    color: var(--o-color-info1);
    font-weight: 500;
  }
}
:deep(.o-tag) {
  min-width: 72px;
  &.o-tag-primary {
    --tag-bg-color: #058ef0;
    --tag-bd-color: #058ef0;
  }
}
.view-all {
  :deep(.o-link) {
    &.o-link-normal {
      --link-color: var(--o-color-info1);
      --link-color-hover: var(--o-color-info1);
    }
  }
}
</style>
