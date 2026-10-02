<template>
  <div class="security-settings px-6 pb-6 pt-0">
    <h1
      class="text-sm font-bold text-text-1 mb-3 flex items-center gap-0.5 h-14 border-b border-opacity-6 required"
    >
      {{ t('securitySettings.pageTitle') }}
    </h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      <div
        v-for="card in cards"
        :key="card.cardKey"
        class="rounded-xl bg-bg-3 p-5 sm:p-6 flex flex-col min-h-[200px] border border-transparent transition-colors"
      >
        <div class="flex items-start justify-between gap-3 mb-4">
          <component :is="card.icon" class="w-6 h-6 shrink-0 text-icon-2" />
          <div
            v-if="card.active"
            class="flex h-6 w-6 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <SuccessIcon class="w-6 h-6" />
          </div>
          <div
            v-else
            class="flex h-6 w-6 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <WarningIcon class="w-6 h-6" />
          </div>
        </div>
        <h2 class="text-base font-bold text-text-1 mb-2">
          {{ t(`securitySettings.cards.${card.cardKey}.title`) }}
        </h2>
        <p class="text-xs sm:text-sm text-text-2 leading-relaxed mb-5 flex-1">
          {{ t(`securitySettings.cards.${card.cardKey}.desc`) }}
        </p>
        <button
          type="button"
          :class="[
            'w-full h-12 rounded-lg text-sm font-bold shrink-0',
            card.active ? 'security-btn-secondary' : 'bg-theme-primary text-text-4'
          ]"
          @click="handleOpenChangeLoginPassword(card.cardKey)"
        >
          {{ getCardActionText(card.cardKey) }}
        </button>
      </div>
    </div>
    <ChangeLoginPasswordPcLayout
      v-model="showChangeLoginPasswordPopup"
      @open-mobile-number="handleOpenMobileNumberFromLoginPassword"
    />
    <!-- 修改手机号码弹窗 -->
    <ChangeMobileNumberPcLayout v-model="showChangeMobileNumberPopup" />
    <!-- 交易密码弹窗 -->
    <TransactionPassword
      v-model="showTransactionPasswordPopup"
      @open-mobile-number="handleOpenMobileNumberFromTransactionPassword"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ChangeLoginPasswordPcLayout from '../changeLoginPassword/pc-layout.vue'
import ChangeMobileNumberPcLayout from '../changeMobileNumber/pc-layout.vue'
import TransactionPassword from '../transactionPassword/pc-layout.vue'
import SuccessIcon from '@/static/svg/security/success.svg?component'
import WarningIcon from '@/static/svg/security/warning.svg?component'
import { useSecurityCards, type SecurityCardKey } from '@/composables/useSecurityCards'

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const { cards } = useSecurityCards(userInfo)

const hasLoginMobile = computed(() => {
  return (
    String(userInfo.value?.areaCode ?? '').trim().length > 0 &&
    String(userInfo.value?.telephone ?? '').trim().length > 0
  )
})

const hasTransactionPassword = computed(() => {
  return String(userInfo.value?.busiPwd ?? '').trim().length > 0
})

// 修改登录密码弹窗
const showChangeLoginPasswordPopup = ref(false)
// 修改手机号码弹窗
const showChangeMobileNumberPopup = ref(false)
// 交易密码弹窗
const showTransactionPasswordPopup = ref(false)

/** 根据任务中心携带的安全操作参数，打开 PC 已有的对应弹窗。 */
const openTaskCenterSecurityAction = (value: unknown) => {
  const action = String(Array.isArray(value) ? value[0] : (value ?? '')).trim()

  if (action === 'transaction-password') {
    showTransactionPasswordPopup.value = true
    return
  }

  if (action === 'mobile-number') {
    showChangeMobileNumberPopup.value = true
  }
}

/** 在进入或复用安全页面时响应任务中心跳转意图。 */
watch(() => route.query.taskCenterSecurityAction, openTaskCenterSecurityAction, { immediate: true })
/**
 * 从修改登录密码弹窗切换到设置手机号码弹窗。
 */
const handleOpenMobileNumberFromLoginPassword = () => {
  showChangeLoginPasswordPopup.value = false
  showChangeMobileNumberPopup.value = true
}

/**
 * 从交易密码弹窗切换到设置手机号码弹窗。
 */
const handleOpenMobileNumberFromTransactionPassword = () => {
  showTransactionPasswordPopup.value = false
  showChangeMobileNumberPopup.value = true
}

/**
 * 打开对应的 PC 安全设置弹窗。
 */
const handleOpenChangeLoginPassword = (_key: SecurityCardKey) => {
  switch (_key) {
    case 'loginPassword':
      showChangeLoginPasswordPopup.value = true
      break
    case 'mobile':
      showChangeMobileNumberPopup.value = true
      break
    default:
      showTransactionPasswordPopup.value = true
      break
  }
}

/**
 * 根据登录方式显示手机号操作文案。
 */
const getCardActionText = (cardKey: SecurityCardKey) => {
  if (cardKey === 'mobile' && !hasLoginMobile.value) {
    return t('common.setMobileNumber')
  }

  if (cardKey === 'transactionPassword') {
    return hasTransactionPassword.value
      ? t('common.changeTransactionPassword')
      : t('common.setTransactionPassword')
  }

  return t(`securitySettings.cards.${cardKey}.action`)
}
</script>

<style scoped lang="scss">
.security-btn-secondary {
  color: var(--color-text-level-2);
  font-weight: 700;
  background-color: var(--color-opacity-10);
  cursor: pointer;
  box-shadow: none;
}
</style>
