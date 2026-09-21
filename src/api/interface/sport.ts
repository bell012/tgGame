/**
 * 只声明接口已明确返回的字段；文档仅用于解释对应字段的含义和枚举。
 * 保留实际字段名和数据类型，不在响应中补造字段或转换数值。
 * `?` 表示字段可能缺失；未知结构使用 unknown，确认后再补充具体类型。
 */

/** 请求语言：体育接口独立语言码，例如 CHS（中文）、ENG（英文）。 */
export type SportsLanguageCode = 'ENG' | 'CHS' | 'VN' | 'HI' | 'PT'

/** 页面支持的盘型（Int）：1 马来盘、2 香港盘、3 欧洲盘、4 印尼盘。 */

export type SportsOddsType = 1 | 2 | 3 | 4

/** 响应盘型（Int）：1 马来盘、2 香港盘、3 欧洲盘、4 印尼盘、6 美式盘。 */
export type SportsResponseOddsType = number

/** 列表筛选（Int）：1 早盘、2 今日、3 滚球、4 串关。 */
export type SportsMarket = 1 | 2 | 3 | 4

/** 赛事自身的盘口分类（Int）：1 早盘、2 今日、3 滚球。 */
export type SportsEventMarket = 1 | 2 | 3

/** 排序方式（Int）：1 按联赛、2 按时间。 */
export type SportsSortType = 1 | 2

/** 联赛条件类型（Int）：1 列表、2 筛选。 */
export type SportsCompetitionCondType = 1 | 2

/** 赛事/盘口开关状态（Int）：1 开盘、2 关盘；封盘另看 IsLocked。 */
export type SportsOpenStatus = 1 | 2

/** 比赛场地（Int）：0 中立场、1 主场。 */
export type SportsGroundType = 0 | 1

/** 滚球计时状态（Int）：0 不适用、1 开始、2 进行中、3 暂停。 */
export type SportsRBTimeStatus = 0 | 1 | 2 | 3

/** 比赛时段（Int）：1 全场、2 上半场、3 下半场。 */
export type SportsPeriodId = 1 | 2 | 3

/** 直播标志（Int）：0 无直播地址、1 有直播地址。 */
export type SportsLiveStreamingFlag = 0 | 1

/** 体育业务响应外层；使用 stc 判断状态，不使用本站接口的 code/result。 */
export interface SportsResponse {
  /** StatusCode（number/String）：100 或 '100' 成功，其他值为失败；E100 不等于 100。 */
  stc: number | string
  /** StatusDesc（String）：业务状态描述，不用此字段判断是否成功。 */
  std: string
  /** 未确认的响应结构保持 unknown，读取前必须校验，不能据此假定业务字段。 */
  [key: string]: unknown
}

/** RelatedScores（rs）：同一比赛不同组别的比分/红牌，不能与主体比分相加。 */
export interface SportRelatedScore {
  /** egtid，Int：比分所属的赛事组别类型 ID，不是球种 ID。 */
  EventGroupTypeId: number
  /** hs，Int：该组别的主队比分。 */
  HomeScore: number
  /** as，Int：该组别的客队比分。 */
  AwayScore: number
  /** hrc，Int：该组别的主队红牌数。 */
  HomeRedCard: number
  /** arc，Int：该组别的客队红牌数。 */
  AwayRedCard: number
  /** Int：扩展阶段字段，枚举含义待确认。 */
  GamePeriod: number
  /** Int：扩展比分分类字段，枚举含义待确认。 */
  ScoreCategory: number
}

/** ExtraInfo 中已确认的 JSON 字段；响应本身仍是字符串，解析后需校验字段类型。 */
export interface SportEventExtraInfo {
  /** HasCorner（Boolean）：是否具有角球投注类型。 */
  hc: boolean
  /** Current15MinsHomeScore（Int）：当前 15 分钟区间的主队比分。 */
  c15mhs: number
  /** Current15MinsAwayScore（Int）：当前 15 分钟区间的客队比分。 */
  c15mas: number
  /** Int，可缺失：扩展字段，业务含义待确认。 */
  htycs?: number
  /** Int，可缺失：扩展字段，业务含义待确认。 */
  atycs?: number
  /** Boolean：扩展标志，业务含义待确认，不与外层 IsLive 混同。 */
  il: boolean
}

/** A-G 分组赔率，值为小数字符串；分组选择规则待确认，字母不代表盘型。 */
export interface SportOddsValues {
  /** A 组赔率（String），保留符号和小数精度。 */
  A: string
  /** B 组赔率（String）。 */
  B: string
  /** C 组赔率（String）。 */
  C: string
  /** D 组赔率（String）。 */
  D: string
  /** E 组赔率（String）。 */
  E: string
  /** F 组赔率（String）。 */
  F: string
  /** G 组赔率（String）。 */
  G: string
}

