<template>
  <!-- 法币充值面板容器 -->
  <div class="w-full bg-bg-2 p-4 rounded-lg font-['Inter']">
    <!-- 充值方式标题 -->
    <p class="text-xs sm:text-sm font-bold leading-normal text-text-1">
      {{ t('deposit.methods') }}
    </p>
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
      <p class="text-xs sm:text-sm font-bold leading-normal text-text-1">
        {{ t('deposit.deposit_channel') }}
      </p>
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
              ? 'border-theme-primary bg-theme-3 font-bold text-text-4'
              : 'border-opacity-10 text-text-1 lg:hover:bg-theme-3'
          "
          @click="selectChannel(channel.rowId)"
        >
          {{ channel.label }}
        </button>
      </div>
    </div>
    <!-- 充值金额标题 -->
    <p class="mt-4 text-xs sm:text-sm font-bold leading-normal text-text-1">
      {{ t('deposit.deposit_amount') }}
    </p>
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
        v-model.number="amount"
        :readonly="!isManualAmountAllowed"
        :inputmode="isManualAmountAllowed ? 'decimal' : 'none'"
        :placeholder="amountPlaceholder"
        class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
        :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
      />
    </div>
    <!-- 流水选项与提示区域 -->
    <div class="mt-4 flex flex-col gap-2">
      <!-- 流水选项切换容器 -->
      <div class="border-b border-opacity-10 pb-2">
        <!-- 流水选项列表 -->
        <div class="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <template v-for="(item, index) in wageringOptions" :key="item.rowId">
            <!-- 单个流水选项按钮 -->
            <button
              type="button"
              class="relative shrink-0 pb-1 text-sm leading-5 transition-colors"
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
              class="h-[14px] w-px shrink-0 bg-opacity-10"
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
          :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
        >
          <span>{{ preset }}</span>
          <span
            v-if="presetDiscountRatioMap[preset] !== undefined"
            class="pointer-events-none absolute -right-1 -top-1 min-w-8 rounded-lg bg-center bg-contain bg-no-repeat px-2 py-0.5 text-center text-xs font-bold leading-4"
            :style="{ backgroundImage: `url(${addBonusBadgeBg})` }"
          >
            {{ t('deposit.bonus_label', { ratio: presetDiscountRatioMap[preset] }) }}
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
  <!-- 充值订单弹窗 -->
  <depositFiatOrderPop
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
import { isOrderTerminalStatus } from '@/constants/orderStatus'
import { resolvePayChannelTabKey } from '@/constants/payChannelTabs'
import addBonusBadgeBg from '@/static/img/deposit/add-bonus-badge.png'
import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import payPalIcon from '@/static/img/payment/payPal.png'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/fiat-order-amount.svg?component'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
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
import depositFiatOrderPop from '../order/fiat/depositFiatOrderPop.vue'
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
const channelOptions = computed(() =>
  paySubColumns.value.map(item => ({
    rowId: item.rowId,
    label: parseSubColumnName(item)
  }))
)
const wageringOptions = computed(() =>
  discountList.value.map(item => ({
    rowId: item.rowId,
    multiple: item.multiple,
    label: formatWageringLabel(item.multiple)
  }))
)
const amountPlaceholder = computed(() =>
  isManualAmountAllowed.value
    ? t('deposit.deposit_amount_input_or_select_placeholder')
    : t('deposit.deposit_amount_preset_placeholder')
)
const isAmountInputHighlighted = computed(() => !isDepositDisabled.value)
const currentOrderId = ref('')
const pollTimer = ref<number | null>(null)

// 处理关闭事件
const handleClose = () => {
  stopOrderPolling()
  currentOrderId.value = ''
  emit('hidden', false)
}

// 处理隐藏状态事件
const handleHidden = () => {
  emit('hidden', true)
}

// 清空金额
const clearAmount = () => {
  amount.value = undefined
}

