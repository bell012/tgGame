import type { Component } from 'vue'

import type { SportCountItem } from '@/api/interface/sport'

import FootballIcon from './icon/football.svg?component'
import BasketballIcon from './icon/basketball.svg?component'
import TennisIcon from './icon/tennis.svg?component'
import BadmintonIcon from './icon/badminton.svg?component'
import PingPongIcon from './icon/ping-pong.svg?component'
import VolleyballIcon from './icon/volleyball.svg?component'
import AmericanFootballIcon from './icon/american-football.svg?component'
import BoxingIcon from './icon/boxing.svg?component'
import AutoRacingIcon from './icon/auto-racing.svg?component'
import BaseballIcon from './icon/baseball.svg?component'

export interface SportItem {
  key: string
  /** 体育接口球种 ID，对应 SportCountItem.sid。 */
  sportId: number
  icon: Component
  i18nKey: string
}

export const sportItems: SportItem[] = [
  {
    key: 'football',
    sportId: 1,
    icon: FootballIcon,
    i18nKey: 'sidebar_menu.sports.children.soccer'
  },
  {
    key: 'basketball',
    sportId: 2,
    icon: BasketballIcon,
    i18nKey: 'sidebar_menu.sports.children.basketball'
  },
  {
    key: 'tennis',
    sportId: 3,
    icon: TennisIcon,
    i18nKey: 'sidebar_menu.sports.children.tennis'
  },
  {
    key: 'badminton',
    sportId: 7,
    icon: BadmintonIcon,
    i18nKey: 'sidebar_menu.sports.children.badminton'
  },
  {
    key: 'ping-pong',
    sportId: 36,
    icon: PingPongIcon,
    i18nKey: 'sidebar_menu.sports.children.table_tennis'
  },
  {
    key: 'volleyball',
    sportId: 40,
    icon: VolleyballIcon,
    i18nKey: 'sidebar_menu.sports.children.volleyball'
  },
  {
    key: 'american-football',
    sportId: 19,
    icon: AmericanFootballIcon,
    i18nKey: 'sidebar_menu.sports.children.american_football'
  },
  {
    key: 'boxing',
    sportId: 11,
    icon: BoxingIcon,
    i18nKey: 'sidebar_menu.sports.children.boxing'
  },
  {
    key: 'auto-racing',
    sportId: 29,
    icon: AutoRacingIcon,
    i18nKey: 'sidebar_menu.sports.children.auto_racing'
  },
  {
    key: 'baseball',
    sportId: 8,
    icon: BaseballIcon,
    i18nKey: 'sidebar_menu.sports.children.baseball'
  }
]

// 标准化体育接口返回的球种 ID，兼容 sid 可能是字符串或数字的情况。
export function normalizeSportId(value: number | string | null | undefined): number | null {
  const sportId = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(sportId) ? sportId : null
}

// 根据接口返回的球种 ID 查找本地球种配置，避免字符串 sid 和数字 sportId 匹配失败。
export function findSportItemBySportId(
  value: number | string | null | undefined
): SportItem | undefined {
  const sportId = normalizeSportId(value)
  return sportId === null ? undefined : sportItems.find(item => item.sportId === sportId)
}

// 根据导航球种项匹配接口返回的今日数量。
export function findSportCountByItem(
  sportCounts: SportCountItem[],
  item: SportItem
): SportCountItem | undefined {
  return sportCounts.find(countItem => normalizeSportId(countItem.sid) === item.sportId)
}

// 获取单个球种今日数量，没有返回时默认展示 0。
export function getSportTodayCount(sportCounts: SportCountItem[], item: SportItem): number {
  return findSportCountByItem(sportCounts, item)?.cou ?? 0
}

// 构建按球种 key 读取的今日数量映射，供导航组件直接使用。
export function buildSportTodayCountMap(
  sportCounts: SportCountItem[]
): Partial<Record<string, number>> {
  return Object.fromEntries(
    sportItems.map(item => [item.key, getSportTodayCount(sportCounts, item)])
  )
}
