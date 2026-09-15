/** Figma 静态页面使用的栏目键。 */
export type TaskTabKey =
  | 'general'
  | 'agent'
  | 'new-user'
  | 'crypto'
  | 'slots'
  | 'live-casino'
  | 'table-games'
  | 'fishing'
  | 'lottery'
  | 'sports'

/** Figma 静态栏目展示数据。 */
export interface TaskTabItem {
  key: TaskTabKey
  label: string
  iconKey: string
  mobileWidth: number
}

/** Figma 静态统计数据。 */
export interface TaskOverviewData {
  deposit: string
  validBets: string
}

/** Figma 静态活动度奖励节点。 */
export interface TaskActivityNode {
  action: 'Claimed' | 'Claim' | 'Open'
  activity: string
  state: 'claimed' | 'claimable' | 'locked'
}

/** Figma 静态活动度区域数据。 */
export interface TaskActivityData {
  currentActivity: string
  nodes: TaskActivityNode[]
  reset: {
    days: string
    hours: string
    minutes: string
    seconds: string
  }
}

/** Figma 静态任务卡片数据。 */
export interface TaskViewItem {
  id: string
  title: string
  activity: string
  reward: string
  progress: number
  action: 'Go to Task' | 'Claim' | 'Completed'
}

/** 按 Figma 顺序生成固定任务栏目。 */
export const taskFigmaTabs: TaskTabItem[] = [
  { key: 'general', label: 'General', iconKey: 'gameCategoriesIcon', mobileWidth: 103 },
  { key: 'agent', label: 'Agent', iconKey: 'referralIcon', mobileWidth: 92 },
  { key: 'new-user', label: 'New User', iconKey: 'taskCenterIcon', mobileWidth: 113 },
  { key: 'crypto', label: 'Crypto', iconKey: 'cryptoAccountIcon', mobileWidth: 97 },
  { key: 'slots', label: 'Slots', iconKey: 'slotsIcon', mobileWidth: 86 },
  { key: 'live-casino', label: 'Live Casino', iconKey: 'liveCasinoIcon', mobileWidth: 123 },
  { key: 'table-games', label: 'Table Games', iconKey: 'tableGamesIcon', mobileWidth: 132 },
  { key: 'fishing', label: 'Fishing', iconKey: 'fishingIcon', mobileWidth: 98 },
  { key: 'lottery', label: 'Lottery', iconKey: 'lotteryEventIcon', mobileWidth: 99 },
  { key: 'sports', label: 'Sports', iconKey: 'gameCategoriesIcon', mobileWidth: 95 }
]

/** 按 Figma 示例生成固定的今日统计。 */
export const taskFigmaOverview: TaskOverviewData = {
  deposit: '570.00',
  validBets: '18112.00'
}

/** 按 Figma 示例生成固定的活动度奖励节点。 */
export const taskFigmaActivity: TaskActivityData = {
  currentActivity: '30',
  nodes: [
    { action: 'Claimed', activity: '30', state: 'claimed' },
    { action: 'Claim', activity: '50', state: 'claimable' },
    { action: 'Open', activity: '100', state: 'locked' },
    { action: 'Open', activity: '150', state: 'locked' },
    { action: 'Open', activity: '250', state: 'locked' },
    { action: 'Open', activity: '300', state: 'locked' },
    { action: 'Open', activity: '350', state: 'locked' }
  ],
  reset: {
    days: '03',
    hours: '23',
    minutes: '59',
    seconds: '59'
  }
}

/** 按 Figma 示例生成固定的任务卡片。 */
export const taskFigmaItems: TaskViewItem[] = [
  {
    id: 'download-login',
    title: 'Download & Log In',
    activity: '+0',
    reward: '18~188',
    progress: 0,
    action: 'Go to Task'
  },
  {
    id: 'slots-bet-500',
    title: 'Slots - Bet 500',
    activity: '+5',
    reward: '18',
    progress: 100,
    action: 'Completed'
  },
  {
    id: 'slots-bet-5000',
    title: 'Slots - Bet 5,000',
    activity: '+10',
    reward: '5%',
    progress: 100,
    action: 'Claim'
  },
  {
    id: 'game-bet-5000',
    title: 'Slots - Bet 5,000',
    activity: '+10',
    reward: '5%',
    progress: 100,
    action: 'Go to Task'
  }
]
