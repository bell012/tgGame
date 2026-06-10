<template>
  <div
    class="relative shrink-0 overflow-hidden"
    data-game-id="lucky_red_envelope"
    :style="areaStyle"
  >
    <!-- 展台及阴影 -->
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2" :style="stageStyle">
      <img
        :src="standImage"
        alt=""
        class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        draggable="false"
      />
      <span class="red-packet-shadow red-packet-shadow--large" :style="largeShadowStyle" />
      <span class="red-packet-shadow red-packet-shadow--small" :style="smallShadowStyle" />
    </div>

    <!-- 未打开红包 -->
    <img
      v-if="!opened"
      :src="closedPacketImage"
      alt=""
      class="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 select-none object-contain"
      :style="packetStyle"
      draggable="false"
    />

    <!-- 已打开红包 -->
    <div v-else class="absolute top-0" :style="openedPacketStyle">
      <div class="absolute bg-[#FF0533]" :style="openedOuterStyle" />
      <div class="absolute bg-[#FFF1CF]" :style="openedInnerStyle" />

      <img
        :src="openedBottomImage"
        alt=""
        class="pointer-events-none absolute left-0 w-full select-none object-cover object-bottom"
        :style="openedBottomStyle"
        draggable="false"
      />

      <p
        class="absolute left-1/2 m-0 -translate-x-1/2 whitespace-nowrap text-center font-bold text-[#F1160E]"
        :style="congratsStyle"
      >
        {{ t('luckySpinPage.result.congratulations') }}
      </p>
      <p
        class="absolute left-1/2 m-0 -translate-x-1/2 whitespace-nowrap text-center font-normal text-[#4D2900]"
        :style="rewardSubtitleStyle"
      >
        You won a reward
      </p>

      <div
        class="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
        :style="rewardContentStyle"
      >
        <div class="flex items-center justify-center" :style="amountRowStyle">
          <span
            class="flex shrink-0 items-center justify-center font-bold text-[#F1160E]"
            :style="currencyStyle"
          >
            {{ currencySymbol }}
          </span>
          <span
            class="flex min-w-0 items-center justify-center text-center font-bold text-[#F1160E]"
            :style="amountStyle"
          >
            {{ amountText }}
          </span>
        </div>
        <p
          class="m-0 whitespace-nowrap text-center font-normal text-[#A1782B]"
          :style="creditStyle"
        >
          {{ t('luckySpinPage.result.creditedToWallet') }}
        </p>
      </div>
    </div>

    <!-- 打开按钮 -->
    <button
      type="button"
      class="absolute z-10 border-0 bg-transparent p-0 disabled:opacity-80"
      :class="{ 'cursor-default': opened || isPending }"
      :style="buttonStyle"
      :aria-label="opened ? undefined : 'OPEN'"
      :disabled="opened || isPending"
      @click="handleOpen"
    >
      <!-- <span
        v-if="!opened"
        class="red-packet-ripple pointer-events-none absolute left-1/2 rounded-full"
        :style="rippleStyle"
      /> -->
      <img
        :src="buttonImage"
        alt=""
        class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        draggable="false"
      />
      <span
        class="pointer-events-none absolute left-1/2 text-center font-bold text-[#FF2321]"
        :style="buttonTextStyle"
      >
        {{ opened ? currencySymbol : 'OPEN' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MbTicketRecord, UseTicketResult } from '@/api/interface/activity'
import { useIsMobile } from '@/composables/useMediaQuery'
import buttonImage from '@/static/img/lucky-spin/lucky-red-envelope/red-packet-button.png'
import closedPacketImage from '@/static/img/lucky-spin/lucky-red-envelope/red-packet-closed.png'
import openedBottomImage from '@/static/img/lucky-spin/lucky-red-envelope/red-packet-opened-bottom.png'
import standImage from '@/static/img/lucky-spin/lucky-red-envelope/stand.png'
import { getCurrencySymbol } from '@/utils/locale'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTicketUseAction } from '../../shared'
import { globalTicketToastState } from '../../shell/ticketToast'

interface RedPacketTicketRecord extends MbTicketRecord {
  amount?: number | string
  currency?: string
}

const emit = defineEmits<{
  open: []
}>()

const { t } = useI18n()
const isMobile = useIsMobile()
const opened = ref(false)
const openedRewardAmount = ref<number | string | null>(null)
const { runUseTicket, isPending } = useTicketUseAction()

/** H5 为三倍稿缩放到 1 倍，PC 为原稿的一半。 */
const scale = computed(() => (isMobile.value ? 1 / 3 : 1 / 2))
const px = (value: number) => `${value * scale.value}px`

