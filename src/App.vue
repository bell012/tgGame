<template>
  <div>
    <router-view />
    <LoginModal v-model="showLoginModal" :default-tab="loginModalTab" />
    <!-- 全局弹窗提示 -->
    <GlobalToast />
    <!-- 全局活动 tikect弹窗提示 -->
    <GlobalTicketToast />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import GlobalToast from '@/components/common/GlobalToast.vue'
import GlobalTicketToast from '@/views/activity/ticket/GlobalTicketToast.vue'
import LoginModal from '@/components/login_register/LoginModal.vue'
import { useAuthModalStore } from '@/stores/authModal'

const authModalStore = useAuthModalStore()
const { defaultTab: loginModalTab, visible } = storeToRefs(authModalStore)

const showLoginModal = computed({
  get: () => visible.value,
  set: value => authModalStore.setVisible(value)
})
</script>
