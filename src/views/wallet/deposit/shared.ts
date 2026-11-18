import Api from '@/api'
import type {
  QueryPayCategoryItem,
  QueryPayColumnItem,
  QueryPayOrderByOrderIdResult,
  QueryPayQuickAmountConfig,
  QueryPaySubColumnItem,
  QueryPaySubColumnPageForm,
  SubmitPayOrderPageForm
} from '@/api/interface/wallet'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { isOrderTerminalStatus } from '@/constants/orderStatus'
import { useUserStore } from '@/stores/user'
import { resolvePayChannelTabKey } from '@/constants/payChannelTabs'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { formatTimestamp } from '@/utils/date'
import { resolveGameImageUrl } from '@/utils/image'
import { getCurrentCurrency, getLanguageCode } from '@/utils/locale'
import { globalShowToast } from '@/utils/toast'
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { defaultFiatOrder, type FiatOrderType } from './components/order/orderType'

export type DepositTabType = 'Fiat' | 'Crypto'
export type DepositPageMode = 'mobile' | 'pc'

export const DEPOSIT_TABS: DepositTabType[] = ['Crypto', 'Fiat']

export const getDepositTabI18nKey = (tab: DepositTabType) =>
  tab === 'Crypto' ? 'deposit.tabs.crypto' : 'deposit.tabs.fiat'

export const getDepositChannelId = (isMobile: boolean) => (isMobile ? 4 : 3)

