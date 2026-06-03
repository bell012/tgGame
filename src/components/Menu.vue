<template>
  <div class="sidebar-menu px-3.5 sm:px-0" :style="mobileMenuStyle">
    <!-- BC代币 / 顶部提示 -->
    <div
      v-if="showBcToken"
      class="bc-card mt-4 flex h-14 shrink-0 cursor-pointer items-center justify-between rounded-xl bg-bg-2 px-3 sm:mt-0"
      @click="() => console.log('点击 BC代币')"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2.5">
        <div
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-theme-primary sm:h-9 sm:w-9"
        ></div>
        <div class="flex min-w-0 flex-col gap-[7px] sm:gap-[10px]">
          <p class="m-0 text-sm font-bold leading-tight text-text-1 whitespace-nowrap">
            {{ t('sidebar_menu.bc_token.title') }}
          </p>
          <p class="m-0 text-xs font-semibold leading-tight text-assistRed">-1.00%</p>
        </div>
      </div>
      <div class="flex shrink-0 flex-col gap-[7px] pl-3 text-right sm:gap-[10px]">
        <p class="m-0 text-sm font-semibold leading-tight text-text-1">1 BC</p>
        <p class="m-0 text-sm leading-tight text-text-1">$0.00783</p>
      </div>
    </div>
    <div class="flex flex-col">
      <div
        v-for="(menuGroup, groupIndex) in sidebarMenuGroups"
        :key="`group-${groupIndex}`"
        class="flex flex-col mt-3"
      >
        <div v-for="(menu, menuIndex) in menuGroup" :key="menu.id" class="flex flex-col bg-bg-2">
          <div v-if="hasGroupedChildren(menu)" class="bg-bg-2 rounded-lg overflow-visible">
            <div
              v-for="(item, index) in menu.children"
              :key="item.id"
              :class="[
                'relative flex items-center justify-between launch-card h-10 rounded-lg cursor-pointer',
                { 'menu-item-collapsed': isCollapsed },
                {
                  'border-opacity-6': index > 0 && menu.children && menu.children.length > 1
                },
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
                      <component v-else :is="item.icon" class="w-6 h-6 fill-text-2" />
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
              { 'border-opacity-6': menuIndex > 0 && menuGroup.length > 1 },
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
                { 'border-opacity-6': menuIndex > 0 && menuGroup.length > 1 },
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
            <component :is="side.helpIcon" class="w-6 h-6 fill-none text-text-2" />
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
                  src="@/static/img/home/pwa.png"
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
        @click="openLanguagePopup()"
      >
        <div class="flex items-center w-full" :class="{ 'justify-center': isCollapsed }">
          <div class="w-10 h-10 flex items-center justify-center">
            <LanguageIcon class="w-6 h-6 text-text-2" />
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
        :class="themeStore.theme === 'light' ? 'bg-bg-3' : 'bg-bg-2'"
      >
        <button
          :class="[
            'flex-1 w-[50%] h-9 rounded-lg border-none cursor-pointer transition-all',
            themeStore.theme === 'dark' ? 'bg-[#4B5354]' : 'bg-transparent'
          ]"
          @click="themeStore.setTheme('dark')"
        >
          <div class="flex items-center justify-center">
            <div class="w-4 h-4 flex items-center justify-center">
              <component
                :is="side.icon_18"
                class="w-4 h-4 ml-1"
                :class="themeStore.theme === 'dark' ? 'text-text-1' : 'text-text-2'"
              />
            </div>
            <span
              v-if="!isCollapsed"
              class="text-sm font-[600] ml-1"
              :class="themeStore.theme === 'dark' ? 'text-text-1' : 'text-text-2'"
              >{{ t('sidebar_menu.theme.dark') }}</span
            >
          </div>
        </button>
        <button
          class="flex-1 w-[50%] h-9 rounded-lg border-none cursor-pointer transition-all bg-bg-2"
          @click="themeStore.setTheme('light')"
        >
          <div class="flex items-center justify-center">
            <div class="w-4 h-4 flex items-center justify-center">
              <component
                :is="side.icon_19"
                class="w-4 h-4"
                :class="themeStore.theme === 'light' ? 'text-text-1' : 'text-text-2'"
              />
            </div>
            <span
              v-if="!isCollapsed"
              class="text-sm font-[600] ml-1"
              :class="themeStore.theme === 'light' ? 'text-text-1' : 'text-text-2'"
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
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
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
    <Teleport to="body">
      <LanguagePopup
        v-model:visible="showLanguagePopup"
        :selected-language="localeStore.currentLanguage"
        :options="languageOptions"
        @select="handleLanguageSelect"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useCasinoTabButtons, type CasinoTabButtonItem } from '@/composables/useCasinoTabButtons'
