<template>
  <div
    class="relative h-[314px] w-[328.333px] shrink-0 overflow-hidden sm:h-[471px] sm:w-[492.5px]"
    data-game-id="lucky_red_envelope"
  >
    <!-- 展台及阴影 -->
    <div
      class="absolute bottom-0 left-1/2 h-[67px] w-[286px] -translate-x-1/2 sm:h-[100.5px] sm:w-[429px]"
    >
      <img
        :src="standImage"
        alt=""
        class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        draggable="false"
      />
    </div>

    <!-- 红包入场动画：结束后保持最后一帧，作为待机状态的红包主体 -->
    <div
      v-show="phase === 'intro' || phase === 'idle'"
      ref="introContainer"
      class="pointer-events-none absolute left-[58.333px] top-0 h-[266.667px] w-[211.667px] sm:left-[87.5px] sm:h-[400px] sm:w-[317.5px] [&_svg]:!h-full [&_svg]:!w-full"
    />

    <!-- 红包待机动画：叠加按钮扫光和扩散效果 -->
    <div
      v-show="phase === 'idle'"
      ref="idleContainer"
      class="pointer-events-none absolute left-[94.167px] top-[98.667px] h-[140px] w-[140px] sm:left-[141.25px] sm:top-[148px] sm:h-[210px] sm:w-[210px] [&_svg]:!h-full [&_svg]:!w-full"
    />

    <!-- 打开红包动画：接口领取成功后播放，并保持最后一帧 -->
    <div
      v-show="phase === 'opening' || phase === 'opened'"
      ref="openContainer"
      class="pointer-events-none absolute left-[58.333px] top-0 h-[266.667px] w-[211.667px] sm:left-[87.5px] sm:h-[400px] sm:w-[317.5px] [&_svg]:!h-full [&_svg]:!w-full"
    />

    <!-- 打开后的红包中心符号 -->
    <div
      v-if="phase === 'opened'"
      class="pointer-events-none absolute left-[125.333px] top-[130px] flex h-[77.667px] w-[77.667px] items-center justify-center sm:left-[188px] sm:top-[195px] sm:h-[116.5px] sm:w-[116.5px]"
    >
      <span
        class="font-inter h-[54.333px] w-[29.667px] text-center text-[45px] font-[700] leading-[54.333px] text-[#FF2321] [text-shadow:0_1px_0.333px_#FCF5EA] sm:h-[81.5px] sm:w-[44.5px] sm:text-[67.5px] sm:leading-[81.5px] sm:[text-shadow:0_1.5px_0.5px_#FCF5EA]"
      >
        $
      </span>
    </div>

    <!-- 打开后的动态奖励文案 -->
    <div
      v-if="phase === 'opened'"
      class="red-envelope-reward-enter pointer-events-none absolute left-[58.333px] top-0 h-[266.667px] w-[211.667px] sm:left-[87.5px] sm:h-[400px] sm:w-[317.5px]"
    >
      <p
        class="font-inter absolute left-1/2 top-[10px] m-0 h-[24.333px] w-[97.333px] -translate-x-1/2 whitespace-nowrap text-center text-[20px] font-[700] leading-[24.333px] text-[#F1160E] sm:top-[15px] sm:h-[36.5px] sm:w-[146px] sm:text-[30px] sm:leading-[36.5px]"
      >
        {{ t('ticketPage.redPacket.resultCongrats') }}
      </p>
      <p
        class="font-inter absolute left-1/2 top-[37.333px] m-0 h-[17px] w-[118.333px] -translate-x-1/2 whitespace-nowrap text-center text-[14px] font-[400] leading-[17px] text-[#4D2900] sm:top-[56px] sm:h-[25.5px] sm:w-[177.5px] sm:text-[21px] sm:leading-[25.5px]"
      >
        {{ t('luckySpinPage.result.wonReward') }}
      </p>

      <div
        class="absolute left-1/2 top-[64.333px] flex h-[57px] w-[171.667px] -translate-x-1/2 flex-col items-center gap-[5px] sm:top-[96.5px] sm:h-[85.5px] sm:w-[257.5px] sm:gap-[7.5px]"
      >
        <div
          class="flex h-[40px] w-[170px] items-center justify-center gap-[0.667px] sm:h-[60px] sm:w-[255px] sm:gap-[1px]"
        >
          <span
            class="font-inter flex h-[27.333px] w-[27.333px] shrink-0 items-center justify-center text-center text-[23.333px] font-[700] leading-[27.333px] text-[#F1160E] sm:h-[41px] sm:w-[41px] sm:text-[35px] sm:leading-[41px]"
          >
            {{ currencySymbol }}
          </span>
          <span
            class="font-inter flex h-[40px] max-w-[115px] min-w-0 items-center justify-center text-center text-[33px] font-[700] leading-[40px] text-[#F1160E] sm:h-[60px] sm:max-w-[172.5px] sm:text-[49.5px] sm:leading-[60px]"
          >
            {{ displayAmountText }}
          </span>
        </div>
        <p
          class="font-inter m-0 h-[12px] w-[170px] whitespace-nowrap text-center text-[10px] font-[400] leading-[12px] text-[#A1782B] sm:h-[18px] sm:w-[255px] sm:text-[15px] sm:leading-[18px]"
        >
          {{ t('luckySpinPage.result.creditedToWallet') }}
        </p>
      </div>
    </div>

    <!-- 红包点击热区 -->
    <button
      v-if="phase === 'idle'"
      type="button"
      class="absolute left-[125.333px] top-[130px] z-10 flex h-[77.667px] w-[77.667px] items-center justify-center border-0 bg-transparent p-0 sm:left-[188px] sm:top-[195px] sm:h-[116.5px] sm:w-[116.5px]"
      :class="{ 'cursor-default': isPending }"
      :aria-label="t('ticketPage.redPacket.openAction')"
      :disabled="isPending"
      @click="handleOpen"
    >
      <span
        class="font-inter pointer-events-none h-[36px] w-[60px] text-center text-[18.333px] font-[700] leading-[36px] tracking-[0.667px] text-[#FF2321] [text-shadow:0_1px_0.333px_#FCF5EA] sm:h-[54px] sm:w-[90px] sm:text-[27.5px] sm:leading-[54px] sm:tracking-[1px] sm:[text-shadow:0_1.5px_0.5px_#FCF5EA]"
      >
        {{ t('ticketPage.redPacket.openAction') }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MbTicketRecord, UseTicketResult } from '@/api/interface/activity'
