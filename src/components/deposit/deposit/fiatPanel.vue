<template>
  <!-- 法币充值面板容器 -->
  <div class="w-full bg-bg-2 p-4 rounded-lg font-['Inter']">
    <!-- 充值方式标题 -->
    <p class="text-xs sm:text-sm font-bold leading-normal text-text-1">Deposit Methods</p>
    <!-- 充值方式滚动区域 -->
    <div class="mt-2.5 overflow-hidden">
      <!-- 充值方式列表 -->
      <div
        ref="methodListRef"
        class="flex flex-nowrap gap-1 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
        @wheel.prevent="handleMethodListWheel"
      >
        <!-- 单个充值方式按钮 -->
        <div
          class="shrink-0 flex flex-col sm:flex-row items-center justify-center p-2 sm:p-4 rounded-xl lg:hover:bg-theme-3 lg:hover:border-theme-primary"
          :class="{
            'border border-theme-primary bg-theme-3':
              selectedMethod?.columnCode === item.columnCode,
            'border border-transparent bg-bg-4': selectedMethod?.columnCode !== item.columnCode,
            'basis-[31.25%]': isMobile
          }"
          v-for="(item, index) in payMethods"
          :key="item.columnCode"
          :ref="el => setMethodItemRef(el, index)"
          @click.stop="selectMethod(item, index)"
        >
          <img class="sm:mr-4 h-6" :src="resolveMethodIcon(item)" />
          <p class="text-sm sm:text-base font-bold leading-normal text-text-1">
            {{ item.columnName }}
          </p>
        </div>
      </div>
    </div>
    <!-- 充值渠道区域 -->
    <div v-if="showChannelSection" class="mt-4 flex flex-col gap-2">
      <!-- 充值渠道标题 -->
      <p class="text-xs sm:text-sm font-bold leading-normal text-text-1">Deposit Channel</p>
      <!-- 充值渠道按钮列表 -->
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <!-- 单个充值渠道按钮 -->
        <button
          v-for="channel in channelOptions"
          :key="channel.rowId"
          type="button"
          class="flex h-9 items-center justify-center rounded-lg border px-2 text-center text-xs leading-4 transition-colors sm:px-3 sm:text-sm sm:leading-5"
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
    <!-- 充值金额标题 -->
    <p class="mt-4 text-xs sm:text-sm font-bold leading-normal text-text-1">Deposit Amount</p>
    <!-- 充值金额输入区域 -->
    <div
      class="flex items-center w-full mt-2 p-3 rounded-lg bg-input-3 border focus-within:border-[color:var(--color-theme-level-1)] focus-within:ring-0"
      :class="
        isAmountInputHighlighted
          ? 'border-[color:var(--color-theme-level-1)]'
          : 'border-[color:var(--color-opacity-10)]'
      "
    >
      <DepositTokenIcon class="w-6 h-6 mr-3 text-theme-primary" />
      <input
        type="number"
        v-model="amount"
        :readonly="!isManualAmountAllowed"
        :inputmode="isManualAmountAllowed ? 'decimal' : 'none'"
        :placeholder="amountPlaceholder"
        class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
        :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
      />
    </div>
    <!-- 预设金额区域 -->
    <div class="mt-4 w-full relative">
      <!-- 预设金额按钮网格 -->
      <div
        ref="presetsRef"
        class="grid grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-5 bg-bg-4 transition-all duration-300 rounded-tl-lg rounded-tr-lg"
        :class="
          expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[106px] sm:max-h-[148px] overflow-hidden'
        "
      >
        <!-- 单个预设金额按钮 -->
        <button
          v-for="preset in presetAmounts"
          :key="preset"
          @click="selectPresetAmount(preset)"
          class="relative flex h-10 items-center justify-center rounded-lg text-base font-bold leading-[19px] transition-colors sm:text-lg lg:hover:bg-theme-primary"
          :class="[preset === amount ? 'bg-[#2AEE88] text-black' : 'bg-bg-2 text-text-1']"
        >
          <span>{{ preset }}</span>
          <span
            v-if="presetDiscountRatioMap[preset] !== undefined"
            class="pointer-events-none absolute -right-1 -top-1 min-w-8 rounded-lg bg-center bg-contain bg-no-repeat px-2 py-0.5 text-center text-xs font-bold leading-4 text-black"
            :style="{ backgroundImage: `url(${addBonusBadgeBg})` }"
          >
            {{ presetDiscountRatioMap[preset] + '% Bonus' }}
          </span>
        </button>
      </div>
      <!-- 展开收起区域 -->
      <div class="w-full bg-bg-4 rounded-bl-lg rounded-br-lg p-1.5 sm:p-3 relative -mt-3 z-10">
        <!-- 展开收起按钮 -->
        <button
          class="mx-auto flex items-center gap-1 text-xs text-text-3 lg:hover:text-text-1 transition"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Collapse' : 'Expand' }}
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
  <!-- 充值订单弹窗 -->
  <depositOrderPop
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
import { useIsMobile } from '@/composables/useMediaQuery'
import { resolvePayChannelTabKey } from '@/constants/payChannelTabs'
import addBonusBadgeBg from '@/static/img/deposit/add-bonus-badge.png'
import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import payPalIcon from '@/static/img/payment/payPal.png'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/fiat-order-amount.svg?component'
import { getCurrentCurrency, getLanguageCode } from '@/utils/locale'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance
} from 'vue'
import { useI18n } from 'vue-i18n'
import depositOrderPop from '../order/depositOrderPop.vue'
import { defaultFiatOrder, FiatOrderType } from '../order/orderType'
import { usePresetGrid } from '../shared/usePresetGrid'

