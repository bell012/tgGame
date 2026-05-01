import request, { type ApiResponseToastOptions } from '@/utils/request'
import type {
  GameBetRecordListResponse,
  GameStatisticsResponse,
  GameDataResponse,
  GetGameBetRecordListParams,
  GetLatestListParams,
  GetLatestListResponse,
  GetCommentsListParams,
  GetCommentSubjectParams,
  GetGameStatisticsParams,
  PublishCommentParams,
  GameRanListResponse,
  GameBrandResponse,
  GameCommentListResponse,
  GameCommentSubjectResponse,
  PublishCommentResponse,
  GameDetailResponse,
  GetGameRanListParams,
  QueryGameDetailsParams,
  GameTypeResponse,
  QueryGameItemPageParams,
  QueryGameItemPageResponse,
  GlobalDicResponse
} from '@/api/interface/game'

/**
 * 获取游戏列表数据
 * @returns Promise<GameDataResponse>
 */
export function getGameData(data: {}): Promise<GameDataResponse> {
  return request({
    url: '/gc/queryGameListForApp',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/**
 * 获取自定义游戏类型
 * @returns Promise<GameTypeResponse>
 */
export function getGameType(options?: ApiResponseToastOptions): Promise<GameTypeResponse> {
  return request({
    url: '/gc/getGameType',
    method: 'post',
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 分页查询游戏数据
 * @param data languageCode, site, param, page
 * @returns Promise<QueryGameItemPageResponse>
 */
export function queryGameItemPage(
  data: QueryGameItemPageParams,
  options?: ApiResponseToastOptions
): Promise<QueryGameItemPageResponse> {
  return request({
    url: '/gc/queryGameItemPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 获取游戏品牌列表数据
 * @returns Promise<GameBrandResponse>
 */
export function getGameBrandData(options?: ApiResponseToastOptions): Promise<GameBrandResponse> {
  return request({
    url: '/gc/gameBrandList',
    method: 'post',
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 获取游戏详情
 * @param params rowId
 * @returns Promise<GameDetailResponse>
 */
export function queryGameDetails(
  params: QueryGameDetailsParams,
  options?: ApiResponseToastOptions
): Promise<GameDetailResponse> {
  return request({
    url: '/gc/queryGameDetails',
    method: 'get',
    params,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 获取高赢榜/幸运中奖列表
 * @param data itemCode, platformCode, type, currency
 * @returns Promise<GameRanListResponse>
 */
export function getGameRanList(
  data: GetGameRanListParams,
  options?: ApiResponseToastOptions
): Promise<GameRanListResponse> {
  return request({
    url: '/gr/getGameRanList',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 获取游戏全部投注/我的投注
 * @param data page, platformCode, gameCode, currency, betType
 * @returns Promise<GameBetRecordListResponse>
 */
export function getGameBetRecordList(
  data: GetGameBetRecordListParams,
  options?: ApiResponseToastOptions
): Promise<GameBetRecordListResponse> {
  return request({
    url: '/special/getGameBetRecordList',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 获取最新投注列表
 * @param data type 1: 最新投注 2: 龙虎榜
 * @returns Promise<GetLatestListResponse>
 */
export function getLatestList(
  data: GetLatestListParams,
  options?: ApiResponseToastOptions
): Promise<GetLatestListResponse> {
  return request({
    url: '/special/getLatestList',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 获取游戏统计数据（盈亏、投注、胜负场次）
 * @param data itemCode, platformCode
 * @returns Promise<GameStatisticsResponse>
 */
export function getGameStatistics(
  data: GetGameStatisticsParams,
  options?: ApiResponseToastOptions
): Promise<GameStatisticsResponse> {
  return request({
    url: '/special/getGameStatistics',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 刷新游戏统计数据（盈亏、投注、胜负场次）
 * @param data itemCode, platformCode
 * @returns Promise<GameStatisticsResponse>
 */
export function refreshGameStatistics(
  data: GetGameStatisticsParams,
  options?: ApiResponseToastOptions
): Promise<GameStatisticsResponse> {
  return request({
    url: '/special/refreshGameStatistics',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

export function getloginPlatform(data: any): Promise<any> {
  return request({
    url: '/gc/loginPlatform',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

export function logoutAllPlatform(data: { companyCode?: string; gameCode?: string }): Promise<any> {
  return request({
    url: '/gc/logoutAllPlatform',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/**
 * 查询游戏社交主体信息
 * @param data gameId, memberRowId
 * @returns Promise<GameCommentSubjectResponse>
 */
export function getCommentSubject(
  data: GetCommentSubjectParams,
  options?: ApiResponseToastOptions
): Promise<GameCommentSubjectResponse> {
  return request({
    url: '/comment/sub/getCommentSubject',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 查询游戏评论列表
 * @param data subjectId, current, pageSize, memberRowId, root, parent
 * @returns Promise<GameCommentListResponse>
 */
export function getCommentsList(
  data: GetCommentsListParams,
  options?: ApiResponseToastOptions
): Promise<GameCommentListResponse> {
  return request({
    url: '/comment/sub/getCommentsList',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

/**
 * 发布评论
 * @param data subjectId, memberId, memberRowId, content, root, parent, replyIndex
 * @returns Promise<PublishCommentResponse>
 */
export function publishComment(
  data: PublishCommentParams,
  options?: ApiResponseToastOptions
): Promise<PublishCommentResponse> {
  return request({
    url: '/comment/sub/publishComment',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

// 游戏名称 或者 平台名称 或者 错误码国际化
export function getGlobalDic(data: {}): Promise<GlobalDicResponse> {
  return request({
    url: '/sy/getGlobalDic',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}
