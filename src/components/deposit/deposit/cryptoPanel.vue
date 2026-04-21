<template>
  <div class="w-full min-h-full font-['Inter']">
    <div class="w-full shrink-0 bg-bg-2 p-3 rounded-lg relative">
      <div class="w-full flex">
        <div class="flex gap-1 flex-1">
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

        <button
          type="button"
          class="appearance-none p-1.5 sm:p-2 rounded-full bg-bg-3 lg:hover:bg-theme-3 text-xs flex items-center border"
          :style="{
            border: `1px solid ${coinMoreShow ? 'var(--color-theme-level-1)' : 'transparent'}`
          }"
          @click.stop="openCoinMorePanel"
        >
          <div class="w-8 h-5 relative mr-3">
            <img class="w-5 aspect-square mr-1 absolute left-0 z-30" :src="DOGEIcon" />
            <img class="w-5 aspect-square mr-1 absolute left-2 z-20" :src="TRXIcon" />
            <img class="w-5 aspect-square mr-1 absolute left-4 z-10" :src="BNBIcon" />
          </div>
          <h2 class="mr-1">{{ t('deposit.deposit_more') }}</h2>
          <ChevronRightSmallIcon class="w-1 h-2" />
        </button>
      </div>

      <div v-if="showChannelSection" class="mt-5">
        <p class="text-xs sm:text-sm text-text-1">{{ t('deposit.deposit_channel') }}</p>

        <div class="mt-4 overflow-hidden">
          <div
            ref="channelListRef"
            class="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
            @wheel.prevent="event => handleHorizontalWheel(event, channelListRef)"
          >
            <button
              v-for="channel in channelOptions"
              :key="channel.rowId"
              :ref="el => setChannelItemRef(el, channel.rowId)"
              @click="selectChannel(channel.rowId)"
              type="button"
              :class="[
                'shrink-0 h-12 px-8 flex justify-center items-center rounded-lg lg:hover:bg-theme-3 border text-text-1',
                selectedSubColumn?.rowId === channel.rowId ? 'bg-theme-3' : ''
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

      <div class="mt-5">
        <div class="flex items-center justify-between">
          <p class="text-xs sm:text-sm text-text-1">{{ t('deposit.deposit_amount') }}</p>

          <div class="flex items-center">
            <AmountInfoIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            <p class="text-xs sm:text-sm text-text-2">{{ t('deposit.deposit_amount') }}</p>
          </div>
        </div>

        <div
          class="flex items-center w-full mt-3 p-3 rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <DepositTokenIcon class="w-6 h-6 mr-3" />
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

      <div
        ref="wageringListRef"
        class="mt-4 text-sm border-b border-opacity-10 pb-2.5 relative overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
        @wheel.prevent="event => handleHorizontalWheel(event, wageringListRef)"
      >
        <div class="flex items-center w-max relative">
          <!-- 区块：template -->
          <template v-for="(item, index) in wageringOptions" :key="item.rowId">
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
              <span
                v-if="selectedDiscountItem?.rowId === item.rowId"
                class="absolute left-0 -bottom-2.5 h-[2px] w-full bg-theme-primary"
              ></span>
            </button>

            <div
              v-if="index !== wageringOptions.length - 1"
              class="h-4 w-px bg-opacity-10 mx-5"
            ></div>
          </template>
        </div>
      </div>

      <div class="w-full relative">
        <p class="py-3 text-xs text-secondary-7">
          {{ t('deposit.withdrawal_no_wagering_tip') }}
        </p>
        <div
          ref="presetsRef"
          class="grid grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-5 bg-bg-4 transition-all duration-300 rounded-tl-lg rounded-tr-lg"
          :class="
            expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[106px] sm:max-h-[148px] overflow-hidden'
          "
        >
          <button
            v-for="preset in presetAmounts"
            :key="preset"
            @click="selectPresetAmount(preset)"
            class="relative text-base sm:text-lg py-[7px] sm:py-3 rounded-lg lg:hover:bg-theme-primary"
            :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
          >
            {{ preset }}
            <div
              v-if="presetDiscountRatioMap[preset] !== undefined"
              class="absolute -top-2 -right-1 text-[10px] text-text-1 px-2 pb-0.5 bg-contain bg-no-repeat bg-center"
              :style="{ backgroundImage: `url(${bonusBgIcon})` }"
            >
              {{ t('deposit.bonus_label', { ratio: presetDiscountRatioMap[preset] }) }}
            </div>
          </button>
        </div>
        <div class="w-full bg-bg-4 rounded-bl-lg rounded-br-lg p-1.5 sm:p-3 relative -mt-3 z-10">
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

      <div class="w-full mt-4">
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

    <div
      class="mt-3 w-full shrink-0 bg-bg-2 p-4 rounded-lg flex items-center justify-between"
      @click="loadWallet"
    >
      <div class="text-xs sm:text-sm text-text-1">{{ t('deposit.load_from_wallet') }}</div>
      <div class="flex items-center">
        <img class="h-6 mr-1" :src="groupIcon" :alt="t('deposit.wallet_bonus_alt')" />
        <div class="text-xs sm:text-sm text-text-1">+300</div>
      </div>
    </div>
  </div>

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
import { useIsMobile } from '@/composables/useMediaQuery'
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
import bonusBgIcon from '@/static/img/payment/amount_bonus_bg.png'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/deposit-token.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { getCurrentCurrency, getLanguageCode } from '@/utils/locale'
import { showToast } from 'vant'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
  type Ref
} from 'vue'
import { useI18n } from 'vue-i18n'
import depositCryptoOrderPop from '../order/crypto/depositCryptoOrderPop.vue'
import { usePresetGrid } from '../shared/usePresetGrid'