/** OddsList（ol）：同一投注选项在不同盘型下的赔率。 */
export interface SportOddsListItem {
  /** ot，Int：1 马来、2 香港、3 欧洲、4 印尼、6 美式。 */
  OddsType: SportsResponseOddsType
  /** ov，对象：按 A-G 分组的赔率，不是单个浮点数。 */
  OddsValues: SportOddsValues
}

/** WagerSelections（wss）的投注选项，不代表已生成或提交的投注订单。 */
export interface SportWagerSelection {
  /** wsid，Long：具体投注选项的唯一 ID，与通用 SelectionId 不同。 */
  WagerSelectionId: number
  /**
   * seid，Int：玩法内选项 ID，需结合 BetTypeId 解读。
   * 让球 1 主/2 客，大小 3 大/4 小，独赢 5 主/6 客/7 和；不是完整枚举。
   */
  SelectionId: number
  /** sen，String：投注类型选项名称。 */
  SelectionName: string
  /** h，Float：让球/大小等玩法的盘口线数值，不是赔率。 */
  Handicap: number
  /** sp，String：附加下注资料，可为空字符串，保留原值。 */
  Specifiers: string
  /** o，Decimal：当前选项赔率，可为负数，须结合 OddsType 解读。 */
  Odds: number
  /** ot，Int：当前 Odds 的盘型，枚举见 SportsResponseOddsType。 */
  OddsType: SportsResponseOddsType
  /** ol，List：多盘型赔率列表，不能用首条默认替代用户选定的盘型。 */
  OddsList: SportOddsListItem[]
}

/** MarketLines（mls）的单个盘口；同一玩法可有不同盘口线或比赛时段。 */
export interface SportMarketLine {
  /** mlid，Long：盘口唯一 ID。 */
  MarketlineId: number
  /** btid，Int：投注类型 ID；常用 1 让球、2 大小、3 独赢，不是完整枚举。 */
  BetTypeId: number
  /** btn，String：投注类型名称。 */
  BetTypeName: string
  /** peid，Int：1 全场、2 上半场、3 下半场。 */
  PeriodId: SportsPeriodId
  /** pen，String：比赛时段名称。 */
  PeriodName: string
  /** mll，Int：盘口级别，不与 PeriodId 混同。 */
  MarketLineLevel: number
  /** mlsid，Int：1 开盘、2 关盘；是否暂时封盘还需检查 IsLocked。 */
  MarketlineStatusId: SportsOpenStatus
  /** isl，Boolean：true 已封盘、false 未封盘，不代表最终一定可以下注。 */
  IsLocked: boolean
  /** wss，List：此盘口下的投注选项列表。 */
  WagerSelections: SportWagerSelection[]
}

