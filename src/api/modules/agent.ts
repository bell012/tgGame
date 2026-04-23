import request, { type ApiResponseToastOptions } from '@/utils/request'

export type AgentChannelId =
  | '3' // PC 端渠道
  | '4' // H5 端渠道

export interface AgentRequestOptions extends ApiResponseToastOptions {
  channelId?: AgentChannelId
}

const callAgentAction = (
  actionId: string,
  param?: Record<string, unknown>,
  options?: AgentRequestOptions
): Promise<any> => {
  // 代理接口走统一入口，默认按 H5 渠道请求；PC 页面显式传入 3。
  const { channelId = '4', ...toastOptions } = options ?? {}
  const data = param === undefined ? { actionId } : { actionId, param }

  return request({
    url: '/sy/apiAction',
    method: 'post',
    data,
    headers: {
      channelId
    },
    showSuccessToast: false,
    showErrorToast: false,
    ...toastOptions
  })
}

// agent75：查询当前登录一级代理未领取佣金总额。
export const queryEstimatedCommission = (options?: AgentRequestOptions): Promise<any> =>
  callAgentAction('agent75', undefined, options)

// agent77：领取当前登录一级代理未领取佣金。
export const claimCommission = (options?: AgentRequestOptions): Promise<any> =>
  callAgentAction('agent77', undefined, {
    showErrorToast: true,
    ...options
  })

// agent76：查询团队邀请统计。
export const queryInvitationStats = (options?: AgentRequestOptions): Promise<any> =>
  callAgentAction('agent76', undefined, options)

// agent61：查询分享渠道配置；openStatus=1 表示只查开启渠道。
export const queryShareChannels = (
  param?: { openStatus?: number },
  options?: AgentRequestOptions
): Promise<any> => callAgentAction('agent61', param, options)

// agent66：查询号码池与 WhatsApp/SMS 配置。
export const queryNumberPool = (options?: AgentRequestOptions): Promise<any> =>
  callAgentAction('agent66', undefined, options)

// agent68：分页查询一级代理佣金记录。
export const queryCommissionRecords = (
  param: Record<string, unknown>,
  options?: AgentRequestOptions
): Promise<any> => callAgentAction('agent68', param, options)
