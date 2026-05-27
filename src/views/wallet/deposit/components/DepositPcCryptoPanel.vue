<template>
  <!-- 数字币充值面板外层容器 -->
  <div class="w-full rounded-xl bg-bg-2 p-6 font-['Inter']">
    <!-- 数字币充值面板主体内容 -->
    <div class="flex flex-col gap-6">
      <!-- 币种展示区域 -->
      <div class="flex items-center justify-between gap-2">
        <!-- 币种按钮列表 -->
        <div class="mr-auto flex max-w-[744px] min-w-0 flex-1 items-center justify-start gap-4">
          <!-- 单个币种按钮 -->
          <button
            v-for="coin in visibleCoins"
            :key="coin.code"
            type="button"
            class="flex h-9 items-center rounded-full border bg-bg-3 px-6 text-sm leading-[17px] transition-colors"
            :class="
              coin.code === coinCode
                ? 'border-[3px] border-theme-primary bg-theme-3 text-common-100'
                : 'border-transparent text-text-2 lg:hover:bg-theme-3'
            "
            @click.stop="selectCoinCode(coin.code)"
          >
            <img class="mr-2 h-5 w-5 shrink-0" :src="coin.icon" :alt="coin.name" />
            <span class="font-bold text-text-1">{{ coin.name }}</span>
          </button>
        </div>

        <!-- 更多币种入口按钮 -->
        <button
          type="button"
          class="flex h-9 shrink-0 items-center rounded-full border bg-bg-3 px-4 text-sm leading-[17px] transition-colors"
          :class="
            coinMoreShow
              ? 'border-theme-primary text-theme-primary'
              : 'border-transparent text-text-2 lg:hover:bg-theme-3'
          "
          @click.stop="openCoinMorePanel"
        >
          <!-- 更多币种图标组合 -->
          <div class="mr-2 flex h-5 w-[37px] items-center">
            <img class="relative z-30 h-5 w-5 shrink-0" :src="DOGEIcon" alt="DOGE" />
            <img class="relative z-20 -ml-3 h-5 w-5 shrink-0" :src="TRXIcon" alt="TRX" />
            <img class="relative z-10 -ml-3 h-5 w-5 shrink-0" :src="BNBIcon" alt="BNB" />
          </div>
          <span class="font-bold">{{ t('deposit.deposit_more') }}</span>
          <ChevronRightSmallIcon class="ml-1 h-2 w-2 shrink-0 text-icon-2" />
        </button>
      </div>

      <!-- 充值渠道区域 -->
      <div v-if="showChannelSection" class="flex flex-col gap-2">
        <!-- 充值渠道标题 -->
        <p class="text-sm font-bold leading-[17px] text-text-1">
          {{ t('deposit.deposit_channel') }}
        </p>

        <!-- 充值渠道按钮列表 -->
        <div class="grid grid-cols-6 gap-4">
          <!-- 单个充值渠道按钮 -->
          <button
            v-for="channel in channelOptions"
            :key="channel.rowId"
            type="button"
            class="flex h-9 items-center justify-center rounded-lg border px-3 text-center text-sm leading-5 transition-colors"
            :class="[
              'text-text-1 lg:hover:bg-theme-3',
              selectedSubColumn?.rowId === channel.rowId
                ? 'border border-theme-primary bg-theme-3'
                : ''
            ]"
            :style="{
              border: `1px solid ${selectedSubColumn?.rowId === channel.rowId ? 'var(--color-theme-level-1)' : 'var(--color-opacity-10)'}`
            }"
            @click="selectChannel(channel.rowId)"
          >
            {{ channel.label }}
          </button>
        </div>
      </div>

      <!-- 充值金额与流水信息区域 -->
      <div class="flex flex-col gap-4">
        <!-- 充值金额输入区域 -->
        <div class="flex flex-col gap-2">
          <!-- 充值金额标题与教程入口 -->
          <div class="flex items-center justify-between gap-4">
            <!-- 充值金额标题 -->
            <p class="text-sm font-bold leading-[17px] text-text-1">
              {{ t('deposit.deposit_amount') }}
            </p>

            <!-- 充值教程按钮 -->
            <button
              type="button"
              class="flex items-center gap-1 text-sm leading-5 text-text-2 transition-colors lg:hover:text-text-1"
              @click="showUnavailableToast"
            >
              <AmountInfoIcon class="h-4 w-4 shrink-0" />
              <span>{{ t('deposit.how_to_deposit') }}</span>
            </button>
          </div>

          <!-- 充值金额输入框容器 -->
          <div
            class="flex h-12 items-center rounded-lg border border-opacity-10 bg-input-3 px-3 transition-colors focus-within:border-theme-primary"
          >
            <DepositTokenIcon class="mr-2 h-6 w-6 shrink-0 text-theme-primary" />

            <!-- 充值金额输入框 -->
            <input
              v-model.number="amount"
              type="number"
              :readonly="!isManualAmountAllowed"
              :inputmode="isManualAmountAllowed ? 'decimal' : 'none'"
              :placeholder="amountPlaceholder"
              class="min-w-0 flex-1 bg-transparent text-sm leading-5 text-text-1 outline-none placeholder:text-sm placeholder:text-text-3"
              :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
            />

            <!-- 清空金额按钮 -->
            <button
              v-show="!isDepositDisabled"
              type="button"
              class="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-opacity-10"
              @click="clearAmount"
            >
              <CloseIcon class="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        <!-- 流水选项与提示区域 -->
        <div class="flex flex-col gap-2">
          <!-- 流水选项切换容器 -->
          <div class="border-b border-opacity-10 pb-2">
            <!-- 流水选项列表 -->
            <div class="flex items-center gap-6">
              <!-- 区块：template -->
              <template v-for="(item, index) in wageringOptions" :key="item.rowId">
                <!-- 单个流水选项按钮 -->
                <button
                  type="button"
                  class="relative pb-1 text-sm leading-5 transition-colors"
                  :class="
                    selectedDiscountItem?.rowId === item.rowId
                      ? 'font-bold text-text-1'
                      : 'text-text-2 lg:hover:text-text-1'
                  "
                  @click="selectWagering(item.rowId)"
                >
                  {{ item.label }}
                  <span
                    v-if="selectedDiscountItem?.rowId === item.rowId"
                    class="absolute inset-x-0 -bottom-[9px] h-px bg-theme-primary"
                  ></span>
                </button>

                <!-- 流水选项分隔线 -->
                <div
                  v-if="index !== wageringOptions.length - 1"
                  class="h-[14px] w-px bg-opacity-10"
                ></div>
              </template>
            </div>
          </div>

          <!-- 提款流水提示文案 -->
          <p class="text-xs leading-[15px] text-secondary-7">
            {{ t('deposit.withdrawal_no_wagering_tip') }}
          </p>
        </div>

        <!-- 预设金额区域 -->
        <div class="rounded-2xl bg-bg-4 p-2">
          <!-- 预设金额按钮网格 -->
          <div
            ref="presetsRef"
            class="grid grid-cols-6 gap-2 transition-all duration-300"
            :class="expanded ? 'max-h-[136px] overflow-y-auto' : 'max-h-[88px] overflow-hidden'"
          >
            <!-- 单个预设金额按钮 -->
            <button
              v-for="preset in presetAmounts"
              :key="preset"
              type="button"
              class="relative flex h-10 items-center justify-center rounded-lg text-base font-bold leading-[19px] transition-colors lg:hover:bg-theme-primary"
              :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
              @click="selectPresetAmount(preset)"
            >
              <!-- 预设金额文本 -->
              <span>{{ preset }}</span>
              <!-- 预设金额优惠角标 -->
              <span
                v-if="presetDiscountRatioMap[preset] !== undefined"
                class="pointer-events-none absolute -right-1 -top-1 min-w-8 rounded-lg bg-center bg-contain bg-no-repeat px-2 py-0.5 text-center text-xs font-bold leading-4"
                :style="{ backgroundImage: `url(${addBonusBadgeBg})` }"
              >
                {{ t('deposit.bonus_label', { ratio: presetDiscountRatioMap[preset] }) }}
              </span>
            </button>
          </div>

          <!-- 展开与收起控制区域 -->
          <div class="mt-2 flex justify-center">
            <!-- 展开与收起按钮 -->
            <button
              type="button"
              class="flex items-center gap-2 text-[13px] leading-4 text-text-3 transition-colors lg:hover:text-text-1"
              @click="expanded = !expanded"
            >
              <span>{{ expanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}</span>
              <ExpandUpDoubleIcon v-if="expanded" class="h-2 w-[9px]" />
              <ExpandDownDoubleIcon v-else class="h-2 w-[9px]" />
            </button>
          </div>
        </div>
      </div>

      <!-- 立即充值按钮 -->
      <button
        class="flex h-12 w-full items-center justify-center rounded-lg text-sm font-extrabold text-text-4"
        :class="[!isDepositDisabled ? 'btn-primary' : 'cursor-not-allowed bg-theme-2 opacity-40']"
        :disabled="isDepositDisabled"
        @click="doDeposit"
      >
        {{ t('deposit.deposit_now') }}
      </button>

      <!-- 钱包快捷入口按钮 -->
      <button
        type="button"
        class="flex items-center justify-center gap-2 text-sm leading-5 text-text-1"
        @click="loadWallet"
      >
        <span>{{ t('deposit.load_from_wallet') }}</span>
        <span class="flex items-center gap-1">
          <img class="h-6" :src="groupIcon" :alt="t('deposit.wallet_bonus_alt')" />
          <span class="text-[13px] leading-4">+300</span>
        </span>
      </button>
    </div>
  </div>

  <!-- 充值订单弹窗组件 -->
  <depositCryptoOrderPop
    v-model:model-value="orderPopShow"
    v-model:orderInfo="orderInfo"
    @close="handleClose"
    @hidden="handleHidden"
  />
</template>

<script setup lang="ts">
import BNBIcon from '@/static/img/crypto/BNB.png'
import BTCIcon from '@/static/img/crypto/BTC.png'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import ETHIcon from '@/static/img/crypto/ETH.png'
import groupIcon from '@/static/img/crypto/groupIcons.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import addBonusBadgeBg from '@/static/img/deposit/add-bonus-badge.png'
import CloseIcon from '@/static/svg/close.svg?component'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/deposit-token.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepositCryptoFlow } from '../shared'
import depositCryptoOrderPop from './order/crypto/depositCryptoOrderPop.vue'
import { usePresetGrid } from './shared/usePresetGrid'

const { t } = useI18n()

const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const visibleCoins = [
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
] as const

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
  showUnavailableToast,
  selectCoinCode,
  openCoinMorePanel,
  clearAmount,
  selectChannel,
  selectWagering,
  selectPresetAmount,
  loadWallet,
  doDeposit,
  handleClose,
  handleHidden
} = useDepositCryptoFlow({
  isMobile: false,
  emitHidden: value => emit('hidden', value),
  emitHiddenOnOrderOpen: false,
  emitHiddenOnOrderHidden: false
})

const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
</script>

<style scoped lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  appearance: textfield;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
}
</style>
