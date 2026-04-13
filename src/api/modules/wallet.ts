import type {
  CancelPayOrderStatusForm,
  CancelPayOrderStatusResponse,
  PayRechargeQuickAmtsForm,
  PayRechargeQuickAmtsResponse,
  QueryDiscountListForm,
  QueryDiscountListResponse,
  QueryDlicghForm,
  QueryDlicghResponse,
  QueryPayColumnPageForm,
  QueryPayColumnPageResponse,
  QueryPayColumnWithSubListForm,
  QueryPayColumnWithSubListResponse,
  QueryMemberPayOrderPageForm,
  QueryMemberPayOrderPageResponse,
  QueryPayOrderByOrderIdForm,
  QueryPayOrderByOrderIdResponse,
  QueryPaySubColumnPageForm,
  QueryPaySubColumnPageResponse,
  SubmitPayOrderPageForm,
  SubmitPayOrderResponse,
  UpdatePayOrderRemarkForm,
  UpdatePayOrderRemarkResponse
} from '@/api/interface/wallet'
import request from '@/utils/request'

// 查询 dlicgh
export function queryDlicgh(data: QueryDlicghForm): Promise<QueryDlicghResponse> {
  return request({
    url: '/sy/dlicgh',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

// 查询支付栏目
export function queryPayColumnPage(
  data: QueryPayColumnPageForm
): Promise<QueryPayColumnPageResponse> {
  return request({
    url: '/pc/queryPayColumnPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

// 查询支付栏目及其子栏目
export function queryPayColumnWithSubList(
  data: QueryPayColumnWithSubListForm
): Promise<QueryPayColumnWithSubListResponse> {
  return request({
    url: '/pc/queryPayColumnWithSubList',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

// 查询支付栏目下子栏目
export function queryPaySubColumnPage(
  data: QueryPaySubColumnPageForm
): Promise<QueryPaySubColumnPageResponse> {
  return request({
    url: '/pc/queryPaySubColumnPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

// 查询充值快捷金额
export function payRechargeQuickAmts(
  data: PayRechargeQuickAmtsForm
): Promise<PayRechargeQuickAmtsResponse> {
  return request({
    url: '/pc/payRechargeQuickAmts',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

// 查询优惠列表
export function queryDiscountList(data: QueryDiscountListForm): Promise<QueryDiscountListResponse> {
  return request({
    url: '/rd/queryDiscountList',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

// 根据订单号查询支付订单
export function queryPayOrderByOrderId(
  data: QueryPayOrderByOrderIdForm
): Promise<QueryPayOrderByOrderIdResponse> {
  return request({
    url: '/pc/queryPayOrderByOrderId',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

// 查询会员充值/提现订单分页
export function queryMemberPayOrderPage(
  data: QueryMemberPayOrderPageForm
): Promise<QueryMemberPayOrderPageResponse> {
  return request({
    url: '/pc/queryMemberPayOrderPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}
///  提交入款
export function submitPayOrder(data: SubmitPayOrderPageForm): Promise<SubmitPayOrderResponse> {
  return request({
    url: '/pc/submitPayOrder',
    method: 'post',
    data,
    showSuccessToast: true,
    showErrorToast: true
  })
}

// 取消支付订单状态
export function cancelPayOrderStatus(
  data: CancelPayOrderStatusForm
): Promise<CancelPayOrderStatusResponse> {
  return request({
    url: '/pc/cancelPayOrderStatus',
    method: 'post',
    data,
    showSuccessToast: true,
    showErrorToast: true
  })
}

// 绑定上传凭证到支付订单
export function updatePayOrderRemark(
  data: UpdatePayOrderRemarkForm
): Promise<UpdatePayOrderRemarkResponse> {
  return request({
    url: '/pc/updatePayOrderRemark',
    method: 'post',
    data: {
      orderId: String(data.orderId),
      orderRemark: data.orderRemark
    },
    showSuccessToast: true,
    showErrorToast: true
  })
}
