<template>
  <Teleport to="body">
    <transition name="lucky-spin-fade">
      <div
        v-show="visible"
        class="lucky-spin-modal fixed inset-0 z-[60] flex min-h-0 flex-col overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
        :class="LUCKY_SPIN_TOKENS.modalMaskClass"
        :style="modalBackdropStyle"
      >
        <div class="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+8px)]">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center text-[18px] text-common-100 disabled:opacity-40"
            :disabled="isSpinning"
            :aria-label="t('common.cancel')"
            @click="handleClosePage"
          >
            ✕
          </button>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center text-[18px] text-common-80 disabled:opacity-40"
            :disabled="isSpinning"
            :aria-label="t('luckySpinPage.reminder.title')"
            @click="showReminder = true"
          >
            ?
          </button>
        </div>

        <div v-if="isLoading" class="flex min-h-[60vh] items-center justify-center text-common-60">
          {{ t('common.loading') }}
        </div>

        <div
          v-else-if="loadError"
          class="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <p class="text-[14px] text-common-60">{{ t('luckySpinPage.loadFailed') }}</p>
          <button
            type="button"
            class="rounded-[10px] bg-theme-primary px-6 py-2 text-[14px] font-[700] text-text-4"
            @click="loadSpinInfo"
          >
            {{ t('luckySpinPage.retry') }}
          </button>
        </div>

        <template v-else-if="spinInfo">
          <LuckySpinHeroHeader
            :max-prize-text="spinInfo.maxPrizeText"
            :end-time="spinInfo.endTime"
          />

          <div class="mt-1">
            <LuckySpinWheel
              ref="wheelRef"
              :prizes="spinInfo.prizes"
              :disabled="spinInfo.remainingSpins <= 0 || isSpinning"
              @go="handleWheelGo"
              @spin-end="handleSpinEnd"
            />
          </div>

          <LuckySpinWinnerTicker :items="spinInfo.winnerRecords" />

          <LuckySpinVoucherSelector
            :items="spinInfo.voucherGames"
            :active-index="activeGameIndex"
            :total-vouchers="spinInfo.totalVouchers"
            @select="handleGameSelect"
            @prev="handleGamePrev"
            @next="handleGameNext"
            @open-voucher-list="showReminder = true"
          />
        </template>
      </div>
    </transition>

    <LuckySpinResultPopup
      v-model:visible="showResult"
      :variant="resultVariant"
      :highlight-text="resultHighlight"
      :vouchers="resultVouchers"
      :voucher-count="resultVouchers.length"
    />

    <LuckySpinReminderPopup
      v-model:visible="showReminder"
      :tasks="spinInfo?.tasks ?? []"
      :rules="spinInfo?.rules ?? []"
      @deposit="handleDeposit"
    />
  </Teleport>
</template>

<script setup lang="ts">
import {
  LuckySpinHeroHeader,
  LuckySpinResultPopup,
  LuckySpinVoucherSelector,
  LuckySpinWinnerTicker
} from '@/components/common/lucky-spin'
import { LUCKY_SPIN_TOKENS } from '@/components/common/lucky-spin/design-tokens'
import { useLockBodyScroll } from '@/composables/useLockBodyScroll'
import { useLuckySpinModalStore } from '@/stores/luckySpinModal'
import LuckySpinReminderPopup from './components/dialogs/LuckySpinReminderPopup.vue'
import LuckySpinWheel from './components/LuckySpinWheel.vue'
import type { LuckySpinWheelExpose } from './useLuckySpinModal'
import { useLuckySpinModal } from './useLuckySpinModal'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const luckySpinModalStore = useLuckySpinModalStore()
const { visible } = storeToRefs(luckySpinModalStore)

useLockBodyScroll(visible)

const modalBackdropStyle = computed(() => ({
  backdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`,
  WebkitBackdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`
}))

const wheelRef = ref<LuckySpinWheelExpose | null>(null)

const {
  isLoading,
  loadError,
  isSpinning,
  spinInfo,
  activeGameIndex,
  showReminder,
  showResult,
  resultVariant,
  resultHighlight,
  resultVouchers,
  loadSpinInfo,
  handleWheelGo,
  handleSpinEnd,
  handleGameSelect,
  handleGamePrev,
  handleGameNext,
  handleDeposit,
  handleClosePage
} = useLuckySpinModal(wheelRef, visible)

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  handleClosePage()
}

watch(visible, nextVisible => {
  if (nextVisible) {
    document.addEventListener('keydown', handleEscapeKey)
    return
  }
  document.removeEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<style scoped lang="scss">
.lucky-spin-modal {
  -webkit-overflow-scrolling: touch;
}

.lucky-spin-fade-enter-active,
.lucky-spin-fade-leave-active {
  transition: opacity 0.24s ease;
}

.lucky-spin-fade-enter-from,
.lucky-spin-fade-leave-to {
  opacity: 0;
}
</style>
