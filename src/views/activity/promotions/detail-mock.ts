import type { ActivityListItem } from '@/api/interface/activity'
import { PROMOTION_DETAIL_BANNERS, type PromotionDetailKind } from './detail-presentation'
import { toPromotionImageUrl } from './shared'

export interface PromotionDetailMockItem extends ActivityListItem {
  mockRouteId: string
  mockCover: string
}

const depositTiers = [100, 200, 300, 400, 500, 600, 700].map((amount, index) => ({
  day: index + 1,
  rechargeAmount: amount,
  rewardAmount: (index + 1) * 10
}))

const richDescription = `
<p><strong>Get Promotional Information First</strong></p>
<p>Follow the official channel to receive the latest promotion news.</p>
`

const createActivity = (
  routeId: string,
  rowId: number,
  name: string,
  type: number,
  kind: PromotionDetailKind,
  config: Record<string, unknown>
): PromotionDetailMockItem => ({
  rowId,
  type,
  mockRouteId: routeId,
  mockCover: PROMOTION_DETAIL_BANNERS[kind],
  activiName: name,
  activityName: [
    { languageCode: 'zh', name },
    { languageCode: 'eng', name },
    { languageCode: 'vn', name }
  ],
  currencyList: ['CNY'],
  jumpType: 1,
  config: {
    CNY: {
      currency: 'CNY',
      ...config
    }
  }
})

/** 详情预览数据。地址使用 /promotions/mock/mock-firstDeposit 这类活动 id。 */
export const PROMOTION_DETAIL_MOCK_LIST: PromotionDetailMockItem[] = [
  createActivity('mock-firstDeposit', 900001, '首充活动', 1, 'firstDeposit', {
    pendingReward: 0,
    sign: depositTiers
  }),
  createActivity('mock-singleDeposit', 900002, '单笔充值活动', 2, 'singleDeposit', {
    pendingReward: 0,
    currentRound: 0,
    signCycle: 3,
    sign: depositTiers
  }),
  createActivity('mock-cumulativeDeposit', 900003, '累计充值活动', 3, 'cumulativeDeposit', {
    pendingReward: 10,
    unclaimedCount: 7,
    depositedAmount: 0,
    sign: depositTiers
  }),
  createActivity('mock-checkIn', 900004, '签到领壕礼', 5, 'checkIn', {
    ruleDesc: richDescription
  }),
  createActivity('mock-electronic', 900005, '电子游戏闯关嘉奖', 4, 'electronic', {
    ruleDesc: richDescription
  })
]

export const PROMOTION_DETAIL_MOCKS: Record<string, PromotionDetailMockItem> = Object.fromEntries(
  PROMOTION_DETAIL_MOCK_LIST.map(item => [item.mockRouteId, item])
)

export const getPromotionCardCover = (item: ActivityListItem) => {
  const mockCover = String((item as PromotionDetailMockItem).mockCover ?? '').trim()
  if (mockCover) {
    return mockCover
  }
  return toPromotionImageUrl(item.preImage)
}

export const getPromotionDetailMock = (activityId?: string) => {
  const id = String(activityId ?? '').trim()
  return PROMOTION_DETAIL_MOCKS[id] ?? null
}
