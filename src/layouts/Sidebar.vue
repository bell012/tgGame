<template>
  <aside
    class="sidebar"
    :style="{
      width: isCollapsed
        ? `${layoutStore.SIDEBAR_WIDTH_COLLAPSED}px`
        : `${layoutStore.SIDEBAR_WIDTH_EXPANDED}px`
    }"
  >
    <nav class="flex flex-col gap-2 px-3 py-2">
      <!-- 应用程式 -->
      <div v-if="!isCollapsed" class="mt-3 mb-2">
        <router-link :to="appDownloadLink" class="block app-download-card rounded-lg">
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
        </router-link>
      </div>

      <!-- BC代币 -->
      <div v-if="!isCollapsed" class="mb-2">
        <div
          class="flex items-center justify-between bc-card p-2 bg-bg-3 rounded-lg cursor-pointer"
          @click="() => console.log('点击 BC代币')"
        >
          <div class="flex items-center flex-1">
            <div class="w-9 h-9 mr-1 flex items-center justify-center">
              <component :is="sideIcons.icon_1" class="w-6 h-6 fill-text-2 fill-none" />
            </div>
            <div v-if="!isCollapsed" class="flex-1 min-w-0">
              <div class="flex items-center">
                <span class="text-sm font-[800] text-text-1 mr-1">BC 代币</span>
                <span class="text-xs font-[600] text-theme-primary">↑ 0.45%</span>
              </div>
              <div class="text-sm text-text-1">$0.00771</div>
            </div>
          </div>
          <div v-if="!isCollapsed" class="text-text-3 text-xl">
            <div class="w-6 h-6 bg-bg-2 rounded-md flex items-center justify-center">
              <Arrow_right class="w-4 h-4 fill-text-2 fill-none" />
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
                  <component :is="sideIcons[menu.icon]" class="w-6 h-6 fill-text-2 fill-none" />
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
                    <component :is="sideIcons[item.icon]" class="w-6 h-6 fill-text-2 fill-none" />
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
                <component :is="sideIcons[menu.icon]" class="w-6 h-6 fill-text-2 fill-none" />
              </div>
            </div>
          </div>

          <!-- 展开时的菜单 -->
          <template v-else>
            <div
              :class="[
                'flex items-center justify-between launch-card h-10 bg-bg-2 rounded-lg cursor-pointer',
                { 'launch-card-active': activeMenuId === menu.id }
              ]"
              @click="handleMenuExpand(menu)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 flex items-center justify-center">
                  <component :is="sideIcons[menu.icon]" class="w-6 h-6 fill-text-2 fill-none" />
                </div>
                <span class="text-sm font-[600] text-text-1">{{ menu.name }}</span>
              </div>
              <div
                class="w-6 h-6 bg-bg-3 rounded-md flex items-center justify-center mr-1.5 transition-transform duration-300 cursor-pointer"
                :class="{ 'rotate-180': expandedMenus.includes(menu.id) }"
                @click.stop="handleMenuCollapse(menu)"
              >
                <Arrow_down class="w-4 h-4 fill-text-2 fill-none" />
              </div>
            </div>

            <!-- 子菜单 -->
            <transition name="expand">
              <div v-if="expandedMenus.includes(menu.id)" class="flex flex-col">
                <div
                  v-for="item in menu.children"
                  :key="item.id"
                  :class="[
                    'relative flex items-center justify-between launch-card mt-1 h-10 bg-bg-2 rounded-lg cursor-pointer',
                    { 'launch-card-active': activeMenuId === item.id }
                  ]"
                  @click="handleMenuItemClick(item)"
                  @mouseenter="(e: MouseEvent) => item.children && handleSubmenuHover(e, menu.id, item.id)"
                  @mouseleave="item.children && startClearSubmenuHover()"
                >
                  <div class="flex items-center">
                    <div class="w-10 h-10 flex items-center justify-center">
                      <component :is="sideIcons[item.icon]" class="w-6 h-6 fill-text-2 fill-none" />
                    </div>
                    <span class="text-sm font-[600] text-text-1">{{ item.name }}</span>
                  </div>
                  <!-- 有子菜单时显示右箭头 -->
                  <div v-if="item.children && item.children.length > 0" class="mr-2">
                    <Arrow_right class="w-4 h-4 fill-text-2 fill-none" />
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
              <component :is="sideIcons[link.icon]" class="w-6 h-6 fill-text-2 fill-none" />
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
            <External class="w-full h-full fill-text-2 fill-none" />
          </div>
        </div>
      </div>

      <!-- 底部功能组 -->
      <div class="flex flex-col mt-1">
        <!-- 赞助  -->
        <div v-for="menu in sponsor" :key="menu.id" class="flex flex-col mt-1">
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
                  <component :is="sideIcons[menu.icon]" class="w-6 h-6 fill-text-2 fill-none" />
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
                    <component :is="sideIcons[item.icon]" class="w-6 h-6 fill-text-2 fill-none" />
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
                <component :is="sideIcons[menu.icon]" class="w-6 h-6 fill-text-2 fill-none" />
              </div>
            </div>
          </div>

          <!-- 展开时的菜单 -->
          <template v-else>
            <div
              :class="[
                'flex items-center justify-between launch-card h-10 bg-bg-2 rounded-lg cursor-pointer',
                { 'launch-card-active': activeMenuId === menu.id }
              ]"
              @click="handleMenuExpand(menu)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 flex items-center justify-center">
                  <component :is="sideIcons[menu.icon]" class="w-6 h-6 fill-text-2 fill-none" />
                </div>
                <span class="text-sm font-[600] text-text-1">{{ menu.name }}</span>
              </div>
              <div
                class="w-6 h-6 bg-bg-3 rounded-md flex items-center justify-center mr-1.5 transition-transform duration-300 cursor-pointer"
                :class="{ 'rotate-180': expandedMenus.includes(menu.id) }"
                @click.stop="handleMenuCollapse(menu)"
              >
                <Arrow_down class="w-4 h-4 fill-text-2 fill-none" />
              </div>
            </div>

            <!-- 子菜单 -->
            <transition name="expand">
              <div v-if="expandedMenus.includes(menu.id)" class="flex flex-col">
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
                      <component :is="sideIcons[item.icon]" class="w-6 h-6 fill-text-2 fill-none" />
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
          :data-tooltip="isCollapsed ? '线上客服' : ''"
          @mouseenter="e => isCollapsed && updateTooltipPosition(e)"
          @click="handleCustomerServiceClick"
        >
          <div class="flex items-center w-full" :class="{ 'justify-center': isCollapsed }">
            <div class="w-10 h-10 flex items-center justify-center">
              <component :is="sideIcons.icon_17" class="w-6 h-6 fill-text-2 fill-none" />
            </div>
            <span v-if="!isCollapsed" class="text-sm font-[600] text-text-1">线上客服</span>
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
              <LanguageIcon class="w-6 h-6 fill-text-2 fill-none" />
            </div>
            <span v-if="!isCollapsed" class="text-sm font-[600] text-text-1">{{
              currentLanguageName
            }}</span>
          </div>
          <div
            v-if="!isCollapsed"
            class="w-6 h-6 bg-bg-3 rounded-md flex items-center justify-center mr-1.5"
          >
            <Arrow_right class="w-4 h-4 fill-text-2 fill-none" />
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
                <component :is="sideIcons.icon_18" class="w-4 h-4 fill-text-2 fill-none" />
              </div>
              <span
                v-if="!isCollapsed"
                :class="[
                  'text-sm font-[600] ml-1',
                  themeStore.theme === 'dark' ? 'text-[#fff]' : 'text-[#B0B9B9]'
                ]"
                >深色模式</span
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
                <component :is="sideIcons.icon_19" class="w-4 h-4 fill-text-2 fill-none" />
              </div>
              <span
                v-if="!isCollapsed"
                :class="[
                  'text-sm font-[600] ml-1',
                  themeStore.theme === 'light' ? 'text-[#171A1A]' : 'text-[#A1AFB2]'
                ]"
                >浅色模式</span
              >
            </div>
          </button>
        </div>
      </div>
    </nav>

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
                  <div class="w-6 h-6 flex items-center justify-center mr-2">
                    <component :is="sideIcons[subItem.icon]" class="w-6 h-6 fill-text-2 fill-none" />
                  </div>
                  <span class="text-sm font-[600] text-text-1">{{ subItem.name }}</span>
                </div>
              </template>
            </template>
          </template>
        </template>
      </div>
    </teleport>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { useLayoutStore } from '@/stores/layout'
