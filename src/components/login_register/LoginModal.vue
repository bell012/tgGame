<template>
  <!-- H5 端登录/注册 -->
  <LoginFormMobile
    v-if="isMobile"
    :visible="modelValue && !showResetPassword"
    :default-tab="defaultTab === 'register' ? 'signup' : 'signin'"
    :login-setting="loginRegisterSetting"
    :logo-url="authLogoUrl"
    :background-image-url="mobileBackgroundImage"
    :background-loading="isAuthBannerLoading"
    @update:visible="handleClose"
    @open-reset-password="openResetPassword"
  />

  <!-- H5 端忘记密码 -->
  <ResetPasswordMobile
    v-if="isMobile"
    :visible="showResetPassword"
    :logo-url="authLogoUrl"
    :background-image-url="mobileBackgroundImage"
    :background-loading="isAuthBannerLoading"
    @update:visible="handleResetPasswordClose"
    @reset-success="handleResetPasswordSuccess"
  />

  <!-- PC 端登录 -->
  <teleport v-if="!isMobile" to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-[#000a] flex items-center justify-center z-[10000] overflow-hidden"
      >
        <div
          class="relative w-full max-w-[800px] h-full sm:max-h-[740px] overflow-hidden rounded-2xl modal-container"
        >
          <div
            class="absolute inset-0 flex rounded-2xl overflow-hidden transition-all duration-500 ease-in-out"
            :class="getLoginClass()"
            style="box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5)"
          >
            <!-- 关闭按钮 -->
            <button
              class="absolute top-5 right-5 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
              @click="handleClose"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>

            <!-- 左侧图片区域 -->
            <div class="w-1/2 p-6 flex flex-col bg-bg-2">
              <div class="z-10 w-full flex justify-center">
                <SmartImage
                  v-if="authLogoUrl"
                  :src="authLogoUrl"
                  alt=""
                  class="h-12 w-auto object-contain"
                />
                <MainLogoIcon v-else class="h-12 w-auto text-text-1" />
              </div>

              <div class="relative mt-6 h-[357px] w-full overflow-hidden">
                <div
                  v-if="showPcBackgroundSkeleton"
                  class="absolute inset-0 animate-pulse bg-bg-4 rounded-xl"
                ></div>
                <img
                  v-if="pcBackgroundImage"
                  :src="pcBackgroundImage"
                  alt=""
                  class="h-full w-full transition-opacity duration-300"
                  :class="showPcBackgroundSkeleton ? 'opacity-0' : 'opacity-100'"
                  @load="handlePcBackgroundLoad"
                  @error="handlePcBackgroundError"
                />
              </div>

              <div class="mt-4">
                <div class="flex items-center justify-center flex-col mt-16">
                  <!-- 保持桀骜不训 -->
                  <h2 class="w-full text-center text-4xl font-[700] text-text-1 mb-3">
                    {{ t('common.stay_untamed') }}
                  </h2>
                  <!-- 注册并获得欢迎奖金 -->
                  <p class="w-full text-center text-base font-[700] text-text-1">
                    {{ t('common.sign_up_get_welcome_bonus') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 右侧表单区域 -->
            <div class="w-1/2 bg-bg-1 p-4">
              <LoginFormDesktop
                ref="loginFormDesktopRef"
                default-tab="signin"
                :login-setting="loginRegisterSetting"
                card-switch
                @switch-tab="handleAuthTabSwitch"
                @open-reset-password="openResetPassword"
                @close="handleClose"
              />
            </div>
          </div>

          <!-- 注册弹窗 -->
          <div
            class="absolute inset-0 flex rounded-2xl overflow-hidden transition-all duration-500 ease-in-out"
            :class="getRegisterClass()"
            style="box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5)"
          >
            <!-- 关闭按钮 -->
            <button
              class="absolute top-5 right-5 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
              @click="handleClose"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>

            <!-- 左侧图片区域 -->
            <div class="w-1/2 p-6 flex flex-col bg-bg-2">
              <div class="z-10 w-full flex justify-center">
                <SmartImage
                  v-if="authLogoUrl"
                  :src="authLogoUrl"
                  alt=""
                  class="h-12 w-auto object-contain"
                />
                <MainLogoIcon v-else class="h-12 w-auto text-text-1" />
              </div>

              <div class="relative mt-6 h-[357px] w-full overflow-hidden">
                <div
                  v-if="showPcBackgroundSkeleton"
                  class="absolute inset-0 animate-pulse bg-bg-4 rounded-xl"
                ></div>
                <img
                  v-if="pcBackgroundImage"
                  :src="pcBackgroundImage"
                  alt=""
                  class="h-full w-full transition-opacity duration-300"
                  :class="showPcBackgroundSkeleton ? 'opacity-0' : 'opacity-100'"
                  @load="handlePcBackgroundLoad"
                  @error="handlePcBackgroundError"
                />
              </div>

              <div class="mt-4">
                <div class="flex items-center justify-center flex-col mt-16">
                  <!-- 保持桀骜不训 -->
                  <h2 class="w-full text-center text-4xl font-[700] text-text-1 mb-3">
                    {{ t('common.stay_untamed') }}
                  </h2>
                  <!-- 注册并获得欢迎奖金 -->
                  <p class="w-full text-center text-base font-[700] text-text-1">
                    {{ t('common.sign_up_get_welcome_bonus') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 右侧表单区域 -->
            <div class="w-1/2 bg-bg-1 p-4">
              <LoginFormDesktop
                ref="registerFormDesktopRef"
                default-tab="signup"
                :login-setting="loginRegisterSetting"
                card-switch
                @switch-tab="handleAuthTabSwitch"
                @open-reset-password="openResetPassword"
                @close="handleClose"
              />
            </div>
          </div>

          <!-- 忘记密码弹窗 -->
          <div
            class="absolute inset-0 flex rounded-2xl overflow-hidden transition-all duration-500 ease-in-out"
            :class="getResetPasswordClass()"
            style="box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5)"
          >
            <!-- 关闭按钮 -->
            <button
              class="absolute top-5 right-5 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
              @click="handleClose"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>

            <!-- 左侧图片区域 -->
            <div class="w-1/2 p-6 flex flex-col bg-bg-2">
              <div class="z-10 w-full flex justify-center">
                <SmartImage
                  v-if="authLogoUrl"
                  :src="authLogoUrl"
                  alt=""
                  class="h-12 w-auto object-contain"
                />
                <MainLogoIcon v-else class="h-12 w-auto text-text-1" />
              </div>

              <div class="relative mt-6 h-[357px] w-full overflow-hidden">
                <div
                  v-if="showPcBackgroundSkeleton"
                  class="absolute inset-0 animate-pulse bg-bg-4 rounded-xl"
                ></div>
                <img
                  v-if="pcBackgroundImage"
                  :src="pcBackgroundImage"
                  alt=""
                  class="h-full w-full transition-opacity duration-300"
                  :class="showPcBackgroundSkeleton ? 'opacity-0' : 'opacity-100'"
                  @load="handlePcBackgroundLoad"
                  @error="handlePcBackgroundError"
                />
              </div>

              <div class="mt-4">
                <div class="flex items-center justify-center flex-col mt-16">
                  <!-- 保持桀骜不训 -->
                  <h2 class="w-full text-center text-4xl font-[700] text-text-1 mb-3">
                    {{ t('common.stay_untamed') }}
                  </h2>
                  <!-- 注册并获得欢迎奖金 -->
                  <p class="w-full text-center text-base font-[700] text-text-1">
                    {{ t('common.sign_up_get_welcome_bonus') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 右侧表单区域 -->
            <div class="w-1/2 bg-bg-1 p-4">
              <ResetPasswordDesktop @reset-success="handleResetPasswordSuccess" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import CloseIcon from '@/static/svg/close.svg?component'
import LoginFormDesktop from './LoginFormDesktop.vue'
import LoginFormMobile from './LoginFormMobile.vue'
import ResetPasswordMobile from './ResetPasswordMobile.vue'
import ResetPasswordDesktop from './ResetPasswordDesktop.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useI18n } from 'vue-i18n'
import MainLogoIcon from '@/static/svg/main-logo.svg?component'
import Api from '@/api'
import { resolveGameImageUrl } from '@/utils/image'
import { getLanguageCode } from '@/utils/locale'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useThemeStore } from '@/stores/theme'
import type { QuerySlideshowItem } from '@/api/interface/home.interface'
import type { LoginSetResult } from '@/api/interface/login_register'

// 是否为移动端
const isMobile = useIsMobile()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const siteConfigStore = useSiteConfigStore()
const { theme } = storeToRefs(themeStore)
const { currentLanguage } = storeToRefs(localeStore)
const { t } = useI18n()

const authBannerRecords = ref<QuerySlideshowItem[]>([])
const isAuthBannerLoading = ref(false)
const isPcBackgroundLoaded = ref(false)
const loginRegisterSetting = ref<LoginSetResult | null>(null)

const authLogoChannelId = computed(() => (isMobile.value ? 4 : 3))
// sy/dlicgh 中 channelId 3 为 PC，4 为 H5；弹窗 logo 使用当前语言的 homeTopVersion。
const authLogoUrl = computed(() =>
  siteConfigStore.getHomeTopLogoUrl(authLogoChannelId.value, currentLanguage.value)
)

const ensureAuthLogoConfig = () => {
  void siteConfigStore.initSiteConfig()
}

// 登录/注册弹窗图片地址。
const resolveAuthBannerUrl = (value: unknown) => {
  return resolveGameImageUrl(value)
}

// 根据当前主题决定登录/注册弹窗实际使用的图片。
const resolveAuthBannerUrlByTheme = (item?: QuerySlideshowItem | null) => {
  const darkThemeImageUrl = resolveAuthBannerUrl(item?.url)
  const lightThemeImageUrl = resolveAuthBannerUrl(item?.skinUrl)

  if (theme.value === 'dark') {
    return darkThemeImageUrl
  }

  return lightThemeImageUrl || darkThemeImageUrl
}

// 根据 deploymentPath=5 的轮播图记录和当前主题生成弹窗背景图。
const authBannerImageUrl = computed(() => {
  return (
    authBannerRecords.value
      .filter(item => Number(item?.deploymentPath) === 5)
      .map(item => resolveAuthBannerUrlByTheme(item))
      .find(Boolean) || ''
  )
})

// 登录/注册弹窗背景图
const pcBackgroundImage = computed(() => {
  return authBannerImageUrl.value
})

const showPcBackgroundSkeleton = computed(() => {
  return (
    (!pcBackgroundImage.value && isAuthBannerLoading.value) ||
    (!!pcBackgroundImage.value && !isPcBackgroundLoaded.value)
  )
})

const mobileBackgroundImage = computed(() => {
  return authBannerImageUrl.value
})

interface Props {
  modelValue: boolean
  defaultTab?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'login'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const activeTab = ref<'login' | 'register' | 'resetPassword'>(props.defaultTab)
const showResetPassword = ref(false)
const loginFormDesktopRef = ref<InstanceType<typeof LoginFormDesktop> | null>(null)
const registerFormDesktopRef = ref<InstanceType<typeof LoginFormDesktop> | null>(null)

watch(
  () => pcBackgroundImage.value,
  () => {
    isPcBackgroundLoaded.value = false
  },
  { immediate: true }
)

watch([() => props.modelValue, () => isMobile.value], async ([newVal]) => {
  if (newVal) {
    activeTab.value = props.defaultTab
    showResetPassword.value = false
    ensureAuthLogoConfig()
    await nextTick()
    if (!isMobile.value) {
      loginFormDesktopRef.value?.resetForm()
      registerFormDesktopRef.value?.resetForm()
    }
    // 弹窗打开时请求登录注册配置
    await fetchLoginAndRegisterSetting()
    // 请求登录/注册弹窗图片
    await fetchAuthBannerImage()
  }
})

watch(currentLanguage, () => {
  if (props.modelValue) {
    ensureAuthLogoConfig()
  }
})

// 请求登录注册配置
const fetchLoginAndRegisterSetting = async () => {
  try {
    const response = await Api.auth.getLoginAndRegisterSetting({})
    loginRegisterSetting.value = response?.result || null
    console.log('登录注册配置:', response)
  } catch (error) {
    loginRegisterSetting.value = null
    console.error(error)
  }
}

// 请求登录/注册弹窗图片
const fetchAuthBannerImage = async () => {
  isAuthBannerLoading.value = true

  try {
    const response = await Api.home.getQuerySlideshow({
      languageCode: getLanguageCode(),
      channelId: isMobile.value ? '4' : '3',
      page: {
        current: 1,
        size: 10
      }
    })

    authBannerRecords.value = Array.isArray(response?.result?.records)
      ? response.result.records
      : []
  } catch (error) {
    authBannerRecords.value = []
    console.error(error)
  } finally {
    isAuthBannerLoading.value = false
  }
}

const handlePcBackgroundLoad = () => {
  isPcBackgroundLoaded.value = true
}

const handlePcBackgroundError = () => {
  isPcBackgroundLoaded.value = true
}

watch(
  () => props.defaultTab,
  newVal => {
    if (props.modelValue) {
      activeTab.value = newVal
    }
  }
)

const handleClose = () => {
  showResetPassword.value = false
  activeTab.value = 'login'
  emit('update:modelValue', false)
}

const openResetPassword = () => {
  if (isMobile.value) {
    showResetPassword.value = true
  } else {
    if (isAnimating.value) return
    isAnimating.value = true
    isSliding.value = true
    activeTab.value = 'resetPassword'
    setTimeout(() => {
      isAnimating.value = false
      isSliding.value = false
    }, 500)
  }
}

/**
 * 打开 PC 注册卡片，并复用忘记密码弹窗的卡片滑入动画。
 */
const openRegister = () => {
  if (isAnimating.value) return

  isAnimating.value = true
  isSliding.value = true
  activeTab.value = 'register'

  setTimeout(() => {
    isAnimating.value = false
    isSliding.value = false
  }, 500)
}

/**
 * 从 PC 注册卡片切回登录卡片，并保持与进入注册/忘记密码一致的滑入方向。
 */
const backToLogin = () => {
  if (isAnimating.value) return

  isAnimating.value = true
  isSliding.value = true
  activeTab.value = 'login'

  setTimeout(() => {
    isAnimating.value = false
    isSliding.value = false
  }, 500)
}

/**
 * 接收表单内部的登录/注册切换请求，交给外层卡片动画处理。
 */
const handleAuthTabSwitch = (tab: 'signin' | 'signup') => {
  if (tab === 'signup') {
    openRegister()
    return
  }

  backToLogin()
}

const handleResetPasswordClose = () => {
  showResetPassword.value = false
  emit('update:modelValue', false)
}
const isResetPasswordClosing = ref(false)

/**
 * 重置密码成功后，统一切回登录弹窗。
 */
const handleResetPasswordSuccess = () => {
  showResetPassword.value = false

  if (isMobile.value) {
    activeTab.value = 'login'
    return
  }

  isAnimating.value = true
  isResetPasswordClosing.value = true

  setTimeout(() => {
    activeTab.value = 'login'
    isAnimating.value = false
    isSliding.value = false
    isResetPasswordClosing.value = false
  }, 500)
}

const isAnimating = ref(false)
const isSliding = ref(false)

// 登入/注册弹窗
const getLoginClass = () => {
  if (activeTab.value === 'login') {
    return 'translate-x-0 z-20 opacity-100'
  } else if (isResetPasswordClosing.value) {
    return 'translate-x-0 z-10 opacity-100'
  } else if (isSliding.value) {
    return '-translate-x-full z-10 opacity-0'
  } else {
    return 'translate-x-full z-10 opacity-0'
  }
}

// 注册弹窗
const getRegisterClass = () => {
  if (activeTab.value === 'register') {
    return 'translate-x-0 z-20 opacity-100'
  } else if (isSliding.value) {
    return '-translate-x-full z-10 opacity-0'
  } else {
    return 'translate-x-full z-10 opacity-0'
  }
}

// 忘记密码弹窗
const getResetPasswordClass = () => {
  if (activeTab.value === 'resetPassword' && isResetPasswordClosing.value) {
    return 'translate-x-full z-20 opacity-0'
  }

  if (activeTab.value === 'resetPassword') {
    return 'translate-x-0 z-20 opacity-100'
  } else if (isSliding.value) {
    return '-translate-x-full z-10 opacity-0'
  } else {
    return 'translate-x-full z-10 opacity-0'
  }
}
</script>

<style scoped lang="scss">
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}

.modal-fade-enter-active .modal-container {
  animation: modalZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active .modal-container {
  animation: modalZoomOut 0.3s cubic-bezier(0.7, 0, 0.84, 0);
}

@keyframes modalZoomIn {
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
}

@keyframes modalZoomOut {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.8);
  }
}
</style>
