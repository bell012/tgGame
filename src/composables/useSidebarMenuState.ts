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

export function useSidebarMenuState() {
  return {
    expandedMenus,
    activeMenuId,
    activeThirdLevelMenuId,
    collapseSidebarMenus
  }
}
