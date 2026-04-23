import request, { type ApiResponseToastOptions } from '@/utils/request'

export type AgentChannelId = '3' | '4'

export interface AgentRequestOptions extends ApiResponseToastOptions {
  channelId?: AgentChannelId
}

const callAgentAction = (
  actionId: string,
  param?: Record<string, unknown>,
  options?: AgentRequestOptions
): Promise<any> => {
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

export const queryEstimatedCommission = (options?: AgentRequestOptions): Promise<any> =>
  callAgentAction('agent75', undefined, options)

export const claimCommission = (options?: AgentRequestOptions): Promise<any> =>
  callAgentAction('agent77', undefined, {
    showErrorToast: true,
    ...options
  })

export const queryInvitationStats = (options?: AgentRequestOptions): Promise<any> =>
  callAgentAction('agent76', undefined, options)

export const queryShareChannels = (
  param?: { openStatus?: number },
  options?: AgentRequestOptions
): Promise<any> => callAgentAction('agent61', param, options)

export const queryNumberPool = (options?: AgentRequestOptions): Promise<any> =>
  callAgentAction('agent66', undefined, options)

export const queryCommissionRecords = (
  param: Record<string, unknown>,
  options?: AgentRequestOptions
): Promise<any> => callAgentAction('agent68', param, options)
