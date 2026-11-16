import { ref } from 'vue'

/** 侧栏选中/展开状态：模块级单例，避免进入全屏游戏卸载 Sidebar 后丢失 */
const expandedMenus = ref<string[]>([])
const activeMenuId = ref('')
const activeThirdLevelMenuId = ref('')

export const collapseSidebarMenus = () => {
  expandedMenus.value = []
  activeMenuId.value = ''
  activeThirdLevelMenuId.value = ''
}

// 仅列出实际有侧栏入口的页面；按路径段匹配，避免详情页或相似前缀误选。
const routeMenuEntries: [string, string][] = [
  ['/vip', 'vip-center'],
  ['/bet-history', 'bet-history'],
  ['/bet-details', 'bet-history'],
  ['/my-orders', 'my-orders'],
  ['/transaction', 'transaction'],
  ['/transaction-details', 'transaction'],
  ['/reward-center', 'rewards'],
  ['/reward-details', 'rewards'],
  ['/rollover', 'rollover'],
  ['/rollover-details', 'rollover'],
  ['/payment-methods', 'payment-methods'],
  ['/security', 'security'],
  ['/sports', 'sports'],
  ['/hash-game', 'hashGame'],
  ['/tasks', 'task-center'],
  ['/promotions', 'promotions'],
  ['/red-packet', 'red-packet'],
  ['/referral', 'referral'],
  ['/personal-center/rebate', 'rebate'],
  ['/personal-center/rebate-records', 'rebate'],
  ['/personal-center/feedback', 'leave-feedback'],
  ['/myVouchers', 'my-vouchers'],
  ['/voucherHistory', 'my-vouchers'],
  ['/favorites-games', 'favorites'],
  ['/recently-played-games', 'recently-played'],
  ['/legal', 'legal'],
  ['/about', 'about']
]

const routeMenuIds = new Set(routeMenuEntries.map(([, id]) => id))

export const isSidebarRouteMenu = (id: string) => {
  return routeMenuIds.has(id) || id === 'game-categories' || id.startsWith('casino_')
}

/** 接收去除语言前缀的路径，仅在导航成功后同步。 */
export const syncSidebarMenuForRoute = (path: string) => {
  const pathname = (path.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/'

  if (pathname === '/') {
    collapseSidebarMenus()
    return
  }

  // 全屏游戏及其详情沿用选游入口，关闭游戏返回后再按列表路径同步。
  if (pathname === '/game-iframe' || pathname.startsWith('/game/')) return

  const category = pathname.match(/^\/(?:casino|gamelist)\/([^/]+)$/)?.[1]
  let menuId =
    routeMenuEntries.find(([prefix]) => {
      return pathname === prefix || pathname.startsWith(`${prefix}/`)
    })?.[1] || ''

  if (category) menuId = `casino_${category}`
  else if (pathname === '/casino' || pathname.startsWith('/brand-games/')) {
    menuId = 'game-categories'
  }

  activeMenuId.value = menuId
  activeThirdLevelMenuId.value = ''

  const parentId =
    menuId.startsWith('casino_') || menuId === 'game-categories'
      ? 'game-categories'
      : menuId === 'my-vouchers'
        ? 'vouchers'
        : ''
  if (parentId && !expandedMenus.value.includes(parentId)) {
    expandedMenus.value.push(parentId)
  }
}

export function useSidebarMenuState() {
  return {
    expandedMenus,
    activeMenuId,
    activeThirdLevelMenuId,
    collapseSidebarMenus
  }
}