import { useIsMobile } from '@/composables/useMediaQuery'
import Arrow_down from '@/static/svg/arrow_down.svg?component'
import Arrow_right from '@/static/svg/arrow_right.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import External from '@/static/svg/external.svg?component'
import LanguageIcon from '@/static/svg/language.svg?component'
import { sideIcons } from '@/static/svg/side'
import newSideIcons from '@/static/svg/side/newIcon'
import { useLayoutStore } from '@/stores/layout'
import { useLocaleStore } from '@/stores/locale'
import { useThemeStore } from '@/stores/theme'
import { getLocaleLabel, getLocaleOptions, type Locale, type LocaleOption } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { openLuckySpin } from '@/utils/openLuckySpin'
import { openTicketActivity } from '@/utils/openTicketActivity'
import { PROMOTIONS_MENU_GROUP_LIMIT, usePromotionsStore } from '@/stores/promotions'
import { getLanguageName as getPromotionGroupName } from '@/views/activity/promotions/shared'
import FeedbackPage from '@/views/personalCenter/feedback/index.vue'
import LanguagePopup from '@/views/settings/preferences/language-popup.vue'

import type { Component } from 'vue'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
interface Props {
  isCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCollapsed: false
})

const emit = defineEmits<{
  'open-language-modal': []
}>()

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const layoutStore = useLayoutStore()
const isMobile = useIsMobile()

const showBcToken = computed(() => !props.isCollapsed || isMobile.value)

const mobileMenuStyle = computed(() => {
  if (!isMobile.value) {
    return undefined
  }

  return {
    paddingTop: `calc(env(safe-area-inset-top) + ${layoutStore.TOPNAV_HEIGHT}px)`
  }
})

const { t } = useI18n()
const isLoggedIn = computed(() => Boolean(localStorage.getItem('userInfo')))
const promotionsStore = usePromotionsStore()
const { groups: promotionGroups } = storeToRefs(promotionsStore)
const { tabButtons: casinoTabButtons } = useCasinoTabButtons({ isLoggedIn })

const buildPromotionsMenuChildren = (
  groups: typeof promotionGroups.value
): SidebarSubmenuItem[] => {
  const children: SidebarSubmenuItem[] = []
  const menuGroups = groups.slice(0, PROMOTIONS_MENU_GROUP_LIMIT)

  for (let i = 0; i < menuGroups.length; i++) {
    const group = menuGroups[i]
    const groupCode = group.groupCode || ''
    if (!groupCode) {
      continue
    }

    const groupName = getPromotionGroupName(group.groupName) || groupCode
    children.push({
      id: `promotions_${groupCode}`,
      name: groupName,
      icon: group.defaultIcon || newSideIcons.promotionCenterIcon,
      handler: () => {
        navigateTo(`/promotions/${groupCode}`)
      }
    })
  }

  return children
}

const { side } = sideIcons
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
const showLanguagePopup = ref(false)

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
const languageOptions = computed<LocaleOption[]>(() => getLocaleOptions())

const handleLanguageSelect = (code: Locale) => {
  localeStore.setLanguage(code)
}

const openLanguagePopup = () => {
  if (isMobile.value) {
    showLanguagePopup.value = true
    return
  }
  emit('open-language-modal')
}
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
  if (!isMobile.value) {
    activeMenuId.value = 'leave-feedback'
    showLeaveFeedbackModal.value = true
  } else {
    navigateTo('/personal-center/feedback')
  }
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
/** 浅色模式下使用logo图片*/
const gameCategorySubmenuIcon = (item: CasinoTabButtonItem) => {
  if (themeStore.theme === 'light' && item.logo?.trim()) {
    return item.logo
  }
  return item.icon
}

