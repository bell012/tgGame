<template>
  <div class="sidebar-menu px-3.5 sm:px-0">
    <!-- BC代币 -->
    <div v-if="!isCollapsed">
      <div
        class="flex items-center justify-between bc-card p-2 rounded-lg cursor-pointer"
        @click="() => console.log('点击 BC代币')"
      >
        <div class="flex items-center flex-1">
          <div class="w-9 h-9 mr-1 flex items-center justify-center">
            <component :is="side.icon_1" class="w-6 h-6 fill-none" />
          </div>
          <div v-if="!isCollapsed" class="flex-1 min-w-0">
            <div class="flex items-center">
              <span class="text-sm font-[800] text-text-1 mr-1">
                {{ t('sidebar_menu.bc_token.title') }}
              </span>
              <span class="text-xs font-[600] text-theme-primary">↑ 0.45%</span>
            </div>
            <div class="text-sm text-text-1">$0.00771</div>
          </div>
        </div>
        <div v-if="!isCollapsed" class="text-text-3 text-xl">
          <div class="w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center">
            <Arrow_right class="w-4 h-4 fill-none" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col mt-1">
      <div
        v-for="(menuGroup, groupIndex) in sidebarMenuGroups"
        :key="`group-${groupIndex}`"
        class="flex flex-col mt-1"
      >
        <div v-for="(menu, menuIndex) in menuGroup" :key="menu.id" class="flex flex-col">
          <div v-if="hasGroupedChildren(menu)" class="bg-bg-2 rounded-lg overflow-visible">
            <div
              v-for="(item, index) in menu.children"
              :key="item.id"
              :class="[
                'relative flex items-center justify-between launch-card h-10 rounded-lg cursor-pointer',
                { 'menu-item-collapsed': isCollapsed },
                { 'border-t border-opacity-6': index > 0 && menu.children && menu.children.length > 1 },
                {
                  'rounded-t-lg rounded-b-none':
                    index === 0 && menu.children && menu.children.length > 1
                },
                {
                  'rounded-b-lg rounded-t-none':
                    menu.children && index === menu.children.length - 1 && menu.children.length > 1
                },
                {
                  'rounded-none': menu.children && index > 0 && index < menu.children.length - 1
                },
                { 'launch-card-active': isSubmenuBranchActive(item) }
              ]"
              :data-tooltip="item.name"
              @mouseenter="e => isCollapsed && updateTooltipPosition(e)"
              @click="handleMenuItemClick(item)"
            >
              <div class="flex items-center w-full" :class="{ 'justify-center': isCollapsed }">
                <div class="w-10 h-10 flex items-center justify-center text-text-2">
                  <img
                    v-if="typeof item.icon === 'string'"
                    :src="item.icon"
                    class="w-6 h-6 object-contain"
                  />
                  <component v-else :is="item.icon" class="w-6 h-6 fill-none" />
                </div>
                <span v-if="!isCollapsed" class="text-sm font-[600] text-text-1">{{
                  item.name
                }}</span>
              </div>
            </div>
          </div>

          <div
            v-else-if="isCollapsed && hasChildren(menu) && expandedMenus.includes(menu.id)"
            class="bg-bg-2 rounded-lg overflow-visible"
          >
            <div
              :class="[
                'relative flex items-center justify-between launch-card h-10 rounded-lg cursor-pointer menu-item-collapsed',
                { 'launch-card-active': isMenuGroupActive(menu) }
              ]"
              :data-tooltip="menu.name2 ? `${menu.name2} ${menu.name}` : menu.name"
              @mouseenter="updateTooltipPosition"
              @click="handleMenuClick(menu)"
            >
              <div class="flex items-center w-full justify-center">
                <div class="w-10 h-10 flex items-center justify-center text-text-2">
                  <img
                    v-if="typeof menu.icon === 'string'"
                    :src="menu.icon"
                    class="w-6 h-6 object-contain"
                  />
                  <component v-else :is="menu.icon" class="w-6 h-6 fill-none" />
                </div>
              </div>
            </div>
            <div class="flex flex-col">
              <template v-for="item in menu.children" :key="item.id">
                <div
                  :class="[
                    'relative flex items-center justify-between launch-card h-10 rounded-lg cursor-pointer menu-item-collapsed mt-1',
                    { 'launch-card-active': isSubmenuBranchActive(item) }
                  ]"
                  :data-tooltip="item.name"
                  @mouseenter="updateTooltipPosition"
                  @click="handleMenuItemClick(item)"
                >
                  <div class="flex items-center w-full justify-center">
                    <div class="w-10 h-10 flex items-center justify-center">
                      <img
                        v-if="typeof item.icon === 'string'"
                        :src="item.icon"
                        class="w-6 h-6 object-contain"
                      />
                      <component v-else :is="item.icon" class="w-6 h-6 fill-none" />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div
            v-else-if="isCollapsed"
            :class="[
              'relative flex items-center justify-between launch-card h-10 bg-bg-2 rounded-lg cursor-pointer menu-item-collapsed',
              { 'border-t border-opacity-6': menuIndex > 0 && menuGroup.length > 1 },
              { 'rounded-t-lg rounded-b-none': menuIndex === 0 && menuGroup.length > 1 },
              {
                'rounded-b-lg rounded-t-none':
                  menuIndex === menuGroup.length - 1 && menuGroup.length > 1
              },
              { 'rounded-none': menuIndex > 0 && menuIndex < menuGroup.length - 1 },
              { 'launch-card-active': isMenuGroupActive(menu) }
            ]"
            :data-tooltip="menu.name2 ? `${menu.name2} ${menu.name}` : menu.name"
            @mouseenter="updateTooltipPosition"
            @click="handleMenuClick(menu)"
          >
            <div class="flex items-center w-full justify-center">
              <div class="w-10 h-10 flex items-center justify-center">
                <img
                  v-if="typeof menu.icon === 'string'"
                  :src="menu.icon"
                  class="w-6 h-6 object-contain"
                />
                <component v-else :is="menu.icon" class="w-6 h-6 fill-none" />
              </div>
            </div>
          </div>

          <template v-else>
            <div
              :class="[
                'flex items-center justify-between launch-card h-10 bg-bg-2 rounded-lg cursor-pointer',
                { 'border-t border-opacity-6': menuIndex > 0 && menuGroup.length > 1 },
                { 'rounded-t-lg rounded-b-none': menuIndex === 0 && menuGroup.length > 1 },
                {
                  'rounded-b-lg rounded-t-none':
                    menuIndex === menuGroup.length - 1 && menuGroup.length > 1
                },
                { 'rounded-none': menuIndex > 0 && menuIndex < menuGroup.length - 1 },
                { 'launch-card-active': isMenuGroupActive(menu) },
                { normalLink: menu.section === 'normal' }
              ]"
              @click="handleMenuClick(menu)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 flex items-center justify-center text-text-2">
                  <img
                    v-if="typeof menu.icon === 'string'"
                    :src="menu.icon"
                    class="w-6 h-6 object-contain"
                  />
                  <component v-else :is="menu.icon" class="w-6 h-6 fill-none" />
                </div>
                <span v-if="menu.name2" class="text-sm font-[600] text-theme-primary mr-1">{{
                  menu.name2
                }}</span>
                <span class="text-sm font-[600] text-text-1">{{ menu.name }}</span>
              </div>
              <div
                v-if="hasChildren(menu)"
                class="w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center mr-1.5 transition-transform duration-300 cursor-pointer"
                :class="{ 'rotate-180': expandedMenus.includes(menu.id) }"
                @click.stop="handleMenuCollapse(menu)"
              >
                <Arrow_down class="w-4 h-4 fill-none" />
              </div>
              <div
                v-else-if="menu.external"
                class="w-4 h-4 flex items-center justify-center ml-1 mr-2"
              >
                <External class="w-full h-full fill-none" />
              </div>
            </div>

            <transition name="expand">
              <div
                v-if="hasChildren(menu) && expandedMenus.includes(menu.id)"
                class="flex flex-col bg-bg-2 rounded-b-lg"
              >
                <div
                  v-for="item in menu.children"
                  :key="item.id"
                  :class="[
                    'relative flex items-center justify-between launch-card mt-1 h-10 bg-bg-2 rounded-lg cursor-pointer',
                    { 'launch-card-active': isSubmenuBranchActive(item) }
                  ]"
                  @click="handleMenuItemClick(item)"
                  @mouseenter="
                    (e: MouseEvent) => item.children && handleSubmenuHover(e, menu.id, item.id)
                  "
                  @mouseleave="item.children && startClearSubmenuHover()"
                >
                  <div class="flex items-center">
                    <div class="w-10 h-10 flex items-center justify-center text-text-2">
                      <img
                        v-if="typeof item.icon === 'string'"
                        :src="item.icon"
                        class="w-6 h-6 object-contain"
                      />
                      <component v-else :is="item.icon" class="w-6 h-6 fill-text-2" />
                    </div>
                    <span
                      class="text-sm font-[600]"
                      :class="isSubmenuBranchActive(item) ? 'text-theme-primary' : 'text-text-1'"
                    >
                      {{ item.name }}
                    </span>
                  </div>
                  <div v-if="item.children && item.children.length > 0" class="mr-2">
                    <Arrow_right class="w-4 h-4 fill-none" />
                  </div>
                </div>
              </div>
            </transition>
          </template>
        </div>
      </div>

      <!-- 线上客服 -->
      <div
        :class="[
          'flex items-center justify-between launch-card h-10 bg-bg-2 rounded-lg cursor-pointer mt-1',
          { 'relative menu-item-collapsed justify-center': isCollapsed },
          { 'launch-card-active': activeMenuId === 'customer-service' }
        ]"
        :data-tooltip="isCollapsed ? t('sidebar_menu.customer_service') : ''"
        @mouseenter="e => isCollapsed && updateTooltipPosition(e)"
        @click="handleCustomerServiceClick"
      >
        <div class="flex items-center w-full" :class="{ 'justify-center': isCollapsed }">
          <div class="w-10 h-10 flex items-center justify-center">
            <component :is="side.helpIcon" class="w-6 h-6 fill-none" />
          </div>
          <span v-if="!isCollapsed" class="text-sm font-[600] text-text-1">
            {{ t('sidebar_menu.customer_service') }}
          </span>
        </div>
      </div>
      <!-- 应用程式 -->
      <div v-if="!isCollapsed" class="mt-3 mb-2">
        <div
          class="block app-download-card rounded-lg cursor-pointer"
          @click="handleAppDownloadClick"
        >
          <div class="flex justify-between items-center">
            <div class="flex-1 p-2.5 pr-0">
              <h3 class="text-sm font-semibold text-text-1 mb-1">
                {{ t('sidebar_menu.app_download.title') }}
              </h3>
              <p class="text-xs text-text-2 leading-tight">
                {{ t('sidebar_menu.app_download.subtitle') }}
              </p>
            </div>
            <div class="w-[80px] h-auto flex-shrink-0 pt-1 pr-1">
              <div class="w-full h-full rounded flex items-center justify-center text-[10px]">
                <img
                  src="@/static/img/home/pwa.png.png"
                  alt=""
                  class="w-full h-full object-cover rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 语言切换 -->
      <div
        :class="[
          'flex items-center justify-between launch-card h-10 bg-bg-2 rounded-lg cursor-pointer mt-2'
        ]"
        @click="() => emit('open-language-modal')"
      >
        <div class="flex items-center w-full" :class="{ 'justify-center': isCollapsed }">
          <div class="w-10 h-10 flex items-center justify-center">
            <LanguageIcon class="w-6 h-6 fill-none" />
          </div>
          <span v-if="!isCollapsed" class="text-sm font-[600] text-text-1">{{
            currentLanguageName
          }}</span>
        </div>
        <div
          v-if="!isCollapsed"
          class="w-6 h-6 bg-bg-3 rounded-md flex items-center justify-center mr-1.5"
        >
          <Arrow_right class="w-4 h-4 fill-none" />
        </div>
      </div>

      <!-- 主题切换 -->
      <div
        v-if="!isCollapsed"
        class="flex items-center justify-between h-10 bg-bg-2 rounded-lg cursor-pointer mt-2 p-0.5 sm:mb-4"
      >
        <button
          :class="[
            'flex-1 w-[50%] h-9 rounded-lg border-none cursor-pointer transition-all',
            themeStore.theme === 'dark' ? 'bg-[#4B5354]' : 'bg-[f9f9f9]'
          ]"
          @click="themeStore.setTheme('dark')"
        >
          <div class="flex items-center justify-center">
            <div class="w-4 h-4 flex items-center justify-center">
              <component :is="side.icon_18" class="w-4 h-4 fill-none" />
            </div>
            <span
              v-if="!isCollapsed"
              :class="[
                'text-sm font-[600] ml-1',
                themeStore.theme === 'dark' ? 'text-[#fff]' : 'text-[#B0B9B9]'
              ]"
              >{{ t('sidebar_menu.theme.dark') }}</span
            >
          </div>
        </button>
        <button
          :class="[
            'flex-1 w-[50%] h-9 rounded-lg border-none cursor-pointer transition-all',
            themeStore.theme === 'light' ? 'bg-[#fff]' : 'bg-transparent'
          ]"
          @click="themeStore.setTheme('light')"
        >
          <div class="flex items-center justify-center">
            <div class="w-4 h-4 flex items-center justify-center">
              <component :is="side.icon_19" class="w-4 h-4 fill-text-2" />
            </div>
            <span
              v-if="!isCollapsed"
              :class="[
                'text-sm font-[600] ml-1',
                themeStore.theme === 'light' ? 'text-[#171A1A]' : 'text-[#A1AFB2]'
              ]"
              >{{ t('sidebar_menu.theme.light') }}</span
            >
          </div>
        </button>
      </div>
    </div>

    <!-- Leave Feedback 弹窗 -->
    <teleport to="body">
      <transition name="leave-feedback-modal">
        <div
          v-if="showLeaveFeedbackModal"
          :class="[
            'leave-feedback-modal-mask',
            { 'leave-feedback-modal-mask-login-unauthed': !isLoggedIn }
          ]"
          @click.self="handleCloseLeaveFeedbackModal"
        >
          <div class="leave-feedback-modal-card">
            <button
              type="button"
              class="leave-feedback-modal-close"
              @click="handleCloseLeaveFeedbackModal"
            >
              <CloseIcon class="h-3.5 w-3.5 stroke-text-1" />
            </button>
            <FeedbackPage embedded @close="handleCloseLeaveFeedbackModal" />
          </div>
        </div>
      </transition>
    </teleport>

    <!-- 三级菜单悬浮面板 -->
    <teleport to="body">
      <div
        v-if="hoveredSubmenu"
        class="submenu-popup"
        :style="{
          top: `${submenuPosition.top}px`,
          left: `${submenuPosition.left}px`
        }"
        @mouseenter="cancelClearSubmenuHover"
        @mouseleave="clearSubmenuHover"
      >
        <template v-for="menu in menusWithChildren" :key="menu.id">
          <template v-if="menu.id === hoveredSubmenu.parentId">
            <template v-for="item in menu.children" :key="item.id">
              <template v-if="item.id === hoveredSubmenu.itemId && item.children">
                <div
                  v-for="subItem in item.children"
                  :key="subItem.id"
                  :class="[
                    'submenu-popup-item',
                    { 'submenu-popup-item-active': activeThirdLevelMenuId === subItem.id }
                  ]"
                  @click="handleThirdLevelClick(subItem)"
                >
                  <div class="w-6 h-6 flex items-center justify-center mr-2"></div>
                  <span
                    class="text-sm font-[600]"
                    :class="
                      activeThirdLevelMenuId === subItem.id ? 'text-theme-primary' : 'text-text-1'
                    "
                  >
                    {{ subItem.name }}
                  </span>
                </div>
              </template>
            </template>
          </template>
        </template>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import Arrow_down from '@/static/svg/arrow_down.svg?component'
