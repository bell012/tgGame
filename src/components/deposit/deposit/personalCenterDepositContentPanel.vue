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
        <span>{{ tab }}</span>
      </button>
    </div>
    <div
      class="w-full flex-1 min-h-0 relative overflow-y-auto overscroll-contain mt-4 bg-bg-1 rounded-lg"
    >
      <personalCenterCryptoPanel v-if="props.modelValue === 'Crypto'" @hidden="handleHidden" />
      <personalCenterFiatPanel v-else-if="props.modelValue === 'Fiat'" @hidden="handleHidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
import personalCenterCryptoPanel from './personalCenterCryptoPanel.vue'
import personalCenterFiatPanel from './personalCenterFiatPanel.vue'

export type DepositTabType = 'Crypto' | 'Fiat'

interface Props {
  modelValue: DepositTabType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: DepositTabType]
  hidden: [val: boolean]
}>()

const depositTabs: DepositTabType[] = ['Crypto', 'Fiat']

const getTabClass = (tab: DepositTabType) => {
  const isActive = props.modelValue === tab

  return [isActive ? 'text-text-1 bg-bg-7' : 'text-text-2 bg-bg-8']
}

const setActiveTab = (tab: DepositTabType) => {
  emit('update:modelValue', tab)
}

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
