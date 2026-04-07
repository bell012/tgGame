import Api from '@/api'
import type {
  QueryWithdrawConfigByMemberResponse,
  SubmitTransferOrderForm,
  SubmitTransferOrderResult,
  WithdrawOrderDetail
} from '@/api/interface/withdraw'
import { StringExtension } from '@/utils/string-extension'
import type { WithdrawOrderStatus, WithdrawSubmitPayload } from './types'

export interface SubmitWithdrawWorkflowParams {
  payload: WithdrawSubmitPayload
  verifyCode?: string
  modifyBy?: string
  withdrawNumber?: number
}

export interface WithdrawOrderViewData {
  orderId: string
  orderNo: string
  amountText: string
  createdAt: string
  methodLabel: string
  status: WithdrawOrderStatus
}

const getAccountNo = (payload: WithdrawSubmitPayload) => {
  return payload.accountRowId ?? payload.address ?? ''
}

const getColumnCode = (payload: WithdrawSubmitPayload) => {
  return payload.paymentCode ?? payload.methodLabel
}

const getCurrencyCode = (payload: WithdrawSubmitPayload) => payload.currencyCode || 'PHP'

const formatAmountText = (amount: string | number | undefined, currencyCode: string) => {
  const nextAmount = Number(amount ?? 0)
  const amountText = Number.isFinite(nextAmount) ? nextAmount.toFixed(0) : String(amount ?? 0)

  return `${amountText}${currencyCode}`
}

const normalizeOrderStatus = (status: unknown): WithdrawOrderStatus => {
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase()

  if (
    normalized === 'success' ||
    normalized === 'completed' ||
    normalized === 'complete' ||
    normalized === '2'
  ) {
    return 'completed'
  }

  return 'processing'
}

const buildOrderViewData = ({
  detail,
  payload,
  submitResult
}: {
  detail?: WithdrawOrderDetail | null
  payload: WithdrawSubmitPayload
  submitResult?: SubmitTransferOrderResult
}): WithdrawOrderViewData => {
  const currencyCode = getCurrencyCode(payload)
  const amountText = formatAmountText(detail?.busiAmount ?? payload.amount, currencyCode)
  const orderId = String(detail?.orderId ?? submitResult?.orderId ?? '')
  const orderNo = String(detail?.orderNo ?? submitResult?.orderNo ?? orderId)
  const createdAt = String(detail?.createTime ?? new Date().toLocaleString('en-US'))
  const methodLabel = String(detail?.paymentName ?? payload.methodLabel ?? '')

  return {
    orderId,
    orderNo,
    amountText,
    createdAt,
    methodLabel,
    status: normalizeOrderStatus(detail?.status ?? submitResult?.status)
  }
}

const buildSubmitTransferOrderForm = ({
  payload,
  verifyCode,
  modifyBy,
  withdrawNumber = 0
}: SubmitWithdrawWorkflowParams): SubmitTransferOrderForm => {
  const accountNo = getAccountNo(payload)
  const columnCode = getColumnCode(payload)

  return {
    busiAmount: String(payload.amount),
    accountNo,
    withdrawNumber,
    channelId: payload.channelId,
    columnCode,
    currencyCode: getCurrencyCode(payload),
    ...(verifyCode ? { verifyCode } : {}),
    ...(modifyBy ? { modifyBy: StringExtension.md5(modifyBy) } : {})
  }
}

export const ensureNoPendingWithdrawOrder = async () => {
  const response = await Api.withdraw.queryWithdrawOrderList({})
  const orderList = Array.isArray(response?.result) ? response.result : []

  if (orderList.length > 0) {
    throw new Error('withdraw.pending_order_exists')
  }
}

export const ensureWithdrawTurnoverRequirement = async () => {
  const response = await Api.withdraw.queryNeedBetAmountForApp()
  const requiredBetAmount = Number(response?.result ?? 0)

  if (requiredBetAmount > 0) {
    throw new Error('withdraw.bet_requirement_unfinished')
  }
}

export const queryWithdrawSubmissionConfig = async (
  payload: WithdrawSubmitPayload
): Promise<QueryWithdrawConfigByMemberResponse['result']> => {
  const accountNo = getAccountNo(payload)

  if (!accountNo) {
    throw new Error('withdraw.missing_account')
  }

  const response = await Api.withdraw.queryWithdrawConfigByMember({ accountNo })
  return response?.result
}

export const submitWithdrawWorkflow = async (
  params: SubmitWithdrawWorkflowParams
): Promise<WithdrawOrderViewData> => {
  const accountNo = getAccountNo(params.payload)

  if (!accountNo) {
    throw new Error('withdraw.missing_account')
  }

  await ensureNoPendingWithdrawOrder()
  await ensureWithdrawTurnoverRequirement()
  await queryWithdrawSubmissionConfig(params.payload)

  const submitResponse = await Api.withdraw.submitTransferOrder(
    buildSubmitTransferOrderForm(params)
  )
  const submitResult = submitResponse?.result
  const orderId = submitResult?.orderId

  if (!orderId) {
    throw new Error(String(submitResponse?.message || 'withdraw.submit_failed'))
  }

  try {
    const detailResponse = await Api.withdraw.queryTheWithdrawOrder({ orderId })
    return buildOrderViewData({
      detail: detailResponse?.result,
      payload: params.payload,
      submitResult
    })
  } catch {
    return buildOrderViewData({
      payload: params.payload,
      submitResult
    })
  }
}
