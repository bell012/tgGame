<template>
  <ResetPasswordFormCore ref="resetPasswordFormRef">
    <template
      #default="{
        showPassword,
        showConfirmPassword,
        formData,
        isResetValid,
        countdown,
        togglePassword,
        toggleConfirmPassword,
        handleSendCode,
        handleResetPassword,
        handleAccountInput,
        handleCodeInput,
        handlePasswordInput,
        handleConfirmPasswordInput
      }"
    >
      <teleport to="body">
        <transition name="drawer-mask">
          <div
            v-if="visible"
            class="fixed inset-0 bg-black/60 z-[10000] overflow-hidden"
            @click="handleClose"
          >
            <transition name="drawer-slide">
              <div
                v-if="showDrawer"
                class="absolute right-0 top-0 h-full w-full bg-bg-1 overflow-y-auto shadow-2xl"
                @click.stop
              >
                <div class="w-full relative h-50 box-content">
                  <div class="w-full z-10 p-4">
                    <div class="flex items-center justify-between">
                      <img
                        src="/src/static/img/home/logo.png"
                        alt="BC.GAME Logo"
                        class="w-auto h-12"
                      />
                      <button
                        class="w-7 h-7 bg-opacity-10 rounded-md flex items-center justify-center"
                        @click="handleClose"
                      >
                        <CloseIcon class="w-3 h-3 fill-none" />
                      </button>
                    </div>
                    <div class="flex flex-col justify-start space-y-4 h-[140px] mt-4 headBg">
                      <div class="flex-col">
                        <h2 class="flex items-center text-xs">
                          <GiftIcon class="w-3.5 h-3.5 fill-none" />
                          <div class="ml-1.5 text-text-1">470%</div>
                        </h2>
                        <!-- 首存奖金 -->
                        <p class="text-text-2 mt-0.5 text-[9px]">
                          {{ t('locales.common.welcome_deposit_bonus') }}
                        </p>
                      </div>
                      <div class="flex-col">
                        <h2 class="flex items-center text-xs">
                          <TurntableIcon class="w-3.5 h-3.5 fill-none" />
                          <div class="ml-1.5 text-text-1">5 BTC%</div>
                        </h2>
                        <!-- 每日免费幸运旋转 -->
                        <p class="text-text-2 mt-0.5 text-[9px]">
                          {{ t('locales.common.free_daily_lucky_spin') }}
                        </p>
                      </div>
                      <div class="flex-col">
                        <h2 class="flex items-center text-xs">
                          <FreePerksIcon class="w-3.5 h-3.5 fill-none" />
                          <!-- 免费福利 -->
                          <div class="ml-1.5 text-text-1">{{ t('locales.common.free_perks') }}</div>
                        </h2>
                        <!-- 每日免费奖励与奖金 -->
                        <p class="text-text-2 mt-0.5 text-[9px]">
                          {{ t('locales.common.daily_free_rewards_bonuses') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="px-4 pb-6">
                  <div class="flex gap-6 mb-3.5 h-[32px]">
                    <button
                      class="relative pb-1.5 text-lg font-[800] transition-all duration-200 tab-button-new mr-20"
                    >
                      <!-- 重置密码 -->
                      <span>{{ t('locales.common.reset_password') }}</span>
                      <div
                        class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
                      ></div>
                    </button>
                  </div>

                  <!-- 账号 -->
                  <div class="text-sm font-[700] text-text-1 mb-1.5">
                    {{ t('locales.common.account') }}
                  </div>
                  <div class="mb-3">
                    <!-- 请输入账号 -->
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-theme-level-1)] text-xs font-[500]"
                      >
                        +63
                      </span>
                      <input
                        :value="formData.account"
                        type="text"
                        inputmode="numeric"
                        :placeholder="t('locales.common.enter_account')"
                        class="w-full h-[47px] pl-12 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                        @input="handleAccountInput"
                      />
                    </div>
                  </div>

                  <!-- 验证码 -->
                  <div class="text-sm font-[700] text-text-1 mb-1.5">
                    {{ t('locales.common.verification') }}
                  </div>
                  <div class="mb-3">
                    <div class="relative">
                      <SafeIcon
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none"
                      />
                      <!-- 请输入验证码 -->
                      <input
                        :value="formData.code"
                        type="text"
                        inputmode="numeric"
                        :placeholder="t('locales.common.enter_verification')"
                        class="w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                        @input="handleCodeInput"
                      />
                      <!-- 获取验证码 -->
                      <button
                        type="button"
                        class="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 bg-secondary-3 text-theme-primary text-xs font-[500] rounded-lg transition-opacity"
                        :class="{ 'opacity-50 cursor-not-allowed': countdown > 0 }"
                        :disabled="countdown > 0"
                        @click="handleSendCode"
                      >
                        {{ countdown > 0 ? `${countdown}s` : t('locales.common.get_code') }}
                      </button>
                    </div>
                  </div>

                  <!-- 密码 -->
                  <div class="text-sm font-[700] text-text-1 mb-1.5">
                    {{ t('locales.common.password') }}
                  </div>
                  <div class="mb-3">
                    <div class="relative">
                      <PasswordIcon
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none"
                      />
                      <!-- 请输入密码 -->
                      <input
                        :value="formData.password"
                        :type="showPassword ? 'text' : 'password'"
                        :placeholder="t('locales.common.enter_password')"
                        class="w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                        @input="handlePasswordInput"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                        @click="togglePassword"
                      >
                        <EyeIcon v-if="!showPassword" class="w-4 h-4 fill-none" />
                        <EyeOffIcon v-else class="w-4 h-4 fill-none" />
                      </button>
                    </div>
                  </div>

                  <!-- 确认密码 -->
                  <div class="text-sm font-[700] text-text-1 mb-1.5">
                    {{ t('locales.common.confirm_password') }}
                  </div>
                  <div class="mb-10">
                    <div class="relative">
                      <PasswordIcon
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none"
                      />
                      <!-- 请输入确认密码 -->
                      <input
                        :value="formData.confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        :placeholder="t('locales.common.enter_confirm_password')"
                        class="w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                        @input="handleConfirmPasswordInput"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                        @click="toggleConfirmPassword"
                      >
                        <EyeIcon v-if="!showConfirmPassword" class="w-4 h-4 fill-none" />
                        <EyeOffIcon v-else class="w-4 h-4 fill-none" />
                      </button>
                    </div>
                  </div>

                  <!-- 确认 -->
                  <button
                    class="btn-primary w-full h-[47px] rounded-lg text-base text-text-4 transition-all"
                    :class="{ 'opacity-40 cursor-not-allowed': !isResetValid }"
                    :disabled="!isResetValid"
                    @click="handleResetPassword"
                  >
                    {{ t('locales.common.confirm') }}
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </teleport>
    </template>
  </ResetPasswordFormCore>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import CloseIcon from '@/static/svg/close.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import GiftIcon from '@/static/svg/login/gift.svg?component'
