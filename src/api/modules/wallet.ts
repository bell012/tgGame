import type {
  QueryDiscountListForm,
  QueryDiscountListResponse,
  QueryDlicghForm,
  QueryDlicghResponse,
  QueryPayColumnWithSubListForm,
  QueryPayColumnWithSubListResponse,
  QueryPayColumnPageForm,
  QueryPayColumnPageResponse,
  QueryPayOrderByOrderIdForm,
  QueryPayOrderByOrderIdResponse,
  QueryPaySubColumnPageForm,
  QueryPaySubColumnPageResponse,
  SubmitPayOrderPageForm,
  SubmitPayOrderResponse
} from '@/api/interface/wallet'
import request from '@/utils/request'

// 查询 dlicgh
export function queryDlicgh(data: QueryDlicghForm): Promise<QueryDlicghResponse> {
  return request({
    url: '/sy/dlicgh',
    method: 'post',
    data
  })
}

// 查询支付栏目
export function queryPayColumnPage(
  data: QueryPayColumnPageForm
): Promise<QueryPayColumnPageResponse> {
  return request({
    url: '/pc/queryPayColumnPage',
    method: 'post',
    data
  })
}

// 查询支付栏目及其子栏目
export function queryPayColumnWithSubList(
  data: QueryPayColumnWithSubListForm
): Promise<QueryPayColumnWithSubListResponse> {
  return request({
    url: '/pc/queryPayColumnWithSubList',
    method: 'post',
    data
  })
}

// 查询支付栏目下子栏目
export function queryPaySubColumnPage(
  data: QueryPaySubColumnPageForm
): Promise<QueryPaySubColumnPageResponse> {
  return request({
    url: '/pc/queryPaySubColumnPage',
    method: 'post',
    data
  })
}

// 查询优惠列表
export function queryDiscountList(data: QueryDiscountListForm): Promise<QueryDiscountListResponse> {
  return request({
    url: '/rd/queryDiscountList',
    method: 'post',
    data
  })
}

// 根据订单号查询支付订单
export function queryPayOrderByOrderId(
  data: QueryPayOrderByOrderIdForm
): Promise<QueryPayOrderByOrderIdResponse> {
  return request({
    url: '/pc/queryPayOrderByOrderId',
    method: 'post',
    data
  })
}
///  提交入款
export function submitPayOrder(data: SubmitPayOrderPageForm): Promise<SubmitPayOrderResponse> {
  return request({
    url: '/pc/submitPayOrder',
    method: 'post',
    data
  })
}
