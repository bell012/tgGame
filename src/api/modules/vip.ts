import request from '@/utils/request'
import type {
  MyVipInfoForm,
  MyVipInfoResponse,
  VipListForm,
  VipListResponse,
  GetVipInfoForm,
  GetVipInfoResponse,
  CommonResponse
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

// 会员福利
export function getVipInfo(data: GetVipInfoForm): Promise<GetVipInfoResponse> {
  return request({
    url: '/vp/getVipInfo',
    method: 'post',
    data
  })
}

// 会员福利 升级奖励领取
export function upgradedPoints(data: {}): Promise<CommonResponse> {
  return request({
    url: '/vp/upgradedPoints',
    method: 'post',
    data
  })
}

// 会员福利 每日奖励领取
export function dayPoints(data: {}): Promise<CommonResponse> {
  return request({
    url: '/vp/dayPoints',
    method: 'post',
    data
  })
}

// 会员福利 每周奖励领取
export function weekPoints(data: {}): Promise<CommonResponse> {
  return request({
    url: '/vp/weekPoints',
    method: 'post',
    data
  })
}
// 会员福利 每月奖励领取
export function monthPoints(data: {}): Promise<CommonResponse> {
  return request({
    url: '/vp/monthPoints',
    method: 'post',
    data
  })
}