/** 主赛事列表中已确认的赛事详情，字段名和类型保持接口原样。 */
export interface SportEvent {
  /** eid，Long：赛事唯一 ID，不与 EventGroupId、BREventId 混用。 */
  EventId: number
  /** op，Boolean：true 支持串关、false 不支持。 */
  OpenParlay: boolean
  /** il，Boolean：是否提供滚球；当前盘口分类以 Market 为准。 */
  IsLive: boolean
  /** m，Int：1 早盘、2 今日、3 滚球。 */
  Market: SportsEventMarket
  /** esid，Int：1 开盘、2 关盘。 */
  EventStatusId: SportsOpenStatus
  /** on，Int：同一联赛中赛事显示顺序。 */
  OrderNumber: number
  /** ed，String：赛事日期，值为毫秒时间戳字符串，不是 Date 实例。 */
  EventDate: string
  /** gtid，Int：0 中立场、1 主场。 */
  GroundTypeId: SportsGroundType
  /** egid，Long：同一实际比赛的组别 ID，主赛/角球等子赛事可属于同一组。 */
  EventGroupId: number
  /** egtid，Int：赛事组别类型 ID，不是赛事 ID。 */
  EventGroupTypeId: number
  /** tmc，Int：赛事盘口总数。 */
  TotalMarketLineCount: number
  /** ip，Boolean：true 热门赛事、false 非热门。 */
  IsPopular: boolean
  /** if，Boolean：当前体育会员是否收藏；游客结果不能代表登录会员。 */
  IsFavourite: boolean
  /** ibto，Boolean：是否支持兑现，不等同于允许直接提交投注。 */
  IsBetTradeOpen: boolean
  /** breid，Long：可视化投注预测的赛事 ID，不是 EventId。 */
  BREventId: number
  /** hv，Boolean：是否有赛事可视化。 */
  HasVisualization: boolean
  /** has，Boolean：是否有赛事统计。 */
  HasStatistic: boolean
  /** seo，Int：虚拟体育赛季指标。 */
  Season: number
  /** md，Int：虚拟足球/篮球赛日指标。 */
  MatchDay: number
  /** ls，Int：0 没有直播地址、1 有直播地址。 */
  LiveStreaming: SportsLiveStreamingFlag
  /** lsurl，List：直播地址列表，元素结构待确认，不预设字段。 */
  LiveStreamingUrl: unknown[]
  /** htid，Int：主队或主方参赛者 ID。 */
  HomeTeamId: number
  /** ht，String：主队或主方参赛者名称。 */
  HomeTeam: string
  /** atid，Int：客队或客方参赛者 ID。 */
  AwayTeamId: number
  /** at，String：客队或客方参赛者名称。 */
  AwayTeam: string
  /** rbt，String：滚球时间显示值，可含阶段文字，不保证是纯分钟数。 */
  RBTime: string
  /** rbts，Int：0 不适用、1 开始、2 进行中、3 暂停。 */
  RBTimeStatus: SportsRBTimeStatus
  /** hs，String：主队比分，需计算时先校验并转换。 */
  HomeScore: string
  /** as，String：客队比分。 */
  AwayScore: string
  /** hrc，String：主队红牌数。 */
  HomeRedCard: string
  /** arc，String：客队红牌数。 */
  AwayRedCard: string
  /** rs，List，可缺失：按赛事组别细分的比分。 */
  RelatedScores?: SportRelatedScore[]
  /** ei，String：赛事附加信息的 JSON 字符串，内部已确认字段见 SportEventExtraInfo。 */
  ExtraInfo: string
  /** co，对象：赛事所属联赛，不是数组。 */
  Competition: SportCompetition
  /** mls，List：赛事盘口列表。 */
  MarketLines: SportMarketLine[]
}

/** 赛事所属联赛。 */
export interface SportCompetition {
  /** cid，Int：联赛/竞赛 ID，用于 CompetitionIds 筛选。 */
  CompetitionId: number
  /** cn，String：联赛/竞赛名称。 */
  CompetitionName: string
  /** pmon，Int：赛前的联赛排序序号。 */
  PMOrderNumber: number
  /** rbon，Int：滚球的联赛排序序号。 */
  RBOrderNumber: number
}

/** 主列表返回的联赛分组，Sports 才是赛事列表。 */
export interface SportCompetitionGroup extends SportCompetition {
  /** List：本联赛当前返回的赛事，可能只包含部分赛事。 */
  Sports: SportEvent[]
  /** Int：联赛计数字段，计数口径待确认，不能直接用当前列表长度替代。 */
  competitionCount: number
}

/** 查询所有球种赛事数量的请求参数。 */
export interface GetAllSportCountParams {
  /** String，必填：ENG 英语、CHS 简体中文、VN 越南语、HI 印地语、PT 葡萄牙语。 */
  LanguageCode: SportsLanguageCode
  /** Boolean，必填：true 串关统计、false 非串关统计；首页当前传 false。 */
  IsCombo: boolean
}

/** SportCount（spc）的单球种统计，保留接口简称。 */
export interface SportCountItem {
  /**
   * SportId（Int）：球种 ID。1 足球、2 篮球、3 网球、7 羽毛球、36 乒乓球、
   * 40 排球、19 美式足球；不是完整枚举，不能使用组件数组下标替代。
   */
  sid: number
  /** SportName（String）：按 LanguageCode 返回的球种名称。 */
  sn: string
  /** OrderNumber（Short）：球种显示排序序号，不是球种 ID。 */
  on: number
  /** Count（Int）：当前球种的赛事计数，不自行替换为四个标签数量之和。 */
  cou: number
  /** EarlyFECount（Int）：早盘的定时赛事数量。 */
  efec: number
  /** TodayFECount（Int）：今日的定时赛事数量。 */
  tfec: number
  /** RBFECount（Int）：滚球的定时赛事数量。 */
  rbfec: number
  /** ORCount（Int）：冠军赛事数量，与定时赛事计数分开。 */
  orc: number
  /** Int：串关赛事数量。 */
  comboCount: number
}

/** 球种数量响应；业务失败时可能不含数量列表。 */
export interface GetAllSportCountResponse extends SportsResponse {
  /** SportCount（List）：所有球种统计；四个筛选角标取选中 sid 对应项，不累加所有球种。 */
  spc?: SportCountItem[]
  /** ServerTime（String）：服务器响应时间，带时区的日期字符串。 */
  sert?: string
}