import Arrow_right from '@/static/svg/arrow_right.svg?component'
import External from '@/static/svg/external.svg?component'
import LanguageIcon from '@/static/svg/language.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import { sideIcons } from '@/static/svg/side'
import newSideIcons from '@/static/svg/side/newIcon'
import { useLayoutStore } from '@/stores/layout'
import { useLocaleStore } from '@/stores/locale'
import { useThemeStore } from '@/stores/theme'
import { useCasinoTabButtons } from '@/composables/useCasinoTabButtons'
import { getLocaleLabel } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import FeedbackPage from '@/views/personalCenter/feedback/index.vue'

import type { Component } from 'vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
interface Props {
  isCollapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  isCollapsed: false
})

const emit = defineEmits<{
  'open-language-modal': []
}>()

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const layoutStore = useLayoutStore()

const { t } = useI18n()
const isLoggedIn = computed(() => Boolean(localStorage.getItem('userInfo')))
const { tabButtons: casinoTabButtons, loadCasinoTabButtons } = useCasinoTabButtons({ isLoggedIn })
const { side, support } = sideIcons
type SidebarSubmenuItem = {
  id: string
  name: string
  icon: string | Component
  handler?: () => void
  children?: SidebarSubmenuItem[]
  external?: boolean
  name2?: string
  section?: 'expandable' | 'normal' | 'bottom'
}

