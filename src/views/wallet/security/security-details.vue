<template>
  <div class="fixed inset-0 flex flex-col bg-bg-1 overflow-hidden">
    <H5Header :title="t('securitySettings.menu.security')" />

    <div class="flex-1 overflow-y-auto px-3.5 py-3.5">
      <div class="flex flex-col pb-8 bg-bg-2 rounded-lg">
        <div class="flex p-3.5 items-center self-stretch border-b text-sm border-opacity-10">
          {{ t('securitySettings.pageTitle') }}
        </div>

        <div
          v-for="card in cards"
          :key="card.cardKey"
          class="py-5 mx-3.5 flex flex-col border-b border-opacity-10"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <component
              :is="card.icon"
              class="h-5 w-5 shrink-0 text-icon-2 [&_svg]:max-w-full [&_svg]:max-h-full"
            />
            <div
              v-if="card.active"
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <SuccessIcon class="h-5 w-5" />
            </div>
            <div
              v-else
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <WarningIcon class="h-5 w-5" />
            </div>
          </div>

          <h2 class="text-sm font-bold text-text-1 mb-2">
            {{ t(`securitySettings.cards.${card.cardKey}.title`) }}
          </h2>
          <p class="text-xs leading-relaxed text-text-2 mb-4">
            {{ t(`securitySettings.cards.${card.cardKey}.desc`) }}
          </p>

          <div
            v-if="card.cardKey === 'mobile'"
            class="mb-4 rounded-lg bg-bg-2 px-3 py-2.5 text-sm font-medium text-text-2 border border-input-2 bg-input-level-3"
          >
            {{ displayMobile }}
          </div>

          <button
            type="button"
            :class="[
              'w-full h-10 rounded-lg text-sm font-bold shrink-0',
              card.active ? 'security-btn-secondary' : 'btn-primary'
            ]"
            @click="handleCardAction(card.cardKey)"
          >
            {{ t(`securitySettings.cards.${card.cardKey}.action`) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import H5Header from '@/components/common/H5Header.vue'
import PasswordIcon from '@/static/svg/security/password.svg?component'
import MobileIcon from '@/static/svg/security/mobile.svg?component'
import TwoFAIcon from '@/static/svg/security/2FA.svg?component'
import PasskeyIcon from '@/static/svg/security/passkey.svg?component'
import AntiPhishingIcon from '@/static/svg/security/anti-phishing.svg?component'
import SuccessIcon from '@/static/svg/security/success.svg?component'
import WarningIcon from '@/static/svg/security/warning.svg?component'

const { t } = useI18n()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
console.log(userInfo.value)
type CardKey =
  | 'loginPassword'
  | 'transactionPassword'
  | 'mobile'
  | 'twoFactor'
  | 'passkey'
  | 'antiPhishing'

const cards: { cardKey: CardKey; icon: Component; active: boolean }[] = [
  { cardKey: 'loginPassword', icon: PasswordIcon, active: true },
  { cardKey: 'transactionPassword', icon: PasswordIcon, active: false },
  { cardKey: 'mobile', icon: MobileIcon, active: true },
  { cardKey: 'twoFactor', icon: TwoFAIcon, active: false },
  { cardKey: 'passkey', icon: PasskeyIcon, active: false },
  { cardKey: 'antiPhishing', icon: AntiPhishingIcon, active: false }
]

const displayMobile = computed(() => {
  const tel = userInfo.value?.telephone
  const areaCode = userInfo.value?.areaCode
  if (tel && String(tel).trim()) {
    return `+${areaCode} ${tel}`
  }
  return '—'
})

onMounted(() => {
  userStore.syncStoredUserData()
})

const handleCardAction = (_key: CardKey) => {
  console.log(`跳转 ${_key}`)
}
</script>

<style scoped lang="scss">
.security-btn-secondary {
  color: var(--color-text-level-1);
  font-weight: 400;
  background-color: var(--color-opacity-10);
  cursor: pointer;
  box-shadow: none;
}
</style>
