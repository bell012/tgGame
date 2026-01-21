import type { Component } from 'vue'
import bc from './bc.svg?component'
import favorites_full from './favorites_full.svg?component'
import fishing from './fishing.svg?component'
import game_providers from './game_providers.svg?component'
import home from './home.svg?component'
import hot_games from './hot_games.svg?component'
import live_casino from './live_casino.svg?component'
import logo from './logo.svg?component'
import poker from './poker.svg?component'
import recent from './recent.svg?component'
import slots from './slots.svg?component'
import themes from './themes.svg?component'

// 导出图标
export const casinoIcons: Record<string, Component> = {
  bc,
  favorites_full,
  fishing,
  game_providers,
  home,
  hot_games,
  logo,
  poker,
  recent,
  slots,
  live_casino,
  themes
}

export default casinoIcons