const buildCasinoMenuChildren = (): SidebarSubmenuItem[] => {
  return casinoTabButtons.value
    .filter(item => item.sysGameTypeCode !== '')
    .map(item => ({
      id: `casino_${item.sysGameTypeCode}`,
      name: item.sysGameTypeName,
      icon: gameCategorySubmenuIcon(item),
      handler: () => {
        navigateTo(`/casino/${item.sysGameTypeCode}`)
      }
    }))
}
const sidebarMenus = computed<SidebarMenuGroup[]>(() => {
  const promotionsChildren = buildPromotionsMenuChildren(promotionGroups.value)

  return [
    {
      id: 'crypto-account',
      name: t('menu.crypto-account'),
      icon: newSideIcons.cryptoAccountIcon,
      handler: () => console.log('点击 Crypto Account'),
      groupKey: 'crypto-account'
    },
    {
      id: 'game-categories',
      name: t('menu.game-categories'),
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
        {
          id: 'recently-played',
          name: t('menu.recently-played'),
          icon: newSideIcons.recentlyPlayedIcon,
          handler: () => navigateTo('/recently-played-games')
        },
        {
          id: 'favorites',
          name: t('menu.favorites'),
          icon: newSideIcons.favoritesIcon,
          handler: () => navigateTo('/favorites-games')
        }
      ]
    },
    {
      id: 'vouchers',
      name: t('menu.vouchers'),
      icon: newSideIcons.vouchersIcon,
      groupKey: 'vouchers',
      children: isLoggedIn.value
        ? [
            {
              id: 'cash-voucher',
              name: t('menu.cash-voucher'),
              icon: newSideIcons.cashVoucherIcon,
              handler: () => openTicketActivity('cash_voucher')
            },
            {
              id: 'lucky-red-envelope',
              name: t('menu.lucky-red-envelope'),
              icon: newSideIcons.luckyRedEnvelopeIcon,
              handler: () => openTicketActivity('lucky_red_envelope')
            },
            {
              id: 'smash-golden-egg',
              name: t('menu.smash-golden-egg'),
              icon: newSideIcons.smashGoldenEggIcon,
              handler: () => openTicketActivity('golden_egg')
            },
            {
              id: 'mystery-box',
              name: t('menu.mystery-box'),
              icon: newSideIcons.mysteryBoxIcon,
              handler: () => openTicketActivity('mystery_box')
            },
            {
              id: 'lucky-spin',
              name: t('menu.lucky-spin'),
              icon: newSideIcons.luckySpinIcon,
              handler: () => openLuckySpin()
            }
          ]
        : []
    },
    {
      id: 'task-center',
      name: t('menu.task-center'),
      icon: newSideIcons.taskCenterIcon,
      groupKey: 'task-center'
    },
    {
      id: 'promotions',
      name: t('menu.promotions'),
      icon: newSideIcons.promotionCenterIcon,
      groupKey: 'promotions',
      handler: () => {
        if (promotionsChildren.length > 0) {
          return navigateTo('/promotions')
        }
        return
      },
      children: promotionsChildren
    },
    {
      id: 'combination1',
      name: 'combination1',
      icon: newSideIcons.redEnvelopeEventIcon,
      groupKey: 'combination1',
      renderAsGroup: true,
      children: [
        {
          id: 'red-envelope-event',
          name: t('menu.red-envelope-event'),
          icon: newSideIcons.redEnvelopeEventIcon
        },
        {
          id: 'credit-loan',
          name: t('menu.credit-loan'),
          icon: newSideIcons.creditLoanIcon
        },
        {
          id: 'lottery-event',
          name: t('menu.lottery-event'),
          icon: newSideIcons.lotteryEventIcon
        },
        {
          id: 'lucky-wheel',
          name: t('menu.lucky-wheel'),
          icon: newSideIcons.luckyWheelIcon,
          handler: () => openLuckySpin()
        },
        {
          id: 'promo-code',
          name: t('menu.promo-code'),
          icon: newSideIcons.promoCodeIcon
        }
      ]
    },

    {
      id: 'vip-center',
      name: t('menu.vip-center'),
      icon: newSideIcons.vipCenterIcon,
      groupKey: 'vip-center',
      handler: () => navigateTo('/vip')
    },
    {
      id: 'referral',
      name: t('menu.referral'),
      icon: newSideIcons.referralIcon,
      groupKey: 'referral',
      handler: () => navigateTo('/referral')
    },
    {
      id: 'rebate',
      name: t('menu.rebate'),
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
        {
          id: 'my-orders',
          name: t('menu.my-orders'),
          icon: newSideIcons.myOrdersIcon,
          handler: () => navigateTo('my-orders')
        },
        {
          id: 'bet-history',
          name: t('menu.bet-history'),
          icon: newSideIcons.betHistoryIcon,
          handler: () => navigateTo('bet-history')
        },
        {
          id: 'transaction',
          name: t('menu.transaction'),
          icon: newSideIcons.transactionIcon,
          handler: () => navigateTo('transaction')
        },
        {
          id: 'rewards',
          name: t('menu.rewards'),
          icon: newSideIcons.rewardsIcon
        },
        {
          id: 'rollover',
          name: t('menu.rollover'),
          icon: newSideIcons.rolloverIcon,
          handler: () => navigateTo('rollover')
        }
      ]
    },

    {
      id: 'payment-methods',
      name: t('menu.payment-methods'),
      icon: newSideIcons.paymentMethodsIcon,
      groupKey: 'payment-methods',
      handler: () => navigateTo('payment-methods')
    },
    {
      id: 'security',
      name: t('menu.security'),
      icon: newSideIcons.securityIcon,
      groupKey: 'security',
      handler: () => navigateTo('security')
    },
    {
      id: 'combination3',
      name: 'combination3',
      icon: newSideIcons.sponsorshipsIcon,
      groupKey: 'combination3',
      renderAsGroup: true,
      children: [
        {
          id: 'sponsorships',
          name: t('menu.sponsorships'),
          icon: newSideIcons.sponsorshipsIcon
        },
        {
          id: 'leave-feedback',
          name: t('menu.leave-feedback'),
          icon: newSideIcons.leaveFeedbackIcon,
          handler: handleLeaveFeedbackClick
        },
        {
          id: 'legal',
          name: t('menu.legal'),
          icon: newSideIcons.legalIcon
        },
        {
          id: 'about',
          name: t('menu.about'),
          icon: newSideIcons.aboutIcon
        }
      ]
    }
  ]
})

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
}

.app-download-card {
  background: var(--color-background-level-2);
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
