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
  /**
   * StatusCode（number/String）：100 或 '100' 为成功标志，其他值为失败；E100 不等于 100。
   * 102：无效令牌；202：无效用户名。需重新获取体育平台凭据，不代表原请求成功。
   * 部分网关异常也会返回 '100'，仍须校验对应业务数据结构，不能只依赖状态码。
   */
  stc: number | string
  /** StatusDesc（String）：业务状态描述，不用此字段判断是否成功。 */
  std: string
  /** 未确认的响应结构保持 unknown，读取前必须校验，不能据此假定业务字段。 */
  [key: string]: unknown
}

/** 体育投注历史接口共用会员凭据参数。 */
export interface SportsBetHistoryAuthParams {
  /** 体育接口语言码，使用 ENG / CHS 等体育网关语言。 */
  LanguageCode: SportsLanguageCode
  /** loginPlatform 返回的 token。 */
  Token: string
  /** loginPlatform 返回的 platformAcct。 */
  MemberCode: string
  /** 体育网关要求的请求时间戳签名，生成规则待接口返回确认。 */
  TimeStamp: string
}

/** GetStatement 已结算请求参数；时间按体育网关跨天 12:00:00 至 11:59:59 传递。 */
export interface GetStatementParams extends SportsBetHistoryAuthParams {
  StartDate: string
  EndDate: string
  DateType: 2
  StartTime: '12:00:00'
  EndTime: '11:59:59'
}

/** GetBetList 未结算请求参数；状态固定查 1、2、3、4。 */
export interface GetBetListParams extends SportsBetHistoryAuthParams {
  BetConfirmationStatus: [1, 2, 3, 4]
}

/** 体育投注历史注单内的单个投注项，字段保留体育网关原始简写。 */
export interface SportsBetHistoryWagerSelection {
  waics: number
  wict: number
  waict: number
  waicr: number
  m: number
  eid: number
  en: string
  etid: number
  edt: number | string
  sid: number | string
  rsid: number | string
  cid: number
  cn: string
  egtid: number
  rbt?: string | null
  htid: number
  htn: string
  atid: number
  atn: string
  ft: string
  btid: number
  btn: string
  peid: number
  btsid: number
  sen: string
  eon?: string | null
  otid: number
  otn?: string | null
  pbo?: number | null
  o: number
  ao?: number | null
  h: number | null
  dih: string | null
  hthts?: number | null
  athts?: number | null
  htfts?: number | null
  atfts?: number | null
  wahts?: number | null
  waats?: number | null
  gtid: number
  seo: number
  md: number
  mlid: number
  sp: string
  soid?: number | null
  os?: string | null
  dh: number
  wtl?: number | null
  ws?: number | null
  pid: number
  pn: string
  ei?: Record<string, unknown> | string
  rai?: number | null
  wio?: number
}

/** 体育投注历史注单记录，wl 数组中的单条数据。 */
export interface SportsBetHistoryWager {
  wid: number | string
  wcdt: number | string
  mc: string
  isa: number
  mwla: number
  ot: number
  wat: number
  bp: string
  bcr: number
  bcs: number
  bss: number
  br: number
  bts: number
  prid: number | null
  bbp: number | null
  btbba: number
  noc: number
  combs: number
  coo?: number | null
  pp: number
  cas: boolean
  pbo?: number | null
  sdt?: string | null
  btsdt?: string | null
  ou?: number
  wil: SportsBetHistoryWagerSelection[]
  rs?: unknown[] | null
  sw: number
  bo?: number | null
  bc?: number | null
  ber: number
}

/** 体育投注历史响应结构；GetStatement 和 GetBetList 当前返回相同结构。 */
export interface SportsBetHistoryResponse extends SportsResponse {
  wl: SportsBetHistoryWager[]
  sert: string
}

/** 已结算响应结构。 */
export type GetStatementResponse = SportsBetHistoryResponse

/** 未结算响应结构。 */
export type GetBetListResponse = SportsBetHistoryResponse

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

/** 主列表与按 ID 查询均已确认的赛事字段；赛前可能不返回滚球时间、比分和红牌。 */
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
  /** rbt，String，可缺失：滚球时间显示值，可含阶段文字；赛前可能不返回。 */
  RBTime?: string
  /** rbts，Int：0 不适用、1 开始、2 进行中、3 暂停。 */
  RBTimeStatus: SportsRBTimeStatus
  /** hs，String，可缺失：主队比分，赛前可能不返回，不据此视为 0。 */
  HomeScore?: string
  /** as，String，可缺失：客队比分，赛前可能不返回。 */
  AwayScore?: string
  /** hrc，String，可缺失：主队红牌数，赛前可能不返回。 */
  HomeRedCard?: string
  /** arc，String，可缺失：客队红牌数，赛前可能不返回。 */
  AwayRedCard?: string
  /** rs，List，可缺失：按赛事组别细分的比分。 */
  RelatedScores?: SportRelatedScore[]
  /** ei，String：赛事附加信息的 JSON 字符串，内部已确认字段见 SportEventExtraInfo。 */
  ExtraInfo: string
  /** co，对象：赛事所属联赛，不是数组。 */
  Competition: SportCompetition
  /** mls，List：赛事盘口列表。 */
  MarketLines: SportMarketLine[]
}

