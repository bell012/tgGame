import request from '@/utils/request'
import type {
  QueryOrderInfoPageForm,
  QueryOrderInfoPageResponse,
  QueryAcctHisPageForm,
  QueryAcctHisPageResponse,
  QueryAcctHisBonusPageForm,
  QueryAcctHisBonusPageResponse,
  QueryInspectPageForm,
  QueryInspectPageResponse
} from '@/api/interface/record.interface'

// 投注记录
export function queryOrderInfoPage(
  data: QueryOrderInfoPageForm
): Promise<QueryOrderInfoPageResponse> {
  return request({
    url: '/gc/queryOrderInfoPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

// 资金明细记录
export function queryAcctHisPage(data: QueryAcctHisPageForm): Promise<QueryAcctHisPageResponse> {
  return request({
    url: '/acct/queryAcctHisPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

// 已领取奖金历史
export function queryAcctHisBonusPage(
  data: QueryAcctHisBonusPageForm
): Promise<QueryAcctHisBonusPageResponse> {
  return request({
    url: '/acct/queryAcctHisBonusPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

// 流水记录
export function queryInspectPage(data: QueryInspectPageForm): Promise<QueryInspectPageResponse> {
  return request({
    url: '/inspect/queryInspectPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}
