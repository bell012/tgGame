<template>
  <div
    class="relative w-full max-w-[480px] max-h-[calc(100dvh-16px)] flex flex-col overflow-hidden sm:rounded-xl modal-container bg-bg-1"
    :class="{
      'sm:max-h-[684px]': modelValue === 'Crypto',
      'sm:max-h-[595px]': modelValue === 'Fiat'
    }"
  >
    <div class="flex items-center justify-between h-14 rounded-tl-xl rounded-tr-xl bg-bg-2">
      <h2 class="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-text-1">
        {{ t('deposit.title') }}
      </h2>
      <!-- 关闭按钮 -->
      <button
        class="absolute top-4 right-4 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
        @click="handleClose"
      >
        <CloseIcon class="w-4 h-4 fill-none" />
      </button>
    </div>

    <div class="w-full shrink-0 flex flex-col bg-bg-2">
      <div class="flex">
        <button
          v-for="tab in depositTabs"
          :key="tab"
          class="relative flex-1 pb-1.5 text-base font-[800] transition-all duration-200 tab-button-new"
          :class="modelValue === tab ? 'text-text-1' : 'text-text-2'"
          @click.stop="setActiveTab(tab)"
        >
          <span>{{ tab }}</span>
          <div
            v-if="modelValue === tab"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
          ></div>
        </button>
      </div>
    </div>
    <div
      class="w-full flex-1 min-h-0 relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto overscroll-contain"
      :class="{
        'sm:max-h-[598px]': modelValue === 'Crypto',
        'sm:max-h-[499px]': modelValue === 'Fiat'
      }"
    >
      <cryptoPanel v-if="modelValue === 'Crypto'" @hidden="handleHidden" />
      <fiatPanel v-else-if="modelValue === 'Fiat'" @hidden="handleHidden" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import cryptoPanel from './cryptoPanel.vue'
import fiatPanel from './fiatPanel.vue'

const { t } = useI18n()
type TabType = 'Crypto' | 'Fiat'
const depositTabs: TabType[] = ['Crypto', 'Fiat']
interface Props {
  modelValue: TabType
}
defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: TabType]
  close: []
  hidden: [val: boolean]
}>()

const setActiveTab = (tab: TabType) => {
  emit('update:modelValue', tab)
}

const handleClose = () => {
  emit('close')
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
