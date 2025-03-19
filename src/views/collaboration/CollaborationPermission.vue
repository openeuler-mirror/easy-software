<script lang="ts" setup>
import { computed, onMounted, nextTick } from 'vue';
import { OButton } from '@opensig/opendesign';
import { windowOpen } from '@/utils/common';
import { useUserInfoStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const userInfoStore = useUserInfoStore();
const router = useRouter();
const { locale } = useI18n();

// 判断是否绑定gitee
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);
const isMaintainerPer = computed(() => userInfoStore.platformMaintainerPermission);

// 跳转个人中心绑定账号
const USER_CENTER = import.meta.env.VITE_LOGIN_URL;
const jumpAccount = () => {
  windowOpen(USER_CENTER);
};

onMounted(() => {
  nextTick(() => {
    if (isAdminPer.value || isMaintainerPer.value) {
      router.push({
        path: `/${locale.value}/collaboration`,
      });
    }
  });
});
</script>

<template>
  <ContentWrapper verticalPadding="40px">
    <Error404Result>
      <template #description>
        <template v-if="userInfoStore.getGiteeId && (!isAdminPer || !isMaintainerPer)">
          <div class="content">您无权限访问协作平台</div>
        </template>
        <template v-else>
          <div class="content">
            <p>如果您是Maintainer,请先前往个人中心-账号绑定 绑定您的Gitee账号, 以获取软件包维护详情信息</p>
          </div>
          <OButton variant="solid" size="large" color="primary" @click="jumpAccount">前往绑定</OButton>
        </template>
      </template>
    </Error404Result>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.content {
  color: var(--o-color-info1);
  margin-bottom: 24px;
  @include text1;
  p {
    margin-bottom: 8px;
  }
}
</style>
