/**
 * 推荐详情页日期筛选值。
 */
export type ReferralDateRangeValue =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last3days'
  | 'last15days'
  | 'last30days'

/**
 * 推荐详情页图表文案配置。
 */
export interface ReferralChartTextMap {
  today: string
  yesterday: string
}

/**
 * 推荐详情页图表 X 轴数据。
 */
export interface ReferralChartAxisData {
  xAxisData: string[]
  dateKeys: string[]
}

/**
 * 推荐详情页图表原始数据项。
 */
export interface ReferralChartRawItem {
  statisticsDate?: number
  [key: string]: number | string | undefined
}

/**
 * 将日期格式化为 MM/DD。
 */
export function formatReferralMonthDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${month}/${day}`
}

/**
 * 返回当前时间往前 N 天的日期列表。
 */
function getReferralRecentDates(days: number) {
  const result: Date[] = []
  const today = new Date()

  for (let index = days - 1; index >= 0; index -= 1) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() - index)
    result.push(currentDate)
  }

  return result
}

/**
 * 根据筛选值生成图表 X 轴显示文案和日期映射。
 */
export function buildReferralChartAxisData(
  value: ReferralDateRangeValue,
  textMap: ReferralChartTextMap
): ReferralChartAxisData {
  if (value === 'today') {
    const todayKey = formatReferralMonthDay(new Date())

    return {
      xAxisData: [textMap.today],
      dateKeys: [todayKey]
    }
  }

  if (value === 'yesterday') {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return {
      xAxisData: [textMap.yesterday],
      dateKeys: [formatReferralMonthDay(yesterday)]
    }
  }

  const dayCountMap: Record<
    Exclude<ReferralDateRangeValue, 'all' | 'today' | 'yesterday'>,
    number
  > = {
    last3days: 3,
    last15days: 15,
    last30days: 30
  }
  const dayCount = value === 'all' ? 30 : dayCountMap[value]
  const recentDates = getReferralRecentDates(dayCount)

  return {
    xAxisData: recentDates.map((date, index) =>
      index === recentDates.length - 1 ? textMap.today : formatReferralMonthDay(date)
    ),
    dateKeys: recentDates.map(date => formatReferralMonthDay(date))
  }
}

/**
 * 根据指定 X 轴补齐图表序列数据。
 */
export function normalizeReferralChartSeriesData(
  list: ReferralChartRawItem[] | undefined,
  valueKey: string,
  axisData: ReferralChartAxisData
) {
  const dataMap = new Map<string, number>()

  for (const item of list ?? []) {
    if (!item.statisticsDate) {
      continue
    }

    const label = formatReferralMonthDay(new Date(item.statisticsDate))
    dataMap.set(label, Number(item[valueKey] ?? 0))
  }

  return axisData.dateKeys.map(dateKey => dataMap.get(dateKey) ?? 0)
}
