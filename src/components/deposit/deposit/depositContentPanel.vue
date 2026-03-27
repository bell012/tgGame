<template>
  <div class="flex flex-1 min-h-0 flex-col">
    <div class="w-full shrink-0 flex flex-col bg-bg-2">
      <div class="flex bg-bg-2 dark:bg-bg-8">
        <button
          v-for="tab in depositTabs"
          :key="tab"
          class="relative flex-1 text-base font-[800] transition-all duration-200 tab-button-new"
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
    <div
      class="w-full flex-1 min-h-0 relative overflow-y-auto overscroll-contain"
      :class="[panelMaxHeightClass, 'p-4 bg-bg-1 rounded-bl-lg rounded-br-lg']"
    >
      <cryptoPanel v-if="props.modelValue === 'Crypto'" @hidden="handleHidden" />
      <fiatPanel v-else-if="props.modelValue === 'Fiat'" @hidden="handleHidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import cryptoPanel from './cryptoPanel.vue'
import fiatPanel from './fiatPanel.vue'

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

const panelMaxHeightClass = computed(() =>
  props.modelValue === 'Crypto' ? 'sm:max-h-[598px]' : 'sm:max-h-[499px]'
)

const getTabClass = (tab: DepositTabType) => {
  const isActive = props.modelValue === tab

  return [isActive ? 'text-text-1 pb-1.5' : 'text-text-2 pb-1.5']
}

const showUnderline = (tab: DepositTabType) => props.modelValue === tab

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
