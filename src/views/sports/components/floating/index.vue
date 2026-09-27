<template>
  <div
    class="pointer-events-none fixed bottom-[calc(88.333px+env(safe-area-inset-bottom))] right-[calc(14px+env(safe-area-inset-right))] z-30 flex flex-col gap-2 font-inter"
    role="group"
    :aria-label="t('sports.betSlip.shortcuts')"
    data-testid="sports-floating"
  >
    <button
      v-for="entry in entries"
      :key="entry.key"
      type="button"
      class="pointer-events-auto relative h-[50px] w-[50px] shrink-0 rounded-full border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
      :aria-label="entry.label"
      :aria-haspopup="entry.key === 'bet-slip' ? 'dialog' : undefined"
      :data-testid="`sports-floating-${entry.key}`"
      @click="emit('select', entry.key)"
    >
      <component :is="entry.icon" class="block h-full w-full text-common-100" aria-hidden="true" />
      <span
        v-if="entry.count > 0"
        class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-2 px-0.5 text-xs font-bold leading-4 text-common-100"
        aria-hidden="true"
        :data-testid="`sports-floating-${entry.key}-count`"
      >
        {{ entry.count > 99 ? '99+' : entry.count }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HistoryIcon from '@/static/svg/sports/float-history.svg?component'
import BetSlipIcon from '@/static/svg/sports/float-betslip.svg?component'

const props = withDefaults(defineProps<{ betCount: number; historyCount?: number }>(), {
  historyCount: 0
})
const { t } = useI18n()
const emit = defineEmits<{ select: [entry: 'history' | 'bet-slip'] }>()

const entries = computed(() => [
  {
    key: 'history' as const,
    icon: HistoryIcon,
    count: props.historyCount,
    label:
      props.historyCount > 0
        ? t('sports.betSlip.historyCount', { count: props.historyCount })
        : t('sports.betSlip.history')
  },
  {
    key: 'bet-slip' as const,
    icon: BetSlipIcon,
    count: props.betCount,
    label: t('sports.betSlip.selectionCount', { count: props.betCount })
  }
])
</script>