const activeTicket = computed(
  () => globalTicketToastState.activeTicketRecord as RedPacketTicketRecord | null
)

const amountText = computed(() => {
  const amount = openedRewardAmount.value ?? activeTicket.value?.amount
  if (amount === undefined || amount === null || amount === '') return '--'
  return String(amount)
})

const currencySymbol = computed(() => getCurrencySymbol(activeTicket.value?.currency))

const areaStyle = computed(() => ({
  width: px(985),
  height: px(942)
}))

const stageStyle = computed(() => ({
  width: px(858),
  height: px(201)
}))

const largeShadowStyle = computed(() => ({
  width: px(540),
  height: px(61),
  top: '24.38%',
  filter: `blur(${px(10)})`
}))

const smallShadowStyle = computed(() => ({
  width: px(540),
  height: px(37),
  top: '25.87%',
  filter: `blur(${px(6)})`
}))

const packetStyle = computed(() => ({
  width: px(635),
  height: px(800)
}))

const openedPacketStyle = computed(() => ({
  width: px(635),
  height: px(800),
  left: px(175)
}))

const openedOuterStyle = computed(() => ({
  left: '0.87%',
  right: '0.87%',
  top: '11.25%',
  bottom: '25.88%',
  border: `${px(5)} solid #FFF2C3`,
  borderRadius: px(30)
}))

const openedInnerStyle = computed(() => ({
  left: '5.12%',
  right: '5.12%',
  top: 0,
  bottom: '22.12%',
  borderRadius: px(42)
}))

const openedBottomStyle = computed(() => ({
  top: px(351),
  height: px(449)
}))

const congratsStyle = computed(() => ({
  width: px(292),
  height: px(73),
  top: px(30),
  fontSize: px(60),
  lineHeight: px(73)
}))

const rewardSubtitleStyle = computed(() => ({
  width: px(355),
  height: px(51),
  top: px(112),
  fontSize: px(42),
  lineHeight: px(51)
}))

const rewardContentStyle = computed(() => ({
  width: px(515),
  height: px(171),
  top: px(193),
  gap: px(15)
}))

const amountRowStyle = computed(() => ({
  width: px(510),
  height: px(120),
  gap: px(2)
}))

const currencyStyle = computed(() => ({
  width: px(82),
  height: px(82),
  fontSize: px(70),
  lineHeight: px(82)
}))

const amountStyle = computed(() => ({
  maxWidth: px(420),
  height: px(120),
  fontSize: px(99),
  lineHeight: px(120)
}))

const creditStyle = computed(() => ({
  width: px(510),
  height: px(36),
  fontSize: px(30),
  lineHeight: px(36)
}))

const buttonStyle = computed(() => ({
  width: px(233),
  height: px(233),
  left: px(376),
  top: px(390),
  filter: `drop-shadow(0 ${px(12)} ${px(12)} rgba(212, 1, 1, 0.25))`
}))

const buttonTextStyle = computed(() => {
  const isOpened = opened.value
  return {
    width: px(isOpened ? 89 : 167),
    height: px(isOpened ? 163 : 73),
    top: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: px(isOpened ? 135 : 60),
    lineHeight: px(isOpened ? 163 : 73),
    textShadow: `0 ${px(3)} ${px(1)} #FCF5EA`
  }
})

const resolveRewardAmount = (result: UseTicketResult | null | undefined) => {
  return result?.amount ?? result?.rewardAmount ?? null
}

const handleOpen = async () => {
  if (opened.value || isPending.value) return

  await runUseTicket({
    voucherName: t('ticketPage.redPacket.title'),
    fallbackErrorMessage: t('luckySpinPage.loadFailed'),
    onSuccess: result => {
      openedRewardAmount.value = resolveRewardAmount(result)
      opened.value = true
      emit('open')
    }
  })
}

/** 切换到另一张红包票券时恢复未打开状态。 */
watch(
  () => [activeTicket.value?.rowId, activeTicket.value?.ticketId],
  () => {
    opened.value = false
    openedRewardAmount.value = null
  }
)
</script>

<style scoped>
.red-packet-shadow {
  position: absolute;
  left: 50%;
  display: block;
  border-radius: 9999px;
  background: #7a0006;
  transform: translateX(-50%);
}

.red-packet-ripple {
  animation: red-packet-ripple 1.4s ease-out infinite;
}

@keyframes red-packet-ripple {
  0% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(0.82);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.18);
  }
}

@media (prefers-reduced-motion: reduce) {
  .red-packet-ripple {
    animation: none;
  }
}
</style>
