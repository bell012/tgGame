<template>
  <div class="sidebar-menu">
    <!-- BC代币 -->
    <div v-if="!isCollapsed" class="mb-2">
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
                {{ t('locales.sidebar_menu.bc_token.title') }}
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

    <!-- 可展开菜单组 -->
    <div class="flex flex-col">
      <div v-for="menu in expandableMenus" :key="menu.id" class="flex flex-col mt-1">
        <div
          v-if="isCollapsed && expandedMenus.includes(menu.id)"
          class="bg-bg-2 rounded-lg overflow-visible"
        >
          <!-- 父菜单 -->
          <div
            :class="[
              'relative flex items-center justify-between launch-card h-10 rounded-lg cursor-pointer menu-item-collapsed',
              { 'launch-card-active': activeMenuId === menu.id }
            ]"
            :data-tooltip="menu.name"
            @mouseenter="updateTooltipPosition"
            @click="handleMenuExpand(menu)"
          >
            <div class="flex items-center w-full justify-center relative">
              <div class="w-10 h-10 flex items-center justify-center">
                <component :is="menu.icon" class="w-6 h-6 fill-none" />
              </div>
            </div>
          </div>
          <!-- 子菜单 -->
          <div class="flex flex-col">
            <div
              v-for="item in menu.children"
              :key="item.id"
              :class="[
                'relative flex items-center justify-between launch-card h-10 rounded-lg cursor-pointer menu-item-collapsed mt-1',
                { 'launch-card-active': activeMenuId === item.id }
              ]"
              :data-tooltip="item.name"
              @mouseenter="updateTooltipPosition"
              @click="handleMenuItemClick(item)"
            >
              <div class="flex items-center w-full justify-center">
                <div class="w-10 h-10 flex items-center justify-center">
                  <component :is="item.icon" class="w-6 h-6 fill-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 折叠时，未展开的菜单 -->
        <div
          v-else-if="isCollapsed"
          :class="[
            'relative flex items-center justify-between launch-card h-10 bg-bg-2 rounded-lg cursor-pointer menu-item-collapsed',
            { 'launch-card-active': activeMenuId === menu.id }
          ]"
          :data-tooltip="menu.name"
          @mouseenter="updateTooltipPosition"
          @click="handleMenuExpand(menu)"
        >
          <div class="flex items-center w-full justify-center relative">
            <div class="w-10 h-10 flex items-center justify-center">
              <component :is="menu.icon" class="w-6 h-6 fill-none" />
            </div>
          </div>
        </div>

        <!-- 展开时的菜单 -->
        <template v-else>
          <div
            :class="[
              'flex items-center justify-between launch-card-active h-10 bg-bg-2 rounded-lg cursor-pointer'
            ]"
            @click="handleMenuExpand(menu)"
          >
            <div class="flex items-center">
              <div class="w-10 h-10 flex items-center justify-center">
                <component :is="menu.icon" class="w-6 h-6 fill-none" />
              </div>
              <span class="text-sm font-[600] text-text-1">{{ menu.name }}</span>
            </div>
            <div
              class="w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center mr-1.5 transition-transform duration-300 cursor-pointer"
              :class="{ 'rotate-180': expandedMenus.includes(menu.id) }"
              @click.stop="handleMenuCollapse(menu)"
            >
              <Arrow_down class="w-4 h-4 fill-none" />
            </div>
          </div>

          <!-- 子菜单 -->
          <transition name="expand">
            <div v-if="expandedMenus.includes(menu.id)" class="flex flex-col bg-bg-2 rounded-b-lg">
              <div
                v-for="item in menu.children"
                :key="item.id"
                :class="[
                  'relative flex items-center justify-between launch-card mt-1 h-10 bg-bg-2 rounded-lg cursor-pointer',
                  { 'launch-card-active': activeMenuId === item.id }
                ]"
                @click="handleMenuItemClick(item)"
                @mouseenter="
                  (e: MouseEvent) => item.children && handleSubmenuHover(e, menu.id, item.id)
                "
                @mouseleave="item.children && startClearSubmenuHover()"
              >
                <div class="flex items-center">
                  <div class="w-10 h-10 flex items-center justify-center">
                    <component :is="item.icon" class="w-6 h-6 fill-none" />
                  </div>
                  <span class="text-sm font-[600] text-text-1">{{ item.name }}</span>
                </div>
                <!-- 有子菜单时显示右箭头 -->
                <div v-if="item.children && item.children.length > 0" class="mr-2">
                  <Arrow_right class="w-4 h-4 fill-none" />
                </div>
              </div>
            </div>
          </transition>
        </template>
      </div>
    </div>

    <!-- 普通链接组 -->
    <div class="flex flex-col my-2 py-1 rounded-lg bg-bg-2 normalLink">
      <div
        v-for="(link, index) in normalLinks"
        :key="index"
        :class="[
          'flex items-center launch-card h-10 bg-bg-2 rounded-lg cursor-pointer',
          { 'relative menu-item-collapsed justify-center': isCollapsed },
          { 'launch-card-active': activeMenuId === link.id }
        ]"
        :data-tooltip="isCollapsed ? (link.name2 ? `${link.name2} ${link.name}` : link.name) : ''"
        @mouseenter="e => isCollapsed && updateTooltipPosition(e)"
        @click="handleNormalLinkClick(link)"
      >
        <div class="flex items-center" :class="{ 'justify-center': isCollapsed }">
          <div class="w-10 h-10 flex items-center justify-center">
            <component :is="link.icon" class="w-6 h-6 fill-none" />
          </div>
          <template v-if="!isCollapsed">
            <span v-if="link.name2" class="text-sm font-[600] text-theme-primary mr-1">{{
              link.name2
            }}</span>
            <span class="text-sm font-[600] text-text-1">{{ link.name }}</span>
          </template>
        </div>
        <div
          v-if="!isCollapsed && link.external"
          class="w-4 h-4 flex items-center justify-center ml-1"
        >
          <External class="w-full h-full fill-none" />
        </div>
      </div>
    </div>

    <!-- 底部功能组 -->
    <div class="flex flex-col mt-1">
      <!-- 赞助  -->
      <div v-for="menu in bottomMenus" :key="menu.id" class="flex flex-col mt-1">
        <div
          v-if="isCollapsed && expandedMenus.includes(menu.id)"
          class="bg-bg-2 rounded-lg overflow-visible"
        >
          <!-- 父菜单 -->
          <div
            :class="[
              'relative flex items-center justify-between launch-card h-10 rounded-lg cursor-pointer menu-item-collapsed',
              { 'launch-card-active': activeMenuId === menu.id }
            ]"
            :data-tooltip="menu.name"
            @mouseenter="updateTooltipPosition"
            @click="handleMenuExpand(menu)"
          >
            <div class="flex items-center w-full justify-center">
              <div class="w-10 h-10 flex items-center justify-center">
                <component :is="menu.icon" class="w-6 h-6 fill-none" />
              </div>
            </div>
          </div>
          <!-- 子菜单 -->
          <div class="flex flex-col">
            <div
              v-for="item in menu.children"
              :key="item.id"
              :class="[
                'relative flex items-center justify-between launch-card h-10 rounded-lg cursor-pointer menu-item-collapsed mt-1',
                { 'launch-card-active': activeMenuId === item.id }
              ]"
              :data-tooltip="item.name"
              @mouseenter="updateTooltipPosition"
              @click="handleMenuItemClick(item)"
            >
              <div class="flex items-center w-full justify-center">
                <div class="w-10 h-10 flex items-center justify-center">
                  <component :is="item.icon" class="w-6 h-6 fill-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 折叠时，未展开的菜单 -->
        <div
          v-else-if="isCollapsed"
          :class="[
            'relative flex items-center justify-between launch-card h-10 bg-bg-2 rounded-lg cursor-pointer menu-item-collapsed',
            { 'launch-card-active': activeMenuId === menu.id }
          ]"
          :data-tooltip="menu.name"
          @mouseenter="updateTooltipPosition"
          @click="handleMenuExpand(menu)"
        >
          <div class="flex items-center w-full justify-center">
            <div class="w-10 h-10 flex items-center justify-center">
              <component :is="menu.icon" class="w-6 h-6 fill-none" />
            </div>
          </div>
        </div>

        <!-- 展开时的菜单 -->
        <template v-else>
          <div
            :class="[
              'flex items-center justify-between launch-card-active h-10 bg-bg-2 rounded-lg cursor-pointer'
            ]"
            @click="handleMenuExpand(menu)"
          >
            <div class="flex items-center">
              <div class="w-10 h-10 flex items-center justify-center">
                <component :is="menu.icon" class="w-6 h-6 fill-none" />
              </div>
              <span class="text-sm font-[600] text-text-1">{{ menu.name }}</span>
            </div>
            <div
              class="w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center mr-1.5 transition-transform duration-300 cursor-pointer"
              :class="{ 'rotate-180': expandedMenus.includes(menu.id) }"
              @click.stop="handleMenuCollapse(menu)"
            >
              <Arrow_down class="w-4 h-4 fill-none" />
            </div>
          </div>

          <!-- 子菜单 -->
          <transition name="expand">
            <div v-if="expandedMenus.includes(menu.id)" class="flex flex-col bg-bg-2 rounded-b-lg">
              <div
                v-for="item in menu.children"
                :key="item.id"
                :class="[
                  'flex items-center justify-between launch-card mt-1 h-10 bg-bg-2 rounded-lg cursor-pointer',
                  { 'launch-card-active': activeMenuId === item.id }
                ]"
                @click="handleMenuItemClick(item)"
              >
                <div class="flex items-center">
                  <div class="w-10 h-10 flex items-center justify-center">
                    <component :is="item.icon" class="w-6 h-6 fill-none" />
                  </div>
                  <span class="text-sm font-[600] text-text-1">{{ item.name }}</span>
                </div>
              </div>
            </div>
          </transition>
        </template>
      </div>

      <!-- 线上客服 -->
      <div
        :class="[
          'flex items-center justify-between launch-card h-10 bg-bg-2 rounded-lg cursor-pointer mt-1',
          { 'relative menu-item-collapsed justify-center': isCollapsed },
          { 'launch-card-active': activeMenuId === 'customer-service' }
        ]"
        :data-tooltip="isCollapsed ? t('locales.sidebar_menu.customer_service') : ''"
        @mouseenter="e => isCollapsed && updateTooltipPosition(e)"
        @click="handleCustomerServiceClick"
      >
        <div class="flex items-center w-full" :class="{ 'justify-center': isCollapsed }">
          <div class="w-10 h-10 flex items-center justify-center">
            <component :is="side.helpIcon" class="w-6 h-6 fill-none" />
          </div>
          <span v-if="!isCollapsed" class="text-sm font-[600] text-text-1">
            {{ t('locales.sidebar_menu.customer_service') }}
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
              <h3 class="text-sm font-semibold text-text-1 mb-1">应用程式</h3>
              <p class="text-xs text-text-2 leading-tight">专属功能全面解锁 玩乐无限升级</p>
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
        class="flex items-center justify-between h-10 bg-bg-2 rounded-lg cursor-pointer mt-2 p-0.5"
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
              >{{ t('locales.sidebar_menu.theme.dark') }}</span
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
              <component :is="side.icon_19" class="w-4 h-4 fill-text-2 fill-none" />
            </div>
            <span
              v-if="!isCollapsed"
              :class="[
                'text-sm font-[600] ml-1',
                themeStore.theme === 'light' ? 'text-[#171A1A]' : 'text-[#A1AFB2]'
              ]"
              >{{ t('locales.sidebar_menu.theme.light') }}</span
            >
          </div>
        </button>
      </div>
    </div>

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
        <template v-for="menu in expandableMenus" :key="menu.id">
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
                  <span class="text-sm font-[600] text-text-1">{{ subItem.name }}</span>
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
import { sideIcons } from '@/static/svg/side'
import { useLayoutStore } from '@/stores/layout'
import { useLocaleStore } from '@/stores/locale'
import { useThemeStore } from '@/stores/theme'
import { navigateTo } from '@/utils/router'
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
const { side, casino, sports, lottery, support, sponsorships, aboutUs, legal } = sideIcons

