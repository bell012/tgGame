import request from '@/utils/request'
import type { GameBrandResponse, GameDataResponse } from '@/api/interface/game'

/**
 * 获取游戏列表数据
 * @returns Promise<GameDataResponse>
 */
export function getGameData(): Promise<GameDataResponse> {
  return request({
    url: '/gc/queryGameListForApp',
    method: 'post'
  })
}

/**
 * 获取游戏品牌列表数据
 * @returns Promise<GameBrandResponse>
 */
export function getGameBrandData(): Promise<GameBrandResponse> {
  return request({
    url: '/gc/gameBrandList',
    method: 'post'
  })
}
