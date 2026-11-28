<template>
  <div class="relative flex h-screen min-h-[720px] w-full overflow-hidden bg-bg-1 text-text-1">
    <header
      class="pointer-events-none absolute inset-x-20 top-[54px] z-10 flex items-center justify-between"
    >
      <button type="button" class="pointer-events-auto flex items-center" @click="goHome">
        <SmartImage v-if="logoUrl" :src="logoUrl" alt="" class="h-8 w-auto object-contain" />
        <MainLogoIcon v-else class="h-8 w-auto text-text-1" />
      </button>
      <button
        type="button"
        class="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-[6.75px] bg-opacity-10 text-text-1"
        @click="goBack"
      >
        <ReturnHomeIcon class="h-9 w-9" />
      </button>
    </header>

    <section class="flex w-[58%] min-w-0 flex-col pb-[70px]">
      <div class="relative min-h-0 flex-1">
        <LoginHeroScene class="absolute inset-0" />
      </div>
      <div class="mx-auto flex w-[524px] max-w-full flex-col gap-1.5 text-center">
        <h1 class="font-inter text-[76px] font-[700] leading-[1.2]">
          {{ t('common.stay_untamed') }}
        </h1>
        <p class="font-inter text-[20px] font-[600] leading-[1.2]">
          {{ t('common.sign_up_get_welcome_bonus') }}
        </p>
      </div>
      <ul class="mt-4 flex items-center justify-center gap-[27px]">
        <template v-for="(reward, index) in rewards" :key="reward.label">
          <li v-if="index > 0" class="h-[54px] w-px bg-opacity-6" aria-hidden="true"></li>
          <li class="flex items-center gap-2.5">
            <img :src="reward.icon" alt="" class="h-[25px] w-[25px]" />
            <div class="flex flex-col gap-[3px] whitespace-nowrap">
              <span class="text-[21px] font-[700] leading-[1.2] text-text-1">{{
                reward.value
              }}</span>
              <span class="text-[13px] leading-[1.2] text-text-2">{{ reward.label }}</span>
            </div>
          </li>
        </template>
      </ul>
    </section>

    <section class="flex w-[42%] min-w-0 items-center justify-center px-6">
      <div
        class="login-card w-[412px] max-w-full rounded-[18px] border border-[color:var(--color-login-card-border)] bg-[var(--color-login-card-bg)] px-[26px] py-[30px] backdrop-blur-[2px]"
      >
        <template v-if="panel === 'resetPassword'">
          <ResetPasswordDesktop @reset-success="switchPanel('login')" />
          <div class="mt-6 text-center text-sm font-[700] text-text-2">
            {{ t('common.have_account') }}
            <button type="button" class="text-theme-primary" @click="switchPanel('login')">
              {{ t('common.log_in_now') }}
            </button>
          </div>
        </template>
        <LoginPageForm
          v-else
          :default-tab="panel === 'register' ? 'signup' : 'signin'"
          :login-setting="loginSetting"
          :redirect="redirect"
          @switch-tab="tab => switchPanel(tab === 'signup' ? 'register' : 'login')"
          @open-reset-password="switchPanel('resetPassword')"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { LoginSetResult } from '@/api/interface/login_register'
import ResetPasswordDesktop from '@/components/login_register/ResetPasswordDesktop.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import MainLogoIcon from '@/static/svg/main-logo.svg?component'
import ReturnHomeIcon from '@/static/svg/login-page/return-home.svg?component'
import rewardGiftIcon from '@/static/svg/login-page/reward-gift.svg?url'
import rewardPerksIcon from '@/static/svg/login-page/reward-perks.svg?url'
import rewardSpinIcon from '@/static/svg/login-page/reward-spin.svg?url'
import { useAuthModalStore } from '@/stores/authModal'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { stripLocalePrefix } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import LoginHeroScene from './components/LoginHeroScene.vue'
import LoginPageForm from './components/LoginPageForm.vue'
import './colors.css'

type Panel = 'login' | 'register' | 'resetPassword'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const authModalStore = useAuthModalStore()
const userStore = useUserStore()
const siteConfigStore = useSiteConfigStore()
const { currentLanguage } = storeToRefs(useLocaleStore())

const logoUrl = computed(() => siteConfigStore.getHomeTopLogoUrl(3, currentLanguage.value))

const rewards = computed(() => [
  { icon: rewardGiftIcon, value: '470%', label: t('common.welcome_deposit_bonus') },
  { icon: rewardSpinIcon, value: '5 BTC', label: t('common.free_daily_lucky_spin') },
  {
    icon: rewardPerksIcon,
    value: t('common.free_perks'),
    label: t('common.daily_free_rewards_bonuses')
  }
])

const queryTab = () => (route.query.tab === 'register' ? 'register' : 'login')
const panel = ref<Panel>(queryTab())

/** 只接受站内路径，避免跳到外站或回到登录页自身。 */
const redirect = computed(() => {
  const value = route.query.redirect
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/'
  return stripLocalePrefix(value.split(/[?#]/)[0]) === '/login' ? '/' : value
})

const isLoggedIn = computed(() =>
  Boolean(userStore.userInfo?.tradeToken || userStore.acctInfo?.memberId)
)

const loginSetting = ref<LoginSetResult | null>(null)

const fetchLoginSetting = async () => {
  try {
    const response = await Api.auth.getLoginAndRegisterSetting({})
    loginSetting.value = response?.result || null
  } catch (error) {
    loginSetting.value = null
    console.error(error)
  }
}

const switchPanel = (next: Panel) => {
  panel.value = next
  if (next === 'resetPassword') return
  void router.replace({ query: { ...route.query, tab: next } })
}

const goHome = () => navigateTo('/')

const goBack = () => {
  void router.replace(redirect.value)
}

watch(
  () => route.query.tab,
  () => {
    panel.value = queryTab()
  }
)

watch(
  isMobile,
  mobile => {
    if (!mobile) return
    const tab = queryTab()
    void router.replace(redirect.value).then(() => authModalStore.openModal(tab))
  },
  { immediate: true }
)

onMounted(() => {
  if (isLoggedIn.value) {
    void router.replace(redirect.value)
    return
  }
  void siteConfigStore.initSiteConfig()
  void fetchLoginSetting()
})
</script>

<style scoped>
.login-card {
  box-shadow: var(--color-login-card-shadow);
}
</style>