import Arrow_right from '@/static/svg/arrow_right.svg?component'
import Arrow_down from '@/static/svg/arrow_down.svg?component'
import External from '@/static/svg/external.svg?component'
import LanguageIcon from '@/static/svg/language.svg?component'
import { sideIcons } from '@/static/svg/side'
import { navigateTo } from '@/utils/router'

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const layoutStore = useLayoutStore()

// 侧边栏折叠状态
const isCollapsed = ref(false)

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
  return localeStore.currentLanguage === 'zh-CN' ? '简体中文' : 'English'
})

// 应用程式下载链接
const appDownloadLink = computed(() => {
  const locale = localeStore.currentLanguage === 'zh-CN' ? 'zh' : 'en'
  return locale === 'en' ? '/app-download' : `/${locale}/app-download`
})

const emit = defineEmits<{
  'open-language-modal': []
}>()

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
const expandableMenus = computed(() => [
  {
    id: 'casino',
    name: '娱乐城',
    icon: 'icon_2',
    handler: () => {
      console.log('点击娱乐城')
    },
    children: [
      {
        id: 'casino_1',
        name: 'BC原创',
        icon: 'icon_2',
        handler: () => {
          navigateTo('/originate')
        },
        children: [
          {
            id: 'casino_1_1',
            name: 'Crash',
            icon: 'icon_2',
            handler: () => {
              console.log('点击 Crash')
            }
          },
          {
            id: 'casino_1_2',
            name: 'Deadliest Sea',
            icon: 'icon_2',
            handler: () => {
              console.log('点击 Deadliest Sea')
            }
          },
          {
            id: 'casino_1_3',
            name: 'Bear Smash: 15000X Boost',
            icon: 'icon_2',
            handler: () => {
              console.log('点击 Bear Smash: 15000X Boost')
            }
          }
        ]
      },
      {
        id: 'casino_2',
        name: 'BC独家',
        icon: 'icon_2',
        handler: () => {
          navigateTo('/exclusive')
        }
      }
    ]
  },
  {
    id: 'sports',
    name: '体育',
    icon: 'icon_3',
    handler: () => {
      console.log('点击体育')
    },
    children: [
      { id: 'sports_1', name: '体育 1', icon: 'icon_3', handler: () => console.log('点击 体育 1') },
      { id: 'sports_2', name: '体育 2', icon: 'icon_3', handler: () => console.log('点击 体育 2') }
    ]
  },
  {
    id: 'lottery',
    name: '彩票',
    icon: 'icon_5',
    handler: () => {
      console.log('点击彩票')
    },
    children: [
      {
        id: 'lottery_1',
        name: '彩票 1',
        icon: 'icon_5',
        handler: () => console.log('点击 彩票 1')
      },
      { id: 'lottery_2', name: '彩票 2', icon: 'icon_5', handler: () => console.log('点击 彩票 2') }
    ]
  },
  {
    id: 'crypto',
    name: '加密货币期货',
    icon: 'icon_6',
    handler: () => {
      console.log('点击加密货币期货')
    },
    children: [
      {
        id: 'crypto_1',
        name: '加密货币 1',
        icon: 'icon_6',
        handler: () => console.log('点击 加密货币 1')
      },
      {
        id: 'crypto_2',
        name: '加密货币 2',
        icon: 'icon_6',
        handler: () => console.log('点击 加密货币 2')
      }
    ]
  },
  {
    id: 'promotion',
    name: '促销',
    icon: 'icon_7',
    handler: () => {
      console.log('点击促销')
    },
    children: [
      {
        id: 'promotion_1',
        name: '促销 1',
        icon: 'icon_7',
        handler: () => console.log('点击 促销 1')
      },
      {
        id: 'promotion_2',
        name: '促销 2',
        icon: 'icon_7',
        handler: () => console.log('点击 促销 2')
      }
    ]
  }
])

