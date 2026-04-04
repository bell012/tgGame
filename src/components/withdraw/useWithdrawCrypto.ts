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

export interface CryptoOption {
  code: string
  name: string
  icon: string
  raw?: WithdrawManagerItem
}

const DEFAULT_CRYPTO_OPTIONS: CryptoOption[] = [
  { name: 'USDT', code: 'USDT', icon: USDTIcon },
  { name: 'ETH', code: 'ETH', icon: ETHIcon },
  { name: 'BTC', code: 'BTC', icon: BTCIcon },
  { name: 'USDC', code: 'USDC', icon: USDCIcon }
]

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

const mapMethodToCryptoOption = (method: WithdrawManagerItem): CryptoOption => {
  const code = normalizeText(method.paymentCode || method.paymentName || 'USDT')

  return {
    code,
    name: normalizeText(method.paymentName || method.paymentCode || 'USDT'),
    icon: resolveCryptoIcon(method),
    raw: method
  }
}

export function useWithdrawCrypto() {
  const localeStore = useLocaleStore()
  const userStore = useUserStore()
  const { currentCurrency } = storeToRefs(localeStore)
  const { acctInfo } = storeToRefs(userStore)

  const amount = ref<number>()
  const address = ref('')
  const coinMoreShow = ref(false)
  const coinCode = ref('USDT')
  const currency = ref('USDT')
  const selectNetwork = ref('TRC20')
  const cryptoOptions = ref<CryptoOption[]>([...DEFAULT_CRYPTO_OPTIONS])
  const isRefreshingBalance = ref(false)

  const visibleCoins = computed(() => cryptoOptions.value.slice(0, 6))
  const currencyOptions = computed(() =>
    cryptoOptions.value.map(item => ({
      label: item.name,
      value: item.code,
      icon: item.icon
    }))
  )
  const currencyOption = computed(() => {
    return currencyOptions.value.find(option => option.value === currency.value)
  })
  const balanceAmount = computed(() => getBalanceByCurrency(acctInfo.value, currentCurrency.value))
  const formattedBalance = computed(() =>
    getFormattedBalance(balanceAmount.value, currentCurrency.value, 2)
  )
  const currencySymbol = computed(() => getCurrencySymbol(currentCurrency.value))
  const networkOptions = computed(() => [{ label: 'Tron（TRC20）', value: 'TRC20' }])
  const isAmountDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
  const isWithdrawDisabled = computed(() => isAmountDisabled.value || !address.value.trim())

  const loadWithdrawManager = async () => {
    try {
      const response = await Api.withdraw.queryWithdrawManager({})
      const result = Array.isArray(response.result) ? response.result : []
      const mappedOptions = result
        .filter(
          item => Number(item.type ?? 0) === 2 || normalizeText(item.paymentName).includes('USDT')
        )
        .map(mapMethodToCryptoOption)
        .filter(item => item.code)

      if (mappedOptions.length) {
        cryptoOptions.value = mappedOptions
        coinCode.value = mappedOptions[0].code
        currency.value = mappedOptions[0].code
      }
    } catch (error) {
      console.error(error)
      cryptoOptions.value = [...DEFAULT_CRYPTO_OPTIONS]
      coinCode.value = cryptoOptions.value[0].code
      currency.value = cryptoOptions.value[0].code
    }
  }

  const selectCoinCode = (code: string) => {
    if (code !== 'USDT') {
      return false
    }

    coinCode.value = code
    currency.value = code
    coinMoreShow.value = false
    return true
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
    amount,
    coinCode,
    coinMoreShow,
    currency,
    currencyOption,
    currencyOptions,
    currencySymbol,
    currentCurrency,
    formattedBalance,
    isAmountDisabled,
    isRefreshingBalance,
    isWithdrawDisabled,
    networkOptions,
    refreshBalance,
    selectCoinCode,
    selectNetwork,
    visibleCoins
  }
}
