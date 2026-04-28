import Api from '@/api'
import { AddMemberCardForm, MemberCardItem, WithdrawManagerItem } from '@/api/interface/withdraw'
import i18n from '@/i18n'
import { Component, computed, ref } from 'vue'
import { globalShowToast } from '@/utils/toast'
import GCashCardIcon from '@/static/svg/withdraw/GCash_card.svg?component'
import GrabPayCardIcon from '@/static/svg/withdraw/GrabPay_card.svg?component'
import MAYACardIcon from '@/static/svg/withdraw/MAYA_card.svg?component'
import ShopeePayCardIcon from '@/static/svg/withdraw/ShopeePay_card.svg?component'
import USDTCardIcon from '@/static/svg/withdraw/USDT_card.svg?component'
import {
  resolveCoinNetworks,
  type CoinNetworkItem
} from '@/components/paymentMethods/shared/cryptoCoins'

export interface AccountOption extends MemberCardItem {
  customCardBackground: Component | null
}

export interface PaymentMethodsOption extends WithdrawManagerItem {
  customIcon: string
  customRoundIcon: string
  label: string
  kind: string
  networks: CoinNetworkItem[]
}

export interface AddAccountOption extends AccountOption {
  verifyType?: string
  verifyCode?: string
}

export interface AccountCardOption extends AccountOption {
  customIcon: string
  customRoundIcon: string
  label: string
  kind: string
}

export const isVisibleWithdrawManagerItem = (item: WithdrawManagerItem) => {
  return Number(item.status ?? 0) === 1
}

export const normalizePaymentMethodsOption = (item: WithdrawManagerItem): PaymentMethodsOption => ({
  ...item,
  customIcon: toImageUrl(item.logo ?? item.logoSelect ?? ''),
  customRoundIcon: toImageUrl(item.defaultOrderIcon ?? item.logo ?? ''),
  label: cryptoPaymentCodes.includes(Number(item.paymentCode ?? 0))
    ? 'USDT'
    : String(item.paymentName ?? ''),
  kind: cryptoPaymentCodes.includes(Number(item.paymentCode ?? 0)) ? 'crypto' : 'fiat',
  networks: cryptoPaymentCodes.includes(Number(item.paymentCode ?? 0))
    ? resolveCoinNetworks('USDT')
    : []
})

export const normalizeAccountOption = (item: MemberCardItem): AccountOption => ({
  ...item,
  customCardBackground: resolveCardBackground(item.cardType)
})

const resolveCardBackground = (paymentCode?: string | number) => {
  const normalized = String(paymentCode ?? '').trim()

  if (normalized === '5') return USDTCardIcon
  if (normalized === '13') return GCashCardIcon
  if (normalized === '17') return MAYACardIcon
  if (normalized === '59') return GrabPayCardIcon
  if (normalized === '60') return ShopeePayCardIcon

  return null
}