type SidebarMenuGroup = {
  id: string
  name: string
  icon: string | Component
  handler?: () => void
  children?: SidebarSubmenuItem[]
  renderAsGroup?: boolean
  external?: boolean
  name2?: string
  section?: 'expandable' | 'normal' | 'bottom'
  groupKey?: string
}

// 展开的菜单 ID 列表
const expandedMenus = ref<string[]>([])

// 当前选中的菜单
const activeMenuId = ref<string>('')

// 当前选中的三级菜单
const activeThirdLevelMenuId = ref<string>('')
const showLeaveFeedbackModal = ref(false)

/** 用于高亮父级 */
const isSubmenuBranchActive = (item: SidebarSubmenuItem): boolean => {
  if (activeMenuId.value === item.id) return true
  const children = item.children
  if (!children?.length) return false
  return children.some(
    child => child.id === activeThirdLevelMenuId.value || isSubmenuBranchActive(child)
  )
}

/** 父级分组选中 */
const isMenuGroupActive = (menu: SidebarMenuGroup): boolean => {
  if (activeMenuId.value === menu.id) return true
  const children = menu.children
  if (!children?.length) return false
  return children.some(child => isSubmenuBranchActive(child))
}

/** 当前三级选中 */
const menuOwnsThirdLevel = (menu: SidebarMenuGroup, thirdId: string): boolean => {
  if (!thirdId) return false
  const children = menu.children
  if (!children?.length) return false
  const branchHasThird = (item: SidebarSubmenuItem): boolean => {
    if (item.children?.some(c => c.id === thirdId)) return true
    return item.children?.some(c => branchHasThird(c)) ?? false
  }
  return children.some(item => branchHasThird(item))
}

