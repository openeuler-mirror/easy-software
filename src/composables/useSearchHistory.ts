import { computed } from 'vue';
import { useStorage } from '@vueuse/core';

const SEARCH_HISTORY_KEY = 'search-history';

const useSearchHistory = () => {
  const storage = useStorage<string[]>(SEARCH_HISTORY_KEY, []);

  const add = (val: string) => {
    storage.value = [...new Set([val, ...storage.value])];
    // 超出6个删除
    if (storage.value.length > 6) {
      storage.value.splice(6);
    }
  };

  const remove = (val?: string) => {
    if (val) {
      storage.value = storage.value.filter((item) => item !== val);
    } else {
      clear();
    }
  };

  const clear = () => {
    storage.value = [];
  };

  const list = computed(() => storage.value);

  return {
    list,
    add,
    remove,
    clear,
  };
};

export default useSearchHistory;
