<template>
  <div
    class="absolute inset-0 z-10 flex items-center justify-center bg-mask-60-1 font-inter"
    @click.self="emit('close')"
  >
    <div class="flex w-[260px] flex-col items-center gap-[24px]">
      <div class="relative w-[260px]" :style="{ height: `${popupLayout.height}px` }">
        <img
          :src="backgroundSrc"
          alt=""
          class="pointer-events-none absolute inset-0 size-full select-none"
        />

        <!-- 标题 -->
        <p
          v-if="showTitle"
          class="absolute inset-x-0 text-center text-[24px] font-[700] leading-[29px]"
          :class="isClaimed ? 'text-packet-title' : 'text-secondary-9'"
          :style="{ top: `${popupLayout.titleTop}px` }"
        >
          {{
            isClaimed
              ? t('redPacketPanel.congratulations')
              : t('redPacketPanel.congratulationsExclaim')
          }}
        </p>

        <!-- 金额 + 名称 -->
        <div
          class="absolute inset-x-0 flex flex-col items-center"
          :class="hideAmount ? 'gap-[10px]' : ''"
          :style="{ top: `${amountTop}px` }"
        >
          <img v-if="hideAmount" :src="hiddenAmountIcon" alt="***" class="h-[14px] w-[58px]" />
          <span
            v-else
            class="text-[46px] font-[700] leading-[56px]"
            :class="isClaimed ? 'text-packet-title' : 'text-common-100'"
          >
            {{ amountText }}
          </span>
          <span
            class="max-w-[232px] truncate text-[16px] leading-[19px]"
            :class="isClaimed ? 'text-packet-title' : 'text-secondary-9'"
          >
            {{ props.item.redEnvelopeName }}
          </span>
        </div>

        <!-- 进度区：剩余时间 + 单/多条件 -->
        <div
          v-if="hasProgress"
          class="absolute left-[14px] flex w-[232px] flex-col items-center gap-[14px]"
          :style="{ top: `${popupLayout.progressTop}px` }"
        >
          <div class="flex items-center gap-[4px]">
            <span class="flex items-center gap-[6px] text-[12px] leading-[15px] text-common-100">
              <img :src="clockIcon" alt="" class="size-[12px]" />
              {{ t('redPacketPanel.timeLeft') }}
            </span>
            <span class="text-[14px] font-[700] leading-[17px] text-secondary-6">
              {{ countdown }}
            </span>
          </div>

          <div class="flex w-full flex-col items-center gap-[2px]">
            <span
              v-if="isSingleCondition && activeCondition"
              class="relative mb-[4px] rounded-[8px] bg-secondary-9 px-[7px] text-[10px] font-[700] leading-[16px]"
            >
              <span class="text-secondary-2">{{ formatAmount(activeCondition.gather, 2) }}</span>
              <span class="text-text-4">/{{ formatAmount(activeCondition.cond, 2) }}</span>
              <span
                class="absolute left-1/2 top-full -translate-x-1/2 border-x-[4.5px] border-t-[4px] border-x-transparent border-t-secondary-9"
              />
            </span>

            <div class="flex w-full flex-col gap-[10px]">
              <div class="h-[6px] w-full overflow-hidden rounded-[60px] bg-mask-20">
                <div
                  class="h-full rounded-[60px] bg-secondary-6"
                  :style="{ width: `${progressPercent}%` }"
                />
              </div>

              <p
                v-if="isSingleCondition && activeCondition"
                class="text-center text-[12px] leading-[15px] text-common-100"
              >
                {{ t(`redPacketPanel.conditionHint.${activeCondition.key}.prefix`) }}
                <span class="text-secondary-6">{{ formatAmount(activeCondition.cond, 2) }}+</span>
                {{ t(`redPacketPanel.conditionHint.${activeCondition.key}.suffix`) }}
              </p>

              <div v-else class="flex flex-col gap-[6px] text-[12px] leading-[15px]">
                <p v-for="condition in conditions" :key="condition.key" class="text-common-100">
                  {{ t(`redPacketPanel.conditionLabel.${condition.key}`) }}
                  <span class="text-secondary-6">
                    {{ formatAmount(condition.gather, 2) }}/{{ formatAmount(condition.cond, 2) }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 已过期 / 已领完 提示 -->
        <div
          v-if="isExpired || isSoldOut"
          class="absolute inset-x-0 flex flex-col items-center gap-[4px] text-[24px] font-[700] leading-[29px] text-secondary-9"
          :style="{ top: `${popupLayout.statusTop}px` }"
        >
          <span>{{
            t(isExpired ? 'redPacketPanel.expiredTitle' : 'redPacketPanel.soldOutTitle')
          }}</span>
          <span>{{
            t(isExpired ? 'redPacketPanel.expiredDesc' : 'redPacketPanel.soldOutDesc')
          }}</span>
        </div>

        <img
          :src="coinIcon"
          alt=""
          class="pointer-events-none absolute size-[84px]"
          :style="{ left: `${popupLayout.coinLeft}px`, top: `${coinStyleTop}px` }"
        />

        <!-- 按钮 -->
        <button
          v-if="buttonText"
          type="button"
          class="red-packet-popup-button absolute left-[26px] flex w-[208px] items-center justify-center rounded-[68px] px-[12px] pb-[10px] pt-[12px] text-[16px] font-[700] leading-[19px] text-packet-button-text disabled:cursor-default"
          :style="{ top: `${popupLayout.buttonTop}px` }"
          :disabled="isClaimed || claiming"
          @click="handleButtonClick"
        >
          {{ buttonText }}
        </button>

        <p
          v-if="isClaimed"
          class="absolute inset-x-0 text-center text-[12px] leading-[15px] text-secondary-9"
          :style="{ top: `${popupLayout.creditedTop}px` }"
        >
          {{ t('redPacketPanel.credited') }}
        </p>

        <p
          v-if="isExpired"
          class="absolute inset-x-0 flex items-center justify-center gap-[6px] text-[12px] leading-[15px]"
          :style="{ top: `${popupLayout.expiryTop}px` }"
        >
          <span class="text-common-100">{{ t('redPacketPanel.expiryDate') }}</span>
          <span class="font-[700] text-secondary-6">{{ expiryDateText }}</span>
        </p>

        <button
          v-if="isClaimed"
          type="button"
          class="absolute left-1/2 flex -translate-x-1/2 items-center gap-[2px] whitespace-nowrap text-[12px] leading-[15px] text-secondary-9"
          :style="{ top: `${popupLayout.historyTop}px` }"
          @click="emit('history')"
        >
          {{ t('redPacketPanel.claimHistory') }}
          <svg viewBox="0 0 10 10" class="size-[10px]" fill="none" aria-hidden="true">
            <path
              d="M1.5 2l3 3-3 3M5.5 2l3 3-3 3"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <button type="button" aria-label="close" class="size-[30px]" @click="emit('close')">
        <img :src="popupCloseIcon" alt="" class="size-full" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import {
  SHOW_STATE,
  type RedEnvelopeItem,
  type RedEnvelopeSchedule,
  type RedEnvelopeShowState
} from '@/api/interface/red-envelope'
import clockIcon from '@/static/svg/red-packet/clock.svg?url'
import coinIcon from '@/static/svg/red-packet/coin.svg?url'
import hiddenAmountIcon from '@/static/svg/red-packet/hidden-amount.svg?url'
import popupBgOpened from '@/static/svg/red-packet/popup-bg-opened.webp'
import popupBgProgress from '@/static/svg/red-packet/popup-bg-progress.svg?url'
import popupBg from '@/static/svg/red-packet/popup-bg.svg?url'
import popupCloseIcon from '@/static/svg/red-packet/popup-close.svg?url'
import {
  formatAmount,
  formatCountdown,
  formatDateTime,
  formatMoney,
  isDailyRedEnvelope
} from '../format'
import { useNow } from '../useNow'

type ConditionKey = 'recharge' | 'loss' | 'bet'
type PopupLayoutKey = 'progress' | 'claimable' | 'claimed' | 'expired' | 'soldOut'

interface RedPacketCondition {
  key: ConditionKey
  gather: number
  cond: number
}

interface PopupLayout {
  height: number
  titleTop?: number
  amountTop: number
  /** 每日红包隐藏金额时的金额区 top，仅进度中和可领取会用到。 */
  hiddenAmountTop?: number
  coinTop: number
  coinLeft: number
  buttonTop?: number
  progressTop?: number
  statusTop?: number
  creditedTop?: number
  expiryTop?: number
  historyTop?: number
}

interface PopupButton {
  textKey: string
  to?: string
}

/** 金币图相对布局 coinTop 上移，和原先模板里的 -10 一致。 */
const COIN_VISUAL_OFFSET = 10

const POPUP_LAYOUT: Record<PopupLayoutKey, PopupLayout> = {
  progress: {
    height: 404,
    titleTop: 20,
    amountTop: 69,
    hiddenAmountTop: 83,
    coinTop: 267,
    coinLeft: 89,
    buttonTop: 337,
    progressTop: 164
  },
  claimable: {
    height: 360,
    titleTop: 24,
    amountTop: 69,
    hiddenAmountTop: 83,
    coinTop: 192,
    coinLeft: 88,
    buttonTop: 264
  },
  claimed: {
    height: 360,
    titleTop: 20,
    amountTop: 57,
    coinTop: 190,
    coinLeft: 88,
    buttonTop: 256,
    creditedTop: 303,
    historyTop: 327
  },
  expired: {
    height: 360,
    amountTop: 38,
    coinTop: 143,
    coinLeft: 88,
    statusTop: 229,
    expiryTop: 321
  },
  soldOut: {
    height: 360,
    amountTop: 50,
    coinTop: 143,
    coinLeft: 88,
    statusTop: 229
  }
}

const BUTTON_CONFIG: Partial<Record<RedEnvelopeShowState, PopupButton>> = {
  [SHOW_STATE.deposit]: { textKey: 'redPacketPanel.depositNow', to: '/deposit' },
  [SHOW_STATE.bet]: { textKey: 'redPacketPanel.betNow', to: '/casino' },
  [SHOW_STATE.claim]: { textKey: 'redPacketPanel.claimNow' },
  [SHOW_STATE.claimed]: { textKey: 'redPacketPanel.claimed' }
}

/** 领取接口若仍返回这些状态，说明还不能记成已领取。 */
const RESULT_STATES_TO_KEEP = new Set<RedEnvelopeShowState>([
  SHOW_STATE.deposit,
  SHOW_STATE.bet,
  SHOW_STATE.expired,
  SHOW_STATE.soldOut
])

const props = defineProps<{
  item: RedEnvelopeItem
  schedule: RedEnvelopeSchedule
}>()

const emit = defineEmits<{
  close: []
  navigate: [path: string]
  claimed: [schedule: RedEnvelopeSchedule]
  history: []
}>()

const { t } = useI18n()
const now = useNow()

const claiming = ref(false)
const currentSchedule = ref<RedEnvelopeSchedule>(props.schedule)

const showState = computed(() => currentSchedule.value.showState)
const hasProgress = computed(
  () => showState.value === SHOW_STATE.deposit || showState.value === SHOW_STATE.bet
)
const isClaimable = computed(() => showState.value === SHOW_STATE.claim)
const isClaimed = computed(() => showState.value === SHOW_STATE.claimed)
const isExpired = computed(() => showState.value === SHOW_STATE.expired)
const isSoldOut = computed(() => showState.value === SHOW_STATE.soldOut)
const showTitle = computed(() => hasProgress.value || isClaimable.value || isClaimed.value)

const isDaily = computed(() => isDailyRedEnvelope(props.item))
const hideAmount = computed(() => isDaily.value && !isClaimed.value)

const layoutKey = computed<PopupLayoutKey>(() => {
  if (hasProgress.value) return 'progress'
  if (isClaimed.value) return 'claimed'
  if (isExpired.value) return 'expired'
  if (isSoldOut.value) return 'soldOut'
  return 'claimable'
})

const popupLayout = computed(() => POPUP_LAYOUT[layoutKey.value])

const amountTop = computed(() => {
  const layout = popupLayout.value
  if (hideAmount.value && layout.hiddenAmountTop !== undefined) return layout.hiddenAmountTop
  return layout.amountTop
})

const coinStyleTop = computed(() => popupLayout.value.coinTop - COIN_VISUAL_OFFSET)

const amountText = computed(() => {
  const amount = currentSchedule.value.amount ?? props.item.amount ?? 0
  return formatMoney(props.item.currency, amount)
})

const conditions = computed<RedPacketCondition[]>(() => {
  const schedule = currentSchedule.value
  const entries: [ConditionKey, number | undefined, number | undefined][] = [
    ['recharge', schedule.rechargeGather, schedule.rechargeCond],
    ['loss', schedule.lossGather, schedule.lossCond],
    ['bet', schedule.betGather, schedule.betCond]
  ]
  return entries
    .filter(([, , cond]) => cond !== undefined && cond !== null)
    .map(([key, gather, cond]) => ({ key, gather: Number(gather ?? 0), cond: Number(cond) }))
})

const isSingleCondition = computed(() => conditions.value.length === 1)

const findCondition = (key: ConditionKey) => conditions.value.find(item => item.key === key)
const isUnmet = (condition?: RedPacketCondition) => !!condition && condition.gather < condition.cond

/** 进度条跟随当前按钮：充值看充值进度，投注看投注或亏损中第一个未达标的。 */
const activeCondition = computed<RedPacketCondition | undefined>(() => {
  if (isSingleCondition.value) return conditions.value[0]
  if (showState.value === SHOW_STATE.deposit)
    return findCondition('recharge') ?? conditions.value[0]
  const bet = findCondition('bet')
  const loss = findCondition('loss')
  return [bet, loss].find(isUnmet) ?? bet ?? loss ?? conditions.value[0]
})

const progressPercent = computed(() => {
  const condition = activeCondition.value
  if (!condition || condition.cond <= 0) return 0
  return Math.min(100, Math.max(0, (condition.gather / condition.cond) * 100))
})

const expiredTime = computed(() => currentSchedule.value.expiredTime ?? props.item.expiredTime)
const countdown = computed(() => formatCountdown((expiredTime.value ?? 0) - now.value))
const expiryDateText = computed(() => formatDateTime(expiredTime.value, true))

const backgroundSrc = computed(() => {
  if (hasProgress.value) return popupBgProgress
  if (isClaimed.value) return popupBgOpened
  return popupBg
})

const buttonConfig = computed(() => BUTTON_CONFIG[showState.value])
const buttonText = computed(() => (buttonConfig.value ? t(buttonConfig.value.textKey) : ''))

const handleClaim = async () => {
  if (claiming.value) return
  claiming.value = true
  try {
    const result = await Api.redEnvelope.claimRewards(props.item.redEnvelopeId)
    const nextState = RESULT_STATES_TO_KEEP.has(result.showState)
      ? result.showState
      : SHOW_STATE.claimed
    currentSchedule.value = { ...currentSchedule.value, ...result, showState: nextState }
    if (nextState === SHOW_STATE.claimed) {
      emit('claimed', currentSchedule.value)
    }
  } finally {
    claiming.value = false
  }
}

const handleButtonClick = () => {
  const config = buttonConfig.value
  if (!config) return
  if (config.to) return emit('navigate', config.to)
  if (showState.value === SHOW_STATE.claim) return handleClaim()
}
</script>

<style scoped>
.red-packet-popup-button {
  background: linear-gradient(
    180deg,
    var(--color-red-packet-button-start) 0%,
    var(--color-red-packet-button-end) 100%
  );
  box-shadow:
    0 2px 0 0 var(--color-red-packet-button-shadow),
    inset 0 -1px 6px 0 var(--color-red-packet-button-inset-bottom),
    inset 0 1px 6px 0 var(--color-red-packet-button-inset-top);
  text-shadow: 0 0.6px 0 var(--color-red-packet-button-highlight);
}
</style>