/** 按 ID 查询与主列表的赛事字段一致，均保留赛前缺失字段和原始盘口。 */
export type SportEventDetail = SportEvent

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
  /** List：本联赛当前返回的赛事；默认列表实测最多预览 5 场，不代表联赛全部赛事。 */
  Sports: SportEvent[]
  /** Int：本联赛赛事数量；可能大于预览 Sports.length，数量本身不包含缺失赛事 ID。 */
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
  sid: number | string
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
  /** Int，必填：1 联赛预览列表；2 联赛/关键词筛选。Keyword 非空必须传 2，筛选结果也可能只含联赛预览。 */
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
  /** Int：联赛/时间排序实测均为联赛总数，不是赛事总数；页数为 ceil(Total / PageSize)。 */
  Total?: number
}

/**
 * 按赛事 ID 查询详情的网关请求；已验证游客查询，无需前端提供 TimeStamp 或会员凭据。
 * 不传 Market：赛事范围由 SportId + EventIds 指定，串关通过 IsCombo 区分。
 * 请求加密交给统一拦截器，调用方直接传业务参数，不手动包 param/data。
 */
export interface GetSelectedEventInfoParams {
  /** Int，必填：赛事所属球种的 sid；一次请求内的赛事应属于同一球种。 */
  SportId: number
  /** List<Long>，必填：赛事 EventId 列表；V5 上限 5 场，调用方先去重、分批。 */
  EventIds: number[]
  /** Int，必填：1 马来盘、2 香港盘、3 欧洲盘、4 印尼盘。 */
  OddsType: SportsOddsType
  /** Boolean，必填：true 查询串关赛事，false 查询非串关赛事。 */
  IsCombo: boolean
  /** Boolean，必填：是否同时返回同赛事组别的关联赛事；仅查询目标卡片时传 false。 */
  IncludeGroupEvents: boolean
  /** String，必填：体育语言码，例如 ENG 英文、CHS 中文，不使用本站 eng/zh。 */
  LanguageCode: SportsLanguageCode
  /** List<Int>，可选：返回的玩法 ID；1 让球、2 大小、3 独赢。已验证过滤有效，但每种玩法可能有多条盘口线。 */
  BetTypeIds?: number[]
  /** List<Int>，可选：返回的比赛时段，1 全场、2 上半场、3 下半场，省略时不限定。 */
  PeriodIds?: SportsPeriodId[]
}

