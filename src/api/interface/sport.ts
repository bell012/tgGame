import type { LocaleCode } from '@/utils/locale'

export type SportsLanguageCode = LocaleCode
export type SportsOddsType = 1 | 2 | 3 | 4
export type SportsMarket = 1 | 2 | 3 | 4
export type SportsSortType = 1 | 2

/** 体育接口使用 stc 判断业务状态，不使用通用接口的 code / result。 */
export interface SportsResponse {
  /** 100 表示成功；保留其他业务状态原值。 */
  stc: number | string
  /** 状态描述。 */
  std: string
  /** 服务端响应时间。 */
  sert?: string
  [key: string]: unknown
}

/** 赛事字段暂保留原始结构，待页面逐项对接后补充明确类型。 */
export type SportEvent = Record<string, unknown>

/** 主列表接口按联赛返回的原始分组。 */
export interface SportCompetitionGroup {
  CompetitionId: number
  CompetitionName: string
  Sports: SportEvent[]
  competitionCount: number
  PMOrderNumber: number
  RBOrderNumber: number
  [key: string]: unknown
}

/** 查询所有球种赛事数量的请求参数。 */
export interface GetAllSportCountParams {
  /** 体育接口语言码，跟随全局语言配置 code，例如 zh、eng。 */
  LanguageCode: SportsLanguageCode
  /** 串关统计标志；首页当前传 false。 */
  IsCombo: boolean
}

/** 单个球种的赛事数量，保留接口原始字段。 */
export interface SportCountItem {
  /** 球种 ID。 */
  sid: number
  /** 球种名称。 */
  sn: string
  /** 滚球数量。 */
  rbfec: number
  /** 今日数量。 */
  tfec: number
  /** 早盘数量。 */
  efec: number
  /** 串关数量。 */
  comboCount: number
  /** 冠军数量。 */
  orc: number
  cou: number
  on: number
}

export interface GetAllSportCountResponse extends SportsResponse {
  /** 球种数量列表；业务失败时可能不返回。 */
  spc?: SportCountItem[]
}

/** 主赛事列表的筛选及分页参数。 */
export interface GetSportsV2Params {
  /** 1 为列表，2 为筛选。 */
  competitionCondType: 1 | 2
  LanguageCode: SportsLanguageCode
  /** 1 为早盘，2 为今日，3 为滚球，4 为串关。 */
  Market: SportsMarket
  PageNumber: number
  /** 1 按联赛，2 按时间。 */
  SortType: SportsSortType
  PageSize: number
  SportId: number
  CompetitionIds: number[]
  Keyword: string
  IsFavourite: boolean
  earlyTradingDate: string | null
  /** 体育会员账号；游客请求使用 null 或不传入。 */
  MemberCode?: string | null
}

export interface GetSportsV2Response extends SportsResponse {
  e?: SportCompetitionGroup[]
  Total?: number
}

/** 查询用于联赛筛选的赛事索引。 */
export interface GetSportEventIndexListParams {
  SportId: number
  Market: SportsMarket
  LanguageCode: SportsLanguageCode
  Keyword: string
}

export interface GetSportEventIndexListResponse extends SportsResponse {
  e?: SportEvent[]
}

/** 分页查询指定联赛下的赛事。 */
export interface GetCompetitionPageParams {
  LanguageCode: SportsLanguageCode
  Market: SportsMarket
  PageNumber: number
  SortType: SportsSortType
  PageSize: number
  SportId: number
  CompetitionIds: number[]
}

export interface GetCompetitionPageResponse extends SportsResponse {
  e?: SportEvent[]
  Total?: number
  /** 部分版本不返回此字段，不能仅凭它判断分页是否结束。 */
  hasNextPage?: boolean
}

/** 查询热门、实时赛事区域的原始数据。 */
export interface GetPopularSportsParams {
  SportId: number
  Market: SportsMarket
  LanguageCode: SportsLanguageCode
  SortType: SportsSortType
}

export interface GetPopularSportsResponse extends SportsResponse {
  e?: SportEvent[]
}

/** 收藏参数的赛事标识及动作字段尚未验证，待对接时核实，不预设未知字段。 */
export interface FavouriteEventParams extends Record<string, unknown> {
  MemberCode: string
}

export type FavouriteEventResponse = SportsResponse