// 普通链接数据
const normalLinks = computed(() => [
  {
    id: 'vip',
    name: '俱乐部',
    name2: 'VIP',
    icon: 'icon_8',
    external: false,
    handler: () => console.log('点击 VIP 俱乐部')
  },
  {
    id: 'prize',
    name: '奖金',
    icon: 'icon_9',
    external: false,
    handler: () => console.log('点击 奖金')
  },
  {
    id: 'recommend',
    name: '推荐',
    icon: 'icon_10',
    external: false,
    handler: () => console.log('点击 推荐')
  },
  {
    id: 'forum',
    name: '论坛',
    icon: 'icon_11',
    external: true,
    handler: () => console.log('点击 论坛')
  },
  {
    id: 'verified',
    name: '可验证公平',
    icon: 'icon_12',
    external: false,
    handler: () => console.log('点击 可验证公平')
  },
  {
    id: 'responsible',
    name: '负责任博彩',
    icon: 'icon_13',
    external: false,
    handler: () => console.log('点击 负责任博彩')
  },
  {
    id: 'blog',
    name: '部落格',
    icon: 'icon_14',
    external: true,
    handler: () => console.log('点击 部落格')
  },
  {
    id: 'sports_injection',
    name: '体育投注注入赔付',
    icon: 'icon_15',
    external: true,
    handler: () => console.log('点击 体育投注注入赔付')
  }
])

