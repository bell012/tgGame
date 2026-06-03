<template>
  <div :class="variant === 'grid' ? 'mt-4' : ''">
    <div
      v-if="gridSlots.length"
      class="grid w-full grid-cols-5 gap-2"
      :class="[
        variant === 'grid' ? 'max-w-[332px]' : 'mx-auto max-w-[340px]',
        gridSlots.length > 5 ? 'max-h-[188px] overflow-y-auto overscroll-contain pr-0.5' : ''
      ]"
    >
      <template v-for="slot in gridSlots" :key="slot.id">
        <button
          v-if="!slot.isPlaceholder"
          type="button"
          class="flex h-[60px] w-full items-center justify-center rounded-[10px] border-2 transition-all"
          :class="isSlotActive(slot) ? 'opacity-100' : 'border-transparent opacity-75'"
          :style="isSlotActive(slot) ? activeItemStyle : undefined"
          :aria-label="slot.label"
          @click="slot.gameIndex != null && emit('select', slot.gameIndex)"
        >
          <img
            :src="resolveIcon(slot)"
            :alt="slot.label ?? slot.id"
            class="h-[80%] w-[80%] max-h-[48px] max-w-[48px] object-contain"
          />
        </button>
        <div
          v-else
          class="h-[60px] w-full rounded-[10px] border-2 border-transparent"
          aria-hidden="true"
        />
      </template>
    </div>

    <button
      type="button"
      class="flex items-center gap-1 text-[13px] text-common-80"
      :class="variant === 'grid' ? 'mt-4 justify-start' : 'mt-3 w-full justify-center'"
      @click="emit('openVoucherList')"
    >
      <span>{{ t('luckySpinPage.youHave') }}</span>
      <span class="font-[700] text-[#2AEE88]">{{ totalVouchers }}</span>
      <span>{{ t('luckySpinPage.vouchers') }} ›</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TicketVoucherFooterData } from '../shared/types'
import { useTicketVoucherSwitcher } from './composables/useTicketVoucherSwitcher'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<
    TicketVoucherFooterData & {
      variant?: 'carousel' | 'grid'
    }
  >(),
  {
    variant: 'carousel'
  }
)

const emit = defineEmits<{
  select: [index: number]
  prev: []
  next: []
  openVoucherList: []
}>()

const { t } = useI18n()
const { gridSlots, resolveIcon, activeItemStyle, isSlotActive } = useTicketVoucherSwitcher(props)
</script>
