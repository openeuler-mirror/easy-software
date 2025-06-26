import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { PACKAGE_TYPE_MAPPING, FLITERMENUOPTIONS } from '@/data/query';

// name 软件名称
export const useRouteQuery = (name: keyof typeof PACKAGE_TYPE_MAPPING) => {
  const route = useRoute();
  const router = useRouter();

  const routeKey = ref('');
  const routeName = ref<string>(PACKAGE_TYPE_MAPPING[name]);
  const routeType = ref<string>(FLITERMENUOPTIONS[0].id);
  const routeOs = ref<String[]>([]);
  const routeArch = ref<String[]>([]);
  const routeCategory = ref<String[]>([]);

  const getQuery = () => {
    const { os, arch, q, sort, type, category } = route.query;

    // 搜索参数
    routeKey.value = q?.toString() || '';
    routeName.value = isValidSearchTabName(type) ? (type as string) : PACKAGE_TYPE_MAPPING[name];
    routeType.value = isValidSearchKey(sort) ? encodeURIComponent(sort as string) : FLITERMENUOPTIONS[0].id;

    // 首页跳转参数
    routeOs.value = os ? [os.toString()] : [];
    routeArch.value = arch ? [arch.toString()] : [];
    routeCategory.value = category ? [category as string] : [];
  };
  watch(
    () => route.query,
    (newQuery) => {
      if (newQuery.name && !newQuery.q) {
        router.replace({
          path: route.path,
          query: {
            q: newQuery.name,
            type: newQuery.tab ?? newQuery.type,
            sort: newQuery.key ?? newQuery.sort,
          },
        });
      }

      getQuery();
    },
    { immediate: true }
  );

  return {
    routeKey,
    routeName,
    routeType,
    routeOs,
    routeArch,
    routeCategory,
  };
};