const { t } = useI18n()
const isMobile = useIsMobile()

const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const defaultPresetAmounts: number[] = []
const presetAmounts = ref<number[]>([...defaultPresetAmounts])

const fallbackMethodIcons: Record<string, string> = {
  GCash: gCashIcon,
  MAYA: mayaIcon,
  Maya: mayaIcon,
  GrabPay: grabPayIcon,
  PayPal: payPalIcon
}

const paySubColumns = ref<QueryPaySubColumnItem[]>([])
const payMethods = ref<QueryPayColumnItem[]>([])
const selectedMethod = ref<QueryPayColumnItem | null>(null)
const selectedSubColumn = ref<QueryPaySubColumnItem | null>(null)
const discountList = ref<QueryDiscountListItem[]>([])
const selectedDiscountItem = ref<QueryDiscountListItem | null>(null)
const amount = ref<number>()
const methodListRef = ref<HTMLDivElement | null>(null)
const methodItemRefs = ref<Array<HTMLElement | null>>([])
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const orderInfo = ref<FiatOrderType>(defaultFiatOrder)
const orderPopShow = ref(false)
const quickAmountConfig = ref<PayRechargeQuickAmtsResult | null>(null)
const isDepositDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
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

  discountList.value.forEach(item => {
    if (item.multiple !== 1) return

    item.discounts?.forEach(discount => {
      const discountAmount = Number(discount.amount)
      if (!Number.isFinite(discountAmount)) return
      if (ratioMap[discountAmount] !== undefined) return

      ratioMap[discountAmount] = String(discount.ratio)
    })
  })

  return ratioMap
})
const channelOptions = computed(() =>
  paySubColumns.value.map(item => ({
    rowId: item.rowId,
    label: parseSubColumnName(item)
  }))
)
const amountPlaceholder = computed(() =>
  isManualAmountAllowed.value
    ? 'Please select or enter deposit amount.'
    : 'Please select a preset deposit amount.'
)
const isAmountInputHighlighted = ref(false)
const currentOrderId = ref('')
const pollTimer = ref<number | null>(null)

const handleClose = () => {
  stopOrderPolling()
  currentOrderId.value = ''
  emit('hidden', false)
}

const handleHidden = () => {
  emit('hidden', true)
}

const clearAmount = () => {
  amount.value = undefined
  isAmountInputHighlighted.value = false
}

// 选择预设金额并回填输入框
const selectPresetAmount = (preset: number) => {
  amount.value = preset
  isAmountInputHighlighted.value = true
}

// 解析充值渠道名称
const parseSubColumnName = (item: QueryPaySubColumnItem) => {
  try {
    const parsedName = JSON.parse(item.subColumnName)
    return parsedName?.zh || item.platformName || item.subColumnName
  } catch {
    return item.platformName || item.subColumnName
  }
}