export const toDepositPayImageUrl = (value: string) => {
  if (!value) return ''
  return resolveGameImageUrl(value)
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

export const createDepositWageringOptions = (discountList: QueryPayQuickAmountConfig[]) =>
  discountList.map(item => ({
    rowId: item.rowId,
    multiple: item.multiple,
    label: item.payQuickName,
    ratio: Number(item.ratio) || 0
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
  initialMethodCode?: string
  emitHidden?: (value: boolean) => void
  emitHiddenOnOrderOpen?: boolean
  emitHiddenOnOrderHidden?: boolean
}

const resolveFlowBoolean = (value: Ref<boolean> | boolean) =>
  typeof value === 'boolean' ? value : value.value

export const useDepositCryptoFlow = (options: DepositFlowOptions) => {
  const { t, locale } = useI18n()
  const userStore = useUserStore()
  const defaultPresetAmounts: number[] = []

  const isInitialLoading = ref(true)
  const payMethods = ref<QueryPayColumnItem[]>([])
  const selectedMethod = ref<QueryPayColumnItem | null>(null)
  const paySubColumns = ref<QueryPaySubColumnItem[]>([])
  const selectedSubColumn = ref<QueryPaySubColumnItem | null>(null)
  const discountList = computed(() => selectedSubColumn.value?.quickAmountConfigs ?? [])
  const selectedDiscountItem = ref<QueryPayQuickAmountConfig | null>(null)
  const amount = ref<number>()
  const orderPopShow = ref(false)
  const orderInfo = ref<Partial<QueryPayOrderByOrderIdResult>>({})
  const currentOrderId = ref('')
  const currentCreateTime = ref<number | null>(null)
  const pollTimer = ref<number | null>(null)
  const presetAmounts = ref<number[]>([...defaultPresetAmounts])
  let subColumnRequestId = 0

  const coinOptions = computed(() =>
    payMethods.value.map(item => ({
      columnCode: item.columnCode,
      label: parseDepositLocalizedName(item.columnName, String(locale.value || 'eng')),
      icon: toDepositPayImageUrl(item.columnIco)
    }))
  )
  const selectedCoinIcon = computed(() =>
    toDepositPayImageUrl(selectedMethod.value?.columnIco ?? '')
  )

  const channelOptions = computed(() =>
    paySubColumns.value.map(item => ({
      rowId: item.rowId,
      label: parseDepositLocalizedName(item.subColumnName, String(locale.value || 'eng')),
      bonusRatio: resolveDepositMethodBonusRatio(item)
    }))
  )
  const wageringOptions = computed(() => createDepositWageringOptions(discountList.value))
  const showWageringSection = computed(() => wageringOptions.value.length > 1)
  const showChannelSection = computed(() => paySubColumns.value.length > 1)
  const isManualAmountAllowed = computed(() => selectedSubColumn.value?.manualAmountIn !== 0)
  const selectedPayChannelCode = computed(() => {
    const ownCode = String(selectedMethod.value?.payChannelCode ?? '').trim()
    return ownCode || resolvePayChannelTabKey(selectedMethod.value?.columnName)
  })
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
      accountCurrency: selectedSubColumn.value?.currency ?? '',
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
        void userStore.refreshBalance({ force: true })
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
    const requestId = ++subColumnRequestId
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
      if (requestId !== subColumnRequestId) return
      ensureApiBusinessSuccess(response)
      const result: QueryPaySubColumnItem[] = Array.isArray(response.result) ? response.result : []

      paySubColumns.value = result
      selectedSubColumn.value = result[0] ?? null
      selectedDiscountItem.value = discountList.value[0] ?? null
      syncPresetAmounts()
    } catch (error) {
      if (requestId !== subColumnRequestId) return
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
      payMethods.value = result

      // 任务中心传入方式编码时优先精确选中，未匹配则保留充值页原有默认方式。
      const initialMethodCode = String(options.initialMethodCode ?? '').trim()
      const defaultMethod =
        payMethods.value.find(item => String(item.columnCode) === initialMethodCode) ??
        payMethods.value[0] ??
        null
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

  const selectMethod = (columnCode: number) => {
    if (selectedMethod.value?.columnCode === columnCode) return
    const target = payMethods.value.find(item => item.columnCode === columnCode)
    if (!target) return

    selectedMethod.value = target
    clearAmount()
    void loadPaySubColumnPage(columnCode)
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
    orderPopShow,
    orderInfo,
    presetAmounts,
    coinOptions,
    selectedCoinIcon,
    channelOptions,
    wageringOptions,
    showChannelSection,
    showWageringSection,
    isManualAmountAllowed,
    amountPlaceholder,
    isDepositDisabled,
    showUnavailableToast,
    selectMethod,
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

export interface DepositCategoryOption {
  id: number
  label: string
}

export const resolveDepositMethodIcon = (item: QueryPaySubColumnItem) =>
  toDepositPayImageUrl(item.platformLogo || '')

// 只有一个流水档时流水 Tab 被隐藏，加赠比例改挂到充值方式上；多个流水档时由流水 Tab 展示。
export const resolveDepositMethodBonusRatio = (item: QueryPaySubColumnItem) => {
  const configs = item.quickAmountConfigs ?? []
  return configs.length === 1 ? Number(configs[0].ratio) || 0 : 0
}

export const useDepositFiatFlow = (options: DepositFlowOptions) => {
  const { t, locale } = useI18n()
  const userStore = useUserStore()
  const { currentCurrencyCode } = useDisplayCurrency()
  const defaultPresetAmounts: number[] = []

  const isInitialLoading = ref(true)
  const payColumnLoaded = ref(false)
  const methodsLoading = ref(false)
  const categories = ref<QueryPayCategoryItem[]>([])
  const selectedCategoryId = ref<number | null>(null)
  const methods = ref<QueryPaySubColumnItem[]>([])
  const selectedMethod = ref<QueryPaySubColumnItem | null>(null)
  const discountList = computed(() => selectedMethod.value?.quickAmountConfigs ?? [])
  const selectedDiscountItem = ref<QueryPayQuickAmountConfig | null>(null)
  const presetAmounts = ref<number[]>([...defaultPresetAmounts])
  const amount = ref<number>()
  const orderInfo = ref<FiatOrderType>({ ...defaultFiatOrder })
  const orderPopShow = ref(false)
  const currentOrderId = ref('')
  const pollTimer = ref<number | null>(null)
  let methodsRequestId = 0
  let initialMethodApplied = false

  const localeCode = computed(() => getLanguageCode(String(locale.value)))

  const categoryOptions = computed<DepositCategoryOption[]>(() =>
    categories.value
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const sortDiff = (a.item.sortNo ?? 0) - (b.item.sortNo ?? 0)
        return sortDiff !== 0 ? sortDiff : a.index - b.index
      })
      .map(({ item }) => ({
        id: item.rowId,
        label: parseDepositLocalizedName(item.categoryName, localeCode.value)
      }))
  )

  const hasPanelContent = computed(() => categories.value.length > 0 || methods.value.length > 0)
  const isDepositDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
  const isManualAmountAllowed = computed(() => selectedMethod.value?.manualAmountIn !== 0)
  const selectedPayChannelCode = computed(() => {
    const method = selectedMethod.value
    if (!method) return ''
    return String(method.payChannelCode || resolvePayChannelTabKey(method.platformName) || '')
  })
  const wageringOptions = computed(() => createDepositWageringOptions(discountList.value))
  // 只有一个选项时不展示选择区，仍默认选中该项；没有充值方式时保留不可用提示。
  const showMethodSection = computed(() => methods.value.length !== 1)
  const showWageringSection = computed(() => wageringOptions.value.length > 1)
  const amountPlaceholder = computed(() =>
    isManualAmountAllowed.value
      ? t('deposit.deposit_amount_input_or_select_placeholder')
      : t('deposit.deposit_amount_preset_placeholder')
  )
  const isAmountInputHighlighted = computed(() => !isDepositDisabled.value)

  const emitHidden = (value: boolean) => {
    options.emitHidden?.(value)
  }

  const resolveMethodName = (item: QueryPaySubColumnItem) =>
    parseDepositSubColumnName(item, localeCode.value)

  const clearAmount = () => {
    amount.value = undefined
  }

  const selectPresetAmount = (preset: number) => {
    amount.value = preset
  }

  const syncPresetAmounts = () => {
    presetAmounts.value = normalizeDepositPresetAmounts(
      selectedDiscountItem.value?.quickAmount ?? [],
      defaultPresetAmounts
    )
  }

  const applySelectedMethod = (method: QueryPaySubColumnItem | null) => {
    selectedMethod.value = method
    selectedDiscountItem.value = discountList.value[0] ?? null
    syncPresetAmounts()
    clearAmount()
  }

  const selectWagering = (rowId: number) => {
    selectedDiscountItem.value = discountList.value.find(item => item.rowId === rowId) ?? null
    syncPresetAmounts()
    clearAmount()
  }

  const pickDefaultMethod = (list: QueryPaySubColumnItem[]) => {
    // 任务中心传入方式编码时首次加载优先精确选中，之后切换分类默认选第一个。
    const initialMethodCode = String(options.initialMethodCode ?? '').trim()
    if (!initialMethodApplied && initialMethodCode) {
      initialMethodApplied = true
      const matched = list.find(item => String(item.columnCode) === initialMethodCode)
      if (matched) return matched
    }

    return list[0] ?? null
  }

  const loadMethods = async (categoryId: number) => {
    const requestId = ++methodsRequestId
    methodsLoading.value = true

    try {
      const param: QueryPaySubColumnPageForm = {
        page: {
          current: 1,
          size: 9999
        },
        param: { categoryId }
      }
      const response = await Api.wallet.queryPaySubColumnPage(param)
      ensureApiBusinessSuccess(response)
      if (requestId !== methodsRequestId) return

      const result: QueryPaySubColumnItem[] = Array.isArray(response.result) ? response.result : []
      methods.value = result
      applySelectedMethod(pickDefaultMethod(result))
    } catch (error) {
      console.error('queryPaySubColumnPage failed', error)
      if (requestId !== methodsRequestId) return

      methods.value = []
      applySelectedMethod(null)
    } finally {
      if (requestId === methodsRequestId) {
        methodsLoading.value = false
      }
    }
  }

  const loadCategories = async () => {
    try {
      const response = await Api.wallet.queryPayCategoryList({
        languageCode: getLanguageCode(),
        currency: currentCurrencyCode.value || getCurrentCurrency()
      })
      ensureApiBusinessSuccess(response)
      categories.value = Array.isArray(response.result) ? response.result : []
    } catch (error) {
      console.error('queryPayCategoryList failed', error)
      categories.value = []
    }

    const firstCategoryId = categoryOptions.value[0]?.id ?? null
    selectedCategoryId.value = firstCategoryId
    if (firstCategoryId === null) {
      methodsRequestId++
      methods.value = []
      applySelectedMethod(null)
    } else {
      await loadMethods(firstCategoryId)
    }
    payColumnLoaded.value = true
    isInitialLoading.value = false
  }

  const selectCategory = async (categoryId: number) => {
    if (selectedCategoryId.value === categoryId) return

    selectedCategoryId.value = categoryId
    await loadMethods(categoryId)
  }

  const selectMethod = (method: QueryPaySubColumnItem) => {
    if (selectedMethod.value?.rowId === method.rowId) return
    applySelectedMethod(method)
  }

  const stopOrderPolling = () => {
    if (pollTimer.value !== null) {
      window.clearInterval(pollTimer.value)
      pollTimer.value = null
    }
  }

  const applyOrderDetail = (detail: QueryPayOrderByOrderIdResult) => {
    orderInfo.value = {
      order_no: String(detail.orderId ?? currentOrderId.value),
      created_at: formatTimestamp(detail.createTime),
      amount: Number(detail.busiAmount ?? amount.value ?? 0),
      method: selectedMethod.value ? resolveMethodName(selectedMethod.value) : '',
      method_icon: selectedMethod.value ? resolveDepositMethodIcon(selectedMethod.value) : '',
      currency: detail.currency || getCurrentCurrency(),
      bonus: String(detail.otherAmount ?? 0),
      type: 'Fiat',
      status: String(detail.status ?? 0)
    }
    orderPopShow.value = true
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
        void userStore.refreshBalance({ force: true })
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

  const doDeposit = async () => {
    if (isDepositDisabled.value) return
    const method = selectedMethod.value
    if (!method) return

    const param: SubmitPayOrderPageForm = {
      columnCode: String(method.columnCode),
      busiAmount: String(amount.value ?? 0),
      payChannelCode: selectedPayChannelCode.value,
      channelId: getDepositChannelId(resolveFlowBoolean(options.isMobile)),
      subColumnCode: method.rowId,
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
        method: resolveMethodName(method),
        method_icon: resolveDepositMethodIcon(method),
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

  watch(currentCurrencyCode, (value, oldValue) => {
    if (!value || value === oldValue) return
    void loadCategories()
  })

  onMounted(() => {
    void loadCategories()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    stopOrderPolling()
  })

  return {
    isInitialLoading,
    payColumnLoaded,
    methodsLoading,
    hasPanelContent,
    categoryOptions,
    selectedCategoryId,
    methods,
    selectedMethod,
    discountList,
    selectedDiscountItem,
    presetAmounts,
    amount,
    orderInfo,
    orderPopShow,
    isDepositDisabled,
    isManualAmountAllowed,
    wageringOptions,
    showMethodSection,
    showWageringSection,
    amountPlaceholder,
    isAmountInputHighlighted,
    clearAmount,
    selectPresetAmount,
    resolveMethodIcon: resolveDepositMethodIcon,
    resolveMethodBonusRatio: resolveDepositMethodBonusRatio,
    resolveMethodName,
    selectWagering,
    selectCategory,
    selectMethod,
    doDeposit,
    handleClose,
    handleHidden
  }
}
