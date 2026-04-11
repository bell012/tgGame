import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type {
  AddMemberCardForm,
  FastAmountItem,
  MemberCardItem,
  WithdrawManagerItem
} from '@/api/interface/withdraw'
import { showToast } from 'vant'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { useIsMobile } from '@/composables/useMediaQuery'
import { getBalanceByCurrency } from '@/utils/balance'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import { StringExtension } from '@/utils/string-extension'
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
  const addAccountPaymentPasswordVisible = ref(false)
  const addAccountSmsVerificationVisible = ref(false)
  const reopenAccountListAfterAdd = ref(false)
  const isLoadingMemberCards = ref(false)
  const hasLoadedMemberCards = ref(false)
  const hasMemberCardsLoadError = ref(false)
  const isRefreshingBalance = ref(false)
  const isSendingAddAccountSmsCode = ref(false)
  const isCheckingAddAccountSmsCode = ref(false)
  const isSubmittingAddAccount = ref(false)
  const addAccountSmsCountdownTrigger = ref(0)
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
  const addMemberCardVerifyWay = computed(() => {
    const baseSiteConfig = (
      siteConfigStore.config as
        | {
            baseSiteConfig?: {
              add_member_card_security_verify_way?: string | number
              addMemberCardSecurityVerifyWay?: string | number
            }
          }
        | null
        | undefined
    )?.baseSiteConfig

    return String(
      baseSiteConfig?.add_member_card_security_verify_way ??
        baseSiteConfig?.addMemberCardSecurityVerifyWay ??
        ''
    ).trim()
  })
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

  const handleToggleAccountDefault = (localId: string) => {
    const nextSelectedAccount =
      availableAccounts.value.find(item => item.localId === localId) ?? null
    const nextCardType = selectedMethod.value.paymentCode

    if (!nextSelectedAccount || nextCardType == null || String(nextCardType).trim() === '') {
      return
    }

    if (Number(nextSelectedAccount.defaultCard ?? 0) === 1) {
      showToast({
        message: t('withdraw.default_account_cannot_be_changed'),
        type: 'fail',
        duration: 3000
      })
      return
    }

    void (async () => {
      try {
        const response = await Api.withdraw.modifyDefaultCard({
          rowId: nextSelectedAccount.rowId,
          cardType: nextCardType,
          defaultCard: 1,
          validDate: 0
        })

        if (response?.code !== 'C2') {
          showToast({
            message: String(response?.message || 'Update default account failed'),
            type: 'fail',
            duration: 3000
          })
          return
        }

        memberCards.value = memberCards.value.map(item => ({
          ...item,
          defaultCard: item.localId === localId ? 1 : 0
        }))

        selectedAccount.value =
          availableAccounts.value.find(item => item.localId === localId) ?? selectedAccount.value
        syncSelectedAccount()
      } catch (error) {
        console.error(error)
        showToast({
          message: 'Update default account failed',
          type: 'fail',
          duration: 3000
        })
      }
    })()
  }

  const buildAddMemberCardForm = (
    nextAccountNo: string,
    nextAccountName: string,
    verifiedValue?: string
  ): AddMemberCardForm | null => {
    const nextType = Number(selectedMethod.value.cardType ?? 0)
    const nextCardType = Number(selectedMethod.value.paymentCode ?? 0)

    if (!nextType || !nextCardType) {
      return null
    }

    return {
      ...(addMemberCardVerifyWay.value ? { verifyType: addMemberCardVerifyWay.value } : {}),
      ...(verifiedValue ? { verifyCode: StringExtension.md5(verifiedValue) } : {}),
      type: nextType,
      cardType: nextCardType,
      accountNo: nextAccountNo,
      accountName: nextAccountName,
      accountSubNo: '',
      defaultCard: 1,
      validDate: 0,
      remark: ''
    }
  }

  const submitAddAccount = async (verifiedValue?: string) => {
    const nextAccountNo = pendingAccountNo.value.trim()
    const nextAccountName = pendingAccountName.value.trim()

    if (!nextAccountNo || !nextAccountName) {
      return
    }

    const requestData = buildAddMemberCardForm(nextAccountNo, nextAccountName, verifiedValue)

    if (!requestData) {
      showToast({
        message: 'Unavailable',
        type: 'fail',
        duration: 3000
      })
      return
    }

    try {
      isSubmittingAddAccount.value = true
      const response = await Api.withdraw.addMemberCard(requestData)

      if (response?.code !== 'C2') {
        showToast({
          message: String(response?.message || 'Add account failed'),
          type: 'fail',
          duration: 3000
        })
        reopenAddAccountForm()
        return
      }
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Add account failed',
        type: 'fail',
        duration: 3000
      })
      reopenAddAccountForm()
      return
    } finally {
      isSubmittingAddAccount.value = false
    }

    await loadMemberCards()
    syncSelectedAccount()
    selectedAccount.value =
      availableAccounts.value.find(item => item.accountNo === nextAccountNo) ?? null
    closeAddAccount()
  }

  const sendAddAccountSmsCode = async () => {
    if (isSendingAddAccountSmsCode.value) {
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
      isSendingAddAccountSmsCode.value = true
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
        addAccountSmsCountdownTrigger.value += 1
        return true
      }

      return false
    } finally {
      isSendingAddAccountSmsCode.value = false
    }
  }

  const closeAddAccountPaymentPassword = () => {
    addAccountPaymentPasswordVisible.value = false
    reopenAddAccountForm()
  }

  const closeAddAccountSmsVerification = () => {
    addAccountSmsVerificationVisible.value = false
    reopenAddAccountForm()
  }

  const handleAddAccountPaymentPasswordConfirm = async (password: string) => {
    addAccountPaymentPasswordVisible.value = false
    await submitAddAccount(password)
  }

  const handleAddAccountSmsVerificationResend = async () => {
    await sendAddAccountSmsCode()
  }

  const handleAddAccountSmsVerificationConfirm = async (code: string) => {
    if (isCheckingAddAccountSmsCode.value || isSubmittingAddAccount.value) {
      return
    }

    try {
      isCheckingAddAccountSmsCode.value = true
      const response = await Api.auth.checkSms({
        telephone: resolvedTelephone.value,
        areaCode: resolvedAreaCode.value,
        smsCode: code
      })

      if (response?.code !== 'C2') {
        showToast({
          message: String(response?.message || 'Invalid sms code'),
          type: 'fail',
          duration: 3000
        })
        return
      }

      addAccountSmsVerificationVisible.value = false
      await submitAddAccount(code)
    } finally {
      isCheckingAddAccountSmsCode.value = false
    }
  }

  const confirmAddAccount = async () => {
    const nextAccountNo = pendingAccountNo.value.trim()
    const nextAccountName = pendingAccountName.value.trim()

    if (!nextAccountNo || !nextAccountName) {
      return
    }

    if (needAddMemberCardBusiPwd.value) {
      addAccountVisible.value = false
      addAccountPaymentPasswordVisible.value = true
      return
    }

    if (needAddMemberCardTelephoneSms.value) {
      addAccountVisible.value = false
      addAccountSmsVerificationVisible.value = true
      await sendAddAccountSmsCode()
      return
    }

    await submitAddAccount()
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
