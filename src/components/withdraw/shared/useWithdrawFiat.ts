import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import Api from '@/api'
import type { FastAmountItem, MemberCardItem, WithdrawManagerItem } from '@/api/interface/withdraw'
import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'
import { getBalanceByCurrency } from '@/utils/balance'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import { splitWithdrawManagerMethods } from './withdrawManager'

export interface FiatMethodOption {
  name: string
  icon: string
  paymentCode?: string | number
  raw?: WithdrawManagerItem
}

export interface FiatAccountItem extends MemberCardItem {
  localId: string
}

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

const resolveMethodIcon = (method: WithdrawManagerItem) => {
  const imagePath = method.logo || method.icon
  return imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''
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

const buildMockFiatAccounts = (paymentCode?: string | number) =>
  Array.from({ length: 12 }, (_, index) => ({
    localId: `${paymentCode ?? 'wallet'}-mock-${index + 1}`,
    rowId: `mock-${index + 1}`,
    accountNo: `1391234${String(1000 + index).slice(-4)}`,
    accountName: `Martin ${index + 1}`,
    paymentCode,
    cardType: paymentCode,
    isDefault: index === 0 ? 1 : 0
  })) satisfies FiatAccountItem[]

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
  const { acctInfo } = storeToRefs(userStore)

  const payMethods = ref<FiatMethodOption[]>([])
  const selectedMethod = ref<FiatMethodOption>({
    name: '',
    icon: '',
    paymentCode: ''
  })
  const memberCards = ref<FiatAccountItem[]>([])
  const selectedAccount = ref<FiatAccountItem | null>(null)
  const quickAmounts = ref<FastAmountItem[]>([])
  const amount = ref<number>()
  const accountListVisible = ref(false)
  const addAccountVisible = ref(false)
  const reopenAccountListAfterAdd = ref(false)
  const pendingAccountNo = ref('')
  const pendingAccountName = ref('')

  const currencySymbol = computed(() => getCurrencySymbol(currentCurrency.value))
  const balanceAmount = computed(() => getBalanceByCurrency(acctInfo.value, currentCurrency.value))
  const formattedBalance = computed(() =>
    getFormattedBalance(balanceAmount.value, currentCurrency.value, 2)
  )
  const isAmountDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
  const availableAccounts = computed(() =>
    memberCards.value.filter(account => matchMethodAccount(selectedMethod.value, account))
  )
  const isWithdrawDisabled = computed(() => isAmountDisabled.value || !selectedAccount.value)

  const syncSelectedAccount = ({ preserveCurrent = true }: { preserveCurrent?: boolean } = {}) => {
    if (!preserveCurrent) {
      selectedAccount.value = null
      return
    }

    const matchedAccount =
      availableAccounts.value.find(account => account.localId === selectedAccount.value?.localId) ??
      null

    selectedAccount.value = matchedAccount
  }

  const loadWithdrawMethods = async () => {
    try {
      const response = await Api.withdraw.queryWithdrawManager({})
      const result = Array.isArray(response.result) ? response.result : []
      const { fiatMethods } = splitWithdrawManagerMethods(result)
      const mappedMethods = fiatMethods
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
      } else {
        payMethods.value = []
        selectedMethod.value = {
          name: '',
          icon: '',
          paymentCode: ''
        }
      }
    } catch (error) {
      console.error(error)
      payMethods.value = []
      selectedMethod.value = {
        name: '',
        icon: '',
        paymentCode: ''
      }
    }
  }

  const loadMemberCards = async () => {
    try {
      const response = await Api.withdraw.selectMemberCard({
        currency: currentCurrency.value
      })
      const result = Array.isArray(response.result) ? response.result : []

      memberCards.value = result.length
        ? result.map((item, index) => ({
            ...item,
            localId: String(item.rowId ?? `${item.paymentCode ?? 'wallet'}-${index}`)
          }))
        : buildMockFiatAccounts(selectedMethod.value.paymentCode)
    } catch (error) {
      console.error(error)
      memberCards.value = buildMockFiatAccounts(selectedMethod.value.paymentCode)
    }

    syncSelectedAccount({ preserveCurrent: false })
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

      if (result.length) {
        quickAmounts.value = result
        return
      }

      quickAmounts.value = parseQuickAmounts(selectedMethod.value.raw?.quickAmts)
    } catch (error) {
      console.error(error)
      quickAmounts.value = parseQuickAmounts(selectedMethod.value.raw?.quickAmts)
    }
  }

  const selectMethod = async (method: FiatMethodOption) => {
    selectedMethod.value = method
    syncSelectedAccount({ preserveCurrent: false })
    await loadQuickAmounts()
  }

  const openAccountList = () => {
    accountListVisible.value = true
  }

  const closeAccountList = () => {
    accountListVisible.value = false
  }

  const openAddAccount = () => {
    reopenAccountListAfterAdd.value = true
    closeAccountList()
    pendingAccountNo.value = ''
    pendingAccountName.value = ''
    addAccountVisible.value = true
  }

  const closeAddAccount = () => {
    addAccountVisible.value = false
    pendingAccountNo.value = ''
    pendingAccountName.value = ''

    if (reopenAccountListAfterAdd.value) {
      reopenAccountListAfterAdd.value = false
      openAccountList()
    }
  }

  const handleSelectAccount = (localId: string) => {
    selectedAccount.value = availableAccounts.value.find(item => item.localId === localId) ?? null
    closeAccountList()
  }

  const confirmAddAccount = () => {
    const nextAccountNo = pendingAccountNo.value.trim()
    const nextAccountName = pendingAccountName.value.trim()

    if (!nextAccountNo || !nextAccountName) {
      return
    }

    const nextAccount: FiatAccountItem = {
      localId: `${selectedMethod.value.paymentCode ?? 'wallet'}-${Date.now()}`,
      rowId: `${Date.now()}`,
      accountNo: nextAccountNo,
      accountName: nextAccountName,
      paymentCode: selectedMethod.value.paymentCode,
      cardType: selectedMethod.value.paymentCode
    }

    memberCards.value = [nextAccount, ...memberCards.value]
    selectedAccount.value = nextAccount
    closeAddAccount()
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
    accountListVisible,
    amount,
    applyQuickAmount,
    availableAccounts,
    addAccountVisible,
    closeAccountList,
    closeAddAccount,
    confirmAddAccount,
    currentCurrency,
    currencySymbol,
    formattedBalance,
    isAmountDisabled,
    isWithdrawDisabled,
    openAccountList,
    openAddAccount,
    payMethods,
    pendingAccountName,
    pendingAccountNo,
    quickAmounts,
    handleSelectAccount,
    selectMethod,
    selectedAccount,
    selectedMethod
  }
}