import standImage from '@/static/img/lucky-spin/lucky-red-envelope/stand.png'
import { getCurrencySymbol } from '@/utils/locale'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTicketUseAction } from '../../shared'
import { LUCKY_RED_ENVELOPE_LOTTIE } from '../../shared/assets'
import { isSameMbTicketRecord, TICKET_TYPE_TO_GAME_ID } from '../../shared/mappers/mbTicketMapper'
import { openTicketReceivePopFromUseResult } from '../../shared/mappers/mapReceiveTickets'
import {
  globalTicketToastState,
  setActiveTicketRecord,
  switchTicketGame
} from '../../shell/ticketToast'
import { useRedEnvelopeLottie } from './useRedEnvelopeLottie'

interface RedPacketTicketRecord extends MbTicketRecord {
  amount?: number | string
  currency?: string
}

const emit = defineEmits<{
  open: []
}>()

const { t } = useI18n()
const openedRewardAmount = ref<number | string | null>(null)
const displayAmountText = ref('0.00')
const { runUseTicket, isPending } = useTicketUseAction()
const introContainer = ref<HTMLElement | null>(null)
const idleContainer = ref<HTMLElement | null>(null)
const openContainer = ref<HTMLElement | null>(null)
const { phase, createPlayers, reset, playOpen } = useRedEnvelopeLottie({
  introContainer,
  idleContainer,
  openContainer,
  introPath: LUCKY_RED_ENVELOPE_LOTTIE.intro,
  idlePath: LUCKY_RED_ENVELOPE_LOTTIE.idle,
  openPath: LUCKY_RED_ENVELOPE_LOTTIE.open
})

const activeTicket = computed(
  () => globalTicketToastState.activeTicketRecord as RedPacketTicketRecord | null
)

const amountText = computed(() => {
  const amount = openedRewardAmount.value ?? activeTicket.value?.amount
  if (amount === undefined || amount === null || amount === '') return '--'
  return String(amount)
})

const currencySymbol = computed(() => getCurrencySymbol(activeTicket.value?.currency))

const AMOUNT_ANIMATION_DURATION_MS = 720
const POST_OPEN_TRIGGER_DELAY_MS = 3000
let amountAnimationFrame: number | null = null
let postOpenTriggerTimer: number | null = null

const stopAmountAnimation = () => {
  if (amountAnimationFrame === null) return
  window.cancelAnimationFrame(amountAnimationFrame)
  amountAnimationFrame = null
}

const clearPostOpenTriggerTimer = () => {
  if (postOpenTriggerTimer === null) return
  window.clearTimeout(postOpenTriggerTimer)
  postOpenTriggerTimer = null
}

