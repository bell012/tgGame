import { Component } from 'vue'
import casino from './casino.svg?component'
import chat from './chat.svg?component'
import explore from './explore.svg?component'
import menu from './menu.svg?component'
import sports from './sports.svg?component'
import home from './home.svg?component'

// 导出图标
export const bottomTabBarIcons: Record<string, Component> = {
  casino,
  chat,
  explore,
  menu,
  sports,
  home
}

export default bottomTabBarIcons
