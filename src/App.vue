<template>
  <div>
    <router-view />
    <LoginModal v-if="isMobile" v-model="showLoginModal" :default-tab="loginModalTab" />
    <OnlineCustomerService />
    <!-- 全局弹窗提示 -->
    <GlobalToast />
    <!-- 全局活动 tikect弹窗提示 -->
    <GlobalTicketToast />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OnlineCustomerService from '@/components/OnlineCustomerService.vue'
import { storeToRefs } from 'pinia'
import GlobalToast from '@/components/common/GlobalToast.vue'
import GlobalTicketToast from '@/views/activity/ticket/GlobalTicketToast.vue'
import LoginModal from '@/components/login_register/LoginModal.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useAuthModalStore } from '@/stores/authModal'
import { stripLocalePrefix } from '@/utils/locale'
import { navigateTo } from '@/utils/router'

const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const authModalStore = useAuthModalStore()
const { defaultTab: loginModalTab, visible } = storeToRefs(authModalStore)

const showLoginModal = computed({
  get: () => visible.value,
  set: value => authModalStore.setVisible(value)
})

const isLoginRoute = computed(() => stripLocalePrefix(route.path) === '/login')

// PC 端登录注册改为独立页面：拦截弹窗打开请求，跳转登录页并记录回跳地址。
watch(
  visible,
  nextVisible => {
    if (!nextVisible || isMobile.value) return

    authModalStore.setVisible(false)
    const tab = loginModalTab.value

    if (isLoginRoute.value) {
      void router.replace({ query: { ...route.query, tab } })
      return
    }

    navigateTo('/login', { query: { tab, redirect: route.fullPath } })
  },
  { immediate: true }
)

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
