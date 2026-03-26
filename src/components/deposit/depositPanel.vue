<template>
  <div
    class="relative w-full max-w-[480px] h-full rounded-xl modal-container bg-bg-1"
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

    <div class="w-full flex flex-col bg-bg-2">
      <div class="flex">
        <button
          class="relative flex-1 pb-1.5 text-base font-[800] transition-all duration-200 tab-button-new"
          :class="modelValue === 'Crypto' ? 'text-text-1' : 'text-text-2'"
          @click.stop="setActiveTab('Crypto')"
        >
          <span>Crypto</span>
          <div
            v-if="modelValue === 'Crypto'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
          ></div>
        </button>
        <button
          class="relative flex-1 pb-1.5 text-base font-[800] transition-all duration-200 tab-button-new"
          :class="modelValue === 'Fiat' ? 'text-text-1' : 'text-text-2'"
          @click.stop="setActiveTab('Fiat')"
        >
          <span>Fiat</span>
          <div
            v-if="modelValue === 'Fiat'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
          ></div>
        </button>
      </div>
    </div>
    <div
      class="flex-1 flex flex-col relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto"
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
.modal-fade-enter-active .modal-container {
  animation: modalZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active .modal-container {
  animation: modalZoomOut 0.3s cubic-bezier(0.7, 0, 0.84, 0);
}

@keyframes modalZoomIn {
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
}

@keyframes modalZoomOut {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.8);
  }
}

.tab-button-new {
  position: relative;

  &:active {
    transform: scale(0.98);
  }
}
</style>
