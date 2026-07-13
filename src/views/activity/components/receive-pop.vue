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
            class="receive-pop__dialog w-full max-w-[320px] sm:max-w-[450px]"
          >
            <h2 class="receive-pop__title text-center text-[32px] font-[700] sm:text-[42px]">
              {{ t('luckySpinPage.result.congratulations') }}
            </h2>
            <p
              class="text-center text-[16px] font-[700] leading-[18px] text-common-100 sm:text-[21px]"
            >
              {{ t('luckySpinPage.result.receivedVouchers', { count: resolvedCount }) }}
            </p>

            <div
              class="relative mt-12 w-full rounded-[24px] bg-[linear-gradient(123deg,#18884E_0%,#062917_100%)] px-4 pb-4 pt-8 sm:pt-[40px]"
            >
              <div
                class="absolute left-1/2 flex -translate-x-1/2 items-center justify-center top-[-43px] sm:top-[-44px] sm:h-[68px] sm:w-[368px]"
              >
                <img
                  :src="titleBackImg"
                  alt=""
                  class="object-contain h-[64px] w-auto max-w-[280px] sm:h-full sm:w-full sm:max-w-none"
                />
              </div>

              <div
                class="flex flex-col gap-3 receive-pop__list max-h-[220px] overflow-y-auto sm:max-h-[390px]"
              >
                <div
                  v-for="item in displayVouchers"
                  :key="item.id"
                  class="flex items-center gap-3 rounded-[13px] px-3 py-2.5 sm:mx-auto sm:h-[108px] sm:w-[404px] sm:shrink-0"
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
                {{ t('luckySpinPage.result.useNow') }}
              </button>
            </div>
          </section>

          <button
            type="button"
            class="mt-[30.67px] flex h-[40px] w-[40px] items-center justify-center"
            :aria-label="t('common.cancel')"
            @click="handleClose"
          >
            <img
              :src="LUCKY_SPIN_ASSETS.controls.modalCloseIcon"
              alt=""
              class="h-full w-full select-none"
              draggable="false"
            />
          </button>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  getVoucherCardBg,
  getVoucherCardTextColors,
  LUCKY_SPIN_ASSETS
} from '@/views/activity/ticket/shared/constants'
import type { MbTicketRecord } from '@/api/interface/activity'
import type { VoucherCardType } from '@/views/activity/ticket/shared/types'
import {
  getMbTicketLanguageCopy,
  normalizeMbTicketRecords,
  TICKET_TYPE_TO_GAME_ID
} from '@/views/activity/ticket/shared/mappers/mbTicketMapper'
import blindBoxImg from '@/static/img/activity/receive-pop/blind-box.png'
import eggImg from '@/static/img/activity/receive-pop/egg.png'
import redEnvelopeImg from '@/static/img/activity/receive-pop/red-envelope.png'
import titleBackImg from '@/static/img/activity/receive-pop/title-back.png'
import turntableImg from '@/static/img/activity/receive-pop/turntable.png'
import cashVoucherImg from '@/static/img/lucky-spin/vouchers/game-cash-voucher.png'
import { formatTimestamp } from '@/utils/date'
import { getTicketActivityEndUseTime } from '@/views/activity/ticket/shared/utils/ticketActivityCountdown'
import { getLanguageCode } from '@/utils/locale'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface ReceiveVoucherItem {
  id: string
  type: VoucherCardType
  title: string
  rewardText: string
  expiresAt: string
}

interface Props {
  nextTickets?: MbTicketRecord[]
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  nextTickets: () => [],
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

const hasTicketIdentity = (record: MbTicketRecord) =>
  record.rowId != null ||
  record.ticketId != null ||
  record.type != null ||
  Array.isArray(record.languageInfo)

const normalizeReceiveTickets = (value: unknown) =>
  normalizeMbTicketRecords(value).filter(hasTicketIdentity)

const displayVouchers = computed<ReceiveVoucherItem[]>(() => {
  const languageCode = getLanguageCode()

  return normalizeReceiveTickets(props.nextTickets).map((record, index) => {
    const type = TICKET_TYPE_TO_GAME_ID[Number(record.type)] ?? 'golden_egg'
    const copy = getMbTicketLanguageCopy(record, languageCode)
    const ticketName = String((record as { ticketName?: unknown }).ticketName ?? '').trim()

    return {
      id: `next-ticket-${record.rowId ?? record.ticketId ?? index}`,
      type,
      title: copy.name || ticketName,
      rewardText: copy.description || '',
      expiresAt: formatTimestamp(getTicketActivityEndUseTime(record))
    }
  })
})

const resolvedCount = computed(() => displayVouchers.value.length)

const resolveCardBg = (item: ReceiveVoucherItem) => getVoucherCardBg(item.type)

const resolveTextColors = (item: ReceiveVoucherItem) => getVoucherCardTextColors(item.type)

const resolveCardIcon = (item: ReceiveVoucherItem) => RECEIVE_POP_ICONS[item.type] ?? eggImg

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
