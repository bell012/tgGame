<template>
  <section class="mx-4 mt-3 pb-4">
    <div class="flex items-center justify-center gap-1">
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
              ? 'h-[68px] w-[60px] border-2 border-[#B06CFF] shadow-[0_0_12px_rgba(176,108,255,0.5)]'
              : 'h-[57px] w-[50px] border-2 border-transparent opacity-75'
          "
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

    <button
      type="button"
      class="mt-3 flex w-full items-center justify-center gap-1 text-[13px] text-common-80"
      @click="emit('openVoucherList')"
    >
      <span>{{ t('luckySpinPage.youHave') }}</span>
      <span class="font-[700] text-[#2AEE88]">{{ totalVouchers }}</span>
      <span>{{ t('luckySpinPage.vouchers') }} ›</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import type { VoucherGameItem } from './types'
import { getGameIcon } from './constants'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  items: VoucherGameItem[]
  activeIndex: number
  totalVouchers: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [index: number]
  prev: []
  next: []
  openVoucherList: []
}>()

const { t } = useI18n()
const VISIBLE_COUNT = 5
const startIndex = ref(0)

const resolveIcon = (item: VoucherGameItem) => item.icon ?? getGameIcon(item.id)

const visibleItems = computed(() => {
  const end = Math.min(startIndex.value + VISIBLE_COUNT, props.items.length)
  return props.items.slice(startIndex.value, end)
})

watch(
  () => props.activeIndex,
  index => {
    if (index < startIndex.value) {
      startIndex.value = Math.max(0, index)
    } else if (index >= startIndex.value + VISIBLE_COUNT) {
      startIndex.value = Math.max(0, index - VISIBLE_COUNT + 1)
    }
  }
)
</script>