const hasChildren = (menu: SidebarMenuGroup): boolean => {
  return Boolean(menu.children && menu.children.length > 0)
}

const hasGroupedChildren = (menu: SidebarMenuGroup): boolean => {
  return Boolean(menu.renderAsGroup && menu.children && menu.children.length > 0)
}

// 当前悬浮的子菜单
const hoveredSubmenu = ref<{ parentId: string; itemId: string } | null>(null)
const submenuPosition = ref({ top: 0, left: 0 })
let submenuHideTimer: ReturnType<typeof setTimeout> | null = null

// 当前语言名称
const currentLanguageName = computed(() => {
  return getLocaleLabel(localeStore.currentLanguage)
})

// 应用程式下载点击
const handleAppDownloadClick = () => {
  navigateTo('/app-download')
}

// 切换菜单展开/折叠的通用方法
const toggleMenu = (menuId: string) => {
  const index = expandedMenus.value.indexOf(menuId)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(menuId)
  }
}

// 菜单展开
const handleMenuExpand = (menu: SidebarMenuGroup) => {
  activeMenuId.value = menu.id
  if (activeThirdLevelMenuId.value && !menuOwnsThirdLevel(menu, activeThirdLevelMenuId.value)) {
    activeThirdLevelMenuId.value = ''
  }
  if (menu.handler) {
    menu.handler()
  }
  if (!expandedMenus.value.includes(menu.id)) {
    expandedMenus.value.push(menu.id)
  }
}