// 选择预设金额并回填输入框
const selectPresetAmount = (preset: number) => {
  amount.value = preset
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

// 同步预设金额列表
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

// 选择当前流水倍数选项
const selectWagering = (rowId: number) => {
  selectedDiscountItem.value = discountList.value.find(item => item.rowId === rowId) ?? null
}

// 获取当前选中充值金额对应的优惠比例
const resolveSelectedDiscountRatio = () => {
  const normalizedAmount = Number(amount.value)
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) return undefined

  const matchedDiscount = selectedDiscountItem.value?.discounts?.find(
    discount => Number(discount.amount) === normalizedAmount
  )
  const ratio = Number(matchedDiscount?.ratio)

  return Number.isFinite(ratio) && ratio > 0 ? ratio : undefined
}

// 格式化时间戳
const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}

// 应用订单详情
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
    status: String(detail.status ?? 0)
  }
  orderPopShow.value = true
}

// 停止订单轮询
const stopOrderPolling = () => {
  if (pollTimer.value !== null) {
    window.clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

// 查询订单详情
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

// 开始订单轮询
const startOrderPolling = () => {
  if (!currentOrderId.value || pollTimer.value !== null) return

  void queryOrderDetail()
  pollTimer.value = window.setInterval(() => {
    void queryOrderDetail()
  }, 3000)
}

// 处理页面可见性变化事件
const handleVisibilityChange = () => {
  if (!currentOrderId.value) return

  if (document.visibilityState === 'visible') {
    startOrderPolling()
  } else {
    stopOrderPolling()
  }
}

// 记录支付方式项的 DOM 引用
const setMethodItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  const target =
    el instanceof HTMLElement
      ? el
      : el && '$el' in el && el.$el instanceof HTMLElement
        ? el.$el
        : null

  methodItemRefs.value[index] = target
}

// 将支付方式滚动到可视区域
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

// 处理支付方式列表滚轮事件
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
    ensureApiBusinessSuccess(response)
    const result: QueryPaySubColumnItem[] = Array.isArray(response.result) ? response.result : []
    paySubColumns.value = result
    selectedSubColumn.value = result[0] ?? null
    syncPresetAmounts()
  } catch (error) {
    console.error('queryPaySubColumnPage failed', error)
    paySubColumns.value = []
    selectedSubColumn.value = null
    presetAmounts.value = [...defaultPresetAmounts]
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

// 请求充值优惠与流水配置
const loadDiscountList = async (payChannelCode: string) => {
  try {
    const response = await Api.wallet.queryDiscountList({ payChannelCode })
    ensureApiBusinessSuccess(response)
    const result: QueryDiscountListItem[] = Array.isArray(response.result) ? response.result : []
    discountList.value = result
    selectedDiscountItem.value = result[0] ?? null
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
    ensureApiBusinessSuccess(response)
    const result: QueryPayColumnItem[] = Array.isArray(response.result) ? response.result : []

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
    presetAmounts.value = [...defaultPresetAmounts]
  }
}

// 选择充值渠道并切换对应金额数据
const selectChannel = (rowId: number) => {
  const target = paySubColumns.value.find(item => item.rowId === rowId)
  if (!target) return

  selectedSubColumn.value = target
  syncPresetAmounts()
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
  if (method.directRecharge === 1) {
    await loadPayRechargeQuickAmts(method.columnCode)
  } else {
    quickAmountConfig.value = null
    syncPresetAmounts()
  }
}

// 提交充值并打开订单弹窗
const doDeposit = async () => {
  if (isDepositDisabled.value) return
  if (!selectedMethod.value) return
  if (!selectedSubColumn.value) return

  const param: SubmitPayOrderPageForm = {
    columnCode: String(selectedMethod.value.columnCode),
    busiAmount: String(amount.value ?? 0),
    payChannelCode: selectedDiscountPayChannelCode.value || String(selectedMethod.value.columnCode),
    channelId: isMobile.value ? 4 : 3,
    subColumnCode: selectedSubColumn.value.rowId,
    flows: selectedDiscountItem.value?.multiple ?? 0
  }

  const discount = resolveSelectedDiscountRatio()
  if (discount !== undefined) {
    param.discount = discount
  }

  try {
    const response = await Api.wallet.submitPayOrder(param)
    ensureApiBusinessSuccess(response)
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
      status: '3'
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
