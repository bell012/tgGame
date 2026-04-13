import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { FastAmountItem, MemberCardItem } from '@/api/interface/withdraw'
import BNBIcon from '@/static/img/crypto/BNB.png'
import BTCIcon from '@/static/img/crypto/BTC.png'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import ETHIcon from '@/static/img/crypto/ETH.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import type { WithdrawManagerItem } from '@/api/interface/withdraw'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useMemberCardDefaultFlow } from '@/composables/useMemberCardDefaultFlow'
import { useMemberCardVerificationFlow } from '@/composables/useMemberCardVerificationFlow'
import { getBalanceByCurrency } from '@/utils/balance'
import { getCurrentCurrency, getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import { showToast } from 'vant'
import { DEFAULT_COINS, resolveCoinNetworks } from '@/components/paymentMethods/shared/cryptoCoins'
import { splitWithdrawManagerMethods } from './withdrawManager'
import { requestOpenWithdrawKindReminder } from './useWithdrawFlow'

export interface CryptoOption {
  code: string
  name: string
  icon: string
  raw?: WithdrawManagerItem
}

export interface CryptoReceiveAddressItem {
  id: string
  coinCode: string
  icon: string
  defaultCard: number
  network: string
  address: string
}

const COIN_ICON_MAP: Record<string, string> = {
  USDT: USDTIcon,
  ETH: ETHIcon,
  BTC: BTCIcon,
  USDC: USDCIcon
}

const DEFAULT_CRYPTO_OPTIONS: CryptoOption[] = DEFAULT_COINS.map(item => ({
  name: item.name,
  code: item.name,
  icon: COIN_ICON_MAP[item.name] || USDTIcon
}))

const DEFAULT_EXTRA_CRYPTO_ICON_MAP: Record<string, string> = {
  DOGE: DOGEIcon,
  TRX: TRXIcon,
  BNB: BNBIcon
}

const normalizeNetworkValue = (value: string) => {
  const match = value.match(/\(([^)]+)\)/)

  if (match?.[1]) {
    return match[1].trim()
  }

  return value.trim()
}