const handleMenuClick = (menu: SidebarMenuGroup) => {
  if (hasChildren(menu)) {
    handleMenuExpand(menu)
    return
  }
  handleMenuItemClick(menu)
}

// 箭头点击（可以展开/折叠）
const handleMenuCollapse = (menu: any) => {
  toggleMenu(menu.id)
}

// 菜单项点击
const handleMenuItemClick = (item: any) => {
  activeMenuId.value = item.id
  activeThirdLevelMenuId.value = ''
  if (item.handler) {
    item.handler()
  }
}

// 提示框位置
const updateTooltipPosition = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const top = rect.top + rect.height / 2
  target.style.setProperty('--tooltip-top', `${top}px`)
}

// 处理客服点击
const handleCustomerServiceClick = () => {
  activeMenuId.value = 'customer-service'
  console.log('打开线上客服')
}

const handleLeaveFeedbackClick = () => {
  activeMenuId.value = 'leave-feedback'
  showLeaveFeedbackModal.value = true
}

const handleCloseLeaveFeedbackModal = () => {
  showLeaveFeedbackModal.value = false
}

// 子菜单悬浮
const handleSubmenuHover = (event: MouseEvent, parentId: string, itemId: string) => {
  if (submenuHideTimer) {
    clearTimeout(submenuHideTimer)
    submenuHideTimer = null
  }

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  hoveredSubmenu.value = { parentId, itemId }
  submenuPosition.value = {
    top: rect.top,
    left: rect.right + 4
  }
}

