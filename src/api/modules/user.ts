/**
 * 用户信息相关 API
 */

import request, { type ApiResponseToastOptions } from '@/utils/request'
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
  QueryFeedbacksResponse,
  ReceiveAllFeedbackForm,
  ReceiveAllFeedbackResponse,
  RebateDataForm,
  RebateDataResponse,
  QueryRebateGameDataForm,
  QueryRebateGameDataResponse,
  SelectRebateRateForm,
  SelectRebateRateResponse
} from '@/api/interface/user'

/**
 * 查询账户信息
 * @param data 空对象
 * @returns Promise<QueryAcctInfoResponse>
 */
export function queryAcctInfo(
  data: QueryAcctInfoForm,
  options?: ApiResponseToastOptions
): Promise<QueryAcctInfoResponse> {
  return request({
    url: '/acct/queryAcctInfo',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false,
    ...options
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
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

/**
 * 修改会员信息
 * @param data 会员信息
 * @returns Promise<ModifyMemberInfoResponse>
 */
export function modifyMemberInfo(
  data: ModifyMemberInfoForm,
  options?: ApiResponseToastOptions
): Promise<ModifyMemberInfoResponse> {
  return request({
    url: '/mc/modifyMemberInfo',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
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
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

/**
 * 修改会员手机号码
 * @param data 修改会员手机号码
 * @returns Promise<ModifyMemberTelePhoneResponse>
 */
export function modifyMemberTelePhone(
  data: ModifyMemberTelePhoneForm,
  options?: ApiResponseToastOptions
): Promise<ModifyMemberTelePhoneResponse> {
  return request({
    url: '/mc/modifyMemberTelePhone',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 提交意见反馈
 * @param data 反馈类型、内容、图片列表
 * @returns Promise<SendFeedbackResponse>
 */
export function sendFeedback(data: SendFeedbackForm): Promise<SendFeedbackResponse> {
  return request({
    url: '/f/sendFeedback',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/**
 * 查询我的反馈列表
 * @param data 空对象
 * @returns Promise<QueryFeedbacksResponse>
 */
export function queryFeedbacks(data: QueryFeedbacksForm): Promise<QueryFeedbacksResponse> {
  return request({
    url: '/f/queryFeedbacks',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

/**
 * 一键领取反馈奖励
 * @param data 空对象
 * @returns Promise<ReceiveAllFeedbackResponse>
 */
export function receiveAllFeedback(
  data: ReceiveAllFeedbackForm
): Promise<ReceiveAllFeedbackResponse> {
  return request({
    url: '/f/receiveAllFeedback',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/**
 * 查询返水比例
 * @param data 空对象
 * @returns Promise<SelectRebateRateResponse>
 */
export function selectRebateRate(
  data: SelectRebateRateForm = {},
  options?: ApiResponseToastOptions
): Promise<SelectRebateRateResponse> {
  return request({
    url: '/re/selectRebateRate',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false,
    ...options
  })
}

/**
 * 查询洗码数据
 * @param data 空对象
 * @returns Promise<RebateDataResponse>
 */
export function rebateData(
  data: RebateDataForm = {},
  options?: ApiResponseToastOptions
): Promise<RebateDataResponse> {
  return request({
    url: '/re/rebateData',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false,
    ...options
  })
}

/**
 * 查询洗码游戏数据
 * @param data 空对象
 * @returns Promise<QueryRebateGameDataResponse>
 */
export function queryRebateGameData(
  data: QueryRebateGameDataForm = {},
  options?: ApiResponseToastOptions
): Promise<QueryRebateGameDataResponse> {
  return request({
    url: '/re/queryRebateGameData',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false,
    ...options
  })
}