const buildNetworkOptions = (coinCode: string) => {
  const networks = resolveCoinNetworks(coinCode)

  if (!networks.length) {
    return [{ label: 'Tron（TRC20）', value: 'TRC20' }]
  }

  return networks.map(item => ({
    label: item.text,
    value: normalizeNetworkValue(item.text)
  }))
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

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase()

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

const resolveCryptoIcon = (method: WithdrawManagerItem) => {
  const paymentName = normalizeText(method.paymentName)
  const paymentCode = normalizeText(method.paymentCode)
  const target = `${paymentName} ${paymentCode}`

  if (target.includes('USDT')) return USDTIcon
  if (target.includes('ETH')) return ETHIcon
  if (target.includes('BTC')) return BTCIcon
  if (target.includes('USDC')) return USDCIcon
  if (target.includes('DOGE')) return DEFAULT_EXTRA_CRYPTO_ICON_MAP.DOGE
  if (target.includes('TRX')) return DEFAULT_EXTRA_CRYPTO_ICON_MAP.TRX
  if (target.includes('BNB')) return DEFAULT_EXTRA_CRYPTO_ICON_MAP.BNB

  return USDTIcon
}

const resolveVirtualCryptoOption = (method?: WithdrawManagerItem | null): CryptoOption => {
  if (!method) {
    return DEFAULT_CRYPTO_OPTIONS[0]
  }

  const target = `${normalizeText(method.paymentName)} ${normalizeText(method.paymentCode)}`
  const matchedOption = DEFAULT_CRYPTO_OPTIONS.find(option => target.includes(option.code))

  return matchedOption ?? { ...DEFAULT_CRYPTO_OPTIONS[0], icon: resolveCryptoIcon(method) }
}

const matchCryptoMemberCard = (account: MemberCardItem, method: WithdrawManagerItem | null) => {
  if (!method) {
    return false
  }

  const accountCardType = normalizeText(account.type)
  const accountPaymentCode = normalizeText(account.cardType)
  const methodCardType = normalizeText(method.cardType)
  const methodPaymentCode = normalizeText(method.paymentCode)

  return [accountCardType, accountPaymentCode].some(
    value => value && value === methodCardType && value === methodPaymentCode
  )
}

export function useWithdrawCrypto() {
  const FAIL_TOAST_DURATION = 3000
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const localeStore = useLocaleStore()
  const siteConfigStore = useSiteConfigStore()
  const userStore = useUserStore()
  const { currentCurrency } = storeToRefs(localeStore)
  const { acctInfo } = storeToRefs(userStore)

  const amount = ref<number>()
  const coinMoreShow = ref(false)
  const coinCode = ref('USDT')
  const currency = ref('USDT')
  const selectNetwork = ref('TRC20')
  const matchedWithdrawMethod = ref<WithdrawManagerItem | null>(null)
  const isRefreshingBalance = ref(false)
  const isLoadingReceiveAddresses = ref(false)
  const hasLoadedReceiveAddresses = ref(false)
  const hasReceiveAddressesLoadError = ref(false)
  const addressListVisible = ref(false)
  const addAddressVisible = ref(false)
  const reopenAddressListAfterAdd = ref(false)
  const receiveAddresses = ref<CryptoReceiveAddressItem[]>([])
  const selectedAddressId = ref<string | null>(null)
  const pendingAddress = ref('')
  const quickAmounts = ref<FastAmountItem[]>([])

  const visibleCoins = computed(() => DEFAULT_CRYPTO_OPTIONS)
  const currencyOptions = computed(() =>
    DEFAULT_CRYPTO_OPTIONS.map(item => ({
      label: item.name,
      value: item.code,
      icon: item.icon
    }))
  )
  const currencyOption = computed(() => {
    return currencyOptions.value.find(option => option.value === currency.value)
  })
  const hasTransactionPassword = computed(() =>
    Boolean(String(userStore.userInfo?.busiPwd ?? '').trim())
  )
  const {
    maskedPhoneNumber,
    isSendingSmsCode: isSendingAddAddressSmsCode,
    isCheckingSmsCode: isCheckingAddAddressSmsCode,
    isSubmitting: isSubmittingAddAddress,
    paymentPasswordVisible: addAddressPaymentPasswordVisible,
    smsVerificationVisible: addAddressSmsVerificationVisible,
    smsCountdownTrigger: addAddressSmsCountdownTrigger,
    beginSubmit: beginAddAddressSubmit,
    closeSmsVerification: closeAddAddressSmsVerificationState,
    closePaymentPasswordVerification: closeAddAddressPaymentPasswordState,
    handleSmsVerificationResend: handleAddAddressSmsVerificationResend,
    handleSmsVerificationConfirm: handleAddAddressSmsVerificationConfirm,
    handlePaymentPasswordVerificationConfirm: handleAddAddressPaymentPasswordConfirm
  } = useMemberCardVerificationFlow<{ address: string; network: string }>({
    buildRequestData: (data, verifyCode) => {
      const nextCardType = Number(matchedWithdrawMethod.value?.cardType ?? 0)

      if (!nextCardType) {
        return null
      }

      return {
        accountNo: data.address,
        accountName: data.network,
        accountSubNo: '',
        cardType: nextCardType,
        defaultCard: 1,
        remark: '',
        type: 5,
        validDate: 0,
        ...(verifyCode ? { verifyCode } : {})
      }
    },
    submitRequest: async requestData => {
      try {
        const response = await Api.withdraw.addMemberCard(requestData)

        if (response?.code !== 'C2') {
          return false
        }

        return true
      } catch (error) {
        console.error(error)
        showToast({
          message: 'Add address failed',
          type: 'fail',
          duration: FAIL_TOAST_DURATION
        })
        return false
      }
    },
    onRequireTransactionPassword: () => {
      requestOpenWithdrawKindReminder()
    },
    onSubmitted: async () => {
      const nextAddress = pendingAddress.value.trim()
      await loadReceiveAddresses()
      syncSelectedAddress()
      selectedAddressId.value =
        receiveAddresses.value.find(item => item.address === nextAddress)?.id ?? null
      closeAddAddress()
    },
    onSubmitFailed: () => {
      reopenAddAddressForm()
    }
  })
  const availableReceiveAddresses = computed(() =>
    receiveAddresses.value.filter(item => item.coinCode === currency.value)
  )
  const selectedReceiveAddress = computed(
    () => availableReceiveAddresses.value.find(item => item.id === selectedAddressId.value) ?? null
  )
  const address = computed(() => selectedReceiveAddress.value?.address || '')
  const hasSelectedReceiveAddress = computed(() => Boolean(selectedReceiveAddress.value))
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
      coinCode.value,
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
  const networkOptions = computed(() => buildNetworkOptions(currency.value))
  const withdrawCardTypeLimit = computed(() => {
    const value = Number(
      (
        siteConfigStore.config as
          | {
              baseSiteConfig?: {
                withdraw_card_type_num?: string | number
              }
            }
          | null
          | undefined
      )?.baseSiteConfig?.withdraw_card_type_num ?? 0
    )

    return Number.isFinite(value) && value > 0 ? value : 0
  })
  const canAddAddress = computed(() => {
    const limit = withdrawCardTypeLimit.value

    if (!limit) {
      return true
    }

    return availableReceiveAddresses.value.length < limit
  })
  const isAmountDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
  const isWithdrawDisabled = computed(
    () => isAmountDisabled.value || !selectedReceiveAddress.value?.address.trim()
  )

  const ensureCanManageReceiveAddress = () => {
    if (hasTransactionPassword.value) {
      return true
    }

    addressListVisible.value = false
    addAddressVisible.value = false
    requestOpenWithdrawKindReminder()
    return false
  }

  const syncSelectedAddress = ({ preserveCurrent = true }: { preserveCurrent?: boolean } = {}) => {
    if (!preserveCurrent) {
      selectedAddressId.value = null
      return
    }

    const matchedAddress = availableReceiveAddresses.value.find(
      item => item.id === selectedAddressId.value
    )

    if (!matchedAddress && isMobile.value) {
      selectedAddressId.value = null
      return
    }

    const nextAddress =
      matchedAddress ?? availableReceiveAddresses.value.find(item => item.defaultCard === 1) ?? null

    selectedAddressId.value = nextAddress?.id ?? null
  }

  const loadReceiveAddresses = async () => {
    const nextCardType = matchedWithdrawMethod.value?.cardType
    const requestData =
      nextCardType != null && String(nextCardType).trim() ? { cardType: nextCardType } : undefined
    isLoadingReceiveAddresses.value = true
    hasReceiveAddressesLoadError.value = false

    try {
      const response = await Api.withdraw.selectMemberCard(requestData)
      const result = Array.isArray(response.result) ? response.result : []

      receiveAddresses.value = result
        .filter(account => matchCryptoMemberCard(account, matchedWithdrawMethod.value))
        .map<CryptoReceiveAddressItem>(account => ({
          id: String(account.rowId),
          coinCode: currency.value,
          icon: String(account.icon ?? currencyOption.value?.icon ?? USDTIcon),
          defaultCard: Number(account.defaultCard ?? 0),
          network: String(account.accountName ?? selectNetwork.value),
          address: String(account.accountNo ?? '')
        }))
        .filter(item => item.address)

      hasLoadedReceiveAddresses.value = true
      return true
    } catch (error) {
      console.error(error)
      receiveAddresses.value = []
      hasReceiveAddressesLoadError.value = true
      hasLoadedReceiveAddresses.value = true
      return false
    } finally {
      isLoadingReceiveAddresses.value = false
    }
  }

  const loadQuickAmounts = async () => {
    if (
      matchedWithdrawMethod.value?.paymentCode == null ||
      matchedWithdrawMethod.value?.paymentCode === ''
    ) {
      quickAmounts.value = []
      return
    }

    const requestParams = {
      paymentCode: matchedWithdrawMethod.value.paymentCode
    }

    try {
      const response = await Api.withdraw.queryFastAmount(requestParams)
      const result = Array.isArray(response.result) ? response.result : []

      if (result.length) {
        quickAmounts.value = result
        return
      }

      quickAmounts.value = parseQuickAmounts(matchedWithdrawMethod.value?.quickAmts as string)
    } catch (error) {
      console.error(error)
      quickAmounts.value = parseQuickAmounts(matchedWithdrawMethod.value?.quickAmts as string)
    }
  }

  const loadWithdrawManager = async () => {
    try {
      const response = await Api.withdraw.queryWithdrawManager({})
      const result = Array.isArray(response.result) ? response.result : []
      const { cryptoMethods } = splitWithdrawManagerMethods(result)
      const firstMatchedMethod = cryptoMethods[0]

      if (firstMatchedMethod) {
        matchedWithdrawMethod.value = firstMatchedMethod

        const matchedOption = resolveVirtualCryptoOption(firstMatchedMethod)
        coinCode.value = matchedOption.code
        currency.value = matchedOption.code
        await loadReceiveAddresses()
        await loadQuickAmounts()
        syncSelectedAddress()
      } else {
        matchedWithdrawMethod.value = null
        receiveAddresses.value = []
        quickAmounts.value = []
        selectedAddressId.value = null
      }
    } catch (error) {
      console.error(error)
      matchedWithdrawMethod.value = null
      coinCode.value = DEFAULT_CRYPTO_OPTIONS[0].code
      currency.value = DEFAULT_CRYPTO_OPTIONS[0].code
      receiveAddresses.value = []
      quickAmounts.value = []
      selectedAddressId.value = null
    }
  }

  const selectCoinCode = (code: string) => {
    if (code === coinCode.value) {
      coinMoreShow.value = false
      return true
    }

    if (code !== 'USDT') {
      return false
    }

    coinCode.value = code
    currency.value = code
    coinMoreShow.value = false
    selectedAddressId.value = null
    return true
  }

  const openAddressList = () => {
    if (!ensureCanManageReceiveAddress()) {
      return
    }

    if (
      isLoadingReceiveAddresses.value ||
      !hasLoadedReceiveAddresses.value ||
      hasReceiveAddressesLoadError.value
    ) {
      return
    }

    syncSelectedAddress()
    addressListVisible.value = true
  }

  const closeAddressList = () => {
    addressListVisible.value = false
  }

  const openAddAddress = () => {
    if (!ensureCanManageReceiveAddress()) {
      return
    }

    if (!canAddAddress.value) {
      return
    }

    reopenAddressListAfterAdd.value = addressListVisible.value
    closeAddressList()
    pendingAddress.value = ''
    addAddressVisible.value = true
  }

  const closeAddAddress = () => {
    addAddressVisible.value = false
    pendingAddress.value = ''

    if (reopenAddressListAfterAdd.value) {
      reopenAddressListAfterAdd.value = false
      openAddressList()
    }
  }

  const reopenAddAddressForm = () => {
    addAddressVisible.value = true
  }

  const handleSelectReceiveAddress = (id: string) => {
    const nextSelectedAddress = availableReceiveAddresses.value.find(item => item.id === id) ?? null

    selectedAddressId.value = id

    if (nextSelectedAddress?.network) {
      selectNetwork.value = nextSelectedAddress.network
    }

    closeAddressList()
  }

  const { setDefault: applyReceiveAddressDefault } = useMemberCardDefaultFlow<string>({
    resolveTarget: id => {
      const nextSelectedAddress =
        availableReceiveAddresses.value.find(item => item.id === id) ?? null

      if (!nextSelectedAddress) {
        return null
      }

      return {
        rowId: id,
        cardType: matchedWithdrawMethod.value?.cardType,
        defaultCard: nextSelectedAddress.defaultCard
      }
    },
    alreadyDefaultMessage: t('withdraw.default_address_cannot_be_changed'),
    updateFailedMessage: 'Update default address failed',
    duration: FAIL_TOAST_DURATION,
    submitDefault: async (rowId, cardType) => {
      try {
        const response = await Api.withdraw.modifyDefaultCard({
          rowId,
          cardType,
          defaultCard: 1,
          validDate: 0
        })

        return response?.code === 'C2'
      } catch (error) {
        console.error(error)
        return false
      }
    },
    onSuccess: id => {
      receiveAddresses.value = receiveAddresses.value.map(item => ({
        ...item,
        defaultCard: item.id === id ? 1 : 0
      }))

      selectedAddressId.value = id
      syncSelectedAddress()
    }
  })

  const handleToggleReceiveAddressDefault = (id: string) => {
    void applyReceiveAddressDefault(id)
  }

  const handleChangeReceiveAddress = () => {
    if (!ensureCanManageReceiveAddress()) {
      return
    }

    openAddressList()
  }

  const closeAddAddressPaymentPassword = () => {
    closeAddAddressPaymentPasswordState()
    reopenAddAddressForm()
  }

  const closeAddAddressSmsVerification = () => {
    closeAddAddressSmsVerificationState()
    reopenAddAddressForm()
  }

  const confirmAddAddress = async () => {
    const nextAddress = pendingAddress.value.trim()

    if (!nextAddress) {
      return
    }

    const result = await beginAddAddressSubmit({
      address: nextAddress,
      network: selectNetwork.value
    })

    if (result === 'password' || result === 'sms') {
      addAddressVisible.value = false
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

  const applyQuickAmount = (quickAmount: FastAmountItem) => {
    const nextAmount = Number(quickAmount.amount ?? 0)

    if (Number.isFinite(nextAmount) && nextAmount > 0) {
      amount.value = nextAmount
    }
  }

  onMounted(async () => {
    await siteConfigStore.initSiteConfig()

    if (!acctInfo.value) {
      await userStore.refreshAcctInfo()
    }

    await loadWithdrawManager()
  })

  return {
    address,
    addressListVisible,
    amount,
    balanceAmount,
    availableReceiveAddresses,
    addAddressVisible,
    addAddressPaymentPasswordVisible,
    addAddressSmsVerificationVisible,
    addAddressSmsCountdownTrigger,
    coinCode,
    coinMoreShow,
    currency,
    currencyOption,
    currencyOptions,
    currencySymbol,
    canAddAddress,
    currentCurrency,
    handleAddAddressPaymentPasswordConfirm,
    handleAddAddressSmsVerificationConfirm,
    handleAddAddressSmsVerificationResend,
    formattedBalance,
    hasSelectedReceiveAddress,
    isAmountDisabled,
    isCheckingAddAddressSmsCode,
    isLoadingReceiveAddresses,
    isRefreshingBalance,
    isSendingAddAddressSmsCode,
    isSubmittingAddAddress,
    isWithdrawDisabled,
    maskedPhoneNumber,
    matchedWithdrawMethod,
    networkOptions,
    openAddAddress,
    openAddressList,
    closeAddAddress,
    closeAddAddressPaymentPassword,
    closeAddAddressSmsVerification,
    closeAddressList,
    confirmAddAddress,
    applyQuickAmount,
    handleChangeReceiveAddress,
    handleSelectReceiveAddress,
    handleToggleReceiveAddressDefault,
    pendingAddress,
    refreshBalance,
    selectCoinCode,
    selectNetwork,
    selectedReceiveAddress,
    quickAmounts,
    visibleCoins,
    youGetAmount
  }
}
