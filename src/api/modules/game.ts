import request from '@/utils/request'
import type {
  GameBrandResponse,
  GameDataResponse,
  GameDetailResponse,
  QueryGameDetailsParams
} from '@/api/interface/game'

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

/**
 * 获取游戏详情
 * @param params rowId
 * @returns Promise<GameDetailResponse>
 */
export function queryGameDetails(params: QueryGameDetailsParams): Promise<GameDetailResponse> {
  return request({
    url: '/gc/queryGameDetails',
    method: 'get',
    params
  })
}
