import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import Api from '@/api'
import BNBIcon from '@/static/img/crypto/BNB.png'
import BTCIcon from '@/static/img/crypto/BTC.png'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import ETHIcon from '@/static/img/crypto/ETH.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import type { WithdrawManagerItem } from '@/api/interface/withdraw'
import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'
import { getBalanceByCurrency } from '@/utils/balance'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import { splitWithdrawManagerMethods } from './withdrawManager'

export interface CryptoOption {
  code: string
  name: string
  icon: string
  raw?: WithdrawManagerItem
}

export interface CryptoReceiveAddressItem {
  id: string
  coinCode: string
  network: string
  address: string
}

const DEFAULT_CRYPTO_OPTIONS: CryptoOption[] = [
  { name: 'USDT', code: 'USDT', icon: USDTIcon },
  { name: 'ETH', code: 'ETH', icon: ETHIcon },
  { name: 'BTC', code: 'BTC', icon: BTCIcon },
  { name: 'USDC', code: 'USDC', icon: USDCIcon }
]

const DEFAULT_RECEIVE_ADDRESSES: CryptoReceiveAddressItem[] = Array.from(
  { length: 12 },
  (_, index) => ({
    id: `usdt-trc20-${index + 1}`,
    coinCode: 'USDT',
    network: 'TRC20',
    address: `UYK1acjkhhoidy89qyd9d049${String(index + 1).padStart(2, '0')}UYK1acjkhhoidy89qyd9d04987`
  })
)

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase()

const resolveCryptoIcon = (method: WithdrawManagerItem) => {
  const paymentName = normalizeText(method.paymentName)
  const paymentCode = normalizeText(method.paymentCode)
  const target = `${paymentName} ${paymentCode}`

  if (target.includes('USDT')) return USDTIcon
  if (target.includes('ETH')) return ETHIcon
  if (target.includes('BTC')) return BTCIcon
  if (target.includes('USDC')) return USDCIcon
  if (target.includes('DOGE')) return DOGEIcon
  if (target.includes('TRX')) return TRXIcon
  if (target.includes('BNB')) return BNBIcon

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

export function useWithdrawCrypto() {
  const localeStore = useLocaleStore()
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
  const addressListVisible = ref(false)
  const addAddressVisible = ref(false)
  const reopenAddressListAfterAdd = ref(false)
  const receiveAddresses = ref<CryptoReceiveAddressItem[]>([...DEFAULT_RECEIVE_ADDRESSES])
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
  const availableReceiveAddresses = computed(() =>
    receiveAddresses.value.filter(
      item => item.coinCode === currency.value && item.network === selectNetwork.value
    )
  )
  const selectedReceiveAddress = computed(
    () => availableReceiveAddresses.value.find(item => item.id === selectedAddressId.value) ?? null
  )
  const address = computed(() => selectedReceiveAddress.value?.address || '')
  const hasSelectedReceiveAddress = computed(() => Boolean(selectedReceiveAddress.value))
  const balanceAmount = computed(() => getBalanceByCurrency(acctInfo.value, currentCurrency.value))
  const formattedBalance = computed(() =>
    getFormattedBalance(balanceAmount.value, currentCurrency.value, 2)
  )
  const currencySymbol = computed(() => getCurrencySymbol(currentCurrency.value))
  const networkOptions = computed(() => [{ label: 'Tron（TRC20）', value: 'TRC20' }])
  const isAmountDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
  const isWithdrawDisabled = computed(
    () => isAmountDisabled.value || !selectedReceiveAddress.value?.address.trim()
  )

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
      }
    } catch (error) {
      console.error(error)
      matchedWithdrawMethod.value = null
      coinCode.value = DEFAULT_CRYPTO_OPTIONS[0].code
      currency.value = DEFAULT_CRYPTO_OPTIONS[0].code
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
    addressListVisible.value = true
  }

  const closeAddressList = () => {
    addressListVisible.value = false
  }

  const openAddAddress = () => {
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

  const handleSelectReceiveAddress = (id: string) => {
    selectedAddressId.value = id
    closeAddressList()
  }

  const handleChangeReceiveAddress = () => {
    openAddressList()
  }

  const confirmAddAddress = () => {
    const nextAddress = pendingAddress.value.trim()

    if (!nextAddress) {
      return
    }

    const nextItem: CryptoReceiveAddressItem = {
      id: `${currency.value}-${Date.now()}`,
      coinCode: currency.value,
      network: selectNetwork.value,
      address: nextAddress
    }

    receiveAddresses.value = [nextItem, ...receiveAddresses.value]
    selectedAddressId.value = nextItem.id
    closeAddAddress()
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
    if (!acctInfo.value) {
      await userStore.refreshAcctInfo()
    }

    await loadWithdrawManager()
  })

  return {
    address,
    addressListVisible,
    amount,
    availableReceiveAddresses,
    addAddressVisible,
    coinCode,
    coinMoreShow,
    currency,
    currencyOption,
    currencyOptions,
    currencySymbol,
    currentCurrency,
    formattedBalance,
    hasSelectedReceiveAddress,
    isAmountDisabled,
    isRefreshingBalance,
    isWithdrawDisabled,
    matchedWithdrawMethod,
    networkOptions,
    openAddAddress,
    openAddressList,
    closeAddAddress,
    closeAddressList,
    confirmAddAddress,
    handleChangeReceiveAddress,
    handleSelectReceiveAddress,
    pendingAddress,
    refreshBalance,
    selectCoinCode,
    selectNetwork,
    selectedReceiveAddress,
    visibleCoins
  }
}
