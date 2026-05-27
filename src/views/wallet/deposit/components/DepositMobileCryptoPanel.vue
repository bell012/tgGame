<template>
  <!-- 最外层充值面板容器 -->
  <div class="w-full min-h-full font-['Inter']">
    <!-- 充值主卡片区域 -->
    <div class="w-full shrink-0 bg-bg-2 p-3 rounded-lg relative">
      <!-- 币种选择与更多入口区域 -->
      <div class="w-full flex">
        <!-- 币种快捷切换列表 -->
        <div class="flex gap-1 flex-1">
          <!-- 单个币种切换按钮 -->
          <button
            v-for="coin in visibleCoins"
            :key="coin.code"
            type="button"
            class="appearance-none p-1.5 sm:p-2 rounded-full bg-bg-3 lg:hover:bg-theme-3 text-xs flex items-center border"
            :style="{
              border: `1px solid ${coin.code === coinCode ? 'var(--color-theme-level-1)' : 'transparent'}`
            }"
            @click.stop="selectCoinCode(coin.code)"
          >
            <img class="w-5 aspect-square mr-1" :src="coin.icon" />
            {{ coin.name }}
          </button>
        </div>

        <!-- 更多币种入口按钮 -->
        <button
          type="button"
          class="appearance-none p-1.5 sm:p-2 rounded-full bg-bg-3 lg:hover:bg-theme-3 text-xs flex items-center border"
          :style="{
            border: `1px solid ${coinMoreShow ? 'var(--color-theme-level-1)' : 'transparent'}`
          }"
          @click.stop="openCoinMorePanel"
        >
          <!-- 更多币种图标组合容器 -->
          <div class="w-8 h-5 relative mr-3">
            <img class="w-5 aspect-square mr-1 absolute left-0 z-30" :src="DOGEIcon" />
            <img class="w-5 aspect-square mr-1 absolute left-2 z-20" :src="TRXIcon" />
            <img class="w-5 aspect-square mr-1 absolute left-4 z-10" :src="BNBIcon" />
          </div>
          <!-- 更多币种标题 -->
          <h2 class="mr-1">{{ t('deposit.deposit_more') }}</h2>
          <ChevronRightSmallIcon class="w-1 h-2" />
        </button>
      </div>

      <!-- 充值渠道区域 -->
      <div v-if="showChannelSection" class="mt-5">
        <!-- 充值渠道标题 -->
        <p class="text-xs sm:text-sm text-text-1">{{ t('deposit.deposit_channel') }}</p>

        <!-- 充值渠道滚动外层容器 -->
        <div class="mt-4 overflow-hidden">
          <!-- 充值渠道横向滚动列表 -->
          <div
            ref="channelListRef"
            class="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
            @wheel.prevent="event => handleHorizontalWheel(event, channelListRef)"
          >
            <!-- 单个充值渠道按钮 -->
            <button
              v-for="channel in channelOptions"
              :key="channel.rowId"
              :ref="el => setChannelItemRef(el, channel.rowId)"
              @click="selectChannel(channel.rowId)"
              type="button"
              :class="[
                'shrink-0 h-12 px-8 flex justify-center items-center rounded-lg lg:hover:bg-theme-3 border text-text-1',
                selectedSubColumn?.rowId === channel.rowId
                  ? ' border border-theme-primary bg-theme-3'
                  : ''
              ]"
              :style="{
                border: `1px solid ${selectedSubColumn?.rowId === channel.rowId ? 'var(--color-theme-level-1)' : 'var(--color-opacity-10)'}`
              }"
            >
              {{ channel.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 充值金额区域 -->
      <div class="mt-5">
        <!-- 充值金额标题与说明区域 -->
        <div class="flex items-center justify-between">
          <!-- 充值金额标题 -->
          <p class="text-xs sm:text-sm text-text-1">{{ t('deposit.deposit_amount') }}</p>

          <!-- 充值金额说明区域 -->
          <div class="flex items-center">
            <AmountInfoIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            <!-- 充值金额说明文字 -->
            <p class="text-xs sm:text-sm text-text-2">{{ t('deposit.deposit_amount') }}</p>
          </div>
        </div>

        <!-- 充值金额输入框容器 -->
        <div
          class="flex items-center w-full mt-3 p-3 rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <DepositTokenIcon class="w-6 h-6 mr-3" />
          <!-- 充值金额输入框 -->
          <input
            type="number"
            v-model.number="amount"
            :readonly="!isManualAmountAllowed"
            :inputmode="isManualAmountAllowed ? 'decimal' : 'none'"
            :placeholder="amountPlaceholder"
            class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
            :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
          />
        </div>
      </div>

      <!-- 流水选项横向滚动区域 -->
      <div
        ref="wageringListRef"
        class="mt-4 text-sm border-b border-opacity-10 pb-2.5 relative overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
        @wheel.prevent="event => handleHorizontalWheel(event, wageringListRef)"
      >
        <!-- 流水选项列表容器 -->
        <div class="flex items-center w-max relative">
          <!-- 流水选项循环模板 -->
          <template v-for="(item, index) in wageringOptions" :key="item.rowId">
            <!-- 单个流水选项按钮 -->
            <button
              :ref="el => setWageringItemRef(el, item.rowId)"
              @click="selectWagering(item.rowId)"
              class="relative text-xs sm:text-sm transition-colors whitespace-nowrap"
              :class="
                selectedDiscountItem?.rowId === item.rowId
                  ? 'text-text-1'
                  : 'text-text-2 lg:hover:text-text-1'
              "
            >
              {{ item.label }}
              <!-- 当前流水选项底部高亮线 -->
              <span
                v-if="selectedDiscountItem?.rowId === item.rowId"
                class="absolute left-0 -bottom-2.5 h-[2px] w-full bg-theme-primary"
              ></span>
            </button>

            <!-- 流水选项分隔线 -->
            <div
              v-if="index !== wageringOptions.length - 1"
              class="h-4 w-px bg-opacity-10 mx-5"
            ></div>
          </template>
        </div>
      </div>

      <!-- 快捷金额区域 -->
      <div class="w-full relative">
        <!-- 提款流水提示文案 -->
        <p class="py-3 text-xs text-secondary-7">
          {{ t('deposit.withdrawal_no_wagering_tip') }}
        </p>
        <!-- 快捷金额列表 -->
        <div
          ref="presetsRef"
          class="grid grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-5 bg-bg-4 transition-all duration-300 rounded-tl-lg rounded-tr-lg"
          :class="
            expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[106px] sm:max-h-[148px] overflow-hidden'
          "
        >
          <!-- 单个快捷金额按钮 -->
          <button
            v-for="preset in presetAmounts"
            :key="preset"
            @click="selectPresetAmount(preset)"
            class="relative text-base sm:text-lg py-[7px] sm:py-3 rounded-lg lg:hover:bg-theme-primary"
            :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
          >
            {{ preset }}
            <!-- 快捷金额优惠角标 -->
            <div
              v-if="presetDiscountRatioMap[preset] !== undefined"
              class="absolute -top-2 -right-1 text-[10px] text-text-1 px-2 pb-0.5 bg-contain bg-no-repeat bg-center"
              :style="{ backgroundImage: `url(${bonusBgIcon})` }"
            >
              {{ t('deposit.bonus_label', { ratio: presetDiscountRatioMap[preset] }) }}
            </div>
          </button>
        </div>
        <!-- 快捷金额展开收起区域 -->
        <div class="w-full bg-bg-4 rounded-bl-lg rounded-br-lg p-1.5 sm:p-3 relative -mt-3 z-10">
          <!-- 展开收起按钮 -->
          <button
            class="mx-auto flex items-center gap-1 text-xs text-text-3 lg:hover:text-text-1 transition"
            @click="expanded = !expanded"
          >
            {{ expanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}
            <ExpandUpDoubleIcon v-if="expanded" class="w-[9px] h-2" />
            <ExpandDownDoubleIcon v-else class="w-[9px] h-2" />
          </button>
        </div>
      </div>

      <!-- 立即充值按钮区域 -->
      <div class="w-full mt-4">
        <!-- 立即充值按钮 -->
        <button
          class="w-full h-10 sm:h-12 flex items-center justify-center lg:hover:btn-primary rounded-lg font-semibold text-text-4"
          :class="[!isDepositDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
          :disabled="isDepositDisabled"
          @click="doDeposit"
        >
          {{ t('deposit.deposit_now') }}
        </button>
      </div>
    </div>

    <!-- 钱包快捷入口区域 -->
    <div
      class="mt-3 w-full shrink-0 bg-bg-2 p-4 rounded-lg flex items-center justify-between"
      @click="loadWallet"
    >
      <!-- 钱包入口标题 -->
      <div class="text-xs sm:text-sm text-text-1">{{ t('deposit.load_from_wallet') }}</div>
      <!-- 钱包入口右侧奖励信息 -->
      <div class="flex items-center">
        <img class="h-6 mr-1" :src="groupIcon" :alt="t('deposit.wallet_bonus_alt')" />
        <!-- 钱包奖励金额文本 -->
        <div class="text-xs sm:text-sm text-text-1">+300</div>
      </div>
    </div>
  </div>

  <!-- 数字币充值订单弹窗 -->
  <depositCryptoOrderPop
    v-model:model-value="orderPopShow"
    v-model:orderInfo="orderInfo"
    @close="handleClose"
    @hidden="handleHidden"
  />
</template>
<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import BNBIcon from '@/static/img/crypto/BNB.png'
import BTCIcon from '@/static/img/crypto/BTC.png'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import ETHIcon from '@/static/img/crypto/ETH.png'
import groupIcon from '@/static/img/crypto/groupIcons.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import bonusBgIcon from '@/static/img/payment/amount_bonus_bg.png'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/deposit-token.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import { computed, nextTick, ref, type ComponentPublicInstance, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepositCryptoFlow } from '../shared'
import depositCryptoOrderPop from './order/crypto/depositCryptoOrderPop.vue'
import { usePresetGrid } from './shared/usePresetGrid'

const { t } = useI18n()
const isMobile = useIsMobile()
const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const coins = [
  {
    name: 'USDT',
    code: 'USDT',
    icon: USDTIcon
  },
  {
    name: 'ETH',
    code: 'ETH',
    icon: ETHIcon
  },
  {
    name: 'BTC',
    code: 'BTC',
    icon: BTCIcon
  },
  {
    name: 'USDC',
    code: 'USDC',
    icon: USDCIcon
  }
]
const visibleCoins = computed(() => (isMobile.value ? coins.slice(0, 3) : coins))

const {
  selectedSubColumn,
  selectedDiscountItem,
  amount,
  coinCode,
  coinMoreShow,
  orderPopShow,
  orderInfo,
  presetAmounts,
  channelOptions,
  wageringOptions,
  showChannelSection,
  isManualAmountAllowed,
  presetDiscountRatioMap,
  amountPlaceholder,
  isDepositDisabled,
  selectCoinCode,
  openCoinMorePanel,
  selectChannel: selectDepositChannel,
  selectWagering: selectDepositWagering,
  selectPresetAmount,
  loadWallet,
  doDeposit,
  handleClose,
  handleHidden
} = useDepositCryptoFlow({
  isMobile,
  emitHidden: value => emit('hidden', value)
})

const channelListRef = ref<HTMLDivElement | null>(null)
const channelItemRefs = ref<Record<string, HTMLElement | null>>({})
const wageringListRef = ref<HTMLDivElement | null>(null)
const wageringItemRefs = ref<Record<string, HTMLElement | null>>({})
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)

// 解析并返回 HTMLElement 节点
const resolveHTMLElement = (el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLElement) return el
  if (el && '$el' in el && el.$el instanceof HTMLElement) return el.$el
  return null
}

// 记录渠道项的 DOM 引用
const setChannelItemRef = (el: Element | ComponentPublicInstance | null, rowId: number) => {
  channelItemRefs.value[String(rowId)] = resolveHTMLElement(el)
}

// 记录流水选项项的 DOM 引用
const setWageringItemRef = (el: Element | ComponentPublicInstance | null, rowId: number) => {
  wageringItemRefs.value[String(rowId)] = resolveHTMLElement(el)
}

// 将目标项滚动到可视区域
const scrollItemIntoView = async (
  containerRef: Ref<HTMLDivElement | null>,
  target: HTMLElement | null
) => {
  await nextTick()

  if (!containerRef.value || !target) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

// 处理横向滚轮事件
const handleHorizontalWheel = (event: WheelEvent, container: HTMLDivElement | null) => {
  if (!container) return

  container.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

// 选择当前渠道并刷新预设金额状态
const selectChannel = (rowId: number) => {
  selectDepositChannel(rowId)
  void scrollItemIntoView(channelListRef, channelItemRefs.value[String(rowId)])
}

// 选择当前流水倍数选项
const selectWagering = (rowId: number) => {
  selectDepositWagering(rowId)
  void scrollItemIntoView(wageringListRef, wageringItemRefs.value[String(rowId)])
}
</script>
<style scoped lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  appearance: textfield; /* 禁用默认浏览器样式 */
  -webkit-appearance: textfield; /* 针对 Safari 和 Webkit 浏览器 */
  -moz-appearance: textfield; /* 针对 Firefox */
}
</style>
