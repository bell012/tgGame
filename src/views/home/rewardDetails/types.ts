import type { RecentBigWinsItem } from '@/api/interface/home.interface'

/**
 * 近期大奖接口一条 + 前端补全的封面图、VIP 图标 URL。
 * 点击进详情时原样传入，展示格式化在 `details.vue` 内完成。
 */
export type RewardDetailsRawItem = RecentBigWinsItem & {
  src: string
  icon: string
}
