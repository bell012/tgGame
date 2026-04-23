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
            :class="
              selectedSubColumn?.rowId === channel.rowId
                ? 'border-theme-primary bg-theme-3 font-bold text-text-1'
                : 'border-opacity-10 text-text-1 lg:hover:bg-theme-3'
            "
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
import Api from '@/api'
import type {
  PayRechargeQuickAmtsResult,
  QueryDiscountListItem,
  QueryPayColumnItem,
  QueryPayOrderByOrderIdResult,
  QueryPaySubColumnItem,
  QueryPaySubColumnPageForm,
  SubmitPayOrderPageForm
} from '@/api/interface/wallet'
import { isOrderTerminalStatus } from '@/constants/orderStatus'
import { resolvePayChannelTabKey } from '@/constants/payChannelTabs'
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
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { getCurrentCurrency, getLanguageCode } from '@/utils/locale'
import { showToast } from 'vant'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import depositCryptoOrderPop from '../order/crypto/depositCryptoOrderPop.vue'
import { usePresetGrid } from '../shared/usePresetGrid'

const { t, locale } = useI18n()

const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const CRYPTO_COLUMN_NAME = 'USDT泰达币'
const CRYPTO_PAY_CHANNEL_CODE = '45'
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

const payMethods = ref<QueryPayColumnItem[]>([])
const selectedMethod = ref<QueryPayColumnItem | null>(null)
const paySubColumns = ref<QueryPaySubColumnItem[]>([])
const selectedSubColumn = ref<QueryPaySubColumnItem | null>(null)
const discountList = ref<QueryDiscountListItem[]>([])
const selectedDiscountItem = ref<QueryDiscountListItem | null>(null)
const amount = ref<number>()
const coinCode = ref('USDT')
const coinMoreShow = ref(false)
const orderPopShow = ref(false)
const orderInfo = ref<Partial<QueryPayOrderByOrderIdResult>>({})
const currentOrderId = ref('')
const currentCreateTime = ref<number | null>(null)
const pollTimer = ref<number | null>(null)
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const quickAmountConfig = ref<PayRechargeQuickAmtsResult | null>(null)

const channelOptions = computed(() =>
  paySubColumns.value.map(item => ({
    rowId: item.rowId,
    label: parseChannelName(item.subColumnName)
  }))
)
const presetAmounts = ref<number[]>([])
const wageringOptions = computed(() =>
  discountList.value.map(item => ({
    rowId: item.rowId,
    multiple: item.multiple,
    label: formatWageringLabel(item.multiple)
  }))
)
const isDirectRecharge = computed(() => selectedMethod.value?.directRecharge === 1)
const showChannelSection = computed(() => {
  const method = selectedMethod.value
  return method ? method.directRecharge !== 1 : false
})
const isManualAmountAllowed = computed(
  () =>
    (quickAmountConfig.value?.manualAmountIn ?? selectedSubColumn.value?.manualAmountIn ?? 1) !== 0
)
const selectedDiscountPayChannelCode = computed(() =>
  resolvePayChannelTabKey(selectedMethod.value?.columnName)
)
const presetDiscountRatioMap = computed<Record<number, string>>(() => {
  const ratioMap: Record<number, string> = {}
  const currentDiscountItem = selectedDiscountItem.value

  currentDiscountItem?.discounts?.forEach(discount => {
    const discountAmount = Number(discount.amount)
    if (!Number.isFinite(discountAmount)) return
    if (ratioMap[discountAmount] !== undefined) return

    ratioMap[discountAmount] = String(discount.ratio)
  })

  return ratioMap
})
const amountPlaceholder = computed(() =>
  isManualAmountAllowed.value
    ? t('deposit.deposit_amount_input_placeholder')
    : t('deposit.deposit_amount_preset_placeholder')
)
const isDepositDisabled = computed(() => !amount.value || Number(amount.value) <= 0)

// 解析渠道名称中的中文文案
const parseChannelName = (subColumnName: string) => {
  try {
    const parsedName = JSON.parse(subColumnName)
    const localeKey = String(locale.value || 'eng')

    return (
      parsedName?.[localeKey] ||
      parsedName?.eng ||
      parsedName?.en ||
      parsedName?.zh ||
      subColumnName
    )
  } catch {
    return subColumnName
  }
}

// 规范化预设金额列表中的金额数据
const normalizePresetAmounts = (values: Array<number | string>) =>
  values.map(value => Number(value)).filter(value => Number.isFinite(value) && value > 0)

// 按支付方式类型同步预设金额来源
const syncPresetAmounts = () => {
  if (isDirectRecharge.value) {
    presetAmounts.value = normalizePresetAmounts(quickAmountConfig.value?.amounts ?? [])
    return
  }

  presetAmounts.value = normalizePresetAmounts(selectedSubColumn.value?.defaultRechargeAmount ?? [])
}

