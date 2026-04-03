<template>
  <!-- 法币充值面板容器 -->
  <div v-if="payMethods.length > 0" class="w-full bg-bg-2 p-6 rounded-lg font-['Inter']">
    <!-- 支付方式标题 -->
    <p class="text-sm font-bold leading-normal text-text-1">Deposit Methods</p>
    <!-- 支付方式列表外层容器 -->
    <div class="mt-2.5 overflow-hidden">
      <!-- 支付方式横向滚动容器 -->
      <div
        ref="methodListRef"
        class="flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
        @wheel.prevent="handleMethodListWheel"
      >
        <!-- 单个支付方式卡片 -->
        <div
          class="shrink-0 basis-[calc((100%-3rem)/4)] flex items-center justify-center p-4 rounded-xl lg:hover:bg-theme-3 lg:hover:border-theme-primary"
          :class="{
            'border border-theme-primary bg-theme-3':
              selectedMethod?.columnCode === item.columnCode,
            'border border-transparent bg-bg-4': selectedMethod?.columnCode !== item.columnCode
          }"
          v-for="(item, index) in payMethods"
          :key="item.columnCode"
          :ref="el => setMethodItemRef(el, index)"
          @click.stop="selectMethod(item, index)"
        >
          <img class="mr-4 h-6" :src="resolveMethodIcon(item)" />
          <!-- 支付方式名称 -->
          <p class="text-base font-bold leading-normal text-text-1">{{ item.columnName }}</p>
        </div>
      </div>
    </div>
    <!-- 充值金额标题 -->
    <p class="mt-4 text-sm font-bold leading-normal text-text-1">Deposit Amount</p>
    <!-- 充值金额输入容器 -->
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
        class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-sm"
        :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
      />
      <!-- 清空输入按钮 -->
      <button
        v-show="!isDepositDisabled"
        class="w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
        @click="clearAmount"
      >
        <CloseIcon class="w-4 h-4" />
      </button>
    </div>
    <!-- 预设金额区域 -->
    <div class="mt-4 w-full relative">
      <!-- 预设金额按钮网格 -->
      <div
        ref="presetsRef"
        class="grid grid-cols-6 gap-2 p-2 bg-bg-4 transition-all duration-300 rounded-tl-lg rounded-tr-lg"
        :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[104px] overflow-hidden'"
      >
        <!-- 单个预设金额按钮 -->
        <button
          v-for="preset in presetAmounts"
          :key="preset"
          @click="selectPresetAmount(preset)"
          class="py-2.5 rounded-lg lg:hover:bg-theme-primary"
          :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
        >
          {{ preset }}
        </button>
      </div>
      <!-- 展开收起操作区 -->
      <div class="w-full bg-bg-4 rounded-bl-lg rounded-br-lg py-2">
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
        class="w-full py-4 lg:hover:btn-primary rounded-xl font-semibold text-text-4"
        :class="[!isDepositDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
        :disabled="isDepositDisabled"
        @click="doDeposit"
      >
        {{ t('deposit.deposit_now') }}
      </button>
    </div>
  </div>
  <!-- 空状态 -->
  <ThemedEmptyState
    v-else-if="payColumnLoaded"
    :dark-image="defaultImgDark"
    :light-image="defaultImgLight"
    :image-alt="$t('notifications.title')"
    :message="$t('notifications.emptyMessage')"
    text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
  />
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
  QueryDiscountListItem,
  QueryPayColumnItem,
  QueryPayOrderByOrderIdResult,
  QueryPaySubColumnItem,
  QueryPaySubColumnPageForm,
  SubmitPayOrderPageForm
} from '@/api/interface/wallet'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { resolvePayChannelTabKey } from '@/constants/payChannelTabs'
import {
  default as defaultImgDark,
  default as defaultImgLight
} from '@/static/img/explore/default.png'
import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import payPalIcon from '@/static/img/payment/payPal.png'
import CloseIcon from '@/static/svg/close.svg?component'
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

