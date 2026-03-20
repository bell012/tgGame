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

// 查询活动栏目
export function getActivityType(): Promise<any> {
  return request({
    url: '/ac/queryGameListForApp',
    method: 'post'
  })
}

export function getGameType(): Promise<any> {
  return request({
    url: '/gc/getGameType',
    method: 'post'
  })
}
