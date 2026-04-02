import request from '@/utils/request'
import type { GameDataResponse } from '@/api/interface/home.interface'

/**
 * 获取首页数据
 * @returns Promise<any>
 */
export function getGameData(): Promise<GameDataResponse> {
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
// 近期大奖
export function getRecentBigWins(data: any): Promise<any> {
  return request({
    url: '/special/getRecentBigWins',
    method: 'post',
    data
  })
}

// 近期大奖
export function getQuerySlideshow(data: any): Promise<any> {
  return request({
    url: '/ac/querySlideshow',
    method: 'post',
    data
  })
}

// 供应商 /gc/gameBrandList
export function getGameBrandList(): Promise<any> {
  return request({
    url: '/gc/gameBrandList',
    method: 'post'
  })
}
