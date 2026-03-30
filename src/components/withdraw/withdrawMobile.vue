<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="w-full shrink-0 flex flex-col bg-bg-2">
      <div class="flex bg-bg-2 dark:bg-bg-8">
        <button
          v-for="tab in depositTabs"
          :key="tab"
          class="relative flex-1 text-sm sm:text-base font-[800] transition-all duration-200 tab-button-new"
          :class="getTabClass(tab)"
          @click.stop="setActiveTab(tab)"
        >
          <span>{{ tab }}</span>
          <div
            v-if="showUnderline(tab)"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
          ></div>
        </button>
      </div>
    </div>
    <div class="w-full flex-1 min-h-0 overflow-y-auto overscroll-contain bg-bg-1 p-3.5">
      <withdrawMobileCryptoPanel v-if="selectTab === 'Crypto'" />
      <withdrawMobileFiatPanel v-else-if="selectTab === 'Fiat'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import withdrawMobileCryptoPanel from './withdrawMobileCryptoPanel.vue'
import withdrawMobileFiatPanel from './withdrawMobileFiatPanel.vue'

export type DepositTabType = 'Crypto' | 'Fiat'
const depositTabs: DepositTabType[] = ['Crypto', 'Fiat']
const selectTab = ref<DepositTabType>('Crypto')

const getTabClass = (tab: DepositTabType) => {
  const isActive = selectTab.value === tab

  return [isActive ? 'text-text-1 pb-1.5' : 'text-text-2 pb-1.5']
}

const showUnderline = (tab: DepositTabType) => selectTab.value === tab

const setActiveTab = (tab: DepositTabType) => {
  selectTab.value = tab
}
</script>
<style scoped lang="scss"></style>
