<template>
  <div class="security-settings p-5 md:p-8">
    <h1 class="text-xl font-bold text-text-1 mb-5 md:mb-6">
      {{ t('securitySettings.pageTitle') }}
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <div
        v-for="card in cards"
        :key="card.cardKey"
        class="rounded-xl bg-bg-3 p-5 md:p-6 flex flex-col min-h-[200px] border border-transparent hover:border-opacity-10 hover:border-[var(--color-opacity-15)] transition-colors"
      >
        <div class="flex items-start justify-between gap-3 mb-4">
          <component :is="card.icon" class="w-9 h-9 shrink-0 text-icon-2" />
          <div
            v-if="card.active"
            class="flex h-7 w-7 items-center justify-center rounded-full bg-[#2AEE88]/15"
            aria-hidden="true"
          >
            <SuccessIcon class="w-4 h-4" />
          </div>
          <div
            v-else
            class="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF9822]/15"
            aria-hidden="true"
          >
            <WarningIcon class="w-4 h-4" />
          </div>
        </div>
        <h2 class="text-base font-bold text-text-1 mb-2">
          {{ t(`securitySettings.cards.${card.cardKey}.title`) }}
        </h2>
        <p class="text-xs md:text-sm text-text-2 leading-relaxed mb-5 flex-1">
          {{ t(`securitySettings.cards.${card.cardKey}.desc`) }}
        </p>
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
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import PasswordIcon from '@/static/svg/security/password.svg?component'
import MobileIcon from '@/static/svg/security/mobile.svg?component'
import TwoFAIcon from '@/static/svg/security/2FA.svg?component'
import PasskeyIcon from '@/static/svg/security/passkey.svg?component'
import AntiPhishingIcon from '@/static/svg/security/anti-phishing.svg?component'
import SuccessIcon from '@/static/svg/security/success.svg?component'
import WarningIcon from '@/static/svg/security/warning.svg?component'

const { t } = useI18n()

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

const handleCardAction = (_key: CardKey) => {
  console.log(`跳转 ${_key}`)
}
</script>

<style scoped lang="scss">
.security-btn-secondary {
  color: var(--color-text-level-1);
  font-weight: 700;
  background-color: var(--color-background-level-2);
  border: 1px solid var(--color-opacity-15);
  cursor: pointer;
  box-shadow: none;
}
</style>
