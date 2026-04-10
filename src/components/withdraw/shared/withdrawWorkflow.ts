import Api from '@/api'
import type {
  QueryWithdrawConfigByMemberResponse,
  SubmitTransferOrderForm,
  SubmitTransferOrderResult,
  WithdrawOrderDetail
} from '@/api/interface/withdraw'
import { formatTimestamp } from '@/utils/date'
import { StringExtension } from '@/utils/string-extension'
import type { WithdrawOrderStatus, WithdrawSubmitPayload } from './types'

export interface SubmitWithdrawWorkflowParams {
  payload: WithdrawSubmitPayload
  modifyBy?: string
  hashModifyBy?: boolean
  withdrawNumber?: number
}

export interface WithdrawOrderViewData {
  orderId: string
  orderNo: string
  amountText: string
  createdAt: string
  methodLabel: string
  methodIcon: string
  status: WithdrawOrderStatus
}

const getAccountNo = (payload: WithdrawSubmitPayload) => payload.accountRowId ?? ''

const getColumnCode = (payload: WithdrawSubmitPayload) => payload.paymentCode ?? ''

const getCurrencyCode = (payload: WithdrawSubmitPayload) => payload.currencyCode || 'PHP'

const getDisplayCreateTime = (
  detail?: WithdrawOrderDetail | null,
  submitResult?: SubmitTransferOrderResult
) =>
  formatTimestamp(
    (detail?.createTime ?? submitResult?.createTime ?? null) as string | number | null | undefined
  )

const formatAmountText = (amount: string | number | undefined, currencyCode: string) => {
  const nextAmount = Number(amount ?? 0)
  const amountText = Number.isFinite(nextAmount) ? nextAmount.toFixed(0) : String(amount ?? 0)

  return `${amountText}${currencyCode}`
}

const normalizeOrderStatus = (status: unknown): WithdrawOrderStatus => {
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase()

  if (normalized === '3') {
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
  const createdAt = getDisplayCreateTime(detail, submitResult)
  const methodLabel = String(detail?.paymentName ?? payload.methodLabel ?? '')
  const methodIcon = String(payload.methodIcon ?? '')

  return {
    orderId,
    orderNo,
    amountText,
    createdAt,
    methodLabel,
    methodIcon,
    status: normalizeOrderStatus(detail?.status ?? submitResult?.status)
  }
}

const buildSubmitTransferOrderForm = ({
  payload,
  modifyBy,
  hashModifyBy = true,
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
    ...(modifyBy ? { modifyBy: hashModifyBy ? StringExtension.md5(modifyBy) : modifyBy } : {})
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
  const nextAmount = Number(params.payload.amount ?? 0)
  const nextBalanceAmount = Number(params.payload.balanceAmount ?? 0)
  const accountNo = getAccountNo(params.payload)

  if (
    Number.isFinite(nextAmount) &&
    Number.isFinite(nextBalanceAmount) &&
    nextAmount > nextBalanceAmount
  ) {
    throw new Error('withdraw.balance_insufficient')
  }

  if (!accountNo) {
    throw new Error('withdraw.missing_account')
  }

  await ensureNoPendingWithdrawOrder()
  await ensureWithdrawTurnoverRequirement()
  const submissionConfig = await queryWithdrawSubmissionConfig(params.payload)
  const nextWithdrawNumber = Number(submissionConfig?.mandatoryPayment ?? 0) === 1 ? 1 : 0

  const submitResponse = await Api.withdraw.submitTransferOrder(
    buildSubmitTransferOrderForm({
      ...params,
      withdrawNumber: nextWithdrawNumber
    })
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