/** 主赛事列表的筛选/分页参数。 */
export interface GetSportsV2Params {
  /** Int，必填：1 列表、2 筛选。 */
  competitionCondType: SportsCompetitionCondType
  /** String，必填：请求语言，枚举见 SportsLanguageCode。 */
  LanguageCode: SportsLanguageCode
  /** Int，必填：1 早盘、2 今日、3 滚球、4 串关。 */
  Market: SportsMarket
  /** Int，必填：页码，从 1 开始。 */
  PageNumber: number
  /** Int，必填：1 按联赛、2 按时间。 */
  SortType: SportsSortType
  /** Int，必填：每页大小；列表按联赛分组，不能假定是赛事条数。 */
  PageSize: number
  /** Int，必填：选中球种的 spc[].sid，不是 UI 数组下标。 */
  SportId: number
  /** List<Int>，必填：联赛 ID 集合；空数组表示未指定联赛。 */
  CompetitionIds: number[]
  /** String，必填：搜索关键字，空字符串不指定关键字。 */
  Keyword: string
  /** Boolean，必填：收藏置顶标志，不代表只查询收藏赛事。 */
  IsFavourite: boolean
  /** String/null，必填：早盘日期筛选；其他 Market 传 null，日期格式及边界待确认。 */
  earlyTradingDate: string | null
  /** String/null，可选：体育平台会员账号，游客传 null/省略，不是本站 memberId 或 token。 */
  MemberCode?: string | null
}

/** 主赛事列表响应。 */
export interface GetSportsV2Response extends SportsResponse {
  /** List：联赛分组，组内 Sports 才是赛事；失败时可能省略。 */
  e?: SportCompetitionGroup[]
  /** Int：分页总量原值；计数口径待确认，不能直接当赛事总数。 */
  Total?: number
}

/** 查询联赛筛选索引的请求参数。 */
export interface GetSportEventIndexListParams {
  /** Int，必填：选中球种的 spc[].sid。 */
  SportId: number
  /** Int，必填：1 早盘、2 今日、3 滚球、4 串关。 */
  Market: SportsMarket
  /** String，必填：请求语言，枚举见 SportsLanguageCode。 */
  LanguageCode: SportsLanguageCode
  /** String，必填：搜索关键字，空字符串不指定关键字。 */
  Keyword: string
}

/** 索引响应目前只确认公共外层；业务数据结构待确认，不预设字段。 */
export type GetSportEventIndexListResponse = SportsResponse

/** 分页补充指定联赛下赛事的请求参数。 */
export interface GetCompetitionPageParams {
  /** String，必填：请求语言，枚举见 SportsLanguageCode。 */
  LanguageCode: SportsLanguageCode
  /** Int，必填：1 早盘、2 今日、3 滚球、4 串关。 */
  Market: SportsMarket
  /** Int，必填：页码，从 1 开始，切换联赛时重置。 */
  PageNumber: number
  /** Int，必填：1 按联赛、2 按时间。 */
  SortType: SportsSortType
  /** Int，必填：每页大小，接口上限待确认。 */
  PageSize: number
  /** Int，必填：选中球种的 spc[].sid。 */
  SportId: number
  /** List<Int>，必填：目标联赛 ID 集合。 */
  CompetitionIds: number[]
}

/** 指定联赛的分页响应。 */
export interface GetCompetitionPageResponse extends SportsResponse {
  /** List：赛事列表，元素结构待确认，不直接套用其他接口的赛事结构。 */
  e?: unknown[]
  /** Int：分页总量原值，计数口径待确认。 */
  Total?: number
}

/** 查询热门/实时赛事的请求参数。 */
export interface GetPopularSportsParams {
  /** Int，必填：选中球种的 spc[].sid。 */
  SportId: number
  /** Int，必填：1 早盘、2 今日、3 滚球、4 串关；当前实时区传 3。 */
  Market: SportsMarket
  /** String，必填：请求语言，枚举见 SportsLanguageCode。 */
  LanguageCode: SportsLanguageCode
  /** Int，必填：1 按联赛、2 按时间。 */
  SortType: SportsSortType
}

/** 热门赛事响应目前只确认公共外层；业务数据结构待确认，不预设字段。 */
export type GetPopularSportsResponse = SportsResponse

/** 收藏/取消收藏参数；动作字段和赛事标识待确认，不预设未知字段。 */
export interface FavouriteEventParams extends Record<string, unknown> {
  /** String，必填：非空体育平台会员账号，不是本站 memberId。 */
  MemberCode: string
}

/** 收藏响应暂使用公共外层，业务数据结构待确认。 */
export type FavouriteEventResponse = SportsResponse