// 拼接支付图标完整地址
const toPayImageUrl = (value: string) => {
  if (!value) return ''
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

// 解析支付方式图标，优先接口图标，失败回退本地图标
const resolveMethodIcon = (item: QueryPayColumnItem) => {
  return (
    toPayImageUrl(item.columnIco) ||
    toPayImageUrl(item.gradientLogo) ||
    fallbackMethodIcons[item.columnName] ||
    payPalIcon
  )
}

// 规范化预设金额，过滤无效值并提供默认值
const normalizePresetAmounts = (values: Array<number | string> = []) => {
  const parsed = values
    .map(value => Number(value))
    .filter(value => Number.isFinite(value) && value > 0)

  return parsed.length > 0 ? parsed : [...defaultPresetAmounts]
}

const findDiscountItemByAmount = (targetAmount?: number | string) => {
  const normalizedAmount = Number(targetAmount)
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) return null

  for (const item of discountList.value) {
    if (item.multiple !== 1) continue

    const matchedDiscount = item.discounts?.find(
      discount => Number(discount.amount) === normalizedAmount
    )

    if (matchedDiscount) {
      return item
    }
  }

  return null
}

const syncSelectedDiscountItem = () => {
  selectedDiscountItem.value = findDiscountItemByAmount(amount.value)
}

const mapOrderStatusText = (status?: number | string) => {
  const normalized = Number(status)
  if (normalized === 1) return 'Success'
  if (normalized === 2) return 'Failed'
  if (normalized === 3) return 'Processing'
  return 'Processing'
}

const isTerminalOrderStatus = (status?: number | string) => {
  const normalized = Number(status)
  return normalized === 1 || normalized === 2
}

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}

const applyOrderDetail = (detail: QueryPayOrderByOrderIdResult) => {
  orderInfo.value = {
    order_no: String(detail.orderId ?? currentOrderId.value),
    created_at: formatTimestamp(detail.createTime),
    amount: Number(detail.busiAmount ?? amount.value ?? 0),
    method: selectedMethod.value?.columnName ?? '',
    method_icon: selectedMethod.value ? resolveMethodIcon(selectedMethod.value) : '',
    currency: detail.currency || getCurrentCurrency(),
    bonus: String(detail.returnAmount ?? 0),
    type: 'Fiat',
    status: mapOrderStatusText(detail.status)
  }
  orderPopShow.value = true
}

