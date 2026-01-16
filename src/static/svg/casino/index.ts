import { Component } from 'vue'
import bc from './bc.svg?component'
import favorites_full from './favorites_full.svg?component'
import home from './home.svg?component'
import hot_games from './hot_games.svg?component'
import poker from './poker.svg?component'
import slots from './slots.svg?component'
import themes from './themes.svg?component'

// 导出图标
export const casinoIcons: Record<string, Component> = {
  bc,
  favorites_full,
  home,
  hot_games,
  poker,
  slots,
  themes
}

export default casinoIcons
