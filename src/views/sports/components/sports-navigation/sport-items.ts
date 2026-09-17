import type { Component } from 'vue'

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
  icon: Component
  i18nKey: string
  count?: number
}

export const sportItems: SportItem[] = [
  {
    key: 'football',
    icon: FootballIcon,
    i18nKey: 'sidebar_menu.sports.children.soccer',
    count: 13
  },
  {
    key: 'basketball',
    icon: BasketballIcon,
    i18nKey: 'sidebar_menu.sports.children.basketball',
    count: 0
  },
  { key: 'tennis', icon: TennisIcon, i18nKey: 'sidebar_menu.sports.children.tennis', count: 0 },
  {
    key: 'badminton',
    icon: BadmintonIcon,
    i18nKey: 'sidebar_menu.sports.children.badminton',
    count: 0
  },
  {
    key: 'ping-pong',
    icon: PingPongIcon,
    i18nKey: 'sidebar_menu.sports.children.table_tennis',
    count: 0
  },
  {
    key: 'volleyball',
    icon: VolleyballIcon,
    i18nKey: 'sidebar_menu.sports.children.volleyball',
    count: 0
  },
  {
    key: 'american-football',
    icon: AmericanFootballIcon,
    i18nKey: 'sidebar_menu.sports.children.american_football',
    count: 0
  },
  { key: 'boxing', icon: BoxingIcon, i18nKey: 'sidebar_menu.sports.children.boxing', count: 0 },
  {
    key: 'auto-racing',
    icon: AutoRacingIcon,
    i18nKey: 'sidebar_menu.sports.children.auto_racing',
    count: 0
  },
  {
    key: 'baseball',
    icon: BaseballIcon,
    i18nKey: 'sidebar_menu.sports.children.baseball',
    count: 0
  }
]
