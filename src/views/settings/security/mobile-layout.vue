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
            class="mb-4 rounded-lg bg-input-3 px-3 py-2.5 text-sm font-medium text-text-2 border border-input-2"
          >
            {{ displayMobile }}
          </div>

          <button
            type="button"
            :class="[
              'w-full h-10 rounded-lg text-sm font-bold shrink-0',
              card.active ? 'security-btn-secondary' : 'bg-theme-primary text-text-4'
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
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import H5Header from '@/components/common/H5Header.vue'
import SuccessIcon from '@/static/svg/security/success.svg?component'
import WarningIcon from '@/static/svg/security/warning.svg?component'
import { navigateToName } from '@/utils/router'
import { useSecurityCards, type SecurityCardKey } from '@/composables/useSecurityCards'

const { t } = useI18n()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const { cards, displayMobile } = useSecurityCards(userInfo)

onMounted(() => {
  userStore.syncStoredUserData()
})

const handleCardAction = (_key: SecurityCardKey) => {
  switch (_key) {
    case 'loginPassword':
      navigateToName('changeLoginPassword')
      break
    case 'mobile':
      navigateToName('changeMobileNumber')
      break
    default:
      navigateToName('transactionPassword')
      break
  }
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
