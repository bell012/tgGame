import type {
  QueryDlicghForm,
  QueryDlicghResponse,
  QueryPayColumnPageForm,
  QueryPayColumnPageResponse,
  QueryPaySubColumnPageForm,
  QueryPaySubColumnPageResponse,
  SubmitPayOrderQuickPageForm
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

///  提交入款申请
export function submitPayOrderQuick(
  data: SubmitPayOrderQuickPageForm
): Promise<QueryPaySubColumnPageResponse> {
  return request({
    url: '/pc/submitPayOrderQuick',
    method: 'post',
    data
  })
}
