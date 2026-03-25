import type {
  QueryNoticeMsgForm,
  QueryNoticeMsgResponse
} from '@/api/interface/notification.interface'
import request from '@/utils/request'

/**
 * 查询通知消息
 * @returns Promise<QueryNoticeMsgResponse>
 */
export function queryNoticeMsg(data: QueryNoticeMsgForm): Promise<QueryNoticeMsgResponse> {
  return request({
    url: '/ac/queryNoticeMsg',
    method: 'post',
    data
  })
}
