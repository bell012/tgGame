import request from '@/utils/request'
import type {
  MyVipInfoForm,
  MyVipInfoResponse,
  VipListForm,
  VipListResponse
} from '@/api/interface/vip'

// 所有VIP等级信息
export function vipList(data: VipListForm): Promise<VipListResponse> {
  return request({
    url: '/vp/vipList',
    method: 'post',
    data
  })
}
// 会员当前等级信息
export function myVipInfo(data: MyVipInfoForm): Promise<MyVipInfoResponse> {
  return request({
    url: '/vp/myVipInfo',
    method: 'post',
    data
  })
}
