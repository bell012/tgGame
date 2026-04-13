import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { FastAmountItem, MemberCardItem, WithdrawManagerItem } from '@/api/interface/withdraw'
import { showToast } from 'vant'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useMemberCardDefaultFlow } from '@/composables/useMemberCardDefaultFlow'
import { useMemberCardVerificationFlow } from '@/composables/useMemberCardVerificationFlow'
import { getBalanceByCurrency } from '@/utils/balance'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import { splitWithdrawManagerMethods } from './withdrawManager'
import { requestOpenWithdrawKindReminder } from './useWithdrawFlow'

export interface FiatMethodOption {
  name: string
  icon: string
  selectedIcon: string
  paymentCode?: string | number
  cardType?: string | number
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
  const imagePath = method.logo || method.logoSelect
  return imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''
}

const resolveSelectedMethodIcon = (method: WithdrawManagerItem) => {
  const imagePath = method.defaultOrderIcon || method.logo
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

const matchMethodAccount = (method: FiatMethodOption, account: MemberCardItem) => {
  const paymentCode = normalizeText(method.paymentCode)
  const methodCardType = normalizeText(method.cardType)
  const accountCardType = normalizeText(account.cardType)
  const accountType = normalizeText(account.type)

  if (!paymentCode || !methodCardType) {
    return false
  }

  return accountCardType === paymentCode && accountType === methodCardType
}

export function useWithdrawFiat() {
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const localeStore = useLocaleStore()
  const siteConfigStore = useSiteConfigStore()
  const userStore = useUserStore()
  const { currentCurrency } = storeToRefs(localeStore)
  const { acctInfo } = storeToRefs(userStore)

  const payMethods = ref<FiatMethodOption[]>([])
  const selectedMethod = ref<FiatMethodOption>({
    name: '',
    icon: '',
    selectedIcon: '',
    paymentCode: ''
  })
  const memberCards = ref<FiatAccountItem[]>([])
  const selectedAccount = ref<FiatAccountItem | null>(null)
  const quickAmounts = ref<FastAmountItem[]>([])
  const amount = ref<number>()
  const accountListVisible = ref(false)
  const addAccountVisible = ref(false)
  const reopenAccountListAfterAdd = ref(false)
  const isLoadingMemberCards = ref(false)
  const hasLoadedMemberCards = ref(false)
  const hasMemberCardsLoadError = ref(false)
  const isRefreshingBalance = ref(false)
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
  const hasTransactionPassword = computed(() =>
    Boolean(String(userStore.userInfo?.busiPwd ?? '').trim())
  )
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
  const canAddAccount = computed(() => {
    const limit = withdrawCardTypeLimit.value

    if (!limit) {
      return true
    }

    return availableAccounts.value.length < limit
  })
  const {
    maskedPhoneNumber,
    isSendingSmsCode: isSendingAddAccountSmsCode,
    isCheckingSmsCode: isCheckingAddAccountSmsCode,
    isCheckingPaymentPassword: isCheckingAddAccountPaymentPassword,
    isSubmitting: isSubmittingAddAccount,
    paymentPasswordVisible: addAccountPaymentPasswordVisible,
    smsVerificationVisible: addAccountSmsVerificationVisible,
    smsCountdownTrigger: addAccountSmsCountdownTrigger,
    beginSubmit: beginAddAccountSubmit,
    closeSmsVerification: closeAddAccountSmsVerificationState,
    closePaymentPasswordVerification: closeAddAccountPaymentPasswordState,
    handleSmsVerificationResend: handleAddAccountSmsVerificationResend,
    handleSmsVerificationConfirm: handleAddAccountSmsVerificationConfirm,
    handlePaymentPasswordVerificationConfirm: handleAddAccountPaymentPasswordConfirm
  } = useMemberCardVerificationFlow<{ accountNo: string; accountName: string }>({
    buildRequestData: (data, verifyCode) => {
      const nextType = Number(selectedMethod.value.cardType ?? 0)
      const nextCardType = Number(selectedMethod.value.paymentCode ?? 0)

      if (!nextType || !nextCardType) {
        return null
      }

      return {
        accountNo: data.accountNo,
        accountName: data.accountName,
        accountSubNo: '',
        cardType: nextCardType,
        defaultCard: 1,
        remark: '',
        type: nextType,
        validDate: 0,
        ...(verifyCode ? { verifyCode } : {})
      }
    },
    submitRequest: async requestData => {
      try {
        const response = await Api.withdraw.addMemberCard(requestData)

        if (response?.code !== 'C2') {
          showToast({
            message: String(response?.message || 'Add account failed'),
            type: 'fail',
            duration: 3000
          })
          return false
        }

        return true
      } catch (error) {
        console.error(error)
        showToast({
          message: 'Add account failed',
          type: 'fail',
          duration: 3000
        })
        return false
      }
    },
    onRequireTransactionPassword: () => {
      requestOpenWithdrawKindReminder()
    },
    onSubmitted: async () => {
      const nextAccountNo = pendingAccountNo.value.trim()
      await loadMemberCards()
      syncSelectedAccount()
      selectedAccount.value =
        availableAccounts.value.find(item => item.accountNo === nextAccountNo) ?? null
      closeAddAccount()
    },
    onSubmitFailed: () => {
      reopenAddAccountForm()
    }
  })

  const syncSelectedAccount = ({ preserveCurrent = true }: { preserveCurrent?: boolean } = {}) => {
    if (!preserveCurrent) {
      selectedAccount.value = null
      return
    }

    const matchedAccount = availableAccounts.value.find(
      account => account.localId === selectedAccount.value?.localId
    )

    if (!matchedAccount && isMobile.value) {
      selectedAccount.value = null
      return
    }

    const nextAccount =
      matchedAccount ??
      availableAccounts.value.find(account => Number(account.defaultCard ?? 0) === 1) ??
      null

    selectedAccount.value = nextAccount
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
          selectedIcon: resolveSelectedMethodIcon(item),
          paymentCode: item.paymentCode,
          cardType: item.cardType,
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
          selectedIcon: '',
          paymentCode: ''
        }
      }
    } catch (error) {
      console.error(error)
      payMethods.value = []
      selectedMethod.value = {
        name: '',
        icon: '',
        selectedIcon: '',
        paymentCode: ''
      }
    }
  }

  const loadMemberCards = async () => {
    const requestData = {
      currency: currentCurrency.value,
      cardType: selectedMethod.value.paymentCode
    }

    isLoadingMemberCards.value = true
    hasMemberCardsLoadError.value = false

    try {
      const response = await Api.withdraw.selectMemberCard(requestData)
      const result = Array.isArray(response.result) ? response.result : []

      memberCards.value = result.map((item, index) => ({
        ...item,
        localId: String(item.rowId ?? `wallet-${index}`)
      }))
      hasLoadedMemberCards.value = true
    } catch (error) {
      console.error(error)
      memberCards.value = []
      hasMemberCardsLoadError.value = true
      hasLoadedMemberCards.value = true
    } finally {
      isLoadingMemberCards.value = false
    }

    syncSelectedAccount()
  }

  const loadQuickAmounts = async () => {
    if (selectedMethod.value.paymentCode == null || selectedMethod.value.paymentCode === '') {
      quickAmounts.value = []
      return
    }

    const requestParams = {
      paymentCode: selectedMethod.value.paymentCode
    }

    try {
      const response = await Api.withdraw.queryFastAmount(requestParams)
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
    await loadMemberCards()
    await loadQuickAmounts()
  }

  const ensureCanManageAccount = () => {
    if (hasTransactionPassword.value) {
      return true
    }

    accountListVisible.value = false
    addAccountVisible.value = false
    requestOpenWithdrawKindReminder()
    return false
  }

  const openAccountList = () => {
    if (!ensureCanManageAccount()) {
      return
    }

    if (
      isLoadingMemberCards.value ||
      !hasLoadedMemberCards.value ||
      hasMemberCardsLoadError.value
    ) {
      return
    }

    accountListVisible.value = true
  }

  const closeAccountList = () => {
    accountListVisible.value = false
  }

  const openAddAccount = () => {
    if (!ensureCanManageAccount()) {
      return
    }

    if (!canAddAccount.value) {
      return
    }

    reopenAccountListAfterAdd.value = accountListVisible.value
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

  const reopenAddAccountForm = () => {
    addAccountVisible.value = true
  }

  const handleSelectAccount = (localId: string) => {
    selectedAccount.value = availableAccounts.value.find(item => item.localId === localId) ?? null
    closeAccountList()
  }

  const { setDefault: applyAccountDefault } = useMemberCardDefaultFlow<string>({
    resolveTarget: localId => {
      const nextSelectedAccount =
        availableAccounts.value.find(item => item.localId === localId) ?? null

      if (!nextSelectedAccount) {
        return null
      }

      return {
        rowId: nextSelectedAccount.rowId,
        cardType: selectedMethod.value.paymentCode,
        defaultCard: nextSelectedAccount.defaultCard
      }
    },
    alreadyDefaultMessage: t('withdraw.default_account_cannot_be_changed'),
    updateFailedMessage: 'Update default account failed',
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
    onSuccess: localId => {
      memberCards.value = memberCards.value.map(item => ({
        ...item,
        defaultCard: item.localId === localId ? 1 : 0
      }))

      selectedAccount.value =
        availableAccounts.value.find(item => item.localId === localId) ?? selectedAccount.value
      syncSelectedAccount()
    }
  })

  const handleToggleAccountDefault = (localId: string) => {
    void applyAccountDefault(localId)
  }

  const closeAddAccountPaymentPassword = () => {
    closeAddAccountPaymentPasswordState()
    reopenAddAccountForm()
  }

  const closeAddAccountSmsVerification = () => {
    closeAddAccountSmsVerificationState()
    reopenAddAccountForm()
  }

  const confirmAddAccount = async () => {
    const nextAccountNo = pendingAccountNo.value.trim()
    const nextAccountName = pendingAccountName.value.trim()

    if (!nextAccountNo || !nextAccountName) {
      return
    }

    const result = await beginAddAccountSubmit({
      accountNo: nextAccountNo,
      accountName: nextAccountName
    })

    if (result === 'password' || result === 'sms') {
      addAccountVisible.value = false
    }
  }

  const applyQuickAmount = (quickAmount: FastAmountItem) => {
    const nextAmount = Number(quickAmount.amount ?? 0)

    if (Number.isFinite(nextAmount) && nextAmount > 0) {
      amount.value = nextAmount
    }
  }

  const refreshBalance = async () => {
    if (isRefreshingBalance.value) {
      return
    }

    try {
      isRefreshingBalance.value = true
      await userStore.refreshAcctInfo()
    } finally {
      isRefreshingBalance.value = false
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
    addAccountPaymentPasswordVisible,
    addAccountSmsCountdownTrigger,
    addAccountSmsVerificationVisible,
    balanceAmount,
    canAddAccount,
    closeAccountList,
    closeAddAccount,
    closeAddAccountPaymentPassword,
    closeAddAccountSmsVerification,
    confirmAddAccount,
    currentCurrency,
    currencySymbol,
    formattedBalance,
    handleAddAccountPaymentPasswordConfirm,
    handleAddAccountSmsVerificationConfirm,
    handleAddAccountSmsVerificationResend,
    isAmountDisabled,
    isCheckingAddAccountSmsCode,
    isCheckingAddAccountPaymentPassword,
    isRefreshingBalance,
    isSendingAddAccountSmsCode,
    isSubmittingAddAccount,
    isWithdrawDisabled,
    maskedPhoneNumber,
    openAccountList,
    openAddAccount,
    payMethods,
    pendingAccountName,
    pendingAccountNo,
    quickAmounts,
    refreshBalance,
    handleSelectAccount,
    handleToggleAccountDefault,
    selectMethod,
    selectedAccount,
    selectedMethod
  }
}
