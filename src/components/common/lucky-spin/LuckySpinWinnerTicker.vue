<template>
  <div v-if="displayItems.length" class="mx-4 mt-2 overflow-hidden">
    <div class="ticker-track flex w-max items-center gap-2 py-1" :style="trackStyle">
      <div
        v-for="(item, index) in displayItems"
        :key="`${item.id}-${index}`"
        class="flex shrink-0 items-center gap-2 rounded-full bg-[#2A2A3E]/90 px-3 py-[6px]"
      >
        <div
          class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4A4A6A] text-[10px] font-[700] text-common-100"
        >
          <img v-if="item.avatar" :src="item.avatar" alt="" class="h-full w-full object-cover" />
          <span v-else>{{ item.username.charAt(0).toUpperCase() }}</span>
        </div>
        <span class="whitespace-nowrap text-[12px] text-common-80">
          {{ item.username }} {{ t('luckySpinPage.won') }} {{ item.prizeText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WinnerTickerItem } from './types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  items: WinnerTickerItem[]
  speed?: number
}

const props = withDefaults(defineProps<Props>(), {
  speed: 40
})

const { t } = useI18n()

const displayItems = computed(() => {
  if (!props.items.length) return []
  const repeatCount = props.items.length < 4 ? 3 : 2
  return Array.from({ length: repeatCount }, () => props.items).flat()
})

const trackStyle = computed(() => ({
  animationDuration: `${Math.max(props.items.length * 4, 12)}s`
}))
</script>

<style scoped lang="scss">
.ticker-track {
  animation: lucky-spin-ticker linear infinite;
}

@keyframes lucky-spin-ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
