<template>
  <div class="flex flex-1 min-h-0 flex-col">
    <div class="w-full shrink-0 flex bg-bg-2 dark:bg-bg-8 rounded-lg">
      <button
        v-for="tab in depositTabs"
        :key="tab"
        class="relative flex-1 text-sm py-3 font-bold transition-all duration-200 tab-button-new rounded-lg"
        :class="getTabClass(tab)"
        @click.stop="setActiveTab(tab)"
      >
        <span>{{ getTabLabel(tab) }}</span>
      </button>
    </div>

    <div
      class="w-full flex-1 min-h-0 relative overflow-y-auto overscroll-contain mt-4 bg-bg-1 rounded-lg"
    >
      <personalCenterCryptoPanel v-if="selectTab === 'Crypto'" @hidden="handleHidden" />
      <personalCenterFiatPanel v-else-if="selectTab === 'Fiat'" @hidden="handleHidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import personalCenterCryptoPanel from './personalCenterCryptoPanel.vue'
import personalCenterFiatPanel from './personalCenterFiatPanel.vue'

export type DepositTabType = 'Crypto' | 'Fiat'

const emit = defineEmits<{
  hidden: [val: boolean]
}>()

const { t } = useI18n()
const depositTabs: DepositTabType[] = ['Crypto', 'Fiat']
const selectTab = ref<DepositTabType>('Crypto')

// 获取标签页样式
const getTabClass = (tab: DepositTabType) => {
  const isActive = selectTab.value === tab

  return [isActive ? 'text-text-1 bg-bg-7' : 'text-text-2 bg-bg-8']
}

// 设置激活状态标签页
const setActiveTab = (tab: DepositTabType) => {
  selectTab.value = tab
}

// 获取标签页国际化文案
const getTabLabel = (tab: DepositTabType) =>
  t(tab === 'Crypto' ? 'deposit.tabs.crypto' : 'deposit.tabs.fiat')

// 处理隐藏状态事件
const handleHidden = (val: boolean) => {
  emit('hidden', val)
}
</script>

<style scoped lang="scss">
.tab-button-new {
  position: relative;

  &:active {
    transform: scale(0.98);
  }
}
</style>
