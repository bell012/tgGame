<template>
  <PopShell
    v-model="visible"
    :transition-type="isMobile ? 'drawer-slide' : 'modal'"
    :full-height="isMobile"
    @close="handleClose"
  >
    <div
      class="relative flex h-full min-h-full w-full max-w-none flex-col bg-bg-2 font-['Inter'] sm:mx-auto sm:h-auto sm:min-h-0 sm:max-w-[480px] sm:rounded-xl modal-container"
    >
      <div class="relative flex h-14 shrink-0 items-center justify-between">
        <h2
          class="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-text-1 sm:text-lg"
        >
          {{ t('withdraw.withdraw_order') }}
        </h2>
        <template v-if="isMobile">
          <button
            type="button"
            class="absolute left-3.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-opacity-10"
            @click="handleClose"
          >
            <LeftArrowIcon class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="absolute right-3.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-opacity-10"
            @click="handleOpenTransaction"
          >
            <DetailsIcon class="h-4 w-4" />
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="absolute right-4 top-4 z-10 hidden h-6 w-6 items-center justify-center rounded-md bg-opacity-10 sm:flex"
            @click="handleClose"
          >
            <CloseIcon class="h-4 w-4 fill-none" />
          </button>
        </template>
      </div>

      <div
        class="w-full flex-1 min-h-0 overflow-y-auto bg-bg-1 p-3 sm:max-h-[548px] sm:rounded-bl-xl sm:rounded-br-xl"
      >
        <withdrawOrderContent :orderItem="orderItem" />
      </div>
    </div>
  </PopShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { WithdrawOrderViewData } from './shared/useWithdrawFlow'
import PopShell from './popShell.vue'
import withdrawOrderContent from './orderContent.vue'
import LeftArrowIcon from '@/static/svg/left-icon.svg?component'
import DetailsIcon from '@/static/svg/deposit/record.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import { navigateToName } from '@/utils/router'

interface Props {
  modelValue: boolean
  orderItem?: WithdrawOrderViewData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const { t } = useI18n()
const isMobile = useIsMobile()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOpenTransaction = () => {
  handleClose()
  void navigateToName('my-orders')
}
</script>
