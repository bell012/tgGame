<template>
  <div>
    <router-view />
    <LoginModal v-model="showLoginModal" :default-tab="loginModalTab" />
    <OnlineCustomerService />
    <!-- 全局弹窗提示 -->
    <GlobalToast />
    <!-- 全局活动 tikect弹窗提示 -->
    <GlobalTicketToast />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import OnlineCustomerService from '@/components/OnlineCustomerService.vue'
import { storeToRefs } from 'pinia'
import GlobalToast from '@/components/common/GlobalToast.vue'
import GlobalTicketToast from '@/views/activity/ticket/GlobalTicketToast.vue'
import LoginModal from '@/components/login_register/LoginModal.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useAuthModalStore } from '@/stores/authModal'

const route = useRoute()
const isMobile = useIsMobile()
const authModalStore = useAuthModalStore()
const { defaultTab: loginModalTab, visible } = storeToRefs(authModalStore)

const showLoginModal = computed({
  get: () => visible.value,
  set: value => authModalStore.setVisible(value)
})

watch(
  () => route.path,
  () => {
    if (isMobile.value) return

    document
      .querySelector<HTMLElement>('.main-layout-content')
      ?.scrollTo({ top: 0, behavior: 'instant' })
    window.scrollTo({ top: 0, behavior: 'instant' })
  },
  { flush: 'post' }
)
</script>