const payMethods = ref<QueryPayColumnItem[]>([])
const selectedMethod = ref<QueryPayColumnItem | null>(null)
const selectedSubColumn = ref<QueryPaySubColumnItem | null>(null)
const selectedDiscountItem = ref<QueryDiscountListItem | null>(null)
const amount = ref<number>()
const methodListRef = ref<HTMLDivElement | null>(null)
const methodItemRefs = ref<Array<HTMLElement | null>>([])
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const orderInfo = ref<FiatOrderType>(defaultFiatOrder)
const orderPopShow = ref(false)
const payColumnLoaded = ref(false)
const isDepositDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
const isManualAmountAllowed = computed(() => selectedSubColumn.value?.manualAmountIn !== 0)
const selectedDiscountPayChannelCode = computed(() =>
  resolvePayChannelTabKey(selectedMethod.value?.columnName)
)
const amountPlaceholder = computed(() =>
  isManualAmountAllowed.value
    ? 'Please select or enter deposit amount.'
    : 'Please select a preset deposit amount.'
)
const isAmountInputHighlighted = ref(false)
const currentOrderId = ref('')
const pollTimer = ref<number | null>(null)

// 处理弹窗关闭事件并通知父组件
const handleClose = () => {
  stopOrderPolling()
  currentOrderId.value = ''
  emit('hidden', false)
}

// 处理弹窗隐藏事件（预留扩展）
const handleHidden = () => {
  // emit('hidden', true)
}

const clearAmount = () => {
  amount.value = undefined
  isAmountInputHighlighted.value = false
}

const selectPresetAmount = (preset: number) => {
  amount.value = preset
  isAmountInputHighlighted.value = true
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

// 滚动到指定支付方式项
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

// 处理支付方式列表的滚轮横向滚动
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
    selectedSubColumn.value = result[0] ?? null
    presetAmounts.value = normalizePresetAmounts(
      selectedSubColumn.value?.defaultRechargeAmount ?? []
    )
  } catch (error) {
    console.error('queryPaySubColumnPage failed', error)
    selectedSubColumn.value = null
    presetAmounts.value = [...defaultPresetAmounts]
  }
}
const loadDiscountList = async (payChannelCode: string) => {
  try {
    const response = await Api.wallet.queryDiscountList({ payChannelCode })
    const result: QueryDiscountListItem[] =
      response?.success && Array.isArray(response.result) ? response.result : []
    selectedDiscountItem.value = result[0] ?? null
  } catch (error) {
    console.error('queryDiscountList failed', error)
    selectedDiscountItem.value = null
  }
}

// 加载支付栏目并默认请求第一个子栏目
const loadPayColumnPage = async () => {
  try {
    // const res = await Api.wallet.queryDlicgh({})
    // const defaultCurrency = res.result?.baseSiteConfig?.defaultCurrency?.trim()
    // const supportCurrency = res.result?.baseSiteConfig?.supportCurrency ?? ''
    // const currency = defaultCurrency || supportCurrency.split(',')[0]?.trim() || 'PHP'
    // 获取当前语言
    const languageCode = getLanguageCode()
    // 获取当前币种
    const currency = getCurrentCurrency()

    const response = await Api.wallet.queryPayColumnPage({
      page: {
        current: 1,
        size: 9999
      },

      languageCode: languageCode,
      currency: currency
    })
    const result: QueryPayColumnItem[] =
      response?.success && Array.isArray(response.result) ? response.result : []

    payMethods.value = result
    methodItemRefs.value = new Array(payMethods.value.length).fill(null)

    const defaultMethod = payMethods.value[0]
    if (!defaultMethod) {
      selectedMethod.value = null
      selectedSubColumn.value = null
      selectedDiscountItem.value = null
      presetAmounts.value = [...defaultPresetAmounts]
      return
    }

    selectedMethod.value = defaultMethod
    void scrollMethodIntoView(0)
    await loadPaySubColumnPage(defaultMethod.columnCode)
  } catch (error) {
    console.error('queryPayColumnPage failed', error)
    payMethods.value = []
    selectedMethod.value = null
    selectedSubColumn.value = null
    selectedDiscountItem.value = null
    presetAmounts.value = [...defaultPresetAmounts]
  } finally {
    payColumnLoaded.value = true
  }
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
    // TODO：后续需要全局配置中取值
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

// 页面挂载时初始化支付栏目数据
onMounted(() => {
  void loadPayColumnPage()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

watch(
  () => [selectedSubColumn.value?.rowId, selectedDiscountPayChannelCode.value],
  () => {
    if (!selectedDiscountPayChannelCode.value) {
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
