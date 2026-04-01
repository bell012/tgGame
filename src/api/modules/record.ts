import request from '@/utils/request'
import type {
  QueryOrderInfoPageForm,
  QueryOrderInfoPageResponse
} from '@/api/interface/record.interface'

// 投注记录
export function queryOrderInfoPage(
  data: QueryOrderInfoPageForm
): Promise<QueryOrderInfoPageResponse> {
  return request({
    url: '/gc/queryOrderInfoPage',
    method: 'post',
    data
  })
}
