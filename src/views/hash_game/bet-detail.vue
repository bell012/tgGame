<template>
  <Teleport to="body" :disabled="variant === 'h5'">
    <Transition name="bottom-sheet">
      <div
        v-if="variant === 'h5' || visible"
        :class="
          variant === 'pc'
            ? 'fixed inset-0 z-[1100] grid place-items-center bg-mask-60-1 p-[12px]'
            : 'fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1'
        "
        @click.self="close"
        @keydown.esc.stop.prevent="close"
      >
        <section
          :class="
            variant === 'pc'
              ? 'bottom-sheet-panel flex max-h-[75vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[8px] bg-bg-1'
              : 'flex min-h-0 flex-1 flex-col overflow-hidden bg-bg-1'
          "
          :role="variant === 'pc' ? 'dialog' : undefined"
          :aria-modal="variant === 'pc' ? 'true' : undefined"
          :aria-labelledby="variant === 'pc' ? 'hash-bet-detail-title' : undefined"
        >
          <header
            v-if="variant === 'pc'"
            class="grid h-[56px] shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-bg-2 px-[16px]"
          >
            <span aria-hidden="true" />
            <h2 id="hash-bet-detail-title" class="text-[18px] font-[700] text-text-1">
              {{ t('betDetails.title') }}
            </h2>
            <button
              type="button"
              class="ml-auto grid size-[24px] place-items-center rounded-[4px] bg-opacity-10"
              :aria-label="t('common.close')"
              @click="close"
            >
              <CloseIcon class="size-[12px] text-icon-1" />
            </button>
          </header>
          <H5Header
            v-else
            :title="t('betDetails.title')"
            :show-sort="true"
            :right-icon="KefuIcon"
            @sort="openKefuPopup"
          />

          <main
            v-if="bet"
            :class="
              variant === 'pc'
                ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain p-[16px]'
                : 'min-h-0 flex-1 overflow-y-auto overscroll-contain p-[14px]'
            "
          >
            <section
              :class="
                variant === 'pc'
                  ? 'rounded-[8px] bg-bg-2 px-[16px] pb-[16px] pt-[32px]'
                  : 'rounded-[8px] bg-bg-2 px-[14px] pb-[14px] pt-[30px]'
              "
            >
              <div
                :class="
                  variant === 'pc'
                    ? 'mb-[32px] flex flex-col items-center'
                    : 'mb-[30px] flex flex-col items-center'
                "
              >
                <img
                  :src="bet.currencyIcon"
                  :alt="bet.currencyCode"
                  :class="
                    variant === 'pc'
                      ? 'mb-[12px] size-[64px] object-contain'
                      : 'mb-[10px] size-[50px] object-contain'
                  "
                />
                <strong
                  :class="[
                    variant === 'pc' ? 'text-[24px] font-bold' : 'text-[25px] font-bold',
                    bet.profitLoss == null
                      ? ''
                      : bet.profitLoss >= 0
                        ? 'text-theme-primary'
                        : 'text-secondary-2'
                  ]"
                >
                  {{
                    bet.profitLoss == null
                      ? '—'
                      : `${bet.profitLoss >= 0 ? '+' : '-'}${Math.abs(bet.profitLoss).toFixed(2)}`
                  }}
                </strong>
                <span
                  :class="
                    variant === 'pc'
                      ? 'mt-[8px] text-[16px] text-text-1'
                      : 'mt-[5px] text-[14px] text-text-1'
                  "
                >
                  {{
                    bet.profitLoss == null
                      ? '—'
                      : t(bet.profitLoss >= 0 ? 'betHistory.win' : 'betHistory.loss')
                  }}
                </span>
              </div>

              <div
                :class="
                  variant === 'pc'
                    ? 'space-y-[16px] rounded-[8px] bg-bg-4 px-[20px] py-[16px]'
                    : 'space-y-[20px] rounded-[8px] bg-bg-4 p-[14px]'
                "
              >
                <div class="flex items-center justify-between gap-3">
                  <span
                    :class="
                      variant === 'pc'
                        ? 'shrink-0 text-[16px] text-text-3'
                        : 'shrink-0 text-[14px] text-text-3'
                    "
                    >{{ t('hashGame.game') }}</span
                  >
                  <span
                    :class="
                      variant === 'pc' ? 'text-[16px] text-text-1' : 'text-[14px] text-text-1'
                    "
                    >{{ bet.gameName }}</span
                  >
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span
                    :class="
                      variant === 'pc'
                        ? 'shrink-0 text-[16px] text-text-3'
                        : 'shrink-0 text-[14px] text-text-3'
                    "
                    >{{ t('hashGame.betId') }}</span
                  >
                  <div
                    :class="
                      variant === 'pc'
                        ? 'flex min-w-0 items-center gap-1 text-[16px] text-text-1'
                        : 'flex min-w-0 items-center gap-1 text-[14px] text-text-1'
                    "
                  >
                    <span class="min-w-0 truncate">{{ bet.id }}</span>
                    <button type="button" class="shrink-0" @click="copyValue(bet.id)">
                      <CopyIcon
                        :class="
                          variant === 'pc' ? 'size-[22px] text-icon-2' : 'size-[16px] text-icon-2'
                        "
                      />
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span
                    :class="
                      variant === 'pc'
                        ? 'shrink-0 text-[16px] text-text-3'
                        : 'shrink-0 text-[14px] text-text-3'
                    "
                  >
                    {{ t('hashGame.betSelection') }}
                  </span>
                  <span
                    :class="
                      variant === 'pc'
                        ? 'flex size-[20px] items-center justify-center rounded-full bg-[#22A89A] text-[12px] text-text-1'
                        : 'flex size-[20px] items-center justify-center rounded-full bg-[#22A89A] text-[12px] text-text-1'
                    "
                  >
                    {{ t(`hashGame.${bet.selection}Mark`) }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span
                    :class="
                      variant === 'pc'
                        ? 'shrink-0 text-[16px] text-text-3'
                        : 'shrink-0 text-[14px] text-text-3'
                    "
                  >
                    {{ t('hashGame.betAmount') }}
                  </span>
                  <span
                    :class="
                      variant === 'pc' ? 'text-[16px] text-text-1' : 'text-[14px] text-text-1'
                    "
                    >{{ bet.betAmount.toFixed(2) }} {{ bet.currencyCode }}</span
                  >
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span
                    :class="
                      variant === 'pc'
                        ? 'shrink-0 text-[16px] text-text-3'
                        : 'shrink-0 text-[14px] text-text-3'
                    "
                  >
                    {{ t('hashGame.resultBlock') }}
                  </span>
                  <div
                    :class="
                      variant === 'pc'
                        ? 'flex min-w-0 items-center gap-1 text-[16px] text-text-1'
                        : 'flex min-w-0 items-center gap-1 text-[14px] text-text-1'
                    "
                  >
                    <span class="min-w-0 truncate">{{ bet.block }}</span>
                    <button type="button" class="shrink-0" @click="copyValue(bet.block)">
                      <CopyIcon
                        :class="
                          variant === 'pc' ? 'size-[22px] text-icon-2' : 'size-[16px] text-icon-2'
                        "
                      />
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span
                    :class="
                      variant === 'pc'
                        ? 'shrink-0 text-[16px] text-text-3'
                        : 'shrink-0 text-[14px] text-text-3'
                    "
                  >
                    {{ t('hashGame.blockHash') }}
                  </span>
                  <div
                    :class="
                      variant === 'pc'
                        ? 'flex min-w-0 items-center gap-1 text-[16px]'
                        : 'flex min-w-0 items-center gap-1 text-[14px]'
                    "
                  >
                    <span class="min-w-0 truncate text-text-1">{{ bet.blockHash || '—' }}</span>
                    <button
                      v-if="bet.blockHash"
                      type="button"
                      class="shrink-0"
                      @click="copyValue(bet.blockHash)"
                    >
                      <CopyIcon
                        :class="
                          variant === 'pc' ? 'size-[22px] text-icon-2' : 'size-[16px] text-icon-2'
                        "
                      />
                    </button>
                    <button type="button" class="shrink-0 text-theme-primary">
                      {{ t('hashGame.verify') }}
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span
                    :class="
                      variant === 'pc'
                        ? 'shrink-0 text-[16px] text-text-3'
                        : 'shrink-0 text-[14px] text-text-3'
                    "
                    >{{ t('hashGame.betTime') }}</span
                  >
                  <span
                    :class="
                      variant === 'pc'
                        ? 'text-right text-[16px] text-text-1'
                        : 'text-right text-[14px] text-text-1'
                    "
                    >{{ bet.betTime }}</span
                  >
                </div>
              </div>
            </section>
          </main>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import KefuIcon from '@/static/svg/vip/kefu.svg?component'
import CopyIcon from '@/static/svg/copy.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import { useOnlineCustomerService } from '@/composables/useOnlineCustomerService'
import { globalShowToast } from '@/utils/toast'
import type { HashGameBetDetail } from './index'

const props = withDefaults(
  defineProps<{
    variant?: 'h5' | 'pc'
    bet?: HashGameBetDetail | null
  }>(),
  { variant: 'h5', bet: null }
)
const visible = defineModel<boolean>('visible', { default: false })

const { t } = useI18n()
const router = useRouter()
const { open: openOnlineCustomer } = useOnlineCustomerService()
const routeBet = ref<HashGameBetDetail | null>(null)
const bet = computed(() => (props.variant === 'pc' ? props.bet : routeBet.value))

onMounted(() => {
  if (props.variant !== 'h5') return
  const state = history.state as { hashGameBet?: string }
  if (!state.hashGameBet) {
    router.back()
    return
  }

  try {
    routeBet.value = JSON.parse(state.hashGameBet) as HashGameBetDetail
  } catch {
    router.back()
  }
})

const close = () => {
  if (props.variant === 'pc') visible.value = false
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (props.variant === 'pc' && visible.value && event.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', handleDocumentKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleDocumentKeydown))

const openKefuPopup = () => openOnlineCustomer()

const copyValue = async (value: string) => {
  await navigator.clipboard.writeText(value)
  globalShowToast(t('betDetails.copy'))
}
</script>
