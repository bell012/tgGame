import request from '@/utils/request'
import type { OnlineCustomerResponse } from '@/api/interface/online-customer'

export function queryOnLineByType(): Promise<OnlineCustomerResponse> {
  return request({
    url: '/online/queryOnLineByType',
    method: 'post',
    data: { type: 1 },
    showSuccessToast: false,
    showErrorToast: false
  })
}