// 延迟清除子菜单悬浮
const startClearSubmenuHover = () => {
  if (submenuHideTimer) {
    clearTimeout(submenuHideTimer)
  }
  submenuHideTimer = setTimeout(() => {
    hoveredSubmenu.value = null
    submenuHideTimer = null
  }, 300)
}

// 取消清除子菜单悬浮
const cancelClearSubmenuHover = () => {
  if (submenuHideTimer) {
    clearTimeout(submenuHideTimer)
    submenuHideTimer = null
  }
}

// 立即清除子菜单悬浮
const clearSubmenuHover = () => {
  if (submenuHideTimer) {
    clearTimeout(submenuHideTimer)
    submenuHideTimer = null
  }
  hoveredSubmenu.value = null
}

// 三级菜单项点击
const handleThirdLevelClick = (item: any) => {
  activeThirdLevelMenuId.value = item.id
  if (item.handler) {
    item.handler()
  }
  hoveredSubmenu.value = null
}
const buildCasinoMenuChildren = (): SidebarSubmenuItem[] => {
  return casinoTabButtons.value
    .filter(item => item.sysGameTypeCode !== '')
    .map(item => ({
      id: `casino_${item.sysGameTypeCode}`,
      name: item.sysGameTypeName,
      icon: item.icon,
      handler: () => {
        navigateTo(`/casino/${item.sysGameTypeCode}`)
      }
    }))
}
const sidebarMenus = computed<SidebarMenuGroup[]>(() => [
  {
    id: 'crypto-account',
    name: 'Crypto Account',
    icon: newSideIcons.cryptoAccountIcon,
    handler: () => console.log('点击 Crypto Account'),
    groupKey: 'crypto-account'
  },
  {
    id: 'game-categories',
    name: 'Game Categories',
    icon: newSideIcons.gameCategoriesIcon,
    handler: () => navigateTo('/casino'),
    groupKey: 'game-categories',
    children: buildCasinoMenuChildren()
  },
  {
    id: 'recent-favorites-group',
    name: 'Recent And Favorites',
    icon: newSideIcons.recentlyPlayedIcon,
    groupKey: 'recent-favorites-group',
    renderAsGroup: true,
    children: [
      { id: 'recently-played', name: 'Recently Played', icon: newSideIcons. recentlyPlayedIcon },
      { id: 'favorites', name: 'Favorites', icon: newSideIcons.favoritesIcon }
    ]
  },
  {
    id: 'vouchers',
    name: 'Vouchers',
    icon: newSideIcons.vouchersIcon,
    groupKey: 'vouchers',
    children: isLoggedIn.value
      ? [
          { id: 'cash-voucher', name: 'Cash Voucher', icon: newSideIcons.cashVoucherIcon },
          {
            id: 'lucky-red-envelope',
            name: 'Lucky Red Envelope',
            icon: newSideIcons.luckyRedEnvelopeIcon
          },
          {
            id: 'smash-golden-egg',
            name: 'Smash the Golden Egg',
            icon: newSideIcons.smashGoldenEggIcon
          },
          { id: 'mystery-box', name: 'Mystery Box', icon: newSideIcons.mysteryBoxIcon },
          { id: 'lucky-spin', name: 'Lucky Spin', icon: newSideIcons.luckySpinIcon }
        ]
      : []
  },
  { id: 'task-center', name: 'Task Center', icon: newSideIcons.taskCenterIcon, groupKey: 'task-center' },
  { id: 'promotion-center', name: 'Promotions Center', icon: newSideIcons.promotionCenterIcon, groupKey: 'promotion-center' },
  {
    id: 'combination1',
    name: 'combination1',
    icon: newSideIcons.redEnvelopeEventIcon,
    groupKey: 'combination1',
    renderAsGroup: true,
    children: [
    { id: 'red-envelope-event', name: 'Red Envelope Event', icon: newSideIcons.redEnvelopeEventIcon },
    { id: 'credit-loan', name: 'Credit Loan', icon: newSideIcons.creditLoanIcon },
    { id: 'lottery-event', name: 'Lottery Event', icon: newSideIcons.lotteryEventIcon },
    { id: 'lucky-wheel', name: 'Lucky Wheel', icon: newSideIcons.luckyWheelIcon },
    { id: 'promo-code', name: 'Promo Code', icon: newSideIcons.promoCodeIcon },
    ]
  },
  
  { id: 'vip-center', name: 'VIP Center', icon: newSideIcons.vipCenterIcon, groupKey: 'vip-center', handler: () => navigateTo('/vip') },
  {
    id: 'referral',
    name: 'Referral',
    icon: newSideIcons.referralIcon,
    groupKey: 'referral',
    handler: () => navigateTo('/menu/referral')
  },
  {
    id: 'rebate',
    name: 'Rebate',
    icon: newSideIcons.rebateIcon,
    groupKey: 'rebate',
    handler: () => navigateTo('/personal-center/rebate')
  },
  {
    id: 'combination2',
    name: 'combination2',
    icon: newSideIcons.myOrdersIcon,
    groupKey: 'combination2',
    renderAsGroup: true,
    children: [
      { id: 'my-orders', name: 'My Orders', icon: newSideIcons.myOrdersIcon },
      { id: 'bet-history', name: 'Bet History', icon: newSideIcons. betHistoryIcon },
      { id: 'transaction', name: 'Transaction', icon: newSideIcons.transactionIcon },
      { id: 'rewards', name: 'Rewards', icon: newSideIcons.rewardsIcon },
      { id: 'rollover', name: 'Rollover', icon: newSideIcons.rolloverIcon },
    ]
  },
  
  { id: 'payment-methods', name: 'Payment Methods', icon: newSideIcons.paymentMethodsIcon, groupKey: 'payment-methods' },
  { id: 'security', name: 'Security', icon: newSideIcons.securityIcon, groupKey: 'security' },
  {
    id: 'combination3',
    name: 'combination3',
    icon: newSideIcons.sponsorshipsIcon,
    groupKey: 'combination3',
    renderAsGroup: true,
    children: [
    { id: 'sponsorships', name: 'Sponsorships', icon: newSideIcons.sponsorshipsIcon },
    {
      id: 'leave-feedback',
      name: 'Leave Feedback',
      icon: newSideIcons.leaveFeedbackIcon,
      handler: handleLeaveFeedbackClick
    },
    { id: 'legal', name: 'Legal', icon: newSideIcons.legalIcon },
    { id: 'about', name: 'About', icon: newSideIcons.aboutIcon }
    ]
  },
  
])

