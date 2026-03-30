/**
 * 用户信息相关 API
 */

import request from '@/utils/request'
import type {
  ModifyMemberInfoForm,
  ModifyMemberInfoResponse,
  QueryAcctInfoForm,
  QueryAcctInfoResponse,
  SelectMemberForm,
  SelectMemberResponse
} from '@/api/interface/user'

/**
 * 查询账户信息
 * @param data 空对象
 * @returns Promise<QueryAcctInfoResponse>
 */
export function queryAcctInfo(data: QueryAcctInfoForm): Promise<QueryAcctInfoResponse> {
  return request({
    url: '/acct/queryAcctInfo',
    method: 'post',
    data
  })
}

/**
 * 查询会员信息
 * @param data 会员ID
 * @returns Promise<SelectMemberResponse>
 */
export function selectMember(data: SelectMemberForm): Promise<SelectMemberResponse> {
  return request({
    url: '/mc/selectMember',
    method: 'post',
    data
  })
}

/**
 * 修改会员信息
 * @param data 会员信息
 * @returns Promise<ModifyMemberInfoResponse>
 */
export function modifyMemberInfo(data: ModifyMemberInfoForm): Promise<ModifyMemberInfoResponse> {
  return request({
    url: '/mc/modifyMemberInfo',
    method: 'post',
    data
  })
}
