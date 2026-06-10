import Api from '@/api'
import type {
  QueryPayColumnItem,
  QueryPayOrderByOrderIdResult,
  QueryPayQuickAmountConfig,
  QueryPaySubColumnItem,
  QueryPaySubColumnPageForm,
  SubmitPayOrderPageForm
} from '@/api/interface/wallet'
import { isOrderTerminalStatus } from '@/constants/orderStatus'
import { resolvePayChannelTabKey } from '@/constants/payChannelTabs'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { formatTimestamp } from '@/utils/date'
import { getCurrentCurrency, getLanguageCode } from '@/utils/locale'
import { globalShowToast } from '@/utils/toast'
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { defaultFiatOrder, type FiatOrderType } from './components/order/orderType'

export type DepositTabType = 'Crypto' | 'Fiat'
export type DepositPageMode = 'mobile' | 'pc'

export const DEPOSIT_TABS: DepositTabType[] = ['Crypto', 'Fiat']
export const DEPOSIT_CRYPTO_COLUMN_NAME = 'USDT泰达币'

export const getDepositTabI18nKey = (tab: DepositTabType) =>
  tab === 'Crypto' ? 'deposit.tabs.crypto' : 'deposit.tabs.fiat'

export const getDepositChannelId = (isMobile: boolean) => (isMobile ? 4 : 3)

