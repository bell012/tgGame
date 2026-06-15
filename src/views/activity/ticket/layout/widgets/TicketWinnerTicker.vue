<template>
  <div
    v-if="items.length && displayItems.length"
    class="ticket-winner-ticker overflow-hidden"
    :class="compact ? 'mt-0' : 'mx-auto w-full max-w-[340px] px-[14px]'"
  >
    <div class="ticker-track flex w-max items-center py-1" :style="trackStyle">
      <div
        v-for="(item, index) in displayItems"
        :key="`${item.id}-${index}`"
        class="flex shrink-0 items-center"
        :style="pillStyle"
      >
        <div
          class="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4A4A6A]"
          :style="avatarStyle"
        >
          <img
            :src="resolveItemAvatar(item)"
            alt=""
            class="h-full w-full object-cover"
            @error="handleAvatarError(item.id)"
          />
        </div>
        <span class="whitespace-nowrap text-common-80" :style="textStyle">
          {{ item.username }} {{ t('luckySpinPage.won') }} {{ item.prizeText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TicketWinnerTickerData, WinnerTickerItem } from '../../shared/types'
import { getMarqueeFallbackAvatar } from '../../shared/mappers/mapTicketMarquee'
import { TICKET_PC_LAYOUT } from '../../shared/layout-tokens/ticketPcLayout'
import { TICKET_MOBILE_LAYOUT } from '../../shared/layout-tokens/ticketMobileLayout'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<TicketWinnerTickerData & { speed?: number; compact?: boolean }>(),
  {
    speed: 40,
    compact: false
  }
)

const { t } = useI18n()

const marqueeLayout = computed(() =>
  props.compact ? TICKET_PC_LAYOUT.marquee : TICKET_MOBILE_LAYOUT.marquee
)

const pillStyle = computed(() => ({
  gap: `${marqueeLayout.value.pillGap}px`,
  padding: `${marqueeLayout.value.pillPaddingY}px ${marqueeLayout.value.pillPaddingX}px`,
  borderRadius: `${marqueeLayout.value.pillRadius}px`,
  backgroundColor: marqueeLayout.value.pillBg,
  marginRight: `${marqueeLayout.value.pillGap}px`
}))

const avatarStyle = computed(() => ({
  width: `${marqueeLayout.value.avatarSize}px`,
  height: `${marqueeLayout.value.avatarSize}px`
}))

const textStyle = computed(() => ({
  fontSize: `${marqueeLayout.value.fontSize}px`
}))

const failedAvatarIds = ref(new Set<string>())

const resolveItemAvatar = (item: WinnerTickerItem) => {
  if (failedAvatarIds.value.has(item.id)) {
    return getMarqueeFallbackAvatar(`${item.id}-${item.username}`)
  }

  return item.avatar
}

const handleAvatarError = (itemId: string) => {
  if (failedAvatarIds.value.has(itemId)) {
    return
  }

  failedAvatarIds.value = new Set([...failedAvatarIds.value, itemId])
}

watch(
  () => props.items,
  () => {
    failedAvatarIds.value = new Set()
  },
  { deep: true }
)

const displayItems = computed(() => {
  if (!props.items.length) return []
  const repeatCount = props.items.length < 4 ? 3 : 2
  return Array.from({ length: repeatCount }, () => props.items).flat()
})

const trackStyle = computed(() => ({
  animationDuration: `${Math.max(props.items.length * 4, 12)}s`,
  gap: `${marqueeLayout.value.pillGap}px`
}))
</script>

<style scoped lang="scss">
.ticket-winner-ticker {
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
}

.ticker-track {
  animation: ticket-winner-ticker linear infinite;
}

@keyframes ticket-winner-ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