const stopOrderPolling = () => {
  if (pollTimer.value !== null) {
    window.clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

const queryOrderDetail = async () => {
  if (!currentOrderId.value) return

  try {
    const response = await Api.wallet.queryPayOrderByOrderId({ orderId: currentOrderId.value })
    const detail = response?.success ? response.result : undefined
    if (!detail) return

    applyOrderDetail(detail)
    if (isTerminalOrderStatus(detail.status)) {
      stopOrderPolling()
    }
  } catch (error) {
    console.error('queryPayOrderByOrderId failed', error)
  }
}

const startOrderPolling = () => {
  if (!currentOrderId.value || pollTimer.value !== null) return

  void queryOrderDetail()
  pollTimer.value = window.setInterval(() => {
    void queryOrderDetail()
  }, 3000)
}

const handleVisibilityChange = () => {
  if (!currentOrderId.value) return

  if (document.visibilityState === 'visible') {
    startOrderPolling()
  } else {
    stopOrderPolling()
  }
}

const setMethodItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  const target =
    el instanceof HTMLElement
      ? el
      : el && '$el' in el && el.$el instanceof HTMLElement
        ? el.$el
        : null

  methodItemRefs.value[index] = target
}

const scrollMethodIntoView = async (index: number) => {
  await nextTick()

  const target = methodItemRefs.value[index]
  if (!target || !methodListRef.value) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

const handleMethodListWheel = (event: WheelEvent) => {
  if (!methodListRef.value) return

  methodListRef.value.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

// 根据栏目编码加载子栏目并刷新预设金额
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
    const result: QueryPaySubColumnItem[] =
      response?.success && Array.isArray(response.result) ? response.result : []
    paySubColumns.value = result
    selectedSubColumn.value = result[0] ?? null
  } catch (error) {
    console.error('queryPaySubColumnPage failed', error)
    paySubColumns.value = []
    selectedSubColumn.value = null
  }
}

// 根据支付方式获取快捷金额
const loadPayRechargeQuickAmts = async (columnCode: number) => {
  quickAmountConfig.value = null
  presetAmounts.value = [...defaultPresetAmounts]

  try {
    const response = await Api.wallet.payRechargeQuickAmts({ columnCode })
    const result = response?.success ? response.result : undefined

    quickAmountConfig.value = result ?? null
    presetAmounts.value = normalizePresetAmounts(result?.amounts ?? [])
  } catch (error) {
    console.error('payRechargeQuickAmts failed', error)
    quickAmountConfig.value = null
    presetAmounts.value = [...defaultPresetAmounts]
  }
}

// 请求充值优惠与流水配置
const loadDiscountList = async (payChannelCode: string) => {
  try {
    const response = await Api.wallet.queryDiscountList({ payChannelCode })
    const result: QueryDiscountListItem[] =
      response?.success && Array.isArray(response.result) ? response.result : []
    discountList.value = result
    syncSelectedDiscountItem()
  } catch (error) {
    console.error('queryDiscountList failed', error)
    discountList.value = []
    selectedDiscountItem.value = null
  }
}

// 加载支付栏目并默认请求第一个子栏目
const loadPayColumnPage = async () => {
  try {
    const languageCode = getLanguageCode()
    const currency = getCurrentCurrency()

    const response = await Api.wallet.queryPayColumnPage({
      page: {
        current: 1,
        size: 9999
      },
      languageCode,
      currency
    })
    const result: QueryPayColumnItem[] =
      response?.success && Array.isArray(response.result) ? response.result : []

    payMethods.value = result.filter(
      item => item.columnName !== 'USDT泰达币' && Boolean(resolvePayChannelTabKey(item.columnName))
    )
    methodItemRefs.value = new Array(payMethods.value.length).fill(null)

    const defaultMethod = payMethods.value[0]
    if (!defaultMethod) {
      selectedMethod.value = null
      paySubColumns.value = []
      selectedSubColumn.value = null
      discountList.value = []
      selectedDiscountItem.value = null
      quickAmountConfig.value = null
      presetAmounts.value = [...defaultPresetAmounts]
      return
    }

    selectedMethod.value = defaultMethod
    void scrollMethodIntoView(0)
    await loadPaySubColumnPage(defaultMethod.columnCode)
    await loadPayRechargeQuickAmts(defaultMethod.columnCode)
  } catch (error) {
    console.error('queryPayColumnPage failed', error)
    payMethods.value = []
    selectedMethod.value = null
    paySubColumns.value = []
    selectedSubColumn.value = null
    discountList.value = []
    selectedDiscountItem.value = null
    quickAmountConfig.value = null
    presetAmounts.value = [...defaultPresetAmounts]
  }
}

// 选择充值渠道并切换对应金额数据
const selectChannel = (rowId: number) => {
  const target = paySubColumns.value.find(item => item.rowId === rowId)
  if (!target) return

  selectedSubColumn.value = target
  clearAmount()
}

// 选择支付方式并切换对应子栏目数据
const selectMethod = async (method: QueryPayColumnItem, index: number) => {
  if (selectedMethod.value?.columnCode === method.columnCode) {
    void scrollMethodIntoView(index)
    return
  }

  selectedMethod.value = method
  clearAmount()
  void scrollMethodIntoView(index)
  await loadPaySubColumnPage(method.columnCode)
  await loadPayRechargeQuickAmts(method.columnCode)
}

// 提交充值并打开订单弹窗
const doDeposit = async () => {
  if (isDepositDisabled.value) return
  if (!selectedMethod.value) return
  if (!selectedSubColumn.value) return

  const param: SubmitPayOrderPageForm = {
    columnCode: String(selectedMethod.value.columnCode),
    busiAmount: String(amount.value ?? 0),
    payChannelCode: String(selectedMethod.value.columnCode),
    channelId: isMobile.value ? 4 : 3,
    subColumnCode: selectedDiscountItem.value?.rowId ?? selectedSubColumn.value.rowId,
    flows: selectedDiscountItem.value?.multiple ?? 0
  }

  try {
    const response = await Api.wallet.submitPayOrder(param)
    const submitResult = response.result
    currentOrderId.value = submitResult?.orderId !== undefined ? String(submitResult.orderId) : ''

    orderInfo.value = {
      order_no: currentOrderId.value,
      created_at: formatTimestamp(submitResult?.createTime),
      amount: amount.value ?? 0,
      method: selectedMethod.value.columnName,
      method_icon: resolveMethodIcon(selectedMethod.value),
      currency: getCurrentCurrency(),
      bonus: '0',
      type: 'Fiat',
      status: mapOrderStatusText(3)
    }
    orderPopShow.value = true
    emit('hidden', true)

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
    return
  }
}

onMounted(() => {
  void loadPayColumnPage()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

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

watch(
  () => amount.value,
  () => {
    syncSelectedDiscountItem()
  }
)

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
  appearance: textfield; /* 禁用默认浏览器样式 */
  -webkit-appearance: textfield; /* 针对 Safari 和 Webkit 浏览器 */
  -moz-appearance: textfield; /* 针对 Firefox */
}
</style>
