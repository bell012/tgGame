<template>
  <div :class="variant === 'grid' ? 'mt-4' : ''">
    <!-- Carousel (mobile) -->
    <div v-if="variant === 'carousel'" class="flex items-center justify-center gap-1">
      <button
        type="button"
        class="flex h-8 w-6 shrink-0 items-center justify-center text-[20px] text-common-40"
        :aria-label="t('luckySpinPage.prev')"
        @click="emit('prev')"
      >
        ‹
      </button>

      <div class="flex flex-1 items-end justify-center gap-[6px]">
        <button
          v-for="(item, index) in visibleItems"
          :key="item.id"
          type="button"
          class="flex shrink-0 items-center justify-center rounded-[8px] transition-all"
          :class="
            index + startIndex === activeIndex
              ? 'h-[68px] w-[60px] border-2'
              : 'h-[57px] w-[50px] border-2 border-transparent opacity-75'
          "
          :style="index + startIndex === activeIndex ? activeItemStyle : undefined"
          :aria-label="item.label"
          @click="emit('select', index + startIndex)"
        >
          <img
            :src="resolveIcon(item)"
            :alt="item.label ?? item.id"
            class="h-full w-full object-contain"
          />
        </button>
      </div>

      <button
        type="button"
        class="flex h-8 w-6 shrink-0 items-center justify-center text-[20px] text-common-40"
        :aria-label="t('luckySpinPage.next')"
        @click="emit('next')"
      >
        ›
      </button>
    </div>

    <!-- Grid (PC) -->
    <div v-else class="grid grid-cols-5 gap-2">
      <button
        v-for="(item, index) in games"
        :key="item.id"
        type="button"
        class="flex aspect-square items-center justify-center rounded-[10px] border-2 transition-all"
        :class="isActive(index) ? 'opacity-100' : 'border-transparent opacity-75'"
        :style="isActive(index) ? activeItemStyle : undefined"
        :aria-label="item.label"
        @click="emit('select', index)"
      >
        <img
          :src="resolveIcon(item)"
          :alt="item.label ?? item.id"
          class="h-[80%] w-[80%] object-contain"
        />
      </button>
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
const { startIndex, resolveIcon, activeItemStyle, visibleItems, isActive } =
  useTicketVoucherSwitcher(props)
</script>