const getAmountFractionDigits = (value: string) => {
  const decimalPart = value.trim().match(/\.(\d+)/)?.[1]
  return decimalPart ? Math.min(decimalPart.length, 8) : 2
}

const parseAmountText = (value: string) => {
  const parsed = Number(value.replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : null
}

const animateAmountText = (targetText: string) => {
  stopAmountAnimation()

  const targetAmount = parseAmountText(targetText)
  if (targetAmount === null) {
    displayAmountText.value = targetText
    return
  }

  const fractionDigits = getAmountFractionDigits(targetText)
  const startTime = window.performance.now()
  displayAmountText.value = (0).toFixed(fractionDigits)

  const runFrame = (now: number) => {
    const progress = Math.min((now - startTime) / AMOUNT_ANIMATION_DURATION_MS, 1)
    const easedProgress = 1 - Math.pow(1 - progress, 3)

    if (progress >= 1) {
      displayAmountText.value = targetText
      amountAnimationFrame = null
      return
    }

    displayAmountText.value = (targetAmount * easedProgress).toFixed(fractionDigits)
    amountAnimationFrame = window.requestAnimationFrame(runFrame)
  }

  amountAnimationFrame = window.requestAnimationFrame(runFrame)
}

const resolveRewardAmount = (result: UseTicketResult | null | undefined) => {
  return result?.amount ?? result?.rewardAmount ?? null
}

const isActiveTicketUnchanged = (record: MbTicketRecord) => {
  const currentRecord = globalTicketToastState.activeTicketRecord
  return Boolean(currentRecord && isSameMbTicketRecord(currentRecord, record))
}

const switchToNextTicket = (consumedRecord: MbTicketRecord) => {
  const records = globalTicketToastState.mbTicketRecords
  const consumedIndex = records.findIndex(record => isSameMbTicketRecord(record, consumedRecord))
  if (consumedIndex < 0) return

  const nextRecord = records[consumedIndex + 1]
  if (!nextRecord) return

  const nextGameId = TICKET_TYPE_TO_GAME_ID[Number(nextRecord.type)]
  if (nextGameId) {
    switchTicketGame(nextGameId, nextRecord)
    return
  }

  setActiveTicketRecord(nextRecord)
}

const schedulePostOpenTrigger = (record: MbTicketRecord, result: UseTicketResult) => {
  clearPostOpenTriggerTimer()

  const enableTrigger = Number(record.enableTrigger)
  if (enableTrigger !== 0 && enableTrigger !== 1) return

  postOpenTriggerTimer = window.setTimeout(() => {
    postOpenTriggerTimer = null
    if (!isActiveTicketUnchanged(record)) return

    if (enableTrigger === 1) {
      openTicketReceivePopFromUseResult(result)
      return
    }

    switchToNextTicket(record)
  }, POST_OPEN_TRIGGER_DELAY_MS)
}

const handleOpen = async () => {
  if (phase.value !== 'idle' || isPending.value) return

  await runUseTicket({
    voucherName: t('ticketPage.redPacket.title'),
    fallbackErrorMessage: t('luckySpinPage.loadFailed'),
    onSuccess: result => {
      const consumedRecord = activeTicket.value ? { ...activeTicket.value } : null
      const enableTrigger = Number(consumedRecord?.enableTrigger)
      const hasPostOpenTrigger = enableTrigger === 0 || enableTrigger === 1

      if (!hasPostOpenTrigger && openTicketReceivePopFromUseResult(result)) return

      openedRewardAmount.value = resolveRewardAmount(result)
      playOpen()
      emit('open')

      if (consumedRecord) {
        schedulePostOpenTrigger(consumedRecord, result)
      }
    }
  })
}

onMounted(() => {
  void createPlayers()
})

onBeforeUnmount(() => {
  stopAmountAnimation()
  clearPostOpenTriggerTimer()
})

watch([phase, amountText], ([nextPhase, nextAmountText]) => {
  if (nextPhase === 'opened') {
    animateAmountText(nextAmountText)
    return
  }

  stopAmountAnimation()
  displayAmountText.value = '0.00'
})

/** 切换到另一张红包票券时恢复未打开状态。 */
watch(
  () => [activeTicket.value?.rowId, activeTicket.value?.ticketId],
  () => {
    clearPostOpenTriggerTimer()
    openedRewardAmount.value = null
    displayAmountText.value = '0.00'
    reset()
  }
)
</script>

<style scoped>
.red-envelope-reward-enter {
  will-change: transform, opacity;
  animation: red-envelope-reward-enter 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes red-envelope-reward-enter {
  0% {
    opacity: 0;
    transform: translateY(60px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
