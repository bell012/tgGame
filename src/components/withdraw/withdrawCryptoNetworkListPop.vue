<template>
  <withdrawPopShell
    v-model="visible"
    :transition-type="isMobile ? 'bottom-sheet' : 'modal'"
    @close="handleClose"
  >
    <div
      class="relative mx-auto flex w-full flex-col rounded-t-[12px] bg-bg-1 px-[14px] pb-5 pt-[14px] font-['Inter'] sm:w-[464px] sm:rounded-[24px] sm:p-8"
    >
      <div class="flex items-center justify-between">
        <h2 class="mx-auto text-xl font-bold leading-normal text-text-1 sm:mx-0">
          {{ title }}
        </h2>
        <button
          type="button"
          class="absolute right-4 top-4 hidden h-6 w-6 items-center justify-center rounded-md text-text-1 sm:flex"
          @click="handleClose"
        >
          <CloseIcon class="size-4" />
        </button>
      </div>

      <div class="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto">
        <button
          v-for="item in items"
          :key="item.value"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-[14px] py-3 text-left"
          @click="handleSelect(item.value)"
          :class="{ 'bg-opacity-10': modelValueSelected === item.value }"
        >
          <p class="text-sm font-bold leading-normal text-text-1">
            {{ item.label }}
          </p>
          <RadioCheckedIcon
            v-if="modelValueSelected === item.value"
            class="h-5 w-5 shrink-0 text-theme-primary"
          />
          <RadioUncheckedIcon v-else class="h-5 w-5 shrink-0 text-text-4" />
        </button>
      </div>
    </div>
  </withdrawPopShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import CloseIcon from '@/static/svg/close.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import withdrawPopShell from './withdrawPopShell.vue'

export interface WithdrawCryptoNetworkOption {
  label: string
  value: string
}

interface Props {
  modelValue: boolean
  title: string
  items: WithdrawCryptoNetworkOption[]
  selectedValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [value: string]
  close: []
}>()

const isMobile = useIsMobile()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const modelValueSelected = computed(() => props.selectedValue)

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleSelect = (value: string) => {
  emit('select', value)
  handleClose()
}
</script>
