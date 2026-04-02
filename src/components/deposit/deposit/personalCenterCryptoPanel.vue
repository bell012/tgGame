<template>
  <!-- 数字币充值面板外层容器 -->
  <div class="w-full rounded-xl bg-bg-2 p-6 font-['Inter']">
    <!-- 数字币充值面板主体内容 -->
    <div class="flex flex-col gap-6">
      <!-- 币种切换与更多入口区域 -->
      <div class="flex items-center justify-between gap-2">
        <!-- 币种切换按钮列表 -->
        <div class="mx-auto flex max-w-[744px] flex-1 items-center justify-center gap-4">
          <!-- 单个币种切换按钮 -->
          <button
            v-for="coin in visibleCoins"
            :key="coin.code"
            type="button"
            class="flex h-9 items-center rounded-full border bg-bg-3 px-6 text-sm leading-[17px] transition-colors"
            :class="
              coin.code === coinCode
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-text-2 lg:hover:bg-theme-3'
            "
            @click.stop="selectCoinCode(coin.code)"
          >
            <img class="mr-2 h-5 w-5 shrink-0" :src="coin.icon" :alt="coin.name" />
            <span class="font-bold">{{ coin.name }}</span>
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
            <img class="relative z-30 h-5 w-5 shrink-0" :src="SOLIcon" alt="SOL" />
            <img class="relative z-20 -ml-3 h-5 w-5 shrink-0" :src="XRPIcon" alt="XRP" />
            <img class="relative z-10 -ml-3 h-5 w-5 shrink-0" :src="TONIcon" alt="TON" />
          </div>
          <span class="font-bold">{{ t('deposit.deposit_more') }}</span>
          <ChevronRightSmallIcon class="ml-1 h-2 w-2 shrink-0 text-icon-2" />
        </button>
      </div>

      <!-- 充值渠道区域 -->
      <div class="flex flex-col gap-2">
        <!-- 充值渠道标题 -->
        <p class="text-sm font-bold leading-[17px] text-text-1">
          {{ t('deposit.deposit_channel') }}
        </p>
        <!-- 充值渠道按钮列表 -->
        <div class="grid grid-cols-6 gap-4">
          <!-- 单个充值渠道按钮 -->
          <button
            v-for="channel in channels"
            :key="channel"
            type="button"
            class="flex h-9 items-center justify-center rounded-lg border px-3 text-center text-sm leading-5 transition-colors"
            :class="
              selectedChannel === channel
                ? 'border-theme-primary bg-theme-3 font-bold text-text-1'
                : 'border-opacity-10 text-text-1 lg:hover:bg-theme-3'
            "
            @click="selectedChannel = channel"
          >
            {{ channel }}
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
              <span>How to Deposit</span>
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
              :placeholder="t('deposit.deposit_amount_input_placeholder')"
              class="min-w-0 flex-1 bg-transparent text-sm leading-5 text-text-1 outline-none placeholder:text-sm placeholder:text-text-3"
            />

            <!-- 清空金额按钮 -->
            <button
              v-show="!isDepositDisabled"
              type="button"
              class="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-opacity-10"
              @click="amount = undefined"
            >
              <CloseIcon class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- 流水选项与提示区域 -->
        <div class="flex flex-col gap-2">
          <!-- 流水选项切换容器 -->
          <div class="border-b border-opacity-10 pb-2">
            <!-- 流水选项列表 -->
            <div class="flex items-center gap-6">
              <template v-for="(item, index) in wageringOptions" :key="item">
                <!-- 单个流水选项按钮 -->
                <button
                  type="button"
                  class="relative pb-1 text-sm leading-5 transition-colors"
                  :class="
                    wageringActiveCode === item
                      ? 'font-bold text-text-1'
                      : 'text-text-2 lg:hover:text-text-1'
                  "
                  @click="wageringActiveCode = item"
                >
                  {{ item }}
                  <span
                    v-if="wageringActiveCode === item"
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
          <p class="text-xs leading-[15px] text-secondary-7">No wagering required for withdrawal</p>
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
              class="h-10 rounded-lg text-base leading-[19px] transition-colors"
              :class="
                preset === amount
                  ? 'bg-theme-primary text-text-4'
                  : 'bg-bg-2 text-text-1 lg:hover:bg-theme-3'
              "
              @click="amount = preset"
            >
              {{ preset }}
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
              <span>{{ expanded ? 'Collapse' : 'Expand' }}</span>
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
        <span>Load from your wallet</span>
        <span class="flex items-center gap-1">
          <img class="h-6" :src="groupIcon" alt="wallet bonus" />
          <span class="text-[13px] leading-4">+300</span>
        </span>
      </button>
    </div>
  </div>

  <!-- 充值订单弹窗组件 -->
  <depositOrderPop
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
import SOLIcon from '@/static/img/crypto/SOL.png'
import TONIcon from '@/static/img/crypto/TON.png'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import XRPIcon from '@/static/img/crypto/XRP.png'
import CloseIcon from '@/static/svg/close.svg?component'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/deposit-token.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import { showToast } from 'vant'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import depositOrderPop from '../order/depositOrderPop.vue'
import { CryptOrderType, defaultCryptOrder } from '../order/orderType'
import { usePresetGrid } from '../shared/usePresetGrid'

