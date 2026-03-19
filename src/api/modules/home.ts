import request from '@/utils/request'

/**
 * 获取首页数据
 * @returns Promise<any>
 */
export function getGameData(): Promise<any> {
  return request({
    url: '/gc/queryGameListForApp',
    method: 'post'
  })
}

export function getGameType(): Promise<any> {
  return request({
    url: '/gc/getGameType',
    method: 'post'
  })
}
