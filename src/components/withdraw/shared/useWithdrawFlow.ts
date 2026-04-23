import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useIsMobile } from '@/composables/useMediaQuery'
import BTCIcon from '@/static/img/crypto/BTC.png'
import ETHIcon from '@/static/img/crypto/ETH.png'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import { usePaymentMethodsFlow } from '@/components/paymentMethods/shared/usePaymentMethodsFlow'
import type {
  AccountCardOption,
  PaymentMethodsOption
} from '@/components/paymentMethods/shared/usePaymentMethodsService'
import { DEFAULT_COINS } from '@/components/paymentMethods/shared/cryptoCoins'
import {
  FastAmountItem,
  QueryWithdrawConfigByMemberResponse,
  SubmitTransferOrderForm,
  WithdrawOrderDetail
} from '@/api/interface/withdraw'
import Api from '@/api'
import { getBalanceByCurrency } from '@/utils/balance'
import { getCurrentCurrency, getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import { showToast } from 'vant'
import { formatTimestamp } from '@/utils/date'
import { StringExtension } from '@/utils/string-extension'
import { isOrderTerminalStatus } from '@/constants/orderStatus'

export type WithdrawTabType = 'Crypto' | 'Fiat'
export type WithdrawOrderStatus = 'processing' | 'completed' | 'cancelled'

export type WithdrawTab = {
  value: WithdrawTabType
  label: string
}

export interface WithdrawOrderViewData {
  orderId: string
  orderNo: string
  amountText: string
  createdAt: string
  methodLabel: string
  methodIcon: string
  status: WithdrawOrderStatus
}

const COIN_ICON_MAP: Record<string, string> = {
  USDT: USDTIcon,
  ETH: ETHIcon,
  BTC: BTCIcon,
  USDC: USDCIcon
}
const WITHDRAW_ORDER_POLL_INTERVAL_MS = 10 * 1000

const DEFAULT_CRYPTO_OPTIONS: PaymentMethodsOption[] = DEFAULT_COINS.filter(
  item => item.name !== 'USDT'
).map(item => ({
  customIcon: COIN_ICON_MAP[item.name] || USDTIcon,
  customRoundIcon: COIN_ICON_MAP[item.name] || USDTIcon,
  label: item.name,
  kind: 'crypto',
  networks: item?.networks ?? []
}))

const parseNumericRate = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim()

    if (!normalized) {
      return null
    }

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const parseRateConfig = (value: unknown): Record<string, unknown> | null => {
  if (!value) {
    return null
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  if (typeof value === 'string') {
    const normalized = value.trim()

    if (!normalized) {
      return null
    }

    try {
      const parsed = JSON.parse(normalized) as unknown

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch (error) {
      console.error(error)
    }
  }

  return null
}

const resolveCoinExchangeRate = (
  siteConfig: Record<string, unknown> | null,
  coinCode: string,
  currencyCode: string
): number | null => {
  if (!siteConfig) {
    return null
  }

  const coinConfig =
    siteConfig[coinCode] ?? siteConfig[coinCode.toUpperCase()] ?? siteConfig[coinCode.toLowerCase()]

  const rateMap = parseRateConfig(coinConfig)

  if (!rateMap) {
    return null
  }
  const candidateKeys = [currencyCode, currencyCode.toUpperCase(), currencyCode.toLowerCase()]

  for (const key of candidateKeys) {
    const parsed = parseNumericRate(rateMap[key])

    if (parsed !== null) {
      return parsed
    }
  }

  return null
}

const formatWithdrawAmountText = (amount: string | number | undefined, currencyCode: string) => {
  const nextAmount = Number(amount ?? 0)
  const amountText = Number.isFinite(nextAmount) ? nextAmount.toFixed(0) : String(amount ?? 0)

  return `${amountText}${currencyCode}`
}

const getCurrencyFromAmountText = (value?: string) => {
  const match = String(value ?? '')
    .trim()
    .match(/[A-Za-z]+$/)

  return match?.[0] ?? ''
}

const toWithdrawOrderStatus = (status: unknown): WithdrawOrderStatus => {
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase()

  if (normalized === '3') {
    return 'completed'
  }

  if (normalized === '2' || normalized === '5') {
    return 'cancelled'
  }

  return 'processing'
}

export const useWithdrawFlow = () => {
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const localeStore = useLocaleStore()
  const userStore = useUserStore()
  const { currentCurrency } = storeToRefs(localeStore)
  const { acctInfo } = storeToRefs(userStore)
  const siteConfigStore = useSiteConfigStore()
  const {
    canAddAccount,
    cryptoPaymentMethodsOptions,
    fiatPaymentMethodsOptions,
    selectPaymentMethodsOption,
    accountCardOptions,
    selectAccountCardOption,
    hasTransactionPassword,
    kindReminderVisible,
    maskedPhoneNumber,
    resolvedAreaCode,
    resolvedTelephone,
    smsCountdownTrigger,
    isSubmittingAdd,
    isCheckingSmsCode,
    isSendingSmsCode,
    isCheckingPaymentPassword,
    smsVerificationVisible,
    paymentPasswordVisible,
    addAccountOptionVisible,
    closeAddAcountCard,
    addAcountCard,
    closeSmsVerification,
    handleAddAccountOptionSmsVerificationResend,
    handleAddAccountOptionSmsVerificationConfirm,
    closePaymentPasswordVerification,
    handleAddAccountOptionPaymentPasswordVerificationConfirm,
    handleMethodTabClick,
    openAddAcountCard,
    handleKindReminderSettings,
    handleKindReminderSkid,
    modifyDefaultAccountCard,
    initialization
  } = usePaymentMethodsFlow()
  const withdrawTabs = computed<WithdrawTab[]>(() => [
    { value: 'Crypto', label: t('withdraw.crypto') },
    { value: 'Fiat', label: t('withdraw.fiat') }
  ])
  const selectWithdrawTab = ref<WithdrawTab>()
  const accountListPopVisible = ref(false)
  const quickAmounts = ref<FastAmountItem[]>([])
  const amount = ref<number>()
  const isRefreshingBalance = ref(false)
  const withdrawPaymentPasswordVisible = ref(false)
  const withdrawSmsVerificationVisible = ref(false)
  const withdrawOrderVisible = ref(false)
  const pendingWithdrawPaymentPassword = ref<string>()
  const pendingWithdrawSmsCode = ref<string>()
  const isWithdrawSendingSmsCode = ref(false)
  const isWithdrawCheckingSmsCode = ref(false)
  const isWithdrawCheckingPaymentPassword = ref(false)
  const withdrawSmsCountdownTrigger = ref(0)
  const isWithdrawSubmitting = ref(false)
  const withdrawOrder = ref<WithdrawOrderViewData>()
  const hasLoadedWithdraw = ref(false)
  let withdrawOrderPollTimer: number | null = null
  let isWithdrawOrderPolling = false

  const cryptoPaymentCodes = [5]
  const withdrawVerifyWay = computed(() =>
    String(
      (
        siteConfigStore.config as
          | {
              baseSiteConfig?: {
                isWithdrawalPasswordRequired?: string | number
              }
            }
          | null
          | undefined
      )?.baseSiteConfig?.isWithdrawalPasswordRequired ?? ''
    ).trim()
  )
  const needWithdrawBusiPwd = computed(() => withdrawVerifyWay.value === '1')
  const needWithdrawTelephoneSms = computed(() => withdrawVerifyWay.value === '2')
  const syncSelectedAccountCardOption = () => {
    const options = accountCardOptions.value

    if (!options.length) {
      selectAccountCardOption.value = undefined
      return
    }

    const currentRowId = selectAccountCardOption.value?.rowId
    const hasCurrentOption =
      currentRowId != null && options.some(option => String(option.rowId) === String(currentRowId))

    if (!hasCurrentOption) {
      selectAccountCardOption.value = options[0]
    }
  }

  const handleClickWithdrawTab = async (tab: WithdrawTab) => {
    if (!tab) return
    if (tab.value === 'Crypto') {
      await cryptoInitialization()
      return
    }

    if (tab.value === 'Fiat') {
      await fiatInitialization()
      return
    }
  }

  const cryptoWithdrawMethodsOptions = computed<PaymentMethodsOption[]>(() => {
    const modifiedSource = cryptoPaymentMethodsOptions.value.map(item => {
      if (item.paymentCode && cryptoPaymentCodes.includes(Number(item.paymentCode ?? 0))) {
        return { ...item, customIcon: USDTIcon, customRoundIcon: USDTIcon }
      }
      return item
    })
    return [...modifiedSource, ...DEFAULT_CRYPTO_OPTIONS]
  })

  const hasSelectedReceiveAddress = computed(() => {
    return Boolean(selectAccountCardOption.value)
  })

  const isAmountDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
  const isWithdrawDisabled = computed<boolean>(() => {
    return Boolean(isAmountDisabled.value || !hasSelectedReceiveAddress.value)
  })

  const resolvedCurrency = computed(() => {
    const nextCurrency = String(currentCurrency.value ?? '').trim()

    if (!nextCurrency || nextCurrency.toLowerCase() === 'none') {
      return getCurrentCurrency()
    }

    return nextCurrency
  })
  const balanceAmount = computed(() => getBalanceByCurrency(acctInfo.value, resolvedCurrency.value))

  const formattedBalance = computed(() =>
    getFormattedBalance(balanceAmount.value, resolvedCurrency.value, 2)
  )

  const youGetRate = computed(() => {
    return resolveCoinExchangeRate(
      siteConfigStore.config as Record<string, unknown> | null,
      selectPaymentMethodsOption.value?.label ?? 'USDT',
      resolvedCurrency.value
    )
  })

  const youGetAmount = computed(() => {
    const nextAmount = Number(amount.value ?? 0)
    const nextRate = youGetRate.value

    if (!Number.isFinite(nextAmount) || nextAmount <= 0 || nextRate === null) {
      return ''
    }

    return String(Math.floor(nextAmount / nextRate))
  })

  const currencySymbol = computed(() => getCurrencySymbol(resolvedCurrency.value))

  const openAcountListPop = () => {
    if (!hasTransactionPassword.value) {
      kindReminderVisible.value = true
      return
    }

    accountListPopVisible.value = true
  }

  const closeAcountListPop = () => {
    accountListPopVisible.value = false
  }

  const handleSelectedAccountOption = (option: AccountCardOption) => {
    selectAccountCardOption.value = option
  }

  const applyQuickAmount = (quickAmount: FastAmountItem) => {
    const nextAmount = Number(quickAmount.amount ?? 0)

    if (Number.isFinite(nextAmount) && nextAmount > 0) {
      amount.value = nextAmount
    }
  }

  const parseQuickAmounts = (value?: string) => {
    if (!value) {
      return []
    }

    return value
      .split(',')
      .map(item => Number(item.trim()))
      .filter(item => Number.isFinite(item) && item > 0)
      .map<FastAmountItem>(item => ({ amount: item }))
  }

  const loadQuickAmounts = async () => {
    if (
      selectPaymentMethodsOption.value?.paymentCode == null ||
      selectPaymentMethodsOption.value?.paymentCode === ''
    ) {
      quickAmounts.value = []
      return
    }

    const requestParams = {
      paymentCode: selectPaymentMethodsOption.value.paymentCode
    }

    try {
      const response = await Api.withdraw.queryFastAmount(requestParams)
      const result = Array.isArray(response.result) ? response.result : []

      if (result.length) {
        quickAmounts.value = result
        return
      }

      quickAmounts.value = parseQuickAmounts(selectPaymentMethodsOption.value?.quickAmts as string)
    } catch (error) {
      console.error(error)
      quickAmounts.value = parseQuickAmounts(selectPaymentMethodsOption.value?.quickAmts as string)
    }
  }

  const refreshBalance = async () => {
    if (isRefreshingBalance.value) {
      return
    }

    isRefreshingBalance.value = true

    try {
      await userStore.refreshAcctInfo()
    } finally {
      window.setTimeout(() => {
        isRefreshingBalance.value = false
      }, 600)
    }
  }

  const handleOpenKindReminder = () => {
    if (kindReminderVisible.value) {
      return
    }

    withdrawPaymentPasswordVisible.value = false
    withdrawSmsVerificationVisible.value = false
    kindReminderVisible.value = true
  }

  const resetWithdrawFlow = () => {
    stopWithdrawOrderPolling()
    kindReminderVisible.value = false
    withdrawPaymentPasswordVisible.value = false
    withdrawSmsVerificationVisible.value = false
    withdrawOrderVisible.value = false
    pendingWithdrawPaymentPassword.value = undefined
    pendingWithdrawSmsCode.value = undefined
  }

  const closeWithdrawOrder = () => {
    stopWithdrawOrderPolling()
    withdrawOrderVisible.value = false
  }

  const sendSmsCode = async () => {
    if (isWithdrawSendingSmsCode.value) {
      return false
    }

    if (!resolvedTelephone.value) {
      showToast({
        message: 'Phone number unavailable',
        type: 'fail',
        duration: 3000
      })
      return false
    }

    try {
      isWithdrawSendingSmsCode.value = true
      const response = await Api.auth.sendSms({
        telephone: resolvedTelephone.value,
        areaCode: resolvedAreaCode.value
      })

      if (response?.code === 'C2') {
        withdrawSmsCountdownTrigger.value += 1
        return true
      }

      return false
    } finally {
      isWithdrawSendingSmsCode.value = false
    }
  }

  const handleSmsVerificationResend = async () => {
    await sendSmsCode()
  }

  const closeWithdrawSmsVerification = () => {
    withdrawSmsVerificationVisible.value = false
    pendingWithdrawSmsCode.value = undefined
  }

  const handleWithdrawSmsVerificationConfirm = async (code: string) => {
    if (isWithdrawCheckingSmsCode.value || isWithdrawSubmitting.value) {
      return false
    }

    try {
      isWithdrawCheckingSmsCode.value = true
      const response = await Api.auth.checkSms({
        telephone: resolvedTelephone.value,
        areaCode: resolvedAreaCode.value,
        smsCode: code
      })

      if (response?.code !== 'C2') {
        return false
      }

      pendingWithdrawSmsCode.value = code

      return submitWithdraw()
    } finally {
      isWithdrawCheckingSmsCode.value = false
    }
  }

  const closeWithdrawPaymentPasswordVerification = () => {
    withdrawPaymentPasswordVisible.value = false
    pendingWithdrawPaymentPassword.value = undefined
  }

  const handleWithdrawPaymentPasswordVerificationConfirm = async (password: string) => {
    if (isWithdrawCheckingPaymentPassword.value || isWithdrawSubmitting.value) {
      return false
    }

    try {
      isWithdrawCheckingPaymentPassword.value = true
      pendingWithdrawPaymentPassword.value = password
      return submitWithdraw()
    } finally {
      isWithdrawCheckingPaymentPassword.value = false
    }
  }

  const ensureNoPendingWithdrawOrder = async () => {
    const response = await Api.withdraw.queryWithdrawOrderList()
    const orderList = Array.isArray(response?.result) ? response.result : []

    if (orderList.length > 0) {
      throw new Error('withdraw.pending_order_exists')
    }
  }

  const ensureWithdrawTurnoverRequirement = async () => {
    const response = await Api.withdraw.queryNeedBetAmountForApp()
    const requiredBetAmount = Number(response?.result ?? 0)

    if (requiredBetAmount > 0) {
      throw new Error('withdraw.bet_requirement_unfinished')
    }
  }

  const queryWithdrawSubmissionConfig = async (): Promise<
    QueryWithdrawConfigByMemberResponse['result']
  > => {
    const accountRowId = selectAccountCardOption.value?.rowId

    if (!selectAccountCardOption.value || !accountRowId) {
      throw new Error('withdraw.missing_account')
    }

    const response = await Api.withdraw.queryWithdrawConfigByMember({ accountNo: accountRowId })
    return response?.result
  }

  const amountVerification = () => {
    const nextAmount = Number(amount.value ?? 0)
    const nextBalanceAmount = Number(balanceAmount.value ?? 0)

    if (
      Number.isFinite(nextAmount) &&
      Number.isFinite(nextBalanceAmount) &&
      nextAmount > nextBalanceAmount
    ) {
      throw new Error('withdraw.balance_insufficient')
    }
  }

  const buildWithdrawOrderViewData = (
    detail?: WithdrawOrderDetail | null
  ): WithdrawOrderViewData => {
    const previousOrder = withdrawOrder.value
    const currencyCode =
      detail?.currency ||
      detail?.currencyCode ||
      getCurrencyFromAmountText(previousOrder?.amountText) ||
      resolvedCurrency.value
    const amountText = formatWithdrawAmountText(detail?.busiAmount ?? amount.value, currencyCode)
    const orderId = String(detail?.orderId ?? previousOrder?.orderId ?? '')
    const orderNo = String(detail?.orderNo ?? previousOrder?.orderNo ?? orderId)
    const createdAt = formatTimestamp(
      (detail?.createTime ?? null) as string | number | null | undefined
    )
    const methodLabel = String(
      detail?.paymentName ??
        selectAccountCardOption.value?.label ??
        previousOrder?.methodLabel ??
        ''
    )
    const methodIcon = String(
      selectAccountCardOption.value?.customRoundIcon ?? previousOrder?.methodIcon ?? ''
    )

    return {
      orderId,
      orderNo,
      amountText,
      createdAt: createdAt || previousOrder?.createdAt || '',
      methodLabel,
      methodIcon,
      status: toWithdrawOrderStatus(detail?.status)
    }
  }

  const applyWithdrawOrderDetail = (detail?: WithdrawOrderDetail | null) => {
    withdrawOrder.value = buildWithdrawOrderViewData(detail)
  }

  const queryAndApplyWithdrawOrder = async (orderId: string | number) => {
    const detailResponse = await Api.withdraw.queryTheWithdrawOrder({ orderId })
    const detail = detailResponse?.result

    applyWithdrawOrderDetail(detail ?? { orderId })

    return detail
  }

  const stopWithdrawOrderPolling = () => {
    if (withdrawOrderPollTimer !== null) {
      window.clearInterval(withdrawOrderPollTimer)
      withdrawOrderPollTimer = null
    }

    isWithdrawOrderPolling = false
  }

  const pollWithdrawOrder = async (orderId: string | number) => {
    if (isWithdrawOrderPolling) {
      return
    }

    try {
      isWithdrawOrderPolling = true
      const detail = await queryAndApplyWithdrawOrder(orderId)

      if (!detail) {
        return
      }

      if (isOrderTerminalStatus('withdraw', detail.status)) {
        stopWithdrawOrderPolling()
        refreshBalance()
      }
    } catch (error) {
      console.error('queryTheWithdrawOrder polling failed', error)
    } finally {
      isWithdrawOrderPolling = false
    }
  }

  const startWithdrawOrderPolling = (orderId: string | number, status?: string | number) => {
    stopWithdrawOrderPolling()

    if (isOrderTerminalStatus('withdraw', status)) {
      return
    }

    withdrawOrderPollTimer = window.setInterval(() => {
      void pollWithdrawOrder(orderId)
    }, WITHDRAW_ORDER_POLL_INTERVAL_MS)
  }

  const buildSubmitTransferOrderForm = (withdrawNumber = 0): SubmitTransferOrderForm => {
    const accountNo = selectAccountCardOption.value?.rowId ?? ''
    const columnCode = selectAccountCardOption.value?.cardType ?? ''
    let modifyBy
    if (needWithdrawBusiPwd.value) {
      modifyBy = pendingWithdrawPaymentPassword.value
    }

    if (needWithdrawTelephoneSms.value) {
      modifyBy = pendingWithdrawSmsCode.value
    }

    return {
      busiAmount: String(amount.value),
      accountNo,
      withdrawNumber,
      channelId: isMobile.value ? 4 : 3,
      columnCode,
      currencyCode: resolvedCurrency.value,
      modifyBy: modifyBy ? StringExtension.md5(modifyBy) : modifyBy
    }
  }

  const submitWithdraw = async () => {
    if (isWithdrawSubmitting.value || isWithdrawDisabled.value) {
      return
    }

    try {
      stopWithdrawOrderPolling()
      isWithdrawSubmitting.value = true
      amountVerification()
      await ensureNoPendingWithdrawOrder()
      await ensureWithdrawTurnoverRequirement()
      const submissionConfig = await queryWithdrawSubmissionConfig()
      const nextWithdrawNumber = Number(submissionConfig?.mandatoryPayment ?? 0) === 1 ? 1 : 0
      const submitResponse = await Api.withdraw.submitTransferOrder(
        buildSubmitTransferOrderForm(nextWithdrawNumber)
      )
      const submitResult = submitResponse?.result
      const orderId = submitResult?.orderId

      if (!orderId) {
        throw new Error(String(submitResponse?.message || 'withdraw.submit_failed'))
      }

      const detail = await queryAndApplyWithdrawOrder(orderId)
      withdrawOrderVisible.value = true
      startWithdrawOrderPolling(orderId, detail?.status)
      refreshBalance()
    } catch (error) {
      const messageKey = error instanceof Error ? error.message : 'withdraw.submit_failed'

      showToast({
        message: messageKey.startsWith('withdraw.') ? t(messageKey) : messageKey,
        type: 'fail',
        duration: 3000
      })
      console.log(error)
    } finally {
      isWithdrawSubmitting.value = false
      resetWithdrawState({ resetSelectedAccount: false })
    }
  }

  const beginSubmitWithdraw = async () => {
    await siteConfigStore.initSiteConfig()

    if (!hasTransactionPassword.value) {
      handleOpenKindReminder()
      return
    }

    if (needWithdrawBusiPwd.value) {
      withdrawPaymentPasswordVisible.value = true
      return
    }

    if (needWithdrawTelephoneSms.value) {
      withdrawSmsVerificationVisible.value = true
      await sendSmsCode()
      return
    }

    await submitWithdraw()
  }

  const handleWithdrawMethodTabClick = async (option: PaymentMethodsOption) => {
    await handleMethodTabClick(option)
    amount.value = undefined
    syncSelectedAccountCardOption()
  }

  const cryptoTabClick = async () => {
    if (!cryptoPaymentMethodsOptions.value.length) {
      return
    }

    const firstCryptoMethod =
      cryptoWithdrawMethodsOptions.value.find(
        item => item.paymentCode && cryptoPaymentCodes.includes(Number(item.paymentCode ?? 0))
      ) ?? cryptoPaymentMethodsOptions.value[0]

    await handleWithdrawMethodTabClick(firstCryptoMethod)
  }

  const fiatTabClick = async () => {
    if (!fiatPaymentMethodsOptions.value.length) {
      return
    }

    await handleWithdrawMethodTabClick(fiatPaymentMethodsOptions.value[0])
  }

  const resetWithdrawState = ({
    resetSelectedAccount = true
  }: { resetSelectedAccount?: boolean } = {}) => {
    withdrawPaymentPasswordVisible.value = false
    withdrawSmsVerificationVisible.value = false
    if (resetSelectedAccount) {
      selectAccountCardOption.value = undefined
    }
    withdrawSmsCountdownTrigger.value = 0
    pendingWithdrawPaymentPassword.value = undefined
    pendingWithdrawSmsCode.value = undefined
  }

  const cryptoInitialization = async () => {
    try {
      hasLoadedWithdraw.value = false
      await initialization()
      selectWithdrawTab.value = withdrawTabs.value[0]
      await cryptoTabClick()
    } catch (error) {
      console.log(error)
    } finally {
      hasLoadedWithdraw.value = true
      resetWithdrawState({ resetSelectedAccount: false })
    }
  }

  const fiatInitialization = async () => {
    try {
      hasLoadedWithdraw.value = false
      await initialization()
      selectWithdrawTab.value = withdrawTabs.value[1]
      await fiatTabClick()
    } catch (error) {
      console.log(error)
    } finally {
      hasLoadedWithdraw.value = true
      resetWithdrawState({ resetSelectedAccount: false })
    }
  }

  watch(
    () => selectPaymentMethodsOption.value,
    () => {
      loadQuickAmounts()
    }
  )

  watch(accountCardOptions, () => {
    syncSelectedAccountCardOption()
  })

  onUnmounted(() => {
    stopWithdrawOrderPolling()
  })

  return {
    smsCountdownTrigger,
    isSubmittingAdd,
    isCheckingSmsCode,
    isSendingSmsCode,
    isCheckingPaymentPassword,
    smsVerificationVisible,
    paymentPasswordVisible,
    addAccountOptionVisible,
    closeAddAcountCard,
    addAcountCard,
    closeSmsVerification,
    handleAddAccountOptionSmsVerificationResend,
    handleAddAccountOptionSmsVerificationConfirm,
    closePaymentPasswordVerification,
    handleAddAccountOptionPaymentPasswordVerificationConfirm,
    modifyDefaultAccountCard,

    withdrawOrder,
    withdrawTabs,
    selectWithdrawTab,
    cryptoWithdrawMethodsOptions,
    fiatPaymentMethodsOptions,
    selectPaymentMethodsOption,
    accountCardOptions,
    selectAccountCardOption,
    canAddAccount,
    accountListPopVisible,
    hasSelectedReceiveAddress,
    amount,
    quickAmounts,
    isWithdrawDisabled,
    currencySymbol,
    formattedBalance,
    youGetAmount,
    isRefreshingBalance,
    kindReminderVisible,
    withdrawPaymentPasswordVisible,
    withdrawSmsVerificationVisible,
    withdrawOrderVisible,
    maskedPhoneNumber,
    hasLoadedWithdraw,
    isWithdrawSendingSmsCode,
    isWithdrawCheckingSmsCode,
    isWithdrawSubmitting,
    withdrawSmsCountdownTrigger,
    resolvedCurrency,
    handleWithdrawMethodTabClick,
    handleClickWithdrawTab,
    openAcountListPop,
    closeAcountListPop,
    openAddAcountCard,
    handleSelectedAccountOption,
    applyQuickAmount,
    refreshBalance,
    submitWithdraw,
    handleOpenKindReminder,
    handleKindReminderSettings,
    handleKindReminderSkid,
    resetWithdrawFlow,
    closeWithdrawOrder,
    beginSubmitWithdraw,
    handleSmsVerificationResend,
    closeWithdrawSmsVerification,
    handleWithdrawSmsVerificationConfirm,
    closeWithdrawPaymentPasswordVerification,
    handleWithdrawPaymentPasswordVerificationConfirm,
    cryptoInitialization,
    fiatInitialization
  }
}
