import type {
  FavouriteEventParams,
  FavouriteEventResponse,
  GetAllSportCountParams,
  GetAllSportCountResponse,
  GetCompetitionPageParams,
  GetCompetitionPageResponse,
  GetPopularSportsParams,
  GetPopularSportsResponse,
  GetSportEventIndexListParams,
  GetSportEventIndexListResponse,
  GetSportsV2Params,
  GetSportsV2Response,
  SportsResponse
} from '@/api/interface/sport'
import request from '@/utils/request'

export interface SportsRequestOptions {
  signal?: AbortSignal
}

/**
 * baseUrl 由调用方传入站点配置 IM.im_app_url；业务状态由调用方检查 stc。
 * 体育数据接口保留明文参数和原始响应，不发送本站登录凭据。
 */
function postSport<TParams, TResponse extends SportsResponse>(
  baseUrl: string,
  path: string,
  data: TParams,
  options?: SportsRequestOptions
): Promise<TResponse> {
  return request<unknown, TResponse, TParams>({
    url: `${baseUrl.replace(/\/+$/, '')}/${path}`,
    method: 'post',
    data,
    signal: options?.signal,
    headers: {
      'X-Auth-Token': null,
      Authorization: null
    },
    skipRequestEncryption: true,
    showSuccessToast: false,
    showErrorToast: false
  }) as unknown as Promise<TResponse>
}

/** 查询所有球种的滚球、今日、早盘、串关等赛事数量。 */
export function getAllSportCount(
  baseUrl: string,
  data: GetAllSportCountParams,
  options?: SportsRequestOptions
): Promise<GetAllSportCountResponse> {
  return postSport(baseUrl, 'GetAllSportCount', data, options)
}

/** 查询按联赛分组的主赛事列表及盘口。 */
export function getSportsV2(
  baseUrl: string,
  data: GetSportsV2Params,
  options?: SportsRequestOptions
): Promise<GetSportsV2Response> {
  return postSport(baseUrl, 'getSportsV2', data, options)
}

/** 查询联赛筛选所需的赛事索引。 */
export function getSportEventIndexList(
  baseUrl: string,
  data: GetSportEventIndexListParams,
  options?: SportsRequestOptions
): Promise<GetSportEventIndexListResponse> {
  return postSport(baseUrl, 'getSportEventIndexList', data, options)
}

/** 分页补充指定联赛下的赛事。 */
export function getCompetitionPage(
  baseUrl: string,
  data: GetCompetitionPageParams,
  options?: SportsRequestOptions
): Promise<GetCompetitionPageResponse> {
  return postSport(baseUrl, 'getCompetitionPage', data, options)
}

/** 查询热门、实时赛事。 */
export function getPopularSports(
  baseUrl: string,
  data: GetPopularSportsParams,
  options?: SportsRequestOptions
): Promise<GetPopularSportsResponse> {
  return postSport(baseUrl, 'getPopularSports', data, options)
}

/** 收藏或取消收藏赛事；仅由明确的用户操作调用。 */
export function favouriteEvent(
  baseUrl: string,
  data: FavouriteEventParams,
  options?: SportsRequestOptions
): Promise<FavouriteEventResponse> {
  return postSport(baseUrl, 'favouriteEvent', data, options)
}
