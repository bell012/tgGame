import type {
  FavouriteEventParams,
  FavouriteEventResponse,
  GetAllSportCountParams,
  GetAllSportCountResponse,
  GetBetListParams,
  GetBetListResponse,
  GetCompetitionListParams,
  GetCompetitionListResponse,
  GetCompetitionPageParams,
  GetCompetitionPageResponse,
  GetPopularSportsParams,
  GetPopularSportsResponse,
  GetSelectedEventInfoParams,
  GetSelectedEventInfoResponse,
  GetStatementParams,
  GetStatementResponse,
  GetSportEventIndexListParams,
  GetSportEventIndexListResponse,
  GetSportsV2Params,
  GetSportsV2Response,
  SubmitBuyBackParams,
  SubmitBuyBackResponse,
  SportsResponse
} from '@/api/interface/sport'
import request from '@/utils/request'

/** 体育请求的传输控制选项，不会作为业务参数发送给服务端。 */
export interface SportsRequestOptions {
  /** 可选的取消信号；切换筛选或离开页面时由调用方中止在途请求。 */
  signal?: AbortSignal
}

/**
 * 统一向当前体育网关发送 POST 请求，保留请求字段和原始业务响应。
 * baseUrl 由站点配置提供，不在此处写死服务地址。
 * 默认跳过请求加密；需要加密的接口显式指定 site，交由统一拦截器处理。
 * 不发送本站登录请求头；业务所需 MemberCode 仍由参数提供。
 * 不在此层转换简称、展开 JSON 字符串、裁剪盘口或自动重试。
 * HTTP 成功不代表业务成功；调用方须同时检查 stc 和业务数据结构，并处理失败反馈。
 *
 * @param baseUrl 体育网关基础地址，拼接前移除末尾斜杠。
 * @param path 相对于基础地址的接口路径，保留服务端要求的大小写。
 * @param data 对应接口的原始业务参数。
 * @param options 可选的请求取消控制。
 * @param requestEncryption 接口固定的传输约定；默认 skip 保持现有接口行为。
 * @returns 未裁剪的体育业务响应，不是 AxiosResponse，也不使用本站 code / result 结构。
 */
function postSport<TParams, TResponse extends SportsResponse>(
  baseUrl: string,
  path: string,
  data: TParams,
  options?: SportsRequestOptions,
  requestEncryption: 'skip' | 'site' = 'skip'
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
    skipRequestEncryption: requestEncryption === 'skip',
    showSuccessToast: false,
    showErrorToast: false
  }) as unknown as Promise<TResponse>
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
 * 默认列表每联赛最多预览 5 场，competitionCount 为该联赛赛事数。
 * 通过 competitionCondType=2 与 CompetitionIds 可补齐指定联赛；本函数仍只请求一页。
 * 按联赛排序的 Total 实测为联赛总数，不能直接当作赛事数或页数。
 */
export function getSportsV2(
  baseUrl: string,
  data: GetSportsV2Params,
  options?: SportsRequestOptions
): Promise<GetSportsV2Response> {
  return postSport(baseUrl, 'getSportsV2', data, options)
}

/**
 * 只读：按 EventIds 批量查询赛事基础信息、比分及盘口，不触发投注。
 * 使用 IM.im_app_url 网关地址，但与 getSportsV2 不同，必须启用请求加密。
 * e 为平铺赛事详情；原样保留盘口/赔率，不裁剪、不合并到主列表、不启动轮询。
 * 实测未加密时 stc 也可能为 '100'，所以调用方还须校验 e 是数组。
 * V5 每次最多 5 场；滚球 10 秒、今日/早盘 20 秒，批次调度由调用方另行处理。
 */
export function getSelectedEventInfo(
  baseUrl: string,
  data: GetSelectedEventInfoParams,
  options?: SportsRequestOptions
): Promise<GetSelectedEventInfoResponse> {
  return postSport(baseUrl, 'GetSelectedEventInfo', data, options, 'site')
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
 * 只读：分页补充 CompetitionIds 指定联赛默认预览之外的赛事，与 getSportsV2 配合使用。
 * 实测自动跳过默认预览的前 5 场；e 是平铺 SportEvent，须保留预览并按 EventId 去重合并。
 * hasNextPage 为布尔分页标志；无剩余数据时可能省略，e 为空即结束。
 * Total 是待补充赛事总数，不是整个联赛赛事数；不支持关键字或指定日期查询。
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
 * 查询体育投注已结算记录。
 */
export function getStatement(
  baseUrl: string,
  data: GetStatementParams,
  options?: SportsRequestOptions
): Promise<GetStatementResponse> {
  return postSport(baseUrl, 'GetStatement', data, options)
}

/**
 * 查询体育投注未结算记录
 */
export function getBetList(
  baseUrl: string,
  data: GetBetListParams,
  options?: SportsRequestOptions
): Promise<GetBetListResponse> {
  return postSport(baseUrl, 'GetBetList', data, options)
}

/**
 * 体育投注提前结算，提交当前注单的回购价格和价格 ID。
 */
export function submitBuyBack(
  baseUrl: string,
  data: SubmitBuyBackParams,
  options?: SportsRequestOptions
): Promise<SubmitBuyBackResponse> {
  return postSport(baseUrl, 'SubmitBuyBack', data, options)
}

/**
 * 只读：查询首页横向滚动区域的热门赛事。
 * 页码、球种、分类及时间范围统一放在 param 中，再交由请求拦截器加密。
 * 走本站统一请求封装，保留公共请求头、鉴权和加解密，不使用体育网关基础地址。
 * 原样返回本站热门记录和队伍信息，不补充网关盘口字段；业务状态按本站规则校验。
 */
export function getCompetitionList(
  data: GetCompetitionListParams,
  options?: SportsRequestOptions
): Promise<GetCompetitionListResponse> {
  return request<unknown, GetCompetitionListResponse, GetCompetitionListParams>({
    url: '/game/getCompetitionList',
    method: 'post',
    data,
    signal: options?.signal,
    showSuccessToast: false,
    showErrorToast: false
  })
}

/**
 * 写操作：收藏或取消收藏赛事，仅由明确的用户操作调用，不能随首页初始化自动执行。
 * 请求只传 MemberCode 和 EventId，不额外发送 IsFavourite 或动作字段。
 * 调用方使用体育平台账号，并根据 stc 判断业务成功后同步赛事收藏状态。
 */
export function favouriteEvent(
  baseUrl: string,
  data: FavouriteEventParams,
  options?: SportsRequestOptions
): Promise<FavouriteEventResponse> {
  return postSport(baseUrl, 'favouriteEvent', data, options)
}