type SidebarSubmenuItem = {
  id: string
  name: string
  icon: Component
  handler: () => void
  children?: SidebarSubmenuItem[]
}

type SidebarMenuGroup = {
  id: string
  name: string
  icon: Component
  handler: () => void
  children: SidebarSubmenuItem[]
}

// 展开的菜单 ID 列表
const expandedMenus = ref<string[]>([])

// 当前选中的菜单
const activeMenuId = ref<string>('')

// 当前选中的三级菜单
const activeThirdLevelMenuId = ref<string>('')

// 当前悬浮的子菜单
const hoveredSubmenu = ref<{ parentId: string; itemId: string } | null>(null)
const submenuPosition = ref({ top: 0, left: 0 })
let submenuHideTimer: ReturnType<typeof setTimeout> | null = null

// 当前语言名称
const currentLanguageName = computed(() => {
  return localeStore.currentLanguage === 'zh-CN'
    ? t('locales.sidebar_menu.language.zh_cn')
    : t('locales.sidebar_menu.language.en')
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
const handleMenuExpand = (menu: any) => {
  activeMenuId.value = menu.id
  if (menu.handler) {
    menu.handler()
  }
  if (!expandedMenus.value.includes(menu.id)) {
    expandedMenus.value.push(menu.id)
  }
}

// 箭头点击（可以展开/折叠）
const handleMenuCollapse = (menu: any) => {
  toggleMenu(menu.id)
}

// 菜单项点击
const handleMenuItemClick = (item: any) => {
  activeMenuId.value = item.id
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

// 处理普通链接点击
const handleNormalLinkClick = (link: any) => {
  activeMenuId.value = link.id
  if (link.handler) {
    link.handler()
  }
}

// 处理客服点击
const handleCustomerServiceClick = () => {
  activeMenuId.value = 'customer-service'
  console.log('打开线上客服')
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
// 可展开菜单组数据
const expandableMenus = computed<SidebarMenuGroup[]>(() => [
  {
    id: 'casino',
    name: t('locales.sidebar_menu.casino.title'),
    icon: side.casinoIcon,
    handler: () => {
      console.log('点击娱乐城')
    },
    children: [
      {
        id: 'casino_favorites',
        name: t('locales.sidebar_menu.casino.children.favorites'),
        icon: casino.favorites_full,
        handler: () => console.log('点击 我的最爱')
      },
      {
        id: 'casino_recent',
        name: t('locales.sidebar_menu.casino.children.recent'),
        icon: casino.recent,
        handler: () => console.log('点击 最近常玩')
      },
      {
        id: 'casino_tg_originals',
        name: t('locales.sidebar_menu.casino.children.tg_originals'),
        icon: casino.logo,
        handler: () => {
          navigateTo('/originate')
        }
      },
      {
        id: 'casino_hot_games',
        name: t('locales.sidebar_menu.casino.children.hot_games'),
        icon: casino.hot_games,
        handler: () => console.log('点击 热门游戏')
      },
      {
        id: 'casino_slots',
        name: t('locales.sidebar_menu.casino.children.slots'),
        icon: casino.slots,
        handler: () => console.log('点击 电子游戏')
      },
      {
        id: 'casino_live_casino',
        name: t('locales.sidebar_menu.casino.children.live_casino'),
        icon: casino.live_casino,
        handler: () => {
          navigateTo('/exclusive')
        }
      },
      {
        id: 'casino_table_games',
        name: t('locales.sidebar_menu.casino.children.table_games'),
        icon: casino.poker,
        handler: () => console.log('点击 棋牌游戏')
      },
      {
        id: 'casino_fishing',
        name: t('locales.sidebar_menu.casino.children.fishing'),
        icon: casino.fishing,
        handler: () => console.log('点击 捕鱼游戏')
      },
      {
        id: 'casino_game_providers',
        name: t('locales.sidebar_menu.casino.children.game_providers'),
        icon: casino.game_providers,
        handler: () => console.log('点击 游戏厂商')
      }
    ]
  },
  {
    id: 'sports',
    name: t('locales.sidebar_menu.sports.label'),
    icon: side.sportsIcon,
    handler: () => {
      console.log('点击体育')
    },
    children: [
      {
        id: 'sports_fifa',
        name: t('locales.sidebar_menu.sports.children.fifa'),
        icon: sports.fifa,
        handler: () => console.log('点击 FIFA')
      },
      {
        id: 'sports_soccer',
        name: t('locales.sidebar_menu.sports.children.soccer'),
        icon: sports.soccer,
        handler: () => console.log('点击 足球')
      },
      {
        id: 'sports_basketball',
        name: t('locales.sidebar_menu.sports.children.basketball'),
        icon: sports.basketball,
        handler: () => console.log('点击 篮球')
      },
      {
        id: 'sports_tennis',
        name: t('locales.sidebar_menu.sports.children.tennis'),
        icon: sports.tennis,
        handler: () => console.log('点击 网球')
      },
      {
        id: 'sports_badminton',
        name: t('locales.sidebar_menu.sports.children.badminton'),
        icon: sports.badminton,
        handler: () => console.log('点击 羽毛球')
      },
      {
        id: 'sports_boxing',
        name: t('locales.sidebar_menu.sports.children.boxing'),
        icon: sports.boxing,
        handler: () => console.log('点击 拳击')
      },
      {
        id: 'sports_darts',
        name: t('locales.sidebar_menu.sports.children.darts'),
        icon: sports.darts,
        handler: () => console.log('点击 飞镖')
      },
      {
        id: 'sports_american_football',
        name: t('locales.sidebar_menu.sports.children.american_football'),
        icon: sports.american_football,
        handler: () => console.log('点击 美式足球')
      },
      {
        id: 'sports_table_tennis',
        name: t('locales.sidebar_menu.sports.children.table_tennis'),
        icon: sports.table_tennis,
        handler: () => console.log('点击 乒乓球')
      },
      {
        id: 'sports_volleyball',
        name: t('locales.sidebar_menu.sports.children.volleyball'),
        icon: sports.volleyball,
        handler: () => console.log('点击 排球')
      }
    ]
  },
  {
    id: 'Anniversary',
    name: t('locales.sidebar_menu.anniversary.label'),
    icon: side.anniversaryIcon,
    handler: () => {
      console.log('周年庆')
    },
    children: []
  },
  {
    id: 'lottery',
    name: t('locales.sidebar_menu.lottery.label'),
    icon: side.lotteryIcon,
    handler: () => {
      console.log('点击彩票')
    },
    children: [
      {
        id: 'lottery_my_bets',
        name: t('locales.sidebar_menu.lottery.children.my_bets'),
        icon: lottery.my_bets,
        handler: () => console.log('点击 我的投注')
      },
      {
        id: 'lottery_all_lotteries',
        name: t('locales.sidebar_menu.lottery.children.all_lotteries'),
        icon: lottery.all_lotteries,
        handler: () => console.log('点击 所有彩票')
      },
      {
        id: 'lottery_favorites',
        name: t('locales.sidebar_menu.lottery.children.favorites'),
        icon: lottery.favorites,
        handler: () => console.log('点击 我的最爱')
      },
      {
        id: 'lottery_popular',
        name: t('locales.sidebar_menu.lottery.children.popular'),
        icon: lottery.popular,
        handler: () => console.log('点击 热门彩票')
      }
    ]
  },
  {
    id: 'crypto',
    name: t('locales.sidebar_menu.crypto.label'),
    icon: side.tradingIcon,
    handler: () => {
      console.log('点击加密货币期货')
    },
    children: [
      {
        id: 'crypto_1',
        name: t('locales.sidebar_menu.crypto.children.crypto_1'),
        icon: side.tradingIcon,
        handler: () => console.log('点击 加密货币 1')
      },
      {
        id: 'crypto_2',
        name: t('locales.sidebar_menu.crypto.children.crypto_2'),
        icon: side.tradingIcon,
        handler: () => console.log('点击 加密货币 2')
      }
    ]
  },
  {
    id: 'promotions',
    name: t('locales.sidebar_menu.promotions.label'),
    icon: side.promotionIcon,
    handler: () => {
      console.log('点击促销')
    },
    children: [
      {
        id: 'promotions_invite_rewards',
        name: t('locales.sidebar_menu.promotions.children.invite_rewards'),
        icon: lottery.invite_rewards,
        handler: () => console.log('点击 优惠活动')
      }
    ]
  }
])

// 普通链接数据
const normalLinks = computed(() => [
  {
    id: 'vip',
    name: t('locales.sidebar_menu.links.vip.name'),
    name2: t('locales.sidebar_menu.links.vip.prefix'),
    icon: side.vipClubIcon,
    external: false,
    handler: () => console.log('点击 VIP 俱乐部')
  },
  {
    id: 'prize',
    name: t('locales.sidebar_menu.links.bonus'),
    icon: side.bonusIcon,
    external: false,
    handler: () => console.log('点击 奖金')
  },
  {
    id: 'recommend',
    name: t('locales.sidebar_menu.links.recommend'),
    icon: side.affiliateIcon,
    external: false,
    handler: () => console.log('点击 推荐')
  },
  {
    id: 'forum',
    name: t('locales.sidebar_menu.links.forum'),
    icon: side.forumIcon,
    external: true,
    handler: () => console.log('点击 论坛')
  },
  {
    id: 'verified',
    name: t('locales.sidebar_menu.links.verified'),
    icon: side.fairIcon,
    external: false,
    handler: () => console.log('点击 可验证公平')
  },
  {
    id: 'responsible',
    name: t('locales.sidebar_menu.links.responsible'),
    icon: side.accountIcon,
    external: false,
    handler: () => console.log('点击 负责任博彩')
  },
  {
    id: 'blog',
    name: t('locales.sidebar_menu.links.blog'),
    icon: side.blogIcon,
    external: true,
    handler: () => console.log('点击 部落格')
  },
  {
    id: 'sports_injection',
    name: t('locales.sidebar_menu.links.betting_insights'),
    icon: side.bettingInsightsIcon,
    external: true,
    handler: () => console.log('点击 体育投注深入解剖')
  }
])

// 底部菜单组
const bottomMenus = computed<SidebarMenuGroup[]>(() => [
  {
    id: 'sponsorships',
    name: t('locales.sidebar_menu.sponsorships.label'),
    icon: side.sponsorshipsIcon,
    handler: () => {
      console.log('点击赞助')
    },
    children: [
      {
        id: 'sponsorships_sponsorship_journey',
        name: t('locales.sidebar_menu.sponsorships.items.sponsorship_journey'),
        icon: sponsorships.sponsorship_journey,
        handler: () => console.log('点击 赞助之旅')
      },
      {
        id: 'sponsorships_o_higgins',
        name: t('locales.sidebar_menu.sponsorships.items.o_higgins'),
        icon: sponsorships.o_higgins,
        handler: () => console.log("点击 O'HIGGINS")
      },
      {
        id: 'sponsorships_jason_derulo',
        name: t('locales.sidebar_menu.sponsorships.items.jason_derulo'),
        icon: sponsorships.jason_derulo,
        handler: () => console.log('点击 Jason Derulo')
      },
      {
        id: 'sponsorships_lil_pump',
        name: t('locales.sidebar_menu.sponsorships.items.lil_pump'),
        icon: sponsorships.lil_pump,
        handler: () => console.log('点击 Lil Pump')
      },
      {
        id: 'sponsorships_colby_covington',
        name: t('locales.sidebar_menu.sponsorships.items.colby_covington'),
        icon: sponsorships.colby_covington,
        handler: () => console.log('点击 Colby Covington')
      },
      {
        id: 'sponsorships_miami_club',
        name: t('locales.sidebar_menu.sponsorships.items.miami_club'),
        icon: sponsorships.miami_club,
        handler: () => console.log('点击 Miami Club')
      },
      {
        id: 'sponsorships_tg_game_esports',
        name: t('locales.sidebar_menu.sponsorships.items.tg_game_esports'),
        icon: sponsorships.tg_game_esports,
        handler: () => console.log('点击 TG Game Esports')
      },
      {
        id: 'sponsorships_st_kitts_nevis_patriots',
        name: t('locales.sidebar_menu.sponsorships.items.st_kitts_nevis_patriots'),
        icon: sponsorships.st_kitts_nevis_patriots,
        handler: () => console.log('点击 St. Kitts & Nevis Patriots')
      },
      {
        id: 'sponsorships_kwara_united',
        name: t('locales.sidebar_menu.sponsorships.items.kwara_united'),
        icon: sponsorships.kwara_united,
        handler: () => console.log('点击 Kwara United')
      },
      {
        id: 'sponsorships_sashimi_poker',
        name: t('locales.sidebar_menu.sponsorships.items.sashimi_poker'),
        icon: sponsorships.sashimi_poker,
        handler: () => console.log('点击 Sashimi Poker')
      },
      {
        id: 'sponsorships_leicester_city',
        name: t('locales.sidebar_menu.sponsorships.items.leicester_city'),
        icon: sponsorships.leicester_city,
        handler: () => console.log('点击 Leicester City')
      },
      {
        id: 'sponsorships_krasava',
        name: t('locales.sidebar_menu.sponsorships.items.krasava'),
        icon: sponsorships.krasava,
        handler: () => console.log('点击 KRASAVA')
      },
      {
        id: 'sponsorships_deccan_gladiators',
        name: t('locales.sidebar_menu.sponsorships.items.deccan_gladiators'),
        icon: sponsorships.deccan_gladiators,
        handler: () => console.log('点击 Deccan Gladiators')
      },
      {
        id: 'sponsorships_jean_silva',
        name: t('locales.sidebar_menu.sponsorships.items.jean_silva'),
        icon: sponsorships.jean_silva,
        handler: () => console.log('点击 Jean Silva')
      }
    ]
  },
  {
    id: 'support',
    name: t('locales.sidebar_menu.support.label'),
    icon: side.helpIcon,
    handler: () => {
      console.log('点击支援')
    },
    children: [
      {
        id: 'support_help_center',
        name: t('locales.sidebar_menu.support.items.help_center'),
        icon: support.help_center,
        handler: () => console.log('点击 帮助中心')
      },
      {
        id: 'support_faq',
        name: t('locales.sidebar_menu.support.items.faq'),
        icon: support.faq,
        handler: () => console.log('点击 常见问题')
      },
      {
        id: 'support_ceo_inbox',
        name: t('locales.sidebar_menu.support.items.ceo_inbox'),
        icon: support.ceo_inbox,
        handler: () => console.log('点击 CEO 信箱')
      }
    ]
  },
  {
    id: 'legal',
    name: t('locales.sidebar_menu.legal.label'),
    icon: side.legalIcon,
    handler: () => {
      console.log('点击法律条款')
    },
    children: [
      {
        id: 'legal_tg_licenses',
        name: t('locales.sidebar_menu.legal.items.tg_licenses'),
        icon: legal.tg_licenses,
        handler: () => console.log('点击 BC 牌照')
      },
      {
        id: 'legal_gamble_aware',
        name: t('locales.sidebar_menu.legal.items.gamble_aware'),
        icon: legal.gamble_aware,
        handler: () => console.log('点击 理性博彩')
      },
      {
        id: 'legal_fairness',
        name: t('locales.sidebar_menu.legal.items.fairness'),
        icon: legal.fairness,
        handler: () => console.log('点击 公平性')
      },
      {
        id: 'legal_privacy_policy',
        name: t('locales.sidebar_menu.legal.items.privacy_policy'),
        icon: legal.privacy_policy,
        handler: () => console.log('点击 隐私权政策')
      },
      {
        id: 'legal_terms_of_service',
        name: t('locales.sidebar_menu.legal.items.terms_of_service'),
        icon: legal.terms_of_service,
        handler: () => console.log('点击 服务条款')
      },
      {
        id: 'legal_aml',
        name: t('locales.sidebar_menu.legal.items.aml'),
        icon: legal.aml,
        handler: () => console.log('点击 AML')
      }
    ]
  },
  {
    id: 'about_us',
    name: t('locales.sidebar_menu.about_us.label'),
    icon: side.tipsHelpIcon,
    handler: () => {
      console.log('点击关于我们')
    },
    children: [
      {
        id: 'about_us_achievement',
        name: t('locales.sidebar_menu.about_us.items.achievement'),
        icon: aboutUs.achievement,
        handler: () => console.log('点击 成就')
      },
      {
        id: 'about_us_news',
        name: t('locales.sidebar_menu.about_us.items.news'),
        icon: aboutUs.news,
        handler: () => console.log('点击 新闻')
      },
      {
        id: 'about_us_work_with_us',
        name: t('locales.sidebar_menu.about_us.items.work_with_us'),
        icon: aboutUs.work_with_us,
        handler: () => console.log('点击 与我们合作')
      },
      {
        id: 'about_us_business_contacts',
        name: t('locales.sidebar_menu.about_us.items.business_contacts'),
        icon: aboutUs.business_contacts,
        handler: () => console.log('点击 商务联络人')
      },
      {
        id: 'about_us_license',
        name: t('locales.sidebar_menu.about_us.items.license'),
        icon: aboutUs.license,
        handler: () => console.log('点击 许可证')
      },
      {
        id: 'about_us_help_desk',
        name: t('locales.sidebar_menu.about_us.items.help_desk'),
        icon: aboutUs.help_desk,
        handler: () => console.log('点击 服务台')
      },
      {
        id: 'about_us_verify_representative',
        name: t('locales.sidebar_menu.about_us.items.verify_representative'),
        icon: aboutUs.verify_representative,
        handler: () => console.log('点击 验证代表')
      },
      {
        id: 'about_us_design_resources',
        name: t('locales.sidebar_menu.about_us.items.design_resources'),
        icon: aboutUs.design_resources,
        handler: () => console.log('点击 设计资源')
      }
    ]
  }
])
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
</style>
