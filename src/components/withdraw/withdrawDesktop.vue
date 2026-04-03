<template>
  <div class="flex-1 min-h-0">
    <div class="w-full shrink-0 flex bg-bg-2 dark:bg-bg-8 rounded-lg">
      <button
        v-for="tab in depositTabs"
        :key="tab.value"
        class="relative flex-1 text-sm py-3 font-bold transition-all duration-200 tab-button-new rounded-lg"
        :class="getTabClass(tab.value)"
        @click.stop="setActiveTab(tab.value)"
      >
        <span>{{ tab.label }}</span>
      </button>
    </div>
    <div class="mt-4 w-full bg-bg-1 rounded-lg">
      <withdrawDesktopCryptoPanel v-if="selectTab === 'Crypto'" @submit="handleSubmit" />
      <withdrawDesktopFiatPanel v-else-if="selectTab === 'Fiat'" @submit="handleSubmit" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import withdrawDesktopCryptoPanel from './withdrawDesktopCryptoPanel.vue'
import withdrawDesktopFiatPanel from './withdrawDesktopFiatPanel.vue'
import type { WithdrawSubmitPayload } from './types'

export type DepositTabType = 'Crypto' | 'Fiat'
const { t } = useI18n()
const depositTabs = computed<{ value: DepositTabType; label: string }[]>(() => [
  { value: 'Crypto', label: t('withdraw.crypto') },
  { value: 'Fiat', label: t('withdraw.fiat') }
])
const selectTab = ref<DepositTabType>('Crypto')

const getTabClass = (tab: DepositTabType) => {
  const isActive = selectTab.value === tab

  return [isActive ? 'text-text-1 bg-bg-7' : 'text-text-2 bg-bg-8']
}

const setActiveTab = (tab: DepositTabType) => {
  selectTab.value = tab
}

const emit = defineEmits<{
  submit: [payload: WithdrawSubmitPayload]
}>()

const handleSubmit = (payload: WithdrawSubmitPayload) => {
  emit('submit', payload)
}
</script>
<style scoped lang="scss"></style>