const toImageUrl = (value: string) => {
  if (!value) return ''
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

const cryptoPaymentCodes = [5]
const fiatPaymentCodes = [13, 17, 59, 60]

export function usePaymentMethodsService() {
  const t = i18n.global.t
  let memberCardsRequestId = 0
  /**全部收款方式 */
  const paymentMethodsOptions = ref<PaymentMethodsOption[]>()
  /**收款方式是否加载成功 */
  const hasLoadedPaymentMethodsOptions = ref(false)
  /**加密货币收款方式集合 */
  const cryptoPaymentMethodsOptions = computed<PaymentMethodsOption[]>(() => {
    return (
      paymentMethodsOptions.value?.filter(
        item => item.paymentCode && cryptoPaymentCodes.includes(Number(item.paymentCode ?? 0))
      ) ?? []
    )
  })
  /**法币收款方式集合 */
  const fiatPaymentMethodsOptions = computed<PaymentMethodsOption[]>(() => {
    return (
      paymentMethodsOptions.value?.filter(
        item => item.paymentCode && fiatPaymentCodes.includes(Number(item.paymentCode ?? 0))
      ) ?? []
    )
  })
  /**收款账号集合 */
  const accountOptions = ref<AccountOption[]>()
  /**收款方式是否加载成功 */
  const hasLoadedAccountOptions = ref(false)

  /**加载收款方式 */
  const loadWithdrawMethods = async () => {
    try {
      hasLoadedPaymentMethodsOptions.value = false
      const response = await Api.withdraw.queryWithdrawManager()
      const result = Array.isArray(response.result) ? response.result : []
      paymentMethodsOptions.value = result
        .filter(isVisibleWithdrawManagerItem)
        .map(normalizePaymentMethodsOption)
      hasLoadedPaymentMethodsOptions.value = true
    } catch (error) {
      console.error(error)
      hasLoadedPaymentMethodsOptions.value = false
    }
  }

  /**
   * 加载收款账号
   * @param paymentCode 收款账号编码
   */
  const loadMemberCards = async (currency: string, paymentCode: string | number) => {
    const requestId = ++memberCardsRequestId

    try {
      hasLoadedAccountOptions.value = false
      accountOptions.value = []
      const requestData = {
        currency: currency,
        cardType: paymentCode
      }
      const response = await Api.withdraw.selectMemberCard(requestData)

      if (requestId !== memberCardsRequestId) {
        return
      }

      const result = Array.isArray(response.result) ? response.result : []
      accountOptions.value = result.map(normalizeAccountOption)
      hasLoadedAccountOptions.value = true
    } catch (error) {
      if (requestId !== memberCardsRequestId) {
        return
      }

      console.error(error)
      hasLoadedAccountOptions.value = false
    }
  }

  /**
   * 添加收款账号
   * @param data 收款账号
   */
  const addAcount = async (requestData: AddMemberCardForm) => {
    try {
      const response = await Api.withdraw.addMemberCard(requestData)

      if (response?.code !== 'C2') {
        globalShowToast({
          message: String(response?.message || t('withdraw.add_account_failed')),
          type: 'fail'
        })
        return false
      }

      return true
    } catch (error) {
      console.log(error)
      globalShowToast({
        message: t('withdraw.add_account_failed'),
        type: 'fail'
      })
      return false
    }
  }

  /**
   * 修改默认收款账号
   * @param rowId 收款账号ID
   * @param paymentCode 收款账号编码
   */
  const modifyDefaultCard = async (rowId: string | number, paymentCode: string | number) => {
    try {
      const response = await Api.withdraw.modifyDefaultCard({
        rowId: rowId,
        cardType: paymentCode,
        defaultCard: 1,
        validDate: 0
      })
      if (response?.code !== 'C2') {
        globalShowToast({
          message: String(response?.message || t('withdraw.update_default_account_failed')),
          type: 'fail'
        })
        return false
      }

      accountOptions.value = accountOptions.value?.map(item => ({
        ...item,
        defaultCard: item.rowId === rowId ? 1 : 0
      }))
      return true
    } catch (error) {
      console.log(error)
      globalShowToast({
        message: t('withdraw.update_default_account_failed'),
        type: 'fail'
      })
      return false
    }
  }

  /**
   * 删除收款账号
   * @param rowId 收款账号ID
   */
  const deleteAccount = async (rowId: string | number) => {
    try {
      const response = await Api.withdraw.delMemberCard({
        rowId: rowId,
        validDate: 0
      })
      if (response?.code !== 'C2') {
        globalShowToast({
          message: String(response?.message || t('withdraw.delete_account_failed')),
          type: 'fail'
        })
        return
      }
      accountOptions.value = accountOptions.value?.filter(item => item.rowId !== rowId)
    } catch (error) {
      console.log(error)
      globalShowToast({
        message: t('withdraw.delete_account_failed'),
        type: 'fail'
      })
    }
  }

  return {
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
  }
}
