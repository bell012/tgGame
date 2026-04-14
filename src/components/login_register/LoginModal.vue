<template>
  <!-- H5 端登录/注册 -->
  <LoginFormMobile
    v-if="isMobile"
    :visible="modelValue && !showResetPassword"
    :default-tab="defaultTab === 'register' ? 'signup' : 'signin'"
    :background-image-url="mobileBackgroundImage"
    @update:visible="handleClose"
    @open-reset-password="openResetPassword"
  />

  <!-- H5 端忘记密码 -->
  <ResetPasswordMobile
    v-if="isMobile"
    :visible="showResetPassword"
    :background-image-url="mobileBackgroundImage"
    @update:visible="handleResetPasswordClose"
  />

  <!-- PC 端登录 -->
  <teleport v-if="!isMobile" to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-[#000a] flex items-center justify-center z-[10000] overflow-hidden"
      >
        <div
          class="relative w-full max-w-[800px] h-full sm:max-h-[640px] overflow-hidden rounded-2xl modal-container"
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
              <CloseIcon class="w-4 h-4 text-text-1" />
            </button>

            <!-- 左侧图片区域 -->
            <div class="w-1/2 p-6 flex flex-col bg-bg-2">
              <div class="z-10 w-full flex justify-center">
                <MainLogoIcon class="h-12 w-auto text-text-1" />
              </div>

              <div class="w-full h-[245px] mt-6">
                <SmartImage :src="pcBackgroundImage" alt="" class="w-full h-full" />
              </div>

              <div class="mt-4">
                <div class="mb-3 flex items-stretch justify-between">
                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <GiftIcon class="w-8 h-8" />
                    </div>
                    <div class="flex items-center justify-center mt-2">
                      <span class="text-base font-[700] text-text-1">470%</span>
                    </div>
                    <!-- 首存奖金 -->
                    <div class="text-[11px] text-text-2 mt-1 text-center">
                      {{ t('common.welcome_deposit_bonus') }}
                    </div>
                  </div>

                  <div class="w-px bg-opacity-5"></div>

                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <TurntableIcon class="w-8 h-8" />
                    </div>
                    <div class="flex items-center justify-center mt-2">
                      <span class="text-base font-[700] text-text-1">5 BTC</span>
                    </div>
                    <!-- 每日免费幸运旋转 -->
                    <div class="text-[11px] text-text-2 mt-1 text-center">
                      {{ t('common.free_daily_lucky_spin') }}
                    </div>
                  </div>

                  <div class="w-px bg-opacity-5"></div>

                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <FreePerksIcon class="w-8 h-8" />
                    </div>
                    <div class="flex items-center justify-center mt-2">
                      <!-- 免费福利 -->
                      <span class="text-base font-[700] text-text-1">
                        {{ t('common.free_perks') }}
                      </span>
                    </div>
                    <!-- 每日免费参与奖金 -->
                    <div class="text-[11px] text-text-2 mt-1 text-center">
                      {{ t('common.daily_free_rewards_bonuses') }}
                    </div>
                  </div>
                </div>

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
            <div class="w-1/2 bg-bg-1 py-5 px-6">
              <LoginFormDesktop
                ref="loginFormDesktopRef"
                :default-tab="defaultTab === 'register' ? 'signup' : 'signin'"
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
              <CloseIcon class="w-4 h-4 text-text-1" />
            </button>

            <!-- 左侧图片区域 -->
            <div class="w-1/2 p-6 flex flex-col bg-bg-2">
              <div class="z-10 w-full flex justify-center">
                <MainLogoIcon class="h-12 w-auto text-text-1" />
              </div>

              <div class="w-full h-[245px] mt-6">
                <SmartImage :src="pcBackgroundImage" alt="" class="w-full h-full" />
              </div>

              <div class="mt-4">
                <div class="mb-3 flex items-stretch justify-between">
                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <GiftIcon class="w-8 h-8" />
                    </div>
                    <div class="flex items-center justify-center mt-2">
                      <span class="text-base font-[700] text-text-1">470%</span>
                    </div>
                    <!-- 首存奖金 -->
                    <div class="text-[11px] text-text-2 mt-1 text-center">
                      {{ t('common.welcome_deposit_bonus') }}
                    </div>
                  </div>

                  <div class="w-px bg-opacity-5"></div>

                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <TurntableIcon class="w-8 h-8" />
                    </div>
                    <div class="flex items-center justify-center mt-2">
                      <span class="text-base font-[700] text-text-1">5 BTC</span>
                    </div>
                    <!-- 每日免费幸运旋转 -->
                    <div class="text-[11px] text-text-2 mt-1 text-center">
                      {{ t('common.free_daily_lucky_spin') }}
                    </div>
                  </div>

                  <div class="w-px bg-opacity-5"></div>

                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <FreePerksIcon class="w-8 h-8" />
                    </div>
                    <div class="flex items-center justify-center mt-2">
                      <!-- 免费福利 -->
                      <span class="text-base font-[700] text-text-1">
                        {{ t('common.free_perks') }}
                      </span>
                    </div>
                    <!-- 每日免费参与奖金 -->
                    <div class="text-[11px] text-text-2 mt-1 text-center">
                      {{ t('common.daily_free_rewards_bonuses') }}
                    </div>
                  </div>
                </div>

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
            <div class="w-1/2 bg-bg-1 py-5 px-6">
              <ResetPasswordDesktop />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import CloseIcon from '@/static/svg/close.svg?component'
import GiftIcon from '@/static/svg/login/gift.svg?skipsvgo'
import TurntableIcon from '@/static/svg/login/turntable.svg?skipsvgo'
import FreePerksIcon from '@/static/svg/login/free_perks.svg?skipsvgo'
import LoginFormDesktop from './LoginFormDesktop.vue'
import LoginFormMobile from './LoginFormMobile.vue'
import ResetPasswordMobile from './ResetPasswordMobile.vue'
import ResetPasswordDesktop from './ResetPasswordDesktop.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useI18n } from 'vue-i18n'
import MainLogoIcon from '@/static/svg/main-logo.svg?component'
import Api from '@/api'
import { getLanguageCode } from '@/utils/locale'

// 是否为移动端
const isMobile = useIsMobile()
const { t } = useI18n()

const ABSOLUTE_IMAGE_URL_PATTERN = /^(data:|blob:|https?:\/\/|\/)/i
const gameImageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
const authBannerImageUrl = ref('')

const resolveAuthBannerUrl = (value: unknown) => {
  const imagePath = String(value ?? '').trim()

  if (!imagePath) {
    return ''
  }

  if (ABSOLUTE_IMAGE_URL_PATTERN.test(imagePath)) {
    return imagePath
  }

  if (!gameImageBaseUrl) {
    return imagePath
  }

  const normalizedImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${gameImageBaseUrl}${normalizedImagePath}`
}

// 登录/注册弹窗背景图
const pcBackgroundImage = computed(() => {
  return authBannerImageUrl.value
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

watch([() => props.modelValue, () => isMobile.value], async ([newVal]) => {
  if (newVal) {
    activeTab.value = props.defaultTab
    showResetPassword.value = false
    await fetchAuthBannerImage()
    if (!isMobile.value) {
      loginFormDesktopRef.value?.resetForm()
    }
  }
})

// 请求登录/注册弹窗图片
const fetchAuthBannerImage = async () => {
  try {
    const response = await Api.home.getQuerySlideshow({
      languageCode: getLanguageCode(),
      channelId: isMobile.value ? '4' : '3',
      page: {
        current: 1,
        size: 10
      }
    })

    const records = Array.isArray(response?.result?.records) ? response.result.records : []
    authBannerImageUrl.value =
      records
        .filter(item => Number(item?.deploymentPath) === 5)
        .map(item => resolveAuthBannerUrl(item?.url))
        .find(Boolean) || ''
  } catch (error) {
    authBannerImageUrl.value = ''
    console.error(error)
  }
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

const handleResetPasswordClose = () => {
  showResetPassword.value = false
  emit('update:modelValue', false)
}

const isAnimating = ref(false)
const isSliding = ref(false)

// 登入/注册弹窗
const getLoginClass = () => {
  if (activeTab.value === 'login' || activeTab.value === 'register') {
    return 'translate-x-0 z-20 opacity-100'
  } else if (isSliding.value) {
    return '-translate-x-full z-10 opacity-0'
  } else {
    return 'translate-x-full z-10 opacity-0'
  }
}

// 忘记密码弹窗
const getResetPasswordClass = () => {
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
