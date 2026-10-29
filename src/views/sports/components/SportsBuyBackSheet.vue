<template>
  <Teleport to="body">
    <Transition name="popup-fade"
      ><div v-if="visible" class="fixed inset-0 z-[1000] bg-mask-60-1" @click="emit('close')"
    /></Transition>
    <Transition name="up-down">
      <section
        v-if="visible && item"
        class="fixed inset-x-0 bottom-0 z-[1001] flex max-h-[78dvh] flex-col overflow-hidden rounded-t-xl bg-bg-1 font-inter text-text-1"
        role="dialog"
        aria-modal="true"
        :aria-label="t('sportsHistory.cashOut')"
        @keydown.esc.stop="emit('close')"
      >
        <header class="relative flex h-12 shrink-0 items-center justify-center bg-bg-2 px-3.5">
          <h2 class="text-base font-bold">{{ t('sportsHistory.cashOut') }}</h2>
          <button
            type="button"
            class="absolute right-3.5 flex h-7 w-7 items-center justify-center rounded-md bg-opacity-10 disabled:opacity-50"
            :aria-label="t('sportsHistory.close')"
            :disabled="submitting"
            @click="emit('close')"
          >
            <CloseIcon class="h-2.5 w-2.5" />
          </button>
        </header>
        <div class="min-h-0 overflow-y-auto overscroll-contain px-3.5 pt-3.5">
          <div class="space-y-3.5">
            <HistoryEvent
              v-for="selection in item.selections"
              :key="selection.id"
              :item="selection"
              show-time
            />
          </div>
          <HistoryFields class="mt-2.5" :item="item" />
        </div>
        <footer class="shrink-0 px-3.5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-5">
          <button
            type="button"
            class="flex h-10 w-full items-center justify-center rounded-lg bg-theme-primary text-sm font-bold text-text-4 disabled:opacity-50"
            :disabled="submitting || !item.cashOutAvailable"
            @click="emit('confirm')"
          >
            {{ submitting ? t('common.loading') : t('sportsHistory.confirmCashOut') }}
          </button>
        </footer>
      </section>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import CloseIcon from '@/static/svg/close.svg?component'
import HistoryEvent from '../bet-history/components/HistoryEvent.vue'
import HistoryFields from '../bet-history/components/HistoryFields.vue'
import type { HistoryWagerView } from '../bet-history/shared'

// 此组件只负责移动端展示，提交资格与账号上下文由列表的统一动作维护。
const props = defineProps<{
  visible: boolean
  item: HistoryWagerView | null
  submitting: boolean
}>()
const emit = defineEmits<{ close: []; confirm: [] }>()
const { t } = useI18n()
usePageScrollLock(() => props.visible)
</script>

<style scoped lang="scss">
@use '../../../styles/mixins' as *;
@include popup-transition;
</style>
