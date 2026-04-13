import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateToName } from '@/utils/router'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { AddMemberCardForm } from '@/api/interface/withdraw'
import { useMemberCardDefaultFlow } from '@/composables/useMemberCardDefaultFlow'
import {
  AddAccountOption,
  AccountCardOption,
  PaymentMethodsOption,
  usePaymentMethodsService
} from './usePaymentMethodsService'
import { showToast } from 'vant'
import { storeToRefs } from 'pinia'
import { useMemberCardVerificationFlow } from '@/composables/useMemberCardVerificationFlow'

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
  const selectPaymentMethodsOption = ref<PaymentMethodsOption>()
  const accountCardOption = ref<AccountCardOption>()
  const addAccountOptionVisible = ref(false)
  const deleteNotificationVisible = ref(false)
  const kindReminderVisible = ref(false)
  const accountDetailsPopVisible = ref(false)
  const selectAccountCardOption = ref<AccountCardOption>()

  const localeStore = useLocaleStore()
  const siteConfigStore = useSiteConfigStore()
  const { currentCurrency } = storeToRefs(localeStore)
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

  const { setDefault: modifyDefaultAccountCard } = useMemberCardDefaultFlow<AccountCardOption>({
    resolveTarget: option => option,
    alreadyDefaultMessage: t('withdraw.default_account_cannot_be_changed'),
    updateFailedMessage: 'Update default account failed',
    submitDefault: modifyDefaultCard
  })

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

  const reopenAddAddressForm = () => {
    closePaymentPasswordVerificationState()
    closeSmsVerificationState()
    addAccountOptionVisible.value = true
  }

  const closeSmsVerification = () => {
    closeSmsVerificationState()
    reopenAddAddressForm()
  }

  const closeAddAddressForm = () => {
    closePaymentPasswordVerificationState()
    closeSmsVerificationState()
    addAccountOptionVisible.value = false
  }

  const closePaymentPasswordVerification = () => {
    closePaymentPasswordVerificationState()
    reopenAddAddressForm()
  }

  const {
    hasTransactionPassword,
    maskedPhoneNumber,
    isSendingSmsCode,
    isCheckingSmsCode,
    isCheckingPaymentPassword,
    isSubmitting: isSubmittingAdd,
    paymentPasswordVisible,
    smsVerificationVisible,
    smsCountdownTrigger,
    beginSubmit,
    closeSmsVerification: closeSmsVerificationState,
    closePaymentPasswordVerification: closePaymentPasswordVerificationState,
    handleSmsVerificationResend: handleAddAccountOptionSmsVerificationResend,
    handleSmsVerificationConfirm: handleAddAccountOptionSmsVerificationConfirm,
    handlePaymentPasswordVerificationConfirm:
      handleAddAccountOptionPaymentPasswordVerificationConfirm
  } = useMemberCardVerificationFlow<AddAccountOption>({
    buildRequestData: (data): AddMemberCardForm | null => {
      if (!data.type || !data.cardType || !data.accountNo || !data.accountName) {
        return null
      }

      return {
        ...(addAccountSecurityVerifyWay.value !== 0
          ? { verifyType: String(addAccountSecurityVerifyWay.value) }
          : {}),
        type: data.type,
        cardType: data.cardType,
        accountNo: data.accountNo,
        accountName: data.accountName,
        accountSubNo: '',
        defaultCard: 1,
        validDate: 0,
        remark: ''
      }
    },
    submitRequest: addAcount,
    onRequireTransactionPassword: () => {
      kindReminderVisible.value = true
    },
    onSubmitted: async () => {
      await requestMemberCards()
      closeAddAddressForm()
    },
    onSubmitFailed: () => {
      reopenAddAddressForm()
    }
  })

  const openAddAcountCard = () => {
    if (!hasTransactionPassword.value) {
      kindReminderVisible.value = true
      return
    }

    addAccountOptionVisible.value = true
  }

  const addAcountCard = async (data: AddAccountOption) => {
    const result = await beginSubmit(data)

    if (result === 'sms' || result === 'password') {
      addAccountOptionVisible.value = false
    }
  }

  const closeAccountDetailsPop = () => {
    accountDetailsPopVisible.value = false
  }

  const openAccountDetailsPop = (option: AccountCardOption) => {
    selectAccountCardOption.value = option
    accountDetailsPopVisible.value = true
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
    selectAccountCardOption,
    accountDetailsPopVisible,
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
    handleAddAccountOptionPaymentPasswordVerificationConfirm,
    openAccountDetailsPop,
    closeAccountDetailsPop
  }
}
