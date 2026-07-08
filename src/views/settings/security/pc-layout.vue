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
        class="rounded-xl bg-bg-3 p-5 sm:p-6 flex flex-col min-h-[200px] border border-transparent hover:border-opacity-10 hover:border-[var(--color-opacity-15)] transition-colors"
      >
        <div class="flex items-start justify-between gap-3 mb-4">
          <component :is="card.icon" class="w-6 h-6 shrink-0 text-icon-2" />
          <div
            v-if="card.active"
            class="flex h-6 w-6 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <SuccessIcon class="w-4 h-4" />
          </div>
          <div
            v-else
            class="flex h-6 w-6 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <WarningIcon class="w-4 h-4" />
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
          {{ t(`securitySettings.cards.${card.cardKey}.action`) }}
        </button>
      </div>
    </div>
    <ChangeLoginPasswordPcLayout v-model="showChangeLoginPasswordPopup" />
    <!-- 修改手机号码弹窗 -->
    <ChangeMobileNumberPcLayout v-model="showChangeMobileNumberPopup" />
    <!-- 交易密码弹窗 -->
    <TransactionPassword v-model="showTransactionPasswordPopup" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import ChangeLoginPasswordPcLayout from '../changeLoginPassword/pc-layout.vue'
import ChangeMobileNumberPcLayout from '../changeMobileNumber/pc-layout.vue'
import TransactionPassword from '../transactionPassword/pc-layout.vue'
import SuccessIcon from '@/static/svg/security/success.svg?component'
import WarningIcon from '@/static/svg/security/warning.svg?component'
import { useSecurityCards, type SecurityCardKey } from '@/composables/useSecurityCards'

const { t } = useI18n()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const { cards } = useSecurityCards(userInfo)

// 修改登录密码弹窗
const showChangeLoginPasswordPopup = ref(false)
// 修改手机号码弹窗
const showChangeMobileNumberPopup = ref(false)
// 交易密码弹窗
const showTransactionPasswordPopup = ref(false)
/**
 * 打开 PC 修改登录密码弹窗。
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