// 赞助数据
const sponsor = computed(() => [
  {
    id: 'sponsor',
    name: '赞助',
    icon: 'icon_16',
    handler: () => {
      console.log('点击赞助')
    },
    children: [
      {
        id: 'sponsor_1',
        name: '赞助 1',
        icon: 'icon_16',
        handler: () => console.log('点击 赞助 1')
      },
      {
        id: 'sponsor_2',
        name: '赞助 2',
        icon: 'icon_16',
        handler: () => console.log('点击 赞助 2')
      }
    ]
  }
])

defineExpose({
  toggleCollapse: () => {
    isCollapsed.value = !isCollapsed.value
  }
})
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  left: 0;
  top: v-bind('layoutStore.TOPNAV_HEIGHT + "px"');
  bottom: 0;
  background-color: var(--color-background-level-5);
  overflow-y: auto;
  overflow-x: visible;
  transition: width 0.3s ease;
  z-index: 100;
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  // H5 隐藏侧边栏
  @media (max-width: v-bind('layoutStore.mobileBreakpointMedia')) {
    display: none;
  }
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
  background: linear-gradient(90deg, rgba(36 238 137 / 0.2), #23ee8800), rgba(255, 255, 255, 0.05);
}
.launch-card-active {
  background: linear-gradient(90deg, rgba(36 238 137 / 0.2), #23ee8800);
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
    background: linear-gradient(90deg, rgba(36 238 137 / 0.2), #23ee8800), rgba(255, 255, 255, 0.05);
  }
}

.submenu-popup-item-active {
  background: linear-gradient(90deg, rgba(36 238 137 / 0.2), #23ee8800);
}
</style>
