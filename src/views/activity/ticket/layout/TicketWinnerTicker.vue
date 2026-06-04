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
import type { TicketWinnerTickerData, WinnerTickerItem } from '../shared/types'
import { getMarqueeFallbackAvatar } from '../shared/mapTicketMarquee'
import { TICKET_MOBILE_LAYOUT } from '../shared/ticketMobileLayout'
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

const pillStyle = computed(() => ({
  gap: `${TICKET_MOBILE_LAYOUT.marquee.pillGap}px`,
  padding: `${TICKET_MOBILE_LAYOUT.marquee.pillPaddingY}px ${TICKET_MOBILE_LAYOUT.marquee.pillPaddingX}px`,
  borderRadius: `${TICKET_MOBILE_LAYOUT.marquee.pillRadius}px`,
  backgroundColor: TICKET_MOBILE_LAYOUT.marquee.pillBg,
  marginRight: `${TICKET_MOBILE_LAYOUT.marquee.pillGap}px`
}))

const avatarStyle = {
  width: `${TICKET_MOBILE_LAYOUT.marquee.avatarSize}px`,
  height: `${TICKET_MOBILE_LAYOUT.marquee.avatarSize}px`
}

const textStyle = computed(() => ({
  fontSize: `${props.compact ? 13 : TICKET_MOBILE_LAYOUT.marquee.fontSize}px`
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
  gap: `${TICKET_MOBILE_LAYOUT.marquee.pillGap}px`
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
