<script lang="ts" setup>
import { computed } from 'vue';
import { OButton } from '@opensig/opendesign';
import { windowOpen } from '@/utils/common';
import { useUserInfoStore } from '@/stores/user';

const userInfoStore = useUserInfoStore();

// 判断是否绑定gitee
const isGiteeAccount = computed(() => !!userInfoStore.identities.find((id) => id.identity === 'gitee'));
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);
const isMaintainerPer = computed(() => userInfoStore.platformMaintainerPermission);

// 跳转个人中心绑定账号
const USER_CENTER = import.meta.env.VITE_LOGIN_URL;
const jumpAccount = () => {
  windowOpen(USER_CENTER);
};
</script>

<template>
  <ContentWrapper verticalPadding="40px">
    <Result404>
      <template #description>
        <template v-if="isGiteeAccount && (!isAdminPer || !isMaintainerPer)">
          <div class="content">无权限访问协作平台</div>
        </template>
        <template v-else>
          <div class="content">
            <p>如果您是Maintainer</p>
            <p>想要获取相关信息，请先前往个人中心-账号绑定 绑定您的Gitee账号</p>
          </div>
          <OButton variant="solid" size="large" color="primary" @click="jumpAccount">前往绑定</OButton>
        </template>
      </template>
    </Result404>
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