// 格式化流水倍数展示文案
const formatWageringLabel = (multiple: number) =>
  multiple === 0 ? t('deposit.wagering_no') : t('deposit.wagering_multiple', { multiple })

// 显示当前功能不可用的提示信息
const showUnavailableToast = () => {
  showToast({
    message: t('deposit.unavailable'),
    type: 'fail'
  })
}

// 选择当前展示的币种按钮
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

// 清空当前输入的充值金额
const clearAmount = () => {
  amount.value = undefined
}

// 选择当前渠道并刷新预设金额状态
const selectChannel = (rowId: number) => {
  const target = paySubColumns.value.find(item => item.rowId === rowId)
  if (!target) return

  selectedSubColumn.value = target
  syncPresetAmounts()
  clearAmount()
}

// 选择当前流水倍数选项
const selectWagering = (rowId: number) => {
  selectedDiscountItem.value = discountList.value.find(item => item.rowId === rowId) ?? null
}

// 选择预设充值金额
const selectPresetAmount = (preset: number) => {
  amount.value = preset
}

// 停止订单轮询
const stopOrderPolling = () => {
  if (pollTimer.value !== null) {
    window.clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

// 开始订单轮询
const startOrderPolling = () => {
  if (!currentOrderId.value || pollTimer.value !== null) return

  void queryOrderDetail()
  pollTimer.value = window.setInterval(() => {
    void queryOrderDetail()
  }, 3000)
}

// 处理页面可见性变化，控制轮询启停
const handleVisibilityChange = () => {
  if (!currentOrderId.value) return

  if (document.visibilityState === 'visible') {
    startOrderPolling()
  } else {
    stopOrderPolling()
  }
}

// 加载数字币支付方式列表
const loadPayColumnPage = async () => {
  try {
    const response = await Api.wallet.queryPayColumnPage({
      page: {
        current: 1,
        size: 9999
      },
      languageCode: getLanguageCode(),
      currency: getCurrentCurrency()
    })

    ensureApiBusinessSuccess(response)
    const result = Array.isArray(response.result) ? response.result : []
    payMethods.value = result.filter(item => item.columnName === CRYPTO_COLUMN_NAME)

    const defaultMethod = payMethods.value[0] ?? null
    if (!defaultMethod) {
      selectedMethod.value = null
      paySubColumns.value = []
      selectedSubColumn.value = null
      discountList.value = []
      selectedDiscountItem.value = null
      quickAmountConfig.value = null
      presetAmounts.value = []
      return
    }

    selectedMethod.value = defaultMethod
    await loadPaySubColumnPage(defaultMethod.columnCode)
    if (defaultMethod.directRecharge === 1) {
      await loadPayRechargeQuickAmts(defaultMethod.columnCode)
    } else {
      quickAmountConfig.value = null
      syncPresetAmounts()
    }
  } catch (error) {
    console.error('queryPayColumnPage failed', error)
    payMethods.value = []
    selectedMethod.value = null
    paySubColumns.value = []
    selectedSubColumn.value = null
    discountList.value = []
    selectedDiscountItem.value = null
    quickAmountConfig.value = null
    presetAmounts.value = []
  }
}

// 根据栏目编码加载子栏目列表
const loadPaySubColumnPage = async (columnCode: number) => {
  try {
    const param: QueryPaySubColumnPageForm = {
      page: {
        current: 1,
        size: 9999
      },
      param: {
        columnCode
      }
    }
    const response = await Api.wallet.queryPaySubColumnPage(param)
    ensureApiBusinessSuccess(response)
    const result: QueryPaySubColumnItem[] = Array.isArray(response.result) ? response.result : []

    paySubColumns.value = result
    selectedSubColumn.value = result[0] ?? null
    syncPresetAmounts()
  } catch (error) {
    console.error('queryPaySubColumnPage failed', error)
    paySubColumns.value = []
    selectedSubColumn.value = null
    presetAmounts.value = []
  }
}

// 根据支付方式获取快捷金额
const loadPayRechargeQuickAmts = async (columnCode: number) => {
  quickAmountConfig.value = null
  syncPresetAmounts()

  try {
    const response = await Api.wallet.payRechargeQuickAmts({ columnCode })
    ensureApiBusinessSuccess(response)
    const result = response.result

    quickAmountConfig.value = result ?? null
    syncPresetAmounts()
  } catch (error) {
    console.error('payRechargeQuickAmts failed', error)
    quickAmountConfig.value = null
    syncPresetAmounts()
  }
}

// 加载流水倍数列表
const loadDiscountList = async (payChannelCode: string) => {
  try {
    const response = await Api.wallet.queryDiscountList({
      payChannelCode
    })
    ensureApiBusinessSuccess(response)
    discountList.value = Array.isArray(response.result) ? response.result : []
    selectedDiscountItem.value = discountList.value[0] ?? null
  } catch (error) {
    console.error('queryDiscountList failed', error)
    discountList.value = []
    selectedDiscountItem.value = null
  }
}

const toPayImageUrl = (value: string) => {
  if (!value) return ''
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

// 根据订单详情刷新弹窗中的订单信息
const applyOrderDetail = (detail?: QueryPayOrderByOrderIdResult) => {
  if (detail) {
    orderInfo.value = {
      ...detail,
      method_icon: toPayImageUrl(selectedMethod.value?.defaultOrderIcon ?? '')
    }
    return
  }

  orderInfo.value = {
    orderId: currentOrderId.value,
    createTime: currentCreateTime.value ?? Date.now(),
    accountAmount: Number(amount.value ?? 0),
    accountCurrency: selectedSubColumn.value?.currency ?? coinCode.value,
    accountName: selectedSubColumn.value?.offlineAccount?.accountName ?? '',
    accountNo: selectedSubColumn.value?.offlineAccount?.accountNo ?? '',
    busiAmount: Number(amount.value ?? 0),
    currency: getCurrentCurrency(),
    method_icon: toPayImageUrl(selectedMethod.value?.defaultOrderIcon ?? ''),
    status: 0
  }
}

// 根据订单号查询订单详情
const queryOrderDetail = async () => {
  if (!currentOrderId.value) return

  try {
    const response = await Api.wallet.queryPayOrderByOrderId({ orderId: currentOrderId.value })
    ensureApiBusinessSuccess(response)
    const detail = response.result
    if (!detail) return

    applyOrderDetail(detail)
    if (isOrderTerminalStatus('deposit', detail.status)) {
      stopOrderPolling()
    }
  } catch (error) {
    console.error('queryPayOrderByOrderId failed', error)
  }
}

// 触发钱包快捷入口操作
const loadWallet = () => {
  showUnavailableToast()
}

// 提交充值订单并打开订单弹窗
const doDeposit = async () => {
  if (isDepositDisabled.value) return
  if (!selectedMethod.value) return
  if (!selectedSubColumn.value) return

  const param: SubmitPayOrderPageForm = {
    columnCode: String(selectedMethod.value.columnCode),
    busiAmount: String(amount.value ?? 0),
    payChannelCode: selectedDiscountPayChannelCode.value || CRYPTO_PAY_CHANNEL_CODE,
    channelId: 3,
    // 取
    subColumnCode: selectedSubColumn.value?.rowId ?? selectedSubColumn?.value.rowId,
    // flows: selectedDiscountItem.value?.multiple ?? 0
    // flows就是加密货币固定类型 0 数字币 后台 计算
    flows: 0
  }
  // 数字币  奖励是后台 计算
  // const discount = resolveSelectedDiscountRatio()
  // if (discount !== undefined) {
  //   param.discount = discount
  // }

  try {
    const response = await Api.wallet.submitPayOrder(param)
    ensureApiBusinessSuccess(response)
    const submitResult = response.result
    currentOrderId.value = submitResult?.orderId !== undefined ? String(submitResult.orderId) : ''
    currentCreateTime.value = submitResult?.createTime ?? null
    applyOrderDetail()
    orderPopShow.value = true

    const payUrl = submitResult?.payUrl
    const openedWindow = payUrl ? window.open(payUrl, '_blank') : null

    if (currentOrderId.value) {
      if (openedWindow) {
        stopOrderPolling()
      } else {
        startOrderPolling()
      }
    }
  } catch (error) {
    console.error('submitPayOrder failed', error)
  }
}

// 处理订单弹窗关闭事件
const handleClose = () => {
  stopOrderPolling()
  currentOrderId.value = ''
  emit('hidden', false)
}

// 处理订单弹窗隐藏事件
const handleHidden = () => {}

// 页面初始化时加载数字币栏目和监听事件
onMounted(() => {
  void loadPayColumnPage()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 监听渠道变化并刷新优惠配置
watch(
  () => [selectedSubColumn.value?.rowId, selectedDiscountPayChannelCode.value],
  () => {
    if (!selectedDiscountPayChannelCode.value) {
      discountList.value = []
      selectedDiscountItem.value = null
      return
    }

    void loadDiscountList(selectedDiscountPayChannelCode.value)
  }
)

// 页面卸载前清理事件与轮询
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  stopOrderPolling()
})
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
