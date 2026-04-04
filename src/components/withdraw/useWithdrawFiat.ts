import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import Api from '@/api'
import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import payPalIcon from '@/static/img/payment/payPal.png'
import type { FastAmountItem, MemberCardItem, WithdrawManagerItem } from '@/api/interface/withdraw'
import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'
import { getBalanceByCurrency } from '@/utils/balance'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'

export interface FiatMethodOption {
  name: string
  icon: string
  paymentCode?: string | number
  raw?: WithdrawManagerItem
}

const DEFAULT_METHOD_OPTIONS: FiatMethodOption[] = [
  {
    name: 'GCash',
    icon: gCashIcon,
    paymentCode: 'GCASH'
  },
  {
    name: 'Maya',
    icon: mayaIcon,
    paymentCode: 'MAYA'
  },
  {
    name: 'GrabPay',
    icon: grabPayIcon,
    paymentCode: 'GRABPAY'
  },
  {
    name: 'PayPal',
    icon: payPalIcon,
    paymentCode: 'PAYPAL'
  }
]

const MOCK_QUICK_AMOUNTS: FastAmountItem[] = [
  { amount: 100 },
  { amount: 300 },
  { amount: 500 },
  { amount: 1000 },
  { amount: 1500 },
  { amount: 2000 },
  { amount: 3000 },
  { amount: 4000 },
  { amount: 5000 },
  { amount: 8000 },
  { amount: 10000 },
  { amount: 15000 },
  { amount: 20000 },
  { amount: 30000 },
  { amount: 50000 },
  { amount: 80000 },
  { amount: 100000 },
  { amount: 150000 }
]

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

const resolveMethodIcon = (method: WithdrawManagerItem) => {
  const paymentName = normalizeText(method.paymentName)
  const paymentCode = normalizeText(method.paymentCode)

  if (paymentName.includes('gcash') || paymentCode.includes('gcash')) {
    return gCashIcon
  }

  if (paymentName.includes('maya') || paymentCode.includes('maya')) {
    return mayaIcon
  }

  if (paymentName.includes('grabpay') || paymentCode.includes('grabpay')) {
    return grabPayIcon
  }

  if (paymentName.includes('paypal') || paymentCode.includes('paypal')) {
    return payPalIcon
  }

  return gCashIcon
}

const matchMethodAccount = (method: FiatMethodOption, account: MemberCardItem) => {
  const paymentCode = normalizeText(method.paymentCode)
  const methodName = normalizeText(method.name)
  const accountCardType = normalizeText(account.cardType)
  const accountPaymentCode = normalizeText(account.paymentCode)
  const accountName = normalizeText(account.accountName)
  const bankName = normalizeText(account.bankName)

  if (!paymentCode && !methodName) {
    return false
  }

  return [accountCardType, accountPaymentCode, accountName, bankName].some(
    value => value && (value === paymentCode || value.includes(methodName))
  )
}

export function useWithdrawFiat() {
  const localeStore = useLocaleStore()
  const userStore = useUserStore()
  const { currentCurrency } = storeToRefs(localeStore)
  const { acctInfo, userInfo } = storeToRefs(userStore)

  const payMethods = ref<FiatMethodOption[]>([...DEFAULT_METHOD_OPTIONS])
  const selectedMethod = ref<FiatMethodOption>(DEFAULT_METHOD_OPTIONS[0])
  const memberCards = ref<MemberCardItem[]>([])
  const selectedAccount = ref<MemberCardItem | null>(null)
  const quickAmounts = ref<FastAmountItem[]>([])
  const accountName = ref('')
  const phoneNumber = ref('')
  const amount = ref<number>()

  const currencySymbol = computed(() => getCurrencySymbol(currentCurrency.value))
  const balanceAmount = computed(() => getBalanceByCurrency(acctInfo.value, currentCurrency.value))
  const formattedBalance = computed(() =>
    getFormattedBalance(balanceAmount.value, currentCurrency.value, 2)
  )
  const isAmountDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
  const isWithdrawDisabled = computed(
    () => isAmountDisabled.value || !accountName.value.trim() || !phoneNumber.value.trim()
  )

  const syncSelectedAccount = () => {
    const matchedAccount =
      memberCards.value.find(account => matchMethodAccount(selectedMethod.value, account)) ??
      memberCards.value.find(account => Boolean(account.isDefault)) ??
      memberCards.value[0] ??
      null

    selectedAccount.value = matchedAccount

    if (!accountName.value.trim()) {
      accountName.value = matchedAccount?.accountName ?? ''
    }

    if (!phoneNumber.value.trim()) {
      phoneNumber.value = userInfo.value?.telephone ?? ''
    }
  }

  const loadWithdrawMethods = async () => {
    try {
      const response = await Api.withdraw.queryWithdrawManager({})
      const result = Array.isArray(response.result) ? response.result : []
      const mappedMethods = result
        .filter(item => Number(item.type ?? 1) !== 2)
        .map<FiatMethodOption>(item => ({
          name: item.paymentName || String(item.paymentCode || ''),
          icon: resolveMethodIcon(item),
          paymentCode: item.paymentCode,
          raw: item
        }))
        .filter(item => item.name)

      if (mappedMethods.length) {
        payMethods.value = mappedMethods
        selectedMethod.value = mappedMethods[0]
      }
    } catch (error) {
      console.error(error)
      payMethods.value = [...DEFAULT_METHOD_OPTIONS]
      selectedMethod.value = payMethods.value[0]
    }
  }

  const loadMemberCards = async () => {
    try {
      const response = await Api.withdraw.selectMemberCard({
        currency: currentCurrency.value
      })
      memberCards.value = Array.isArray(response.result) ? response.result : []
    } catch (error) {
      console.error(error)
      memberCards.value = []
    }

    syncSelectedAccount()
  }

  const loadQuickAmounts = async () => {
    if (selectedMethod.value.paymentCode == null || selectedMethod.value.paymentCode === '') {
      quickAmounts.value = []
      return
    }

    try {
      const response = await Api.withdraw.queryFastAmount({
        paymentCode: selectedMethod.value.paymentCode
      })
      const result = Array.isArray(response.result) ? response.result : []
      quickAmounts.value = result.length ? result : [...MOCK_QUICK_AMOUNTS]
    } catch (error) {
      console.error(error)
      quickAmounts.value = [...MOCK_QUICK_AMOUNTS]
    }
  }

  const selectMethod = async (method: FiatMethodOption) => {
    selectedMethod.value = method
    accountName.value = ''
    phoneNumber.value = userInfo.value?.telephone ?? ''
    syncSelectedAccount()
    await loadQuickAmounts()
  }

  const applyQuickAmount = (quickAmount: FastAmountItem) => {
    const nextAmount = Number(quickAmount.amount ?? 0)

    if (Number.isFinite(nextAmount) && nextAmount > 0) {
      amount.value = nextAmount
    }
  }

  onMounted(async () => {
    if (!acctInfo.value) {
      await userStore.refreshAcctInfo()
    }

    await loadWithdrawMethods()
    await loadMemberCards()
    await loadQuickAmounts()
  })

  watch(currentCurrency, async () => {
    await loadMemberCards()
  })

  return {
    accountName,
    amount,
    applyQuickAmount,
    currentCurrency,
    currencySymbol,
    formattedBalance,
    isAmountDisabled,
    isWithdrawDisabled,
    payMethods,
    phoneNumber,
    quickAmounts,
    selectMethod,
    selectedAccount,
    selectedMethod
  }
}