import TurntableIcon from '@/static/svg/login/turntable.svg?component'
import FreePerksIcon from '@/static/svg/login/free_perks.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?component'
import PasswordIcon from '@/static/svg/login/password.svg?component'
import ResetPasswordFormCore from './ResetPasswordFormCore.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const showDrawer = ref(false)
const resetPasswordFormRef = ref<InstanceType<typeof ResetPasswordFormCore> | null>(null)

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      await nextTick()
      setTimeout(() => {
        showDrawer.value = true
      }, 50)
    } else {
      showDrawer.value = false
    }
  },
  { immediate: true }
)

const handleClose = () => {
  showDrawer.value = false
  setTimeout(() => {
    resetPasswordFormRef.value?.resetForm()
    emit('update:visible', false)
  }, 350)
}
</script>

<style scoped lang="scss">
.headBg {
  background: url('/src/static/img/home/login_h5_h.png') no-repeat;
  background-size: 100% 100%;
}

:root.light .headBg {
  background: url('/src/static/img/home/login_h5_b.png') no-repeat;
  background-size: 100% 100%;
}

.tab-button {
  position: relative;
  overflow: hidden;

  &:active {
    animation: nod 0.2s ease-out;
  }
}

@keyframes nod {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(0);
  }
}

// 遮罩层淡入淡出动画
.drawer-mask-enter-active,
.drawer-mask-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-mask-enter-from,
.drawer-mask-leave-to {
  opacity: 0;
}

.drawer-mask-enter-to,
.drawer-mask-leave-from {
  opacity: 1;
}

// 抽屉滑动动画 - 从右往左滑入，从左往右滑出
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.drawer-slide-enter-to,
.drawer-slide-leave-from {
  transform: translateX(0);
}
</style>
