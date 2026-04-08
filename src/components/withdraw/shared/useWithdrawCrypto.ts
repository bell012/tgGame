import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import Api from '@/api'
import type { AddMemberCardForm, MemberCardItem } from '@/api/interface/withdraw'
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
import { getBalanceByCurrency } from '@/utils/balance'
import { getCurrentCurrency, getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import { StringExtension } from '@/utils/string-extension'
import { showToast } from 'vant'
import { splitWithdrawManagerMethods } from './withdrawManager'
import { requestOpenWithdrawKindReminder } from './useWithdrawFlow'

export interface CryptoOption {
  code: string
  name: string
  icon: string
  raw?: WithdrawManagerItem
}

export interface ICoinNetworkItem {
  text: string
}

export interface ICoinItem {
  name: string
  symbol: string
  bgColor: string
  networks: ICoinNetworkItem[]
}

export interface CryptoReceiveAddressItem {
  id: string
  coinCode: string
  network: string
  address: string
}

export const DEFAULT_COINS: ICoinItem[] = [
  {
    name: 'USDT',
    symbol: '₮',
    bgColor: '#50AF95',
    networks: [
      { text: 'Tron (TRC20)' },
      { text: 'Tron (BEP2)' },
      { text: 'Tron (ERC20)' },
      { text: 'Tron (BEPSC)' }
    ]
  },
  {
    name: 'USDC',
    symbol: '$',
    bgColor: '#2775CA',
    networks: [{ text: 'TRC20' }, { text: 'BEP2' }, { text: 'ERC20' }, { text: 'BEPSC' }]
  },
  {
    name: 'BTC',
    symbol: '₿',
    bgColor: '#F7931A',
    networks: [{ text: 'TRC20' }, { text: 'BEP2' }, { text: 'ERC20' }, { text: 'BEPSC' }]
  },
  {
    name: 'ETH',
    symbol: 'Ξ',
    bgColor: '#627EEA',
    networks: [{ text: 'TRC20' }, { text: 'BEP2' }, { text: 'ERC20' }, { text: 'BEPSC' }]
  }
]

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

const resolveCoinNetworks = (coinCode: string) => {
  return DEFAULT_COINS.find(item => item.name === coinCode)?.networks ?? []
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

  const accountCardType = normalizeText(account.cardType)
  const accountPaymentCode = normalizeText(account.paymentCode)
  const methodCardType = normalizeText(method.cardType)
  const methodPaymentCode = normalizeText(method.paymentCode)

  return [accountCardType, accountPaymentCode].some(
    value => value && (value === methodCardType || value === methodPaymentCode)
  )
}

export function useWithdrawCrypto() {
  const FAIL_TOAST_DURATION = 3000
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
  const addAddressPaymentPasswordVisible = ref(false)
  const addAddressSmsVerificationVisible = ref(false)
  const reopenAddressListAfterAdd = ref(false)
  const isSendingAddAddressSmsCode = ref(false)
  const isCheckingAddAddressSmsCode = ref(false)
  const isSubmittingAddAddress = ref(false)
  const addAddressSmsCountdownTrigger = ref(0)
  const receiveAddresses = ref<CryptoReceiveAddressItem[]>([])
  const selectedAddressId = ref<string | null>(null)
  const pendingAddress = ref('')

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
  const addMemberCardVerifyWay = computed(() =>
    String(
      (
        siteConfigStore.config as
          | {
              baseSiteConfig?: {
                add_member_card_security_verify_way?: string | number
                addMemberCardSecurityVerifyWay?: string | number
              }
            }
          | null
          | undefined
      )?.baseSiteConfig?.add_member_card_security_verify_way ??
        (
          siteConfigStore.config as
            | {
                baseSiteConfig?: {
                  add_member_card_security_verify_way?: string | number
                  addMemberCardSecurityVerifyWay?: string | number
                }
              }
            | null
            | undefined
        )?.baseSiteConfig?.addMemberCardSecurityVerifyWay ??
        ''
    ).trim()
  )
  const needAddMemberCardBusiPwd = computed(() => addMemberCardVerifyWay.value === '2')
  const needAddMemberCardTelephoneSms = computed(() => addMemberCardVerifyWay.value === '1')
  const resolvedAreaCode = computed(() => String(userStore.userInfo?.areaCode ?? '').trim())
  const resolvedTelephone = computed(() =>
    String(userStore.userInfo?.telephone ?? '')
      .trim()
      .replace(/\D/g, '')
  )
  const maskedPhoneNumber = computed(() => {
    const areaCode = resolvedAreaCode.value
    const telephone = resolvedTelephone.value

    if (!telephone) {
      return ''
    }

    if (telephone.length <= 4) {
      return `+${areaCode}-${telephone}`
    }

    return `+${areaCode}-${telephone.slice(0, 3)}****${telephone.slice(-4)}`
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

    const matchedAddress =
      availableReceiveAddresses.value.find(item => item.id === selectedAddressId.value) ?? null

    selectedAddressId.value = matchedAddress?.id ?? null
  }

  const loadReceiveAddresses = async () => {
    const nextCardType = matchedWithdrawMethod.value?.cardType
    isLoadingReceiveAddresses.value = true
    hasReceiveAddressesLoadError.value = false

    try {
      const response = await Api.withdraw.selectMemberCard(
        nextCardType != null && String(nextCardType).trim() ? { cardType: nextCardType } : undefined
      )
      const result = Array.isArray(response.result) ? response.result : []

      receiveAddresses.value = result
        .filter(account => matchCryptoMemberCard(account, matchedWithdrawMethod.value))
        .map<CryptoReceiveAddressItem>(account => ({
          id: String(account.rowId),
          coinCode: currency.value,
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
        syncSelectedAddress()
      } else {
        matchedWithdrawMethod.value = null
        receiveAddresses.value = []
        selectedAddressId.value = null
      }
    } catch (error) {
      console.error(error)
      matchedWithdrawMethod.value = null
      coinCode.value = DEFAULT_CRYPTO_OPTIONS[0].code
      currency.value = DEFAULT_CRYPTO_OPTIONS[0].code
      receiveAddresses.value = []
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

    reopenAddressListAfterAdd.value = true
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

  const handleChangeReceiveAddress = () => {
    if (!ensureCanManageReceiveAddress()) {
      return
    }

    openAddressList()
  }

  const buildAddMemberCardForm = (
    nextAddress: string,
    verifiedValue?: string
  ): AddMemberCardForm | null => {
    const nextCardType = Number(matchedWithdrawMethod.value?.cardType ?? 0)

    if (!nextCardType) {
      return null
    }

    return {
      type: 5,
      cardType: nextCardType,
      ...(addMemberCardVerifyWay.value ? { verifyType: addMemberCardVerifyWay.value } : {}),
      ...(verifiedValue ? { verifyCode: StringExtension.md5(verifiedValue) } : {}),
      accountNo: nextAddress,
      accountName: selectNetwork.value,
      accountSubNo: '',
      defaultCard: 1,
      validDate: 0,
      remark: ''
    }
  }

  const submitAddAddress = async (verifiedValue?: string) => {
    const nextAddress = pendingAddress.value.trim()

    if (!nextAddress) {
      return
    }

    const requestData = buildAddMemberCardForm(nextAddress, verifiedValue)

    if (!requestData) {
      showToast({
        message: 'Unavailable',
        type: 'fail',
        duration: FAIL_TOAST_DURATION
      })
      return
    }

    try {
      isSubmittingAddAddress.value = true
      const response = await Api.withdraw.addMemberCard(requestData)

      if (response?.code !== 'C2') {
        showToast({
          message: String(response?.message || 'Add address failed'),
          type: 'fail',
          duration: FAIL_TOAST_DURATION
        })
        reopenAddAddressForm()
        return
      }
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Add address failed',
        type: 'fail',
        duration: FAIL_TOAST_DURATION
      })
      reopenAddAddressForm()
      return
    } finally {
      isSubmittingAddAddress.value = false
    }

    await loadReceiveAddresses()
    syncSelectedAddress()
    selectedAddressId.value =
      receiveAddresses.value.find(item => item.address === nextAddress)?.id ?? null
    closeAddAddress()
  }

  const sendAddAddressSmsCode = async () => {
    if (isSendingAddAddressSmsCode.value) {
      return false
    }

    if (!resolvedTelephone.value) {
      showToast({
        message: 'Phone number unavailable',
        type: 'fail',
        duration: FAIL_TOAST_DURATION
      })
      return false
    }

    try {
      isSendingAddAddressSmsCode.value = true
      const response = await Api.auth.sendSms({
        telephone: resolvedTelephone.value,
        areaCode: resolvedAreaCode.value
      })

      if (response?.message) {
        showToast({
          message: response.message,
          type: response?.code === 'C2' ? 'success' : 'fail'
        })
      }

      if (response?.code === 'C2') {
        addAddressSmsCountdownTrigger.value += 1
        return true
      }

      return false
    } finally {
      isSendingAddAddressSmsCode.value = false
    }
  }

  const closeAddAddressPaymentPassword = () => {
    addAddressPaymentPasswordVisible.value = false
    reopenAddAddressForm()
  }

  const closeAddAddressSmsVerification = () => {
    addAddressSmsVerificationVisible.value = false
    reopenAddAddressForm()
  }

  const handleAddAddressPaymentPasswordConfirm = async (password: string) => {
    addAddressPaymentPasswordVisible.value = false
    await submitAddAddress(password)
  }

  const handleAddAddressSmsVerificationResend = async () => {
    await sendAddAddressSmsCode()
  }

  const handleAddAddressSmsVerificationConfirm = async (code: string) => {
    if (isCheckingAddAddressSmsCode.value || isSubmittingAddAddress.value) {
      return
    }

    try {
      isCheckingAddAddressSmsCode.value = true
      const response = await Api.auth.checkSms({
        telephone: resolvedTelephone.value,
        areaCode: resolvedAreaCode.value,
        smsCode: code
      })

      if (response?.code !== 'C2') {
        showToast({
          message: String(response?.message || 'Invalid sms code'),
          type: 'fail',
          duration: FAIL_TOAST_DURATION
        })
        return
      }

      addAddressSmsVerificationVisible.value = false
      await submitAddAddress(code)
    } finally {
      isCheckingAddAddressSmsCode.value = false
    }
  }

  const confirmAddAddress = async () => {
    const nextAddress = pendingAddress.value.trim()

    if (!nextAddress) {
      return
    }

    if (needAddMemberCardBusiPwd.value) {
      addAddressVisible.value = false
      addAddressPaymentPasswordVisible.value = true
      return
    }

    if (needAddMemberCardTelephoneSms.value) {
      addAddressVisible.value = false
      addAddressSmsVerificationVisible.value = true
      await sendAddAddressSmsCode()
      return
    }

    await submitAddAddress()
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
    handleChangeReceiveAddress,
    handleSelectReceiveAddress,
    pendingAddress,
    refreshBalance,
    selectCoinCode,
    selectNetwork,
    selectedReceiveAddress,
    visibleCoins,
    youGetAmount
  }
}