export const toDepositPayImageUrl = (value: string) => {
  if (!value) return ''
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

export const normalizeDepositPresetAmounts = (
  values: Array<number | string> = [],
  fallback: number[] = []
) => {
  const parsed = values
    .map(value => Number(value))
    .filter(value => Number.isFinite(value) && value > 0)

  return parsed.length > 0 ? parsed : [...fallback]
}

export const createDepositPresetDiscountRatioMap = (
  discountItem: QueryPayQuickAmountConfig | null
) => {
  const ratioMap: Record<number, string> = {}

  discountItem?.quickAmount.forEach(value => {
    const amount = Number(value)
    if (!Number.isFinite(amount)) return

    ratioMap[amount] = String(discountItem.ratio)
  })

  return ratioMap
}

export const createDepositWageringOptions = (discountList: QueryPayQuickAmountConfig[]) =>
  discountList.map(item => ({
    rowId: item.rowId,
    multiple: item.multiple,
    label: item.payQuickName
  }))

export const parseDepositLocalizedName = (value: string, localeCode: string) => {
  try {
    const parsedName = JSON.parse(value)

    return parsedName?.[localeCode] || parsedName?.eng || parsedName?.en || parsedName?.zh || value
  } catch {
    return value
  }
}

export const parseDepositSubColumnName = (item: QueryPaySubColumnItem, localeCode = 'zh') => {
  try {
    const parsedName = JSON.parse(item.subColumnName)

    return (
      parsedName?.[localeCode] ||
      parsedName?.eng ||
      parsedName?.en ||
      parsedName?.zh ||
      item.platformName ||
      item.subColumnName
    )
  } catch {
    return item.platformName || item.subColumnName
  }
}

export const createDepositChannelOptions = (
  subColumns: QueryPaySubColumnItem[],
  localeCode = 'zh'
) =>
  subColumns.map(item => ({
    rowId: item.rowId,
    label: parseDepositSubColumnName(item, localeCode)
  }))

interface DepositFlowOptions {
  isMobile: Ref<boolean> | boolean
  emitHidden?: (value: boolean) => void
  emitHiddenOnOrderOpen?: boolean
  emitHiddenOnOrderHidden?: boolean
}

const resolveFlowBoolean = (value: Ref<boolean> | boolean) =>
  typeof value === 'boolean' ? value : value.value

export const useDepositCryptoFlow = (options: DepositFlowOptions) => {
  const { t, locale } = useI18n()
  const defaultPresetAmounts: number[] = []

  const isInitialLoading = ref(true)
  const payMethods = ref<QueryPayColumnItem[]>([])
  const selectedMethod = ref<QueryPayColumnItem | null>(null)
  const paySubColumns = ref<QueryPaySubColumnItem[]>([])
  const selectedSubColumn = ref<QueryPaySubColumnItem | null>(null)
  const discountList = computed(() => selectedSubColumn.value?.quickAmountConfigs ?? [])
  const selectedDiscountItem = ref<QueryPayQuickAmountConfig | null>(null)
  const amount = ref<number>()
  const coinCode = ref('USDT')
  const coinMoreShow = ref(false)
  const orderPopShow = ref(false)
  const orderInfo = ref<Partial<QueryPayOrderByOrderIdResult>>({})
  const currentOrderId = ref('')
  const currentCreateTime = ref<number | null>(null)
  const pollTimer = ref<number | null>(null)
  const presetAmounts = ref<number[]>([...defaultPresetAmounts])

  const channelOptions = computed(() =>
    paySubColumns.value.map(item => ({
      rowId: item.rowId,
      label: parseDepositLocalizedName(item.subColumnName, String(locale.value || 'eng'))
    }))
  )
  const wageringOptions = computed(() => createDepositWageringOptions(discountList.value))
  const showChannelSection = computed(() => paySubColumns.value.length > 1)
  const isManualAmountAllowed = computed(() => selectedSubColumn.value?.manualAmountIn !== 0)
  const selectedPayChannelCode = computed(() =>
    resolvePayChannelTabKey(selectedMethod.value?.columnName)
  )
  const presetDiscountRatioMap = computed(() =>
    createDepositPresetDiscountRatioMap(selectedDiscountItem.value)
  )
  const amountPlaceholder = computed(() =>
    isManualAmountAllowed.value
      ? t('deposit.deposit_amount_input_placeholder')
      : t('deposit.deposit_amount_preset_placeholder')
  )
  const isDepositDisabled = computed(() => !amount.value || Number(amount.value) <= 0)

  const emitHidden = (value: boolean) => {
    options.emitHidden?.(value)
  }

  const syncPresetAmounts = () => {
    presetAmounts.value = normalizeDepositPresetAmounts(
      selectedDiscountItem.value?.quickAmount ?? [],
      defaultPresetAmounts
    )
  }

  const showUnavailableToast = () => {
    globalShowToast({
      message: t('deposit.unavailable'),
      type: 'fail'
    })
  }

  const selectCoinCode = (code: string) => {
    if (code !== 'USDT') {
      showUnavailableToast()
      return
    }

    coinCode.value = code
    coinMoreShow.value = false
  }

  const openCoinMorePanel = () => {
    showUnavailableToast()
  }

  const clearAmount = () => {
    amount.value = undefined
  }

  const selectChannel = (rowId: number) => {
    const target = paySubColumns.value.find(item => item.rowId === rowId)
    if (!target) return

    selectedSubColumn.value = target
    selectedDiscountItem.value = discountList.value[0] ?? null
    syncPresetAmounts()
    clearAmount()
  }

  const selectWagering = (rowId: number) => {
    selectedDiscountItem.value = discountList.value.find(item => item.rowId === rowId) ?? null
    syncPresetAmounts()
    clearAmount()
  }

  const selectPresetAmount = (preset: number) => {
    amount.value = preset
  }

  const stopOrderPolling = () => {
    if (pollTimer.value !== null) {
      window.clearInterval(pollTimer.value)
      pollTimer.value = null
    }
  }

  const applyOrderDetail = (detail?: QueryPayOrderByOrderIdResult) => {
    if (detail) {
      orderInfo.value = {
        ...detail,
        method_icon: toDepositPayImageUrl(selectedMethod.value?.defaultOrderIcon ?? '')
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
      method_icon: toDepositPayImageUrl(selectedMethod.value?.defaultOrderIcon ?? ''),
      status: 0
    }
  }

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
      selectedDiscountItem.value = discountList.value[0] ?? null
      syncPresetAmounts()
    } catch (error) {
      console.error('queryPaySubColumnPage failed', error)
      paySubColumns.value = []
      selectedSubColumn.value = null
      selectedDiscountItem.value = null
      presetAmounts.value = [...defaultPresetAmounts]
    }
  }

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
      payMethods.value = result.filter(item => item.columnName === DEPOSIT_CRYPTO_COLUMN_NAME)

      const defaultMethod = payMethods.value[0] ?? null
      if (!defaultMethod) {
        selectedMethod.value = null
        paySubColumns.value = []
        selectedSubColumn.value = null
        selectedDiscountItem.value = null
        presetAmounts.value = [...defaultPresetAmounts]
        return
      }

      selectedMethod.value = defaultMethod
      await loadPaySubColumnPage(defaultMethod.columnCode)
    } catch (error) {
      console.error('queryPayColumnPage failed', error)
      payMethods.value = []
      selectedMethod.value = null
      paySubColumns.value = []
      selectedSubColumn.value = null
      selectedDiscountItem.value = null
      presetAmounts.value = [...defaultPresetAmounts]
    } finally {
      isInitialLoading.value = false
    }
  }

  const loadWallet = () => {
    showUnavailableToast()
  }

  const doDeposit = async () => {
    if (isDepositDisabled.value) return
    if (!selectedMethod.value) return
    if (!selectedSubColumn.value) return

    const param: SubmitPayOrderPageForm = {
      columnCode: String(selectedMethod.value.columnCode),
      busiAmount: String(amount.value ?? 0),
      payChannelCode: selectedPayChannelCode.value,
      channelId: getDepositChannelId(resolveFlowBoolean(options.isMobile)),
      subColumnCode: selectedSubColumn.value.rowId,
      flows: selectedDiscountItem.value?.multiple ?? 0
    }

    if (selectedDiscountItem.value) {
      param.discount = selectedDiscountItem.value.ratio
    }

    try {
      const response = await Api.wallet.submitPayOrder(param)
      ensureApiBusinessSuccess(response)
      const submitResult = response.result
      currentOrderId.value = submitResult?.orderId !== undefined ? String(submitResult.orderId) : ''
      currentCreateTime.value = submitResult?.createTime ?? null
      applyOrderDetail()
      orderPopShow.value = true

      if (options.emitHiddenOnOrderOpen ?? true) {
        emitHidden(true)
      }

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

  const handleClose = () => {
    stopOrderPolling()
    currentOrderId.value = ''
    currentCreateTime.value = null
    emitHidden(false)
  }

  const handleHidden = () => {
    if (options.emitHiddenOnOrderHidden ?? true) {
      emitHidden(true)
    }
  }

  onMounted(() => {
    void loadPayColumnPage()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    stopOrderPolling()
  })

  return {
    isInitialLoading,
    payMethods,
    selectedMethod,
    paySubColumns,
    selectedSubColumn,
    discountList,
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
  }
}

export const useDepositFiatFlow = (options: DepositFlowOptions) => {
  const { t } = useI18n()
  const defaultPresetAmounts: number[] = []

  const isInitialLoading = ref(true)
  const presetAmounts = ref<number[]>([...defaultPresetAmounts])
  const paySubColumns = ref<QueryPaySubColumnItem[]>([])
  const payMethods = ref<QueryPayColumnItem[]>([])
  const selectedMethod = ref<QueryPayColumnItem | null>(null)
  const selectedSubColumn = ref<QueryPaySubColumnItem | null>(null)
  const discountList = computed(() => selectedSubColumn.value?.quickAmountConfigs ?? [])
  const selectedDiscountItem = ref<QueryPayQuickAmountConfig | null>(null)
  const amount = ref<number>()
  const orderInfo = ref<FiatOrderType>({ ...defaultFiatOrder })
  const orderPopShow = ref(false)
  const payColumnLoaded = ref(false)
  const currentOrderId = ref('')
  const pollTimer = ref<number | null>(null)

  const isDepositDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
  const showChannelSection = computed(() => paySubColumns.value.length > 1)
  const isManualAmountAllowed = computed(() => selectedSubColumn.value?.manualAmountIn !== 0)
  const selectedPayChannelCode = computed(() =>
    resolvePayChannelTabKey(selectedMethod.value?.columnName)
  )
  const presetDiscountRatioMap = computed(() =>
    createDepositPresetDiscountRatioMap(selectedDiscountItem.value)
  )
  const channelOptions = computed(() => createDepositChannelOptions(paySubColumns.value))
  const wageringOptions = computed(() => createDepositWageringOptions(discountList.value))
  const amountPlaceholder = computed(() =>
    isManualAmountAllowed.value
      ? t('deposit.deposit_amount_input_or_select_placeholder')
      : t('deposit.deposit_amount_preset_placeholder')
  )
  const isAmountInputHighlighted = computed(() => !isDepositDisabled.value)

  const emitHidden = (value: boolean) => {
    options.emitHidden?.(value)
  }

  const clearAmount = () => {
    amount.value = undefined
  }

  const selectPresetAmount = (preset: number) => {
    amount.value = preset
  }

  const resolveMethodIcon = (item: QueryPayColumnItem) => {
    return toDepositPayImageUrl(item.defaultOrderIcon)
  }

  const syncPresetAmounts = () => {
    presetAmounts.value = normalizeDepositPresetAmounts(
      selectedDiscountItem.value?.quickAmount ?? [],
      defaultPresetAmounts
    )
  }

  const selectWagering = (rowId: number) => {
    selectedDiscountItem.value = discountList.value.find(item => item.rowId === rowId) ?? null
    syncPresetAmounts()
    clearAmount()
  }

  const applyOrderDetail = (detail: QueryPayOrderByOrderIdResult) => {
    orderInfo.value = {
      order_no: String(detail.orderId ?? currentOrderId.value),
      created_at: formatTimestamp(detail.createTime),
      amount: Number(detail.busiAmount ?? amount.value ?? 0),
      method: selectedMethod.value?.columnName ?? '',
      method_icon: selectedMethod.value ? resolveMethodIcon(selectedMethod.value) : '',
      currency: detail.currency || getCurrentCurrency(),
      bonus: String(detail.otherAmount ?? 0),
      type: 'Fiat',
      status: String(detail.status ?? 0)
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
      selectedDiscountItem.value = discountList.value[0] ?? null
      syncPresetAmounts()
    } catch (error) {
      console.error('queryPaySubColumnPage failed', error)
      paySubColumns.value = []
      selectedSubColumn.value = null
      selectedDiscountItem.value = null
      presetAmounts.value = [...defaultPresetAmounts]
    }
  }

  const selectChannel = (rowId: number) => {
    const target = paySubColumns.value.find(item => item.rowId === rowId)
    if (!target) return

    selectedSubColumn.value = target
    selectedDiscountItem.value = discountList.value[0] ?? null
    syncPresetAmounts()
    clearAmount()
  }

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
      const result: QueryPayColumnItem[] = Array.isArray(response.result) ? response.result : []

      payMethods.value = result
        .map((item, index) => ({ item, index }))
        .filter(
          ({ item }) =>
            item.columnName !== DEPOSIT_CRYPTO_COLUMN_NAME &&
            Boolean(resolvePayChannelTabKey(item.columnName))
        )
        .sort((a, b) => {
          const sortDiff = a.item.sortNo - b.item.sortNo
          return sortDiff !== 0 ? sortDiff : a.index - b.index
        })
        .map(({ item }) => item)

      const defaultMethod = payMethods.value[0]
      if (!defaultMethod) {
        selectedMethod.value = null
        paySubColumns.value = []
        selectedSubColumn.value = null
        selectedDiscountItem.value = null
        presetAmounts.value = [...defaultPresetAmounts]
        return
      }

      selectedMethod.value = defaultMethod
      await loadPaySubColumnPage(defaultMethod.columnCode)
    } catch (error) {
      console.error('queryPayColumnPage failed', error)
      payMethods.value = []
      selectedMethod.value = null
      paySubColumns.value = []
      selectedSubColumn.value = null
      selectedDiscountItem.value = null
      presetAmounts.value = [...defaultPresetAmounts]
    } finally {
      payColumnLoaded.value = true
      isInitialLoading.value = false
    }
  }

  const selectMethod = async (method: QueryPayColumnItem) => {
    if (selectedMethod.value?.columnCode === method.columnCode) {
      return
    }

    selectedMethod.value = method
    clearAmount()
    await loadPaySubColumnPage(method.columnCode)
  }

  const doDeposit = async () => {
    if (isDepositDisabled.value) return
    if (!selectedMethod.value) return
    if (!selectedSubColumn.value) return

    const param: SubmitPayOrderPageForm = {
      columnCode: String(selectedMethod.value.columnCode),
      busiAmount: String(amount.value ?? 0),
      payChannelCode: selectedPayChannelCode.value,
      channelId: getDepositChannelId(resolveFlowBoolean(options.isMobile)),
      subColumnCode: selectedSubColumn.value.rowId,
      flows: selectedDiscountItem.value?.multiple ?? 0
    }

    if (selectedDiscountItem.value) {
      param.discount = selectedDiscountItem.value.ratio
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

      if (options.emitHiddenOnOrderOpen ?? true) {
        emitHidden(true)
      }

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

  const handleClose = () => {
    stopOrderPolling()
    currentOrderId.value = ''
    emitHidden(false)
  }

  const handleHidden = () => {
    if (options.emitHiddenOnOrderHidden ?? true) {
      emitHidden(true)
    }
  }

  onMounted(() => {
    void loadPayColumnPage()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    stopOrderPolling()
  })

  return {
    isInitialLoading,
    presetAmounts,
    paySubColumns,
    payMethods,
    selectedMethod,
    selectedSubColumn,
    discountList,
    selectedDiscountItem,
    amount,
    orderInfo,
    orderPopShow,
    payColumnLoaded,
    isDepositDisabled,
    showChannelSection,
    isManualAmountAllowed,
    presetDiscountRatioMap,
    channelOptions,
    wageringOptions,
    amountPlaceholder,
    isAmountInputHighlighted,
    clearAmount,
    selectPresetAmount,
    resolveMethodIcon,
    selectWagering,
    selectChannel,
    selectMethod,
    doDeposit,
    handleClose,
    handleHidden
  }
}