const { t } = useI18n()

const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const unavailableMessage = 'Unavailable'
const presetAmounts = [
  100, 300, 500, 1000, 2000, 3000, 5000, 8000, 10000, 20000, 30000, 50000, 80000, 100000, 200000,
  300000, 500000, 1000000
]
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
    name: 'BNB',
    code: 'BNB',
    icon: BNBIcon
  },
  {
    name: 'DOGE',
    code: 'DOGE',
    icon: DOGEIcon
  },
  {
    name: 'USDC',
    code: 'USDC',
    icon: USDCIcon
  }
] as const
const visibleCoins = coins.slice(0, 6)
const channels = ['Channel 1', 'Channel 2', 'Channel 3', 'Channel 4', 'Channel 5', 'Channel 6']
const wageringOptions = ['No Wagering', '1x Wagering', '5x Wagering', '10x Wagering'] as const

const amount = ref<number>()
const coinCode = ref('USDT')
const coinMoreShow = ref(false)
const selectedChannel = ref('Channel 1')
const wageringActiveCode = ref<(typeof wageringOptions)[number]>('No Wagering')
const orderPopShow = ref(false)
const orderInfo = ref<CryptOrderType>(defaultCryptOrder)
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const selectedCoin = computed(() => coins.find(coin => coin.code === coinCode.value) ?? coins[0])
const isDepositDisabled = computed(() => !amount.value || Number(amount.value) <= 0)

// 显示当前功能不可用的提示信息
const showUnavailableToast = () => {
  showToast({
    message: unavailableMessage,
    type: 'fail'
  })
}

// 选择当前充值币种
const selectCoinCode = (code: string) => {
  if (code !== 'USDT') {
    showUnavailableToast()
    return
  }

  coinCode.value = code
  coinMoreShow.value = false
}

// 打开更多币种面板
const openCoinMorePanel = () => {
  showUnavailableToast()
}

// 触发钱包快捷入口操作
const loadWallet = () => {
  showUnavailableToast()
}

// 执行充值并组装订单弹窗数据
const doDeposit = () => {
  orderInfo.value = {
    order_no: 'ts0768456746746746746',
    created_at: '12/18/2026 11:14:15 AM',
    amount: amount.value ?? 0,
    method: coinCode.value,
    method_icon: selectedCoin.value.icon,
    rate: 'Rate：1USDT≈7.15PHP（You Get≈3750PHP）',
    network: 'TRC20',
    address_token: 'tu899iugh889k9ijehddndk987he73178uh1ko671usuth55278',
    type: 'Crypto',
    status: 'loading'
  }
  orderPopShow.value = true
}

// 处理订单弹窗关闭事件
const handleClose = () => {
  emit('hidden', false)
}

// 处理订单弹窗隐藏事件
const handleHidden = () => {}
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
