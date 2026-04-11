import Api from '@/api'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateToName } from '@/utils/router'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { StringExtension } from '@/utils/string-extension'
import { AddMemberCardForm } from '@/api/interface/withdraw'
import {
  AddAccountOption,
  AccountCardOption,
  PaymentMethodsOption,
  usePaymentMethodsService
} from './usePaymentMethodsService'
import { showToast } from 'vant'
import { storeToRefs } from 'pinia'

const {
  paymentMethodsOptions,
  cryptoPaymentMethodsOptions,
  fiatPaymentMethodsOptions,
  accountOptions,
  hasLoadedPaymentMethodsOptions,
  hasLoadedAccountOptions,
  loadWithdrawMethods,
  loadMemberCards,
  addAcount,
  modifyDefaultCard,
  deleteAccount
} = usePaymentMethodsService()

export function usePaymentMethodsFlow() {
  const { t } = useI18n()
  const addAccountOption = ref<AddAccountOption>()
  const selectPaymentMethodsOption = ref<PaymentMethodsOption>()
  const accountCardOption = ref<AccountCardOption>()
  const isSendingSmsCode = ref(false)
  const isCheckingSmsCode = ref(false)
  const isCheckingPaymentPassword = ref(false)
  const isSubmittingAdd = ref(false)
  const addAccountOptionVisible = ref(false)
  const deleteNotificationVisible = ref(false)
  const kindReminderVisible = ref(false)
  const paymentPasswordVisible = ref(false)
  const smsVerificationVisible = ref(false)
  const smsCountdownTrigger = ref(0)

  const localeStore = useLocaleStore()
  const siteConfigStore = useSiteConfigStore()
  const userStore = useUserStore()
  const { currentCurrency } = storeToRefs(localeStore)
  const { userInfo } = storeToRefs(userStore)

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
  const hasTransactionPassword = computed(() =>
    Boolean(String(userInfo.value?.busiPwd ?? '').trim())
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

  /**是否支持会员删除收款账号 | `0` 不支持，`1` 支持 | */
  const hasDeleteAccount = computed(() => {
    const value = Number(
      (
        siteConfigStore.config as
          | {
              baseSiteConfig?: {
                delete_pix_support?: string | number
              }
            }
          | null
          | undefined
      )?.baseSiteConfig?.delete_pix_support ?? 0
    )

    return value === 1
  })
  /**新增会员收款账号安全验证方式 | `0` 不验证，`1` 短信，`2` 支付密码（单选） */
  const addAccountSecurityVerifyWay = computed(() => {
    const value = Number(
      (
        siteConfigStore.config as
          | {
              baseSiteConfig?: {
                add_member_card_security_verify_way?: string | number
              }
            }
          | null
          | undefined
      )?.baseSiteConfig?.add_member_card_security_verify_way ?? 0
    )

    return Number.isFinite(value) && value >= 0 ? value : 2
  })
  /**是否可以添加收款账户 */
  const canAddAccount = computed(() => {
    const limit = withdrawCardTypeLimit.value

    if (!limit) {
      return true
    }

    return accountOptions.value && accountOptions.value.length < limit
  })

  const isMethodTabActive = (option: PaymentMethodsOption) => {
    return (
      selectPaymentMethodsOption.value &&
      option.paymentCode &&
      selectPaymentMethodsOption.value.paymentCode &&
      option.paymentCode === selectPaymentMethodsOption.value.paymentCode
    )
  }

  const handleMethodTabClick = (option: PaymentMethodsOption) => {
    selectPaymentMethodsOption.value = option
    requestMemberCards()
  }

  const requestMemberCards = () => {
    if (selectPaymentMethodsOption.value && selectPaymentMethodsOption.value.paymentCode) {
      loadMemberCards(currentCurrency.value, selectPaymentMethodsOption.value.paymentCode)
    }
  }

  const accountCardOptions = computed<AccountCardOption[]>(() => {
    const res = accountOptions.value?.map(item => ({
      ...item,
      customIcon: selectPaymentMethodsOption.value?.customIcon ?? '',
      customRoundIcon: selectPaymentMethodsOption.value?.customRoundIcon ?? '',
      label: selectPaymentMethodsOption.value?.label ?? '',
      kind: selectPaymentMethodsOption.value?.kind ?? ''
    }))

    return res ?? []
  })

  const modifyDefaultAccountCard = (option: AccountCardOption) => {
    if (
      option == null ||
      !option.rowId ||
      String(option.rowId).trim() === '' ||
      !option.cardType ||
      String(option.cardType).trim() === ''
    ) {
      return
    }

    if (Number(option.defaultCard ?? 0) === 1) {
      showToast({
        message: t('withdraw.default_account_cannot_be_changed'),
        type: 'fail',
        duration: 3000
      })
      return
    }

    modifyDefaultCard(option.rowId, String(option.cardType).trim())
  }

  const deleteAccountCard = (option: AccountCardOption) => {
    if (option == null || !option.rowId || String(option.rowId).trim() === '') {
      return
    }

    if (hasDeleteAccount.value) {
      showToast({
        message: t('withdraw.delete_receive_address_not_supported'),
        type: 'fail',
        duration: 3000
      })
      return
    }

    accountCardOption.value = option
    deleteNotificationVisible.value = true
  }

  const buildAddMemberCardForm = (data: AddAccountOption): AddMemberCardForm => {
    return {
      ...(addAccountSecurityVerifyWay.value !== 0
        ? { verifyType: addAccountSecurityVerifyWay.value }
        : {}),
      ...(addAccountSecurityVerifyWay.value !== 0 && data.verifyCode
        ? { verifyCode: StringExtension.md5(data.verifyCode) }
        : {}),
      type: data.type,
      cardType: data.cardType,
      accountNo: data.accountNo,
      accountName: data.accountName,
      accountSubNo: '',
      defaultCard: 1,
      validDate: 0,
      remark: ''
    } as AddMemberCardForm
  }

  const reopenAddAddressForm = () => {
    paymentPasswordVisible.value = false
    smsVerificationVisible.value = false
    addAccountOptionVisible.value = true
  }

  const closeSmsVerification = () => {
    reopenAddAddressForm()
  }

  const closeAddAddressForm = () => {
    paymentPasswordVisible.value = false
    smsVerificationVisible.value = false
    addAccountOptionVisible.value = false
  }

  const handleAddAccountOptionSmsVerificationResend = async () => {
    await sendAddAccountOptionSmsCode()
  }

  const sendAddAccountOptionSmsCode = async () => {
    if (isSendingSmsCode.value) {
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
      isSendingSmsCode.value = true
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
        smsCountdownTrigger.value += 1
        return true
      }

      return false
    } finally {
      isSendingSmsCode.value = false
    }
  }

  const handleAddAccountOptionSmsVerificationConfirm = async (code: string) => {
    if (isCheckingSmsCode.value || isSubmittingAdd.value) {
      return
    }

    try {
      isCheckingSmsCode.value = true
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

      smsVerificationVisible.value = false
      if (addAccountOption.value) {
        addAccountOption.value.verifyCode = code
      }
      await submitAcountCard()
    } finally {
      isCheckingSmsCode.value = false
    }
  }

  const closePaymentPasswordVerification = () => {
    reopenAddAddressForm()
  }

  const handleAddAccountOptionPaymentPasswordVerificationConfirm = async (code: string) => {
    if (isCheckingPaymentPassword.value || isSubmittingAdd.value) {
      return
    }

    try {
      isCheckingPaymentPassword.value = true
      if (addAccountOption.value) {
        addAccountOption.value.verifyCode = code
      }
      await submitAcountCard()
    } finally {
      isCheckingPaymentPassword.value = false
    }
  }

  const openAddAcountCard = () => {
    if (!hasTransactionPassword.value) {
      kindReminderVisible.value = true
      return
    }

    addAccountOptionVisible.value = true
  }

  const addAcountCard = async (data: AddAccountOption) => {
    if (!hasTransactionPassword.value) {
      kindReminderVisible.value = true
      return
    }

    addAccountOption.value = data

    if (addAccountSecurityVerifyWay.value == 1) {
      smsVerificationVisible.value = true
      await sendAddAccountOptionSmsCode()
      return
    }

    if (addAccountSecurityVerifyWay.value == 2) {
      paymentPasswordVisible.value = true
      return
    }

    submitAcountCard()
  }

  const submitAcountCard = async () => {
    try {
      isSubmittingAdd.value = true
      if (addAccountOption.value) {
        const requestData = buildAddMemberCardForm(addAccountOption.value)
        await addAcount(requestData)
        closeAddAddressForm()
      }
    } finally {
      isSubmittingAdd.value = false
    }
  }

  const handleKindReminderSkid = () => {
    kindReminderVisible.value = false
  }

  const handleKindReminderSettings = () => {
    kindReminderVisible.value = false
    navigateToName('security')
  }

  const confirmDeleteAccountCard = async () => {
    if (accountCardOption.value) {
      await deleteAccount(accountCardOption.value.rowId)
      deleteNotificationVisible.value = false
    }
  }

  const coloseDeleteNotification = () => {
    accountCardOption.value = undefined
    deleteNotificationVisible.value = false
  }

  const closeAddAcountCard = () => {
    closeAddAddressForm()
  }

  onMounted(async () => {
    await siteConfigStore.initSiteConfig()
    loadWithdrawMethods().then(() => {
      if (
        hasLoadedPaymentMethodsOptions.value &&
        paymentMethodsOptions.value &&
        paymentMethodsOptions.value.length > 0
      ) {
        handleMethodTabClick(paymentMethodsOptions.value[0])
      }
    })
  })

  return {
    addAccountOptionVisible,
    deleteNotificationVisible,
    kindReminderVisible,
    paymentPasswordVisible,
    smsVerificationVisible,
    paymentMethodsOptions,
    cryptoPaymentMethodsOptions,
    fiatPaymentMethodsOptions,
    accountCardOptions,
    hasLoadedPaymentMethodsOptions,
    hasLoadedAccountOptions,
    canAddAccount,
    hasDeleteAccount,
    addAccountSecurityVerifyWay,
    hasTransactionPassword,
    selectPaymentMethodsOption,
    maskedPhoneNumber,
    isSendingSmsCode,
    isCheckingSmsCode,
    isCheckingPaymentPassword,
    isSubmittingAdd,
    smsCountdownTrigger,
    isMethodTabActive,
    requestMemberCards,
    openAddAcountCard,
    closeAddAcountCard,
    addAcountCard,
    modifyDefaultAccountCard,
    deleteAccountCard,
    confirmDeleteAccountCard,
    coloseDeleteNotification,
    handleMethodTabClick,
    handleKindReminderSettings,
    handleKindReminderSkid,
    closeSmsVerification,
    closeAddAddressForm,
    handleAddAccountOptionSmsVerificationResend,
    handleAddAccountOptionSmsVerificationConfirm,
    closePaymentPasswordVerification,
    handleAddAccountOptionPaymentPasswordVerificationConfirm
  }
}
