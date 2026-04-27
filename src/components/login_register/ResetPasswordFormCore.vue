<template>
  <slot
    :show-password="showPassword"
    :show-confirm-password="showConfirmPassword"
    :form-data="formData"
    :is-reset-valid="isResetValid"
    :countdown="countdown"
    :toggle-password="togglePassword"
    :toggle-confirm-password="toggleConfirmPassword"
    :handle-send-code="handleSendCode"
    :handle-reset-password="handleResetPassword"
    :handle-account-input="handleAccountInput"
    :handle-code-input="handleCodeInput"
    :handle-password-input="handlePasswordInputHandler"
    :handle-confirm-password-input="handleConfirmPasswordInput"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePersistentCountdown } from '@/composables/usePersistentCountdown'
import {
  handleLoosePhoneInput,
  handlePasswordInput,
  handleVerificationCodeInput,
  isValidPhoneNumber,
  isValidPassword
} from '@/utils/phone-input'
import Api from '@/api'
import { getDefaultAreaCode } from '@/utils/locale'
import { StringExtension } from '@/utils/string-extension'
import { globalShowToast } from '@/utils/toast.ts'
import { useI18n } from 'vue-i18n'
import { useAuthModalStore } from '@/stores/authModal'

const { t } = useI18n()
const defaultAreaCode = getDefaultAreaCode()
const RESET_PASSWORD_SMS_COUNTDOWN_STORAGE_KEY = 'reset-password-sms-countdown'
const authModalStore = useAuthModalStore()

const emit = defineEmits<{
  'reset-success': []
}>()

const {
  remainingSeconds: countdown,
  startCountdown,
  syncCountdown
} = usePersistentCountdown({
  storageKey: RESET_PASSWORD_SMS_COUNTDOWN_STORAGE_KEY,
  durationSeconds: 60
})

// 密码显示状态
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 表单数据
const formData = ref({
  account: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 重置密码表单验证
const isResetValid = computed(() => {
  return (
    formData.value.account.length > 0 &&
    formData.value.code.length > 0 &&
    formData.value.password.length > 0 &&
    formData.value.confirmPassword.length > 0
  )
})

/**
 * 处理账号输入。
 */
const handleAccountInput = (event: Event) => {
  handleLoosePhoneInput(event, (value: string) => {
    formData.value.account = value
  })
}

/**
 * 处理验证码输入。
 */
const handleCodeInput = (event: Event) => {
  handleVerificationCodeInput(event, (value: string) => {
    formData.value.code = value
  })
}

/**
 * 处理密码输入。
 */
const handlePasswordInputHandler = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.password = value
  })
}

/**
 * 处理确认密码输入。
 */
const handleConfirmPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.confirmPassword = value
  })
}

// 切换密码显示/隐藏
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 切换确认密码显示/隐藏
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

/**
 * 校验手机号是否符合登录/注册/忘记密码。
 */
const validatePhoneNumber = (value: string) => {
  if (!isValidPhoneNumber(value)) {
    globalShowToast(t('common.pleaseEnterCorrectPhone'))
    return false
  }

  return true
}

/**
 * 校验密码是否满足 6-16 位字母和数字组合规则。
 */
const validatePasswordRule = (value: string) => {
  if (!isValidPassword(value)) {
    globalShowToast(t('common.passwordRuleInvalid'))
    return false
  }

  return true
}

/**
 * 校验两次输入的密码是否一致。
 */
const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (password !== confirmPassword) {
    globalShowToast(t('common.passwordMismatch'))
    return false
  }

  return true
}

/**
 * 处理发送验证码。
 */
const handleSendCode = async () => {
  if (countdown.value > 0) {
    return
  }

  try {
    const telephone = formData.value.account
    if (!telephone) {
      globalShowToast(t('common.pleaseEnterThePhoneNumber'))
      return
    }

    if (!validatePhoneNumber(telephone)) {
      return
    }

    // 发送短信接口
    const response = await Api.auth.sendSms({
      telephone: telephone,
      areaCode: defaultAreaCode
    })
    // 只有短信接口返回 C2 时，才开始60秒倒计时
    if (response?.code === 'C2') {
      startCountdown()
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * 处理重置密码。
 */
const handleResetPassword = async () => {
  if (!validatePhoneNumber(formData.value.account)) {
    return
  }

  if (!validatePasswordRule(formData.value.password)) {
    return
  }

  if (!validateConfirmPassword(formData.value.password, formData.value.confirmPassword)) {
    return
  }

  try {
    // 构建重置密码参数
    const resetPasswordData = {
      memberPwd: StringExtension.md5(formData.value.password), // 新密码
      smsCode: formData.value.code, // 短信验证码
      telephone: formData.value.account, // 手机号
      areaCode: defaultAreaCode, // 区号
      memberId: formData.value.account // 会员账号
    }

    // 重置密码接口
    const response = await Api.auth.resetPassword(resetPasswordData)
    // 重置密码成功后，重置表单并切回登录弹窗。
    if (response.code == 'C2') {
      resetForm()
      authModalStore.openLoginModal()
      emit('reset-success')
    }
  } catch (error) {
    console.error(error)
  }
}

// 重置表单数据
const resetForm = () => {
  // 重置表单字段
  formData.value.account = ''
  formData.value.code = ''
  formData.value.password = ''
  formData.value.confirmPassword = ''

  // 重置密码显示状态
  showPassword.value = false
  showConfirmPassword.value = false

  // 同步当前倒计时状态
  syncCountdown()
}

defineExpose({
  formData,
  showPassword,
  showConfirmPassword,
  isResetValid,
  countdown,
  togglePassword,
  toggleConfirmPassword,
  handleSendCode,
  handleResetPassword,
  handleAccountInput,
  handleCodeInput,
  handlePasswordInputHandler,
  handleConfirmPasswordInput,
  resetForm
})
</script>
