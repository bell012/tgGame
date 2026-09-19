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

/** 体育请求的传输控制选项，不会作为业务参数发送给网关。 */
export interface SportsRequestOptions {
  /** 可选的取消信号；切换筛选或离开页面时由调用方中止在途请求。 */
  signal?: AbortSignal
}

/**
 * 统一向当前体育网关发送 POST 请求，保留请求字段和原始业务响应。
 * baseUrl 由站点配置提供，不在此处写死服务地址。
 * 参数不使用本站请求加密，也不发送本站登录请求头；业务所需 MemberCode 仍由参数提供。
 * 不在此层转换简称、展开 JSON 字符串、裁剪盘口或自动重试。
 * HTTP 成功不代表业务成功；调用方须检查 stc 为 100 或 '100'，并处理失败反馈。
 *
 * @param baseUrl 体育网关基础地址，拼接前移除末尾斜杠。
 * @param path 相对于基础地址的接口路径，保留服务端要求的大小写。
 * @param data 对应接口的原始业务参数。
 * @param options 可选的请求取消控制。
 * @returns 未裁剪的体育业务响应，不是 AxiosResponse，也不使用本站 code / result 结构。
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
  })
}

/**
 * 只读：查询所有球种的滚球、今日、早盘、冠军及网关扩展的串关数量。
 * spc 返回球种数量列表，comboCount 表示串关数量。
 * 返回各球种数量而不是赛事详情；页面按 sid 选取当前球种，不应将所有球种数量相加替代。
 */
export function getAllSportCount(
  baseUrl: string,
  data: GetAllSportCountParams,
  options?: SportsRequestOptions
): Promise<GetAllSportCountResponse> {
  return postSport(baseUrl, 'GetAllSportCount', data, options)
}

/**
 * 只读：按球种、赛事分类、联赛、关键字等条件分页查询主列表及盘口。
 * e 返回联赛分组，组内 Sports 才是赛事。
 * Total 的具体计数口径尚未确认，不能直接当作赛事总数或页数。
 */
export function getSportsV2(
  baseUrl: string,
  data: GetSportsV2Params,
  options?: SportsRequestOptions
): Promise<GetSportsV2Response> {
  return postSport(baseUrl, 'getSportsV2', data, options)
}

/**
 * 只读：查询联赛筛选所需的轻量赛事索引，由调用方按联赛信息整理筛选项。
 * 业务数据结构待确认，不预设索引字段或完整赛事结构。
 */
export function getSportEventIndexList(
  baseUrl: string,
  data: GetSportEventIndexListParams,
  options?: SportsRequestOptions
): Promise<GetSportEventIndexListResponse> {
  return postSport(baseUrl, 'getSportEventIndexList', data, options)
}

/**
 * 只读：分页补充 CompetitionIds 指定联赛下的赛事，与 getSportsV2 配合使用。
 * 已确认返回 e 和 Total；e 的元素结构及 Total 的计数口径待确认。
 * 本函数只请求指定页，不递归翻页或替调用方合并列表。
 */
export function getCompetitionPage(
  baseUrl: string,
  data: GetCompetitionPageParams,
  options?: SportsRequestOptions
): Promise<GetCompetitionPageResponse> {
  return postSport(baseUrl, 'getCompetitionPage', data, options)
}

/**
 * 只读：查询热门赛事区域的数据；当前首页调用方传入滚球分类 Market=3。
 * 业务数据结构待确认，不预设赛事字段。
 * 本函数不对返回赛事二次筛选，也不自行启动实时轮询。
 */
export function getPopularSports(
  baseUrl: string,
  data: GetPopularSportsParams,
  options?: SportsRequestOptions
): Promise<GetPopularSportsResponse> {
  return postSport(baseUrl, 'getPopularSports', data, options)
}

/**
 * 写操作：收藏或取消收藏赛事，仅由明确的用户操作调用，不能随首页初始化自动执行。
 * 除 MemberCode 外，赛事标识及动作参数待确认，不预设未知字段或枚举。
 * 调用方应先核实体育会员账号、动作参数及业务状态。
 */
export function favouriteEvent(
  baseUrl: string,
  data: FavouriteEventParams,
  options?: SportsRequestOptions
): Promise<FavouriteEventResponse> {
  return postSport(baseUrl, 'favouriteEvent', data, options)
}
