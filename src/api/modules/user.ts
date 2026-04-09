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
  SelectMemberResponse,
  GameBetTotalForm,
  GameBetTotalResponse,
  ModifyMemberTelePhoneForm,
  ModifyMemberTelePhoneResponse,
  SendFeedbackForm,
  SendFeedbackResponse,
  QueryFeedbacksForm,
  QueryFeedbacksResponse
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

/**
 * 游戏下注信息统计
 * @param data 游戏下注信息
 * @returns Promise<GameBetTotalResponse>
 */
export function getGameBetTotal(data: GameBetTotalForm): Promise<GameBetTotalResponse> {
  return request({
    url: '/special/getGameBetTotal',
    method: 'post',
    data
  })
}

/**
 * 修改会员手机号码
 * @param data 修改会员手机号码
 * @returns Promise<ModifyMemberTelePhoneResponse>
 */
export function modifyMemberTelePhone(
  data: ModifyMemberTelePhoneForm
): Promise<ModifyMemberTelePhoneResponse> {
  return request({
    url: '/mc/modifyMemberTelePhone',
    method: 'post',
    data
  })
}

/**
 * 提交意见反馈
 * @param data 反馈类型、内容、图片列表
 * @returns Promise<SendFeedbackResponse>
 */
export function sendFeedback(data: SendFeedbackForm): Promise<SendFeedbackResponse> {
  return request({
    url: '/mc/sendFeedback',
    method: 'post',
    data
  })
}

/**
 * 查询我的反馈列表
 * @param data 空对象
 * @returns Promise<QueryFeedbacksResponse>
 */
export function queryFeedbacks(data: QueryFeedbacksForm): Promise<QueryFeedbacksResponse> {
  return request({
    url: '/mc/queryFeedbacks',
    method: 'post',
    data
  })
}
