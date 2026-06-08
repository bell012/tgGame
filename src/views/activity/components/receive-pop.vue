<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="receive-pop__mask fixed inset-0 z-[10020]"
          @click.self="handleOverlayClose"
        />
      </transition>

      <transition name="receive-pop-transition">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10021] flex flex-col items-center justify-center px-6 py-8"
          @click.self="handleOverlayClose"
        >
          <section
            role="dialog"
            aria-modal="true"
            class="receive-pop__dialog w-full max-w-[320px] sm:max-w-[350px]"
          >
            <h2 class="receive-pop__title text-center text-[32px] font-[700] sm:text-[42px]">
              {{ resolvedTitle }}
            </h2>
            <p class="text-center text-[16px] leading-[18px] text-common-100 sm:text-[21px]">
              {{ resolvedSubtext }}
            </p>

            <div
              class="relative mt-12 w-full rounded-[24px] bg-[linear-gradient(123deg,#18884E_0%,#062917_100%)] px-4 pb-4 pt-8"
            >
              <div
                class="absolute left-1/2 top-[-43px] flex -translate-x-1/2 items-center justify-center"
              >
                <img
                  :src="titleBackImg"
                  alt=""
                  class="h-[64px] w-auto max-w-[280px] object-contain"
                />
              </div>

              <div
                class="flex flex-col gap-3 receive-pop__list max-h-[220px] overflow-y-auto sm:max-h-[390px]"
              >
                <div
                  v-for="item in displayVouchers"
                  :key="item.id"
                  class="flex items-center gap-3 rounded-[13px] px-3 py-2.5"
                  :style="{ background: resolveCardBg(item) }"
                >
                  <div class="flex w-[44px] shrink-0 items-center justify-center sm:w-[75px]">
                    <img :src="resolveCardIcon(item)" alt="" class="h-full w-full object-contain" />
                  </div>
                  <div class="min-w-0 flex-1 border-l border-dashed border-black/10 pl-3">
                    <p class="truncate text-[14px] font-[700] text-[#000] sm:text-[18px]">
                      {{ item.title }}
                    </p>
                    <p
                      class="text-[13px] font-[400] sm:text-[14px]"
                      :style="{ color: resolveTextColors(item).reward }"
                    >
                      {{ item.rewardText }}
                    </p>
                    <p
                      class="mt-1 text-[10px] font-[400] sm:text-[12px] sm:mt-2.5"
                      :style="{ color: resolveTextColors(item).meta }"
                    >
                      {{ t('luckySpinPage.expiresOn') }} : {{ item.expiresAt }}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="mt-4 flex h-[44px] w-full items-center justify-center rounded-[10px] bg-[#00E676] text-[15px] font-[700] text-[#1A1A1A]"
                @click="handleUseNow"
              >
                {{ resolvedButtonText }}
              </button>
            </div>
          </section>

          <button
            type="button"
            class="mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-common-30 text-[18px] leading-none text-common-80"
            :aria-label="t('common.cancel')"
            @click="handleClose"
          >
            ✕
          </button>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  getVoucherCardBg,
  getVoucherCardTextColors
} from '@/views/activity/ticket/shared/constants'
import type { VoucherCardType } from '@/views/activity/ticket/shared/types'
import blindBoxImg from '@/static/img/activity/receive-pop/blind-box.png'
import eggImg from '@/static/img/activity/receive-pop/egg.png'
import redEnvelopeImg from '@/static/img/activity/receive-pop/red-envelope.png'
import titleBackImg from '@/static/img/activity/receive-pop/title-back.png'
import turntableImg from '@/static/img/activity/receive-pop/turntable.png'
import cashVoucherImg from '@/static/img/lucky-spin/vouchers/game-cash-voucher.png'
// import { globalTicketToastState } from '../ticket/shell/ticketToast'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
// const ticketId = computed(() => globalTicketToastState.activeTicketRecord?.ticketId)
export interface ReceiveVoucherItem {
  id: string
  type: VoucherCardType
  title: string
  rewardText: string
  expiresAt: string
  icon?: string
  bgColor?: string
}

interface Props {
  title?: string
  subtext?: string
  buttonText?: string
  /** 传入列表时优先使用；单条时可只传 vouchers 或沿用下方单券字段 */
  vouchers?: ReceiveVoucherItem[]
  voucherCount?: number
  voucherTitle?: string
  rewardText?: string
  expiresAt?: string
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtext: undefined,
  buttonText: undefined,
  vouchers: () => [],
  voucherCount: undefined,
  voucherTitle: 'Golden Egg Voucher',
  rewardText: 'Win up to ₱888',
  expiresAt: '12/18/2026 11:14 AM',
  closeOnOverlay: true
})

const emit = defineEmits<{
  useNow: []
  close: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const { t } = useI18n()

const RECEIVE_POP_ICONS: Record<string, string> = {
  golden_egg: eggImg,
  lucky_spin: turntableImg,
  cash_voucher: cashVoucherImg,
  lucky_red_envelope: redEnvelopeImg,
  mystery_box: blindBoxImg
}

const displayVouchers = computed<ReceiveVoucherItem[]>(() => {
  if (props.vouchers.length > 0) {
    return props.vouchers
  }

  return [
    {
      id: 'default',
      type: 'golden_egg',
      title: props.voucherTitle,
      rewardText: props.rewardText,
      expiresAt: props.expiresAt
    }
  ]
})

const resolvedCount = computed(() => props.voucherCount ?? displayVouchers.value.length)

const resolvedTitle = computed(() => props.title ?? t('luckySpinPage.result.congratulations'))

const resolvedSubtext = computed(
  () => props.subtext ?? t('luckySpinPage.result.receivedVouchers', { count: resolvedCount.value })
)

const resolvedButtonText = computed(() => props.buttonText ?? t('luckySpinPage.result.useNow'))

const resolveCardBg = (item: ReceiveVoucherItem) => item.bgColor ?? getVoucherCardBg(item.type)

const resolveTextColors = (item: ReceiveVoucherItem) => getVoucherCardTextColors(item.type)

const resolveCardIcon = (item: ReceiveVoucherItem) =>
  item.icon ?? RECEIVE_POP_ICONS[item.type] ?? eggImg

const handleClose = () => {
  visible.value = false
  emit('close')
}

const handleOverlayClose = () => {
  if (!props.closeOnOverlay) return
  handleClose()
}

const handleUseNow = () => {
  emit('useNow')
  handleClose()
}
</script>

<style scoped lang="scss">
.receive-pop__mask {
  background: var(--color-mask-60-1, rgb(0 0 0 / 60%));
  backdrop-filter: blur(5px);
}

.receive-pop__title {
  background: linear-gradient(180deg, #fffdf8 0%, #f9cf7b 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.receive-pop__list {
  padding-right: 2px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgb(255 255 255 / 35%);
  }
}

.popup-fade-enter-active,
.popup-fade-leave-active,
.receive-pop-transition-enter-active,
.receive-pop-transition-leave-active {
  transition: opacity 0.24s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to,
.receive-pop-transition-enter-from,
.receive-pop-transition-leave-to {
  opacity: 0;
}

.receive-pop-transition-enter-active .receive-pop__dialog,
.receive-pop-transition-leave-active .receive-pop__dialog {
  transition:
    transform 0.24s ease,
    opacity 0.24s ease;
}

.receive-pop-transition-enter-from .receive-pop__dialog,
.receive-pop-transition-leave-to .receive-pop__dialog {
  transform: translateY(18px) scale(0.96);
}
</style>
