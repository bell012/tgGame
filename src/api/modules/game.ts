import request from '@/utils/request'
import type {
  GameBetRecordListResponse,
  GameStatisticsResponse,
  GetGameBetRecordListParams,
  GetCommentsListParams,
  GetCommentSubjectParams,
  GetGameStatisticsParams,
  PublishCommentParams,
  GameRanListResponse,
  GameBrandResponse,
  GameDataResponse,
  GameCommentListResponse,
  GameCommentSubjectResponse,
  PublishCommentResponse,
  GameDetailResponse,
  GetGameRanListParams,
  QueryGameDetailsParams,
  GameTypeResponse
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
 * 获取自定义游戏类型
 * @returns Promise<GameTypeResponse>
 */
export function getGameType(): Promise<GameTypeResponse> {
  return request({
    url: '/gc/getGameType',
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

/**
 * 获取游戏统计数据（盈亏、投注、胜负场次）
 * @param data itemCode, platformCode
 * @returns Promise<GameStatisticsResponse>
 */
export function getGameStatistics(data: GetGameStatisticsParams): Promise<GameStatisticsResponse> {
  return request({
    url: '/special/getGameStatistics',
    method: 'post',
    data
  })
}

/**
 * 刷新游戏统计数据（盈亏、投注、胜负场次）
 * @param data itemCode, platformCode
 * @returns Promise<GameStatisticsResponse>
 */
export function refreshGameStatistics(
  data: GetGameStatisticsParams
): Promise<GameStatisticsResponse> {
  return request({
    url: '/special/refreshCameStatistics',
    method: 'post',
    data
  })
}

export function getloginPlatform(data: any): Promise<any> {
  return request({
    url: '/gc/loginPlatform',
    method: 'post',
    data
  })
}

/**
 * 查询游戏社交主体信息
 * @param data gameId, memberRowId
 * @returns Promise<GameCommentSubjectResponse>
 */
export function getCommentSubject(
  data: GetCommentSubjectParams
): Promise<GameCommentSubjectResponse> {
  return request({
    url: '/comment/sub/getCommentSubject',
    method: 'post',
    data
  })
}

/**
 * 查询游戏评论列表
 * @param data subjectId, current, pageSize, memberRowId, root, parent
 * @returns Promise<GameCommentListResponse>
 */
export function getCommentsList(data: GetCommentsListParams): Promise<GameCommentListResponse> {
  return request({
    url: '/comment/sub/getCommentsList',
    method: 'post',
    data
  })
}

/**
 * 发布评论
 * @param data subjectId, memberId, memberRowId, content, root, parent, replyIndex
 * @returns Promise<PublishCommentResponse>
 */
export function publishComment(data: PublishCommentParams): Promise<PublishCommentResponse> {
  return request({
    url: '/comment/sub/publishComment',
    method: 'post',
    data
  })
}