/** 按 ID 查询的原始响应；实测外层只有 stc、std、e，不返回联赛分组或 Total。 */
export interface GetSelectedEventInfoResponse extends SportsResponse {
  /**
   * Events（List）：平铺赛事详情，直接读取 e[].EventId / MarketLines，不是 e[].Sports。
   * 返回顺序可能与 EventIds 不同，必须按 EventId 匹配，不能按数组位置对应。
   * 访问失败时可能仅返回 stc='100' 和错误 std、缺少 e；须同时校验 e 是数组。
   * 日期保留字符串；滚球时间、比分和红牌在赛前可缺失，详见 SportEventDetail。
   */
  e?: SportEventDetail[]
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

/**
 * 分页补充指定联赛预览之外赛事的请求参数。
 * 不支持 Keyword 或指定日期；Market 控制赛事分类，搜索结果不调用本接口补查。
 */
export interface GetCompetitionPageParams {
  /** String，必填：请求语言，枚举见 SportsLanguageCode。 */
  LanguageCode: SportsLanguageCode
  /** Int，必填：1 早盘、2 今日、3 滚球、4 串关。 */
  Market: SportsMarket
  /** Int，必填：补充列表页码，从 1 开始；getSportsV2 的预览不是本接口第 1 页。 */
  PageNumber: number
  /** Int，必填：1 按联赛、2 按时间。 */
  SortType: SportsSortType
  /** Int，必填：每页大小；首页传 10，接口上限待确认。 */
  PageSize: number
  /** Int，必填：选中球种的 spc[].sid。 */
  SportId: number
  /** List<Int>，必填：目标联赛 ID 集合。 */
  CompetitionIds: number[]
}

/** 指定联赛预览之后的分页响应；实测自动跳过 getSportsV2 默认预览的前 5 场。 */
export interface GetCompetitionPageResponse extends SportsResponse {
  /**
   * Events（List）：平铺赛事，结构与 SportEvent 一致，不是联赛分组。
   * 保留主列表预览，再按 EventId 去重追加；包含球队、联赛和 MarketLines，赛前比分可缺失。
   * 没有剩余赛事或页码超出范围时返回空数组。
   */
  e?: SportEvent[]
  /** Boolean，可缺失：true 继续请求下一页，false 已到末页；没有剩余赛事时可能省略。 */
  hasNextPage?: boolean
  /** Int：补充列表的赛事总数，不含默认预览的前 5 场，不能替换联赛 competitionCount。 */
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

/** 本站热门赛事请求体，分页与筛选条件均放在 param 中，不使用体育网关基础地址。 */
export interface GetCompetitionListParams {
  /** 热门赛事页码、球种、分类及时间范围。 */
  param: {
    /** 页码，从 1 开始。 */
    page: number
    /** 当前选中的球种 ID，首页默认为 1（足球）。 */
    sportId: number
    /** 当前赛事分类，首页默认为 3（滚球）。 */
    market: SportsMarket
    /** 查询开始时间，当前时间前一天的 13 位毫秒时间戳。 */
    startTime: number
    /** 查询结束时间，当前时间的 13 位毫秒时间戳。 */
    endTime: number
  }
}

/** 本站热门赛事的队伍信息；eventList 实际返回对象，不是数组，也不包含盘口。 */
export interface SportHotEventTeams {
  /** string：客队名称。 */
  awayTeam: string
  /** number，整数：客队 ID，可用于获取队标。 */
  awayTeamId: number
  /** string：主队名称。 */
  homeTeam: string
  /** number，整数：主队 ID，可用于获取队标。 */
  homeTeamId: number
}

/** 本站热门赛事记录，仅声明实际返回字段，不套用体育网关 SportEvent 的完整盘口结构。 */
export interface SportHotEvent {
  /** number，整数：联赛 ID，不是赛事 ID。 */
  competitionId: number
  /** string：联赛名称。 */
  competitionName: string
  /** number：记录创建时间，13 位毫秒时间戳，不是比赛开始时间。 */
  createTime: number
  /** number，整数：启用标志；已返回 1，完整枚举及各取值含义待后端确认。 */
  enable: number
  /** number：赛事时间，13 位毫秒时间戳，不沿用网关 EventDate 的字符串类型。 */
  eventDate: number
  /** number，整数：赛事 ID，可用于与体育赛事数据关联，不与 rowId 混用。 */
  eventId: number
  /** object：主客队名称及 ID，实际结构为单个对象。 */
  eventList: SportHotEventTeams
  /** string：赛事展示名称；当前返回格式为“主队/客队”，不依赖拆分此字段获取队名。 */
  eventName: string
  /** string：本站语言码；已返回 eng（英文），不是体育网关的 ENG。 */
  languageCode: string
  /** string：最后修改者标识，不是修改时间。 */
  lastModify: string
  /** number，整数：赛事分类；当前记录返回 2（今日），其他返回取值待确认。 */
  market: number
  /** number，整数：本站热门记录 ID，与 eventId、competitionId 分属不同标识。 */
  rowId: number
  /** number，整数：排序值；已返回 0，升降序及同值处理规则待确认。 */
  sort: number
  /** number，整数：球种 ID；当前记录返回 1（足球）。 */
  sportId: number
}

/** 本站热门赛事响应；成功时 result 为记录数组，不是分页对象，允许空数组。 */
export interface GetCompetitionListResponse {
  /** string：本站业务状态码，C2 成功；已出现 C1 失败，不使用体育网关的 stc。 */
  code: string
  /** string：服务端业务提示，不以文案判断成功与否。 */
  message: string
  /** Array：热门赛事记录；业务失败时可能不返回该字段。 */
  result?: SportHotEvent[]
  /** boolean：服务端成功标志；实际出现过 C1 与 true 并存，须优先校验 code。 */
  success: boolean
}

/** 收藏/取消收藏共用参数；仅传会员账号和赛事 ID，不额外发送动作或收藏状态字段。 */
export interface FavouriteEventParams {
  /** String，必填：非空体育平台会员账号，不是本站 memberId。 */
  MemberCode: string
  /** Long，必填：赛事接口返回的 EventId，不是页面的球种与赛事组合 ID。 */
  EventId: number
}

/** 收藏响应暂使用公共外层，业务数据结构待确认。 */
export type FavouriteEventResponse = SportsResponse
