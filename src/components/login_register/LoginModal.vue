<template>
  <!-- H5 端登录/注册 -->
  <LoginFormMobile
    v-if="isMobile"
    :visible="modelValue && !showResetPassword"
    :default-tab="defaultTab === 'register' ? 'signup' : 'signin'"
    @update:visible="handleClose"
    @open-reset-password="openResetPassword"
  />

  <!-- H5 端忘记密码 -->
  <ResetPasswordMobile
    v-if="isMobile"
    :visible="showResetPassword"
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
              <CloseIcon class="w-4 h-4 fill-none" />
            </button>

            <!-- 左侧图片区域 -->
            <div class="w-1/2 p-6 flex flex-col bg-bg-2">
              <div class="z-10 w-full flex justify-center">
                <img src="/src/static/img/home/logo.png" alt="Logo" class="w-auto h-12" />
              </div>

              <div class="w-full h-[245px] mt-6">
                <img :src="pcBackgroundImage" alt="" class="w-full h-full" />
              </div>

              <div class="mt-6">
                <div class="mb-3 mt-6 flex items-stretch justify-between">
                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <GiftIcon class="w-5 h-5 fill-none" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">470%</span>
                    </div>
                    <!-- 首存奖金 -->
                    <div class="text-[10px] text-text-2 mt-2 text-center">
                      {{ t('locales.common.welcome_deposit_bonus') }}
                    </div>
                  </div>

                  <div class="w-px bg-[#e4eaf019]"></div>

                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <TurntableIcon class="w-5 h-5 fill-none" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">5 BTC</span>
                    </div>
                    <!-- 每日免费幸运旋转 -->
                    <div class="text-[10px] text-text-2 mt-2 text-center">
                      {{ t('locales.common.free_daily_lucky_spin') }}
                    </div>
                  </div>

                  <div class="w-px bg-[#e4eaf019]"></div>

                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <FreePerksIcon class="w-5 h-5 fill-none" />
                      <!-- 免费福利 -->
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">
                        {{ t('locales.common.free_perks') }}
                      </span>
                    </div>
                    <!-- 每日免费参与奖金 -->
                    <div class="text-[10px] text-text-2 mt-2 text-center">
                      {{ t('locales.common.daily_free_rewards_bonuses') }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-center flex-col mt-6">
                  <!-- 保持桀骜不训 -->
                  <h2 class="w-full text-center text-[36px] font-[800] text-text-1 mb-1">
                    {{ t('locales.common.stay_untamed') }}
                  </h2>
                  <!-- 注册并获得欢迎奖金 -->
                  <p class="w-full text-center text-[16px] font-[600] text-text-1">
                    {{ t('locales.common.sign_up_get_welcome_bonus') }}
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
              <CloseIcon class="w-4 h-4 fill-none" />
            </button>

            <!-- 左侧图片区域 -->
            <div class="w-1/2 p-6 flex flex-col bg-bg-2">
              <div class="z-10 w-full flex justify-center">
                <img src="/src/static/img/home/logo.png" alt="Logo" class="w-auto h-12" />
              </div>

              <div class="w-full h-[245px] mt-6">
                <img :src="pcBackgroundImage" alt="" class="w-full h-full" />
              </div>

              <div class="mt-6">
                <div class="mb-3 mt-6 flex items-stretch justify-between">
                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <GiftIcon class="w-5 h-5 fill-none" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">470%</span>
                    </div>
                    <!-- 首存奖金 -->
                    <div class="text-[10px] text-text-2 mt-2 text-center">
                      {{ t('locales.common.welcome_deposit_bonus') }}
                    </div>
                  </div>

                  <div class="w-px bg-[#e4eaf019]"></div>

                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <TurntableIcon class="w-5 h-5 fill-none" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">5 BTC</span>
                    </div>
                    <!-- 每日免费幸运旋转 -->
                    <div class="text-[10px] text-text-2 mt-2 text-center">
                      {{ t('locales.common.free_daily_lucky_spin') }}
                    </div>
                  </div>

                  <div class="w-px bg-[#e4eaf019]"></div>

                  <div class="flex-1 flex flex-col items-center justify-start px-2">
                    <div class="flex items-center justify-center">
                      <FreePerksIcon class="w-5 h-5 fill-none" />
                      <!-- 免费福利 -->
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">{{
                        t('locales.common.free_perks')
                      }}</span>
                    </div>
                    <!-- 每日免费参与奖金 -->
                    <div class="text-[10px] text-text-2 mt-2 text-center">
                      {{ t('locales.common.daily_free_rewards_bonuses') }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-center flex-col mt-6">
                  <!-- 保持桀骜不训 -->
                  <h2 class="w-full text-center text-[36px] font-[800] text-text-1 mb-1">
                    {{ t('locales.common.stay_untamed') }}
                  </h2>
                  <!-- 注册并获得欢迎奖金 -->
                  <p class="w-full text-center text-[16px] font-[600] text-text-1">
                    {{ t('locales.common.sign_up_get_welcome_bonus') }}
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
import GiftIcon from '@/static/svg/login/gift.svg?component'
import TurntableIcon from '@/static/svg/login/turntable.svg?component'
import FreePerksIcon from '@/static/svg/login/free_perks.svg?component'
import LoginFormDesktop from './LoginFormDesktop.vue'
import LoginFormMobile from './LoginFormMobile.vue'
import ResetPasswordMobile from './ResetPasswordMobile.vue'
import ResetPasswordDesktop from './ResetPasswordDesktop.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'
import loginPcDark from '@/static/img/home/login_pc_h.png'
import loginPcLight from '@/static/img/home/login_pc_b.png'
import Api from '@/api'

// 是否为移动端
const isMobile = useIsMobile()
const themeStore = useThemeStore()
const { t } = useI18n()

// 主题动态背景图
const pcBackgroundImage = computed(() => {
  return themeStore.theme === 'dark' ? loginPcDark : loginPcLight
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

watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      activeTab.value = props.defaultTab
      showResetPassword.value = false
      // 弹窗打开时请求登录注册配置
      await fetchLoginAndRegisterSetting()
      if (!isMobile.value) {
        loginFormDesktopRef.value?.resetForm()
      }
    }
  }
)

// 请求登录注册配置
const fetchLoginAndRegisterSetting = async () => {
  try {
    const response = await Api.auth.getLoginAndRegisterSetting({})
    console.log('登录注册配置:', response)
  } catch (error) {
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
