import request from '@/utils/request'
import type {
  GameBetRecordListResponse,
  GetGameBetRecordListParams,
  GameRanListResponse,
  GameBrandResponse,
  GameDataResponse,
  GameDetailResponse,
  GetGameRanListParams,
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

/**
 * 获取高赢榜/幸运中奖列表
 * @param data itemCode, platformCode, type, currency
 * @returns Promise<GameRanListResponse>
 */
export function getGameRanList(data: GetGameRanListParams): Promise<GameRanListResponse> {
  return request({
    url: '/gr/getGameRanList',
    method: 'post',
    data
  })
}

/**
 * 获取游戏全部投注/我的投注
 * @param data page, platformCode, gameCode, currency, betType
 * @returns Promise<GameBetRecordListResponse>
 */
export function getGameBetRecordList(
  data: GetGameBetRecordListParams
): Promise<GameBetRecordListResponse> {
  return request({
    url: '/special/getGameBetRecordList',
    method: 'post',
    data
  })
}