const sidebarMenuGroups = computed<SidebarMenuGroup[][]>(() => {
  const groups = new Map<string, SidebarMenuGroup[]>()
  sidebarMenus.value.forEach(menu => {
    const groupKey = menu.groupKey ?? menu.id
    const currentGroup = groups.get(groupKey)
    if (currentGroup) {
      currentGroup.push(menu)
      return
    }
    groups.set(groupKey, [menu])
  })
  return Array.from(groups.values())
})

const menusWithChildren = computed<SidebarMenuGroup[]>(() =>
  sidebarMenus.value.filter(menu => hasChildren(menu))
)
</script>

<style scoped lang="scss">
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-download-card {
  background: #323738;
  background-image: radial-gradient(circle at 400% 400%, rgb(36 238 137), transparent 92%);
}

.bc-card {
  background-image: radial-gradient(
    85.75% 170.25% at 0% 100%,
    rgba(35, 238, 136, 0.15) 0%,
    rgba(35, 238, 136, 0) 100%
  );
}

.launch-card:hover {
  background: var(--color-opacity-10);
}

.launch-card-active {
  background: var(--color-opacity-10);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

.normalLink {
  position: relative;
  &::after {
    content: '';
    width: 32px;
    height: auto;
    min-height: 18px;
    position: absolute;
    top: -8px;
    right: 0px;
    z-index: 99;
    background: url('@/static/img/home/cloud.webp') no-repeat center center;
    background-size: contain;
  }
}

// 折叠时的菜单项
.menu-item-collapsed {
  position: relative;

  // 悬浮提示
  &::after {
    content: attr(data-tooltip);
    position: fixed;
    left: calc(v-bind('layoutStore.SIDEBAR_WIDTH_COLLAPSED + "px"') + -5px);
    top: var(--tooltip-top, 50%);
    transform: translateY(-50%);
    padding: 6px 8px;
    background-color: var(--color-background-level-3);
    color: var(--color-text-level-1);
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.2s ease,
      visibility 0.2s ease;
    pointer-events: none;
    z-index: 99999;
  }

  // 小三角形
  &::before {
    content: '';
    position: fixed;
    left: calc(v-bind('layoutStore.SIDEBAR_WIDTH_COLLAPSED + "px"') + -11px);
    top: var(--tooltip-top, 50%);
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid var(--color-background-level-3);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.2s ease,
      visibility 0.2s ease;
    pointer-events: none;
    z-index: 99999;
  }

  &:hover::after,
  &:hover::before {
    opacity: 1;
    visibility: visible;
  }
}

// 三级菜单悬浮面板
.submenu-popup {
  position: fixed;
  background-color: var(--color-background-level-2);
  border-radius: 8px;
  padding: 12px 8px;
  z-index: 100000;
  min-width: 200px;
  max-width: 300px;
}

.submenu-popup-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 4px;

  &:hover {
    background:
      linear-gradient(90deg, rgba(36 238 137 / 0.2), #23ee8800), rgba(255, 255, 255, 0.05);
  }
}

.submenu-popup-item-active {
  background: linear-gradient(90deg, rgba(36 238 137 / 0.2), #23ee8800);
}

.leave-feedback-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 10, 18, 0.65);
}

@media (min-width: 641px) {
  .leave-feedback-modal-mask-login-unauthed {
    z-index: 9999;
  }
}

.leave-feedback-modal-card {
  position: relative;
  width: min(100%, 520px);
  height: min(88vh, 760px);
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.36);
}

.leave-feedback-modal-close {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
  display: flex;
  height: 26px;
  width: 26px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: var(--color-opacity-10);
  cursor: pointer;
}

.leave-feedback-modal-enter-active,
.leave-feedback-modal-leave-active {
  transition: opacity 0.2s ease;
}

.leave-feedback-modal-enter-active .leave-feedback-modal-card,
.leave-feedback-modal-leave-active .leave-feedback-modal-card {
  transition:
    transform 0.22s ease,
    opacity 0.2s ease;
}

.leave-feedback-modal-enter-from,
.leave-feedback-modal-leave-to {
  opacity: 0;
}

.leave-feedback-modal-enter-from .leave-feedback-modal-card,
.leave-feedback-modal-leave-to .leave-feedback-modal-card {
  transform: translateY(10px) scale(0.96);
  opacity: 0;
}
</style>
