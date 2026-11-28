<template>
  <div
    class="grid grid-cols-4 divide-opacity-6"
    :class="mobile ? 'min-h-[29.33px] divide-x-[0.667px]' : 'min-h-8 divide-x'"
  >
    <div
      v-for="stat in stats"
      :key="stat.key"
      class="flex min-w-0 items-center justify-center"
      :class="mobile ? 'flex-col gap-0.5 px-0.5' : 'flex-wrap gap-x-2 gap-y-1 px-2 lg:gap-x-8'"
    >
      <div
        class="flex max-w-full items-center justify-center whitespace-nowrap text-text-1"
        :class="mobile ? 'text-[10px] font-bold leading-3' : 'text-[13px] font-extrabold leading-4'"
      >
        {{ stat.value }}
        <TrendIcon
          v-if="stat.key === 'liveRtp' && rtp != null"
          class="shrink-0 text-secondary-2"
          :class="mobile ? 'size-[10px]' : 'size-4'"
          aria-hidden="true"
        />
      </div>
      <div
        class="flex min-w-0 items-center justify-center text-center font-normal text-text-2"
        :class="mobile ? 'gap-0.5 text-[9px] leading-[9px]' : 'gap-[5px] text-xs leading-[15px]'"
      >
        <LiveIcon
          v-if="stat.key === 'liveRtp'"
          class="shrink-0 text-theme-primary"
          :class="mobile ? 'size-[7.67px]' : 'size-3'"
          aria-hidden="true"
        />
        {{ t('gameDetail.' + stat.key) }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameDataItem } from '@/api/interface/game'
import TrendIcon from '@/static/svg/game/detail/top/rtp-trend-down.svg?component'
import LiveIcon from '@/static/svg/game/detail/top/live-status.svg?component'

const props = defineProps<{
  mobile?: boolean
  rtp?: number | null
  volatility?: GameDataItem['volatility']
  maxMultiple?: GameDataItem['maxMultiple']
}>()
const { t } = useI18n()
const VOLATILITY_LABEL_KEYS = {
  1: 'gameDetail.volatilityLevels.small',
  2: 'gameDetail.volatilityLevels.middle',
  3: 'gameDetail.volatilityLevels.big'
} as const

const stats = computed(() => {
  const rtp = props.rtp ?? null
  const volatilityKey =
    props.volatility == null ? undefined : VOLATILITY_LABEL_KEYS[props.volatility]
  const maxMultiple = String(props.maxMultiple ?? '').trim()
  return [
    { key: 'liveRtp', value: rtp === null ? '-' : (100 - rtp).toFixed(2) + '%' },
    { key: 'realRtp', value: rtp === null ? '-' : rtp.toFixed(2) + '%' },
    { key: 'volatility', value: volatilityKey ? t(volatilityKey) : '-' },
    { key: 'maxBonus', value: maxMultiple ? `${maxMultiple}X` : '-' }
  ]
})
</script>