const { t, locale } = useI18n()
const isMobile = useIsMobile()
const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const CRYPTO_COLUMN_NAME = 'USDT泰达币'
const CRYPTO_PAY_CHANNEL_CODE = '45'
const defaultPresetAmounts: number[] = []

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

const payMethods = ref<QueryPayColumnItem[]>([])
const selectedMethod = ref<QueryPayColumnItem | null>(null)
const paySubColumns = ref<QueryPaySubColumnItem[]>([])
const selectedSubColumn = ref<QueryPaySubColumnItem | null>(null)
const discountList = ref<QueryDiscountListItem[]>([])
const selectedDiscountItem = ref<QueryDiscountListItem | null>(null)
const channelListRef = ref<HTMLDivElement | null>(null)
const channelItemRefs = ref<Record<string, HTMLElement | null>>({})
const wageringListRef = ref<HTMLDivElement | null>(null)
const wageringItemRefs = ref<Record<string, HTMLElement | null>>({})
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
const presetAmounts = ref<number[]>([...defaultPresetAmounts])
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

// 显示不可用提示
const showUnavailableToast = () => {
  showToast({
    message: t('deposit.unavailable'),
    type: 'fail'
  })
}

// 解析并返回 HTMLElement 节点
const resolveHTMLElement = (el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLElement) return el
  if (el && '$el' in el && el.$el instanceof HTMLElement) return el.$el
  return null
}

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
  void scrollItemIntoView(channelListRef, channelItemRefs.value[String(rowId)])
}

// 选择当前流水倍数选项
const selectWagering = (rowId: number) => {
  selectedDiscountItem.value = discountList.value.find(item => item.rowId === rowId) ?? null
  void scrollItemIntoView(wageringListRef, wageringItemRefs.value[String(rowId)])
}

// 选择预设充值金额
const selectPresetAmount = (preset: number) => {
  amount.value = preset
}

// 选择币种编码
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
    presetAmounts.value = [...defaultPresetAmounts]
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

// 加载钱包
const loadWallet = () => {
  showUnavailableToast()
}

// 提交充值并打开订单弹窗
const doDeposit = async () => {
  if (isDepositDisabled.value) return
  if (!selectedMethod.value) return
  if (!selectedSubColumn.value) return

  const param: SubmitPayOrderPageForm = {
    columnCode: String(selectedMethod.value.columnCode),
    busiAmount: String(amount.value ?? 0),
    payChannelCode: selectedDiscountPayChannelCode.value || CRYPTO_PAY_CHANNEL_CODE,
    channelId: isMobile.value ? 4 : 3,
    subColumnCode: selectedSubColumn.value.rowId,
    flows: 0
  }

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

// 处理关闭事件
const handleClose = () => {
  stopOrderPolling()
  currentOrderId.value = ''
  currentCreateTime.value = null
  emit('hidden', false)
}

// 处理隐藏状态事件
const handleHidden = () => {
  emit('hidden', true)
}

// 页面初始化时加载数字币栏目和监听事件
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
  appearance: textfield; /* 禁用默认浏览器样式 */
  -webkit-appearance: textfield; /* 针对 Safari 和 Webkit 浏览器 */
  -moz-appearance: textfield; /* 针对 Firefox */
}
</style>
