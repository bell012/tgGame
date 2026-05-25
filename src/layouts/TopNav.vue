<template>
  <header class="top-nav">
    <div class="top-nav-inner h-full flex items-center justify-between px-4">
      <!-- h5菜单 -->
      <div
        class="sm:hidden cursor-pointer rounded-lg flex items-center justify-center"
        @click="toggleH5Menu"
      >
        <span class="fold-icon-wrap" :class="{ 'fold-icon-wrap--open': isH5MenuActive }">
          <FoldIconH5
            class="h-6 w-6 fold-icon-inner"
            :class="[
              isH5MenuActive ? 'text-theme-primary' : 'text-text-1',
              { 'fold-icon-inner--pulse': h5FoldPulse }
            ]"
          />
        </span>
      </div>
      <!-- 左侧 -->
      <div class="flex items-center">
        <div
          class="hidden sm:flex cursor-pointer search w-[40px] h-[40px] rounded-lg items-center justify-center"
          @click="handleToggleSidebar"
        >
          <span class="fold-icon-wrap" :class="{ 'fold-icon-wrap--open': !props.sidebarCollapsed }">
            <FoldIconH5
              class="h-6 w-6 fill-none fold-icon-inner"
              :class="[
                !props.sidebarCollapsed ? 'text-theme-primary' : 'text-text-1',
                { 'fold-icon-inner--pulse': sidebarFoldPulse }
              ]"
            />
          </span>
        </div>

        <!-- PC端 Logo -->
        <div
          class="hidden sm:flex w-[150px] h-[48px] ml-0 sm:ml-5 items-center cursor-pointer"
          @click="navigateTo('/')"
        >
          <MainLogoIcon class="w-full h-full text-text-1" />
        </div>
        <!-- H5端 Logo (登录后小logo) -->
        <div
          v-if="isLoggedIn"
          class="flex sm:hidden w-[26px] h-[26px] items-center cursor-pointer mobileLogo"
        >
          <SmartImage :src="mobileLogoImage" alt="" class="w-full h-full" />
          <MainLogoIcon class="w-full h-full text-text-1" />
        </div>
        <!-- H5端 Logo (未登录大logo) -->
        <div
          v-else
          class="flex sm:hidden w-[150px] h-[48px] items-center cursor-pointer"
          @click="navigateTo('/')"
        >
          <MainLogoIcon class="w-full h-full text-text-1" />
        </div>
      </div>

      <!-- 右侧 -->
      <div class="flex items-center justify-end">
        <div
          class="hidden sm:flex items-center justify-center cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3"
          @click="openExploreModal"
        >
          <SearchIcon class="w-6 h-6 text-icon-2" />
        </div>

        <!-- 未登录状态 -->
        <template v-if="!isLoggedIn">
          <!-- 登入 -->
          <div
            class="cursor-pointer w-[84px] h-[35px] sm:w-[100px] sm:h-[40px] text-[14px] sm:text-[16px] px-3 sm:px-4 rounded-lg flex items-center justify-center bg-opacity-10 border-0 sm:border-2 border-[#e4eaf019] mr-1"
            @click="openLoginModal"
          >
            {{ t('home.sign_In') }}
          </div>
          <!-- 注册 -->
          <div
            class="cursor-pointer font-bold w-[84px] h-[35px] sm:w-[100px] sm:h-[40px] text-[14px] sm:text-[16px] px-3 sm:px-4 rounded-lg flex items-center justify-center btn-primary"
            @click="openRegisterModal"
          >
            {{ t('home.sign_Up') }}
          </div>
        </template>

        <!-- 已登录状态 -->
        <template v-else>
          <div
            ref="desktopCurrencyAnchorRef"
            class="hidden sm:flex items-center justify-between search h-[40px] p-1 rounded-lg mr-3"
            style="width: 260px"
          >
            <div
              class="flex items-center justify-center cursor-pointer ml-1"
              @click="openLoggedInCurrencyPopup"
            >
              <div class="w-10 h-10 mr-1">
                <img
                  :src="currentCurrencyIcon"
                  :alt="currentCurrencyCode"
                  class="w-full h-full object-cover"
                />
              </div>
              <!-- 金额 -->
              <span class="text-[14px] font-[600] text-text-1">
                {{ currentBalanceText }}
              </span>
            </div>
            <!-- 充值 -->
            <div class="flex items-center">
              <button
                type="button"
                class="top-nav-currency-arrow-bg mr-1 cursor-pointer"
                @click="openLoggedInCurrencyPopup"
              >
                <svg
                  class="top-nav-currency-arrow"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M6 8L10 12L14 8" />
                </svg>
              </button>
              <div
                class="cursor-pointer h-8 text-[14px] font-[600] px-2 flex items-center justify-center btn-primary rounded-lg"
                @click="openDeposit"
              >
                {{ t('deposit.title') }}
              </div>
            </div>
          </div>

          <!-- H5 余额和充值容器 -->
          <div
            ref="mobileCurrencyAnchorRef"
            class="flex sm:hidden items-center justify-between search w-[184px] h-[33px] p-1 rounded-lg mr-2"
          >
            <div
              class="flex items-center justify-center cursor-pointer ml-1"
              @click="openLoggedInCurrencyPopup"
            >
              <div class="w-5 h-5 mr-1">
                <img
                  :src="currentCurrencyIcon"
                  :alt="currentCurrencyCode"
                  class="w-full h-full object-cover"
                />
              </div>
              <!-- 金额 -->
              <span class="text-[14px] font-[600] text-text-1">
                {{ currentBalanceText }}
              </span>
            </div>

            <div class="flex items-center">
              <button
                type="button"
                class="top-nav-currency-arrow-bg mr-1 cursor-pointer"
                @click="openLoggedInCurrencyPopup"
              >
                <svg
                  class="top-nav-currency-arrow"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M6 8L10 12L14 8" />
                </svg>
              </button>
              <!-- 充值按钮 -->
              <div
                class="cursor-pointer w-[26px] h-[26px] text-[14px] font-[600] px-2 flex items-center justify-center btn-primary rounded-lg"
                @click="openDeposit"
              >
                <Jia class="w-3 h-3" />
              </div>
            </div>
          </div>

          <!-- H5 礼物、通知、头像 -->
          <div class="flex sm:hidden items-center">
            <!-- 礼物图标 -->
            <div
              class="cursor-pointer search w-[33px] h-[33px] flex items-center justify-center rounded-lg mr-2"
            >
              <GiftIcon class="w-4 h-4 fill-none" />
            </div>
            <!-- 通知图标 -->
            <div
              class="cursor-pointer search w-[33px] h-[33px] flex items-center justify-center rounded-lg mr-2"
              @click="handleNotificationClick"
            >
              <SmartImage
                v-if="shouldShowUnreadBell"
                :src="bellUnreadImage"
                alt=""
                class="w-6 h-6"
              />
              <SmartImage v-else :src="bellDefaultImage" alt="" class="w-6 h-6" />
            </div>
            <!-- 用户头像 (H5端) -->
            <div
              class="cursor-pointer w-[33px] h-[33px] border-2 border-opacity-15 flex items-center justify-center bg-opacity-5 rounded-full overflow-hidden"
              @click="handleAvatarClick"
            >
              <img :src="avatarUrl" alt="Avatar" class="w-[28px] h-[28px] object-cover" />
            </div>
          </div>

          <!-- 礼物图标 -->
          <div
            class="hidden sm:flex items-center justify-center cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3"
          >
            <GiftIcon class="w-6 h-6 fill-none" />
          </div>

          <!-- 聊天和通知容器 (带边框和分隔线) -->
          <div class="hidden sm:flex items-center search h-[40px] rounded-lg mr-3">
            <!-- 聊天图标 -->
            <div class="flex items-center justify-center cursor-pointer w-[40px] h-[40px]">
              <ChatIcon class="w-6 h-6 fill-none" />
            </div>

            <!-- 竖线分隔 -->
            <div class="h-6 w-[1px] bg-[#e4eaf019]"></div>

            <!-- 通知图标 -->
            <div
              class="flex items-center justify-center cursor-pointer w-[40px] h-[40px]"
              @click="handleNotificationClick"
            >
              <SmartImage
                v-if="shouldShowUnreadBell"
                :src="bellUnreadImage"
                alt=""
                class="w-6 h-6"
              />
              <SmartImage v-else :src="bellDefaultImage" alt="" class="w-6 h-6" />
            </div>
          </div>

          <!-- 用户头像 (PC端) -->
          <div ref="userMenuRef" class="hidden sm:block relative">
            <div
              class="cursor-pointer w-[44px] h-[44px] border-3 border-opacity-15 flex items-center justify-center bg-opacity-5 rounded-full overflow-hidden mr-2"
              @click="toggleUserMenu"
            >
              <img :src="avatarUrl" alt="Avatar" class="w-[38px] h-[38px] object-cover" />
            </div>

            <!-- PC 端下拉菜单 -->
            <UserMenuDropdown v-model="showUserMenu" />
          </div>
        </template>

        <!-- 未登录时显示的聊天图标 -->
        <div
          v-if="!isLoggedIn"
          class="hidden sm:flex items-center justify-center cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3"
        >
          <ChatIcon class="w-5 h-5 fill-none translate-y-[2px] translate-x-[2px]" />
        </div>

        <!-- 语言和币种选择 (未登录时显示) -->
        <div
          v-if="!isLoggedIn"
          class="flex items-center justify-center w-auto h-[40px] rounded-lg overflow-hidden relative"
        >
          <div
            class="hidden sm:flex items-center justify-center cursor-pointer search w-[40px] h-[40px]"
            @click="openLanguageModal"
          >
            <LanguageIcon class="w-6 h-6 fill-none" />
          </div>
          <template v-if="localeStore.currentCurrency !== 'none'">
            <div class="absolute left-10 top-2 h-6 w-[1px] line"></div>
            <div
              class="hidden sm:flex items-center justify-center cursor-pointer search w-auto h-[40px] px-2"
              @click="openCurrencyModal"
            >
              <span class="text">{{ localeStore.currentCurrency }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 选择弹窗 -->
    <SelectModal
      v-model="showModal"
      :type="modalType"
      @select-language="handleLanguageChange"
      @select-currency="handleCurrencyChange"
    />

    <Teleport to="body">
      <CurrencyPopup
        v-model:visible="showCurrencyPopup"
        :desktop="!isMobile"
        :desktop-anchor="currencyPopupAnchor"
        :selected-currency="currentCurrencyCode"
        :options="currencyOptions"
        @select="handleLoggedInCurrencySelect"
      />
    </Teleport>

    <!-- PC 搜索弹窗 -->
    <ExploreDesktop v-model="showExplorehModal" />

    <DepositPop v-model="showDepositPop" />
  </header>
</template>

<script setup lang="ts">
import ExploreDesktop from '@/components/explore/desktop/index.vue'
import SelectModal from '@/components/SelectModal.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useIsMobile } from '@/composables/useMediaQuery'
import bellDefaultImage from '@/static/img/bell.png'
import bellUnreadImage from '@/static/img/bell_n.png'
import mobileLogoImage from '@/static/img/home/logo_h5.png'
import ChatIcon from '@/static/svg/chat.svg?component'
import FoldIconH5 from '@/static/svg/foldH5.svg?component'
import LanguageIcon from '@/static/svg/language.svg?component'
import GiftIcon from '@/static/svg/login/gift.svg?component'
import Jia from '@/static/svg/login/jia.svg?component'
import MainLogoIcon from '@/static/svg/main-logo.svg?component'
import SearchIcon from '@/static/svg/search.svg?component'
import { useAuthModalStore } from '@/stores/authModal'
import { useLayoutStore } from '@/stores/layout'
import { useLocaleStore } from '@/stores/locale'
import { useNotificationIndicatorStore } from '@/stores/notificationIndicator'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { stripLocalePrefix, type Locale } from '@/utils/locale'
import { resolveProfileAvatarUrl } from '@/utils/profile-customization'
import { navigateTo } from '@/utils/router'
import UserMenuDropdown from '@/views/personalCenter/components/UserMenuDropdown.vue'
import CurrencyPopup from '@/views/settings/preferences/currency-popup.vue'
import DepositPop from '@/views/wallet/deposit/components/deposit/depositPop.vue'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const authModalStore = useAuthModalStore()
const localeStore = useLocaleStore()
const layoutStore = useLayoutStore()
const notificationIndicatorStore = useNotificationIndicatorStore()
const siteConfigStore = useSiteConfigStore()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isMobile = useIsMobile()
const { acctInfo, userInfo } = storeToRefs(userStore)
const { visible: showLoginModal } = storeToRefs(authModalStore)
const { hasUnread } = storeToRefs(notificationIndicatorStore)

const props = withDefaults(
  defineProps<{
    sidebarCollapsed?: boolean
  }>(),
  {
    sidebarCollapsed: false
  }
)

const emit = defineEmits<{
  'toggle-sidebar': []
  'notification-click': []
}>()

const showModal = ref(false)
const modalType = ref<'language' | 'currency'>('language')
const showCurrencyPopup = ref(false)
const currencyPopupAnchor = ref<PopupAnchorRect | null>(null)

const showExplorehModal = ref(false)
const showDepositPop = ref(false)

// 用户菜单下拉框
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const desktopCurrencyAnchorRef = ref<HTMLElement | null>(null)
const mobileCurrencyAnchorRef = ref<HTMLElement | null>(null)

type PopupAnchorRect = {
  top: number
  left: number
  width: number
  height: number
}

// 是否已登录
const isLoggedIn = computed(() => {
  return Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId)
})

// 顶部导航显示通知图标时，PC/H5 均按同一未读规则切换铃铛图片。
const shouldShowUnreadBell = computed(() => {
  return isLoggedIn.value && hasUnread.value
})

// 用户头像 URL
const avatarUrl = computed(() => {
  return resolveProfileAvatarUrl(userInfo.value?.headPortrait)
})
const isH5MenuActive = computed(() => stripLocalePrefix(route.path) === '/menu')

const FOLD_ICON_ANIM_MS = 300
const h5FoldPulse = ref(false)
const sidebarFoldPulse = ref(false)
let h5FoldPulseTimer: ReturnType<typeof setTimeout> | undefined
let sidebarFoldPulseTimer: ReturnType<typeof setTimeout> | undefined

const runFoldIconScalePulse = (target: 'h5' | 'sidebar') => {
  const pulse = target === 'h5' ? h5FoldPulse : sidebarFoldPulse
  pulse.value = false
  const existingTimer = target === 'h5' ? h5FoldPulseTimer : sidebarFoldPulseTimer
  if (existingTimer) {
    clearTimeout(existingTimer)
  }
  requestAnimationFrame(() => {
    pulse.value = true
    const timerId = setTimeout(() => {
      pulse.value = false
    }, FOLD_ICON_ANIM_MS)
    if (target === 'h5') {
      h5FoldPulseTimer = timerId
    } else {
      sidebarFoldPulseTimer = timerId
    }
  })
}

const {
  currentCurrencyCode,
  currentCurrencyIcon,
  currentBalanceText,
  currencyOptions,
  setDisplayCurrency
} = useDisplayCurrency()

// 同步同账号在其他标签页更新后的本地用户信息。
const handleStorageChange = () => {
  userStore.syncStoredUserData()
  siteConfigStore.syncStoredConfig()
}

// 顶部导航可见时触发普通通知未读刷新：仅拉 promotions / system 两类消息。
const refreshVisibleNotificationIndicator = async () => {
  if (!isLoggedIn.value) {
    return
  }

  await notificationIndicatorStore.refreshStaticUnread()
}

// 登录成功后主动刷新普通通知未读态，便于首页首次展示正确铃铛状态。
const handleLoginStateChange = (loggedIn: boolean, previousLoggedIn?: boolean) => {
  if (!loggedIn || previousLoggedIn) {
    return
  }

  void notificationIndicatorStore.refreshStaticUnread()
}

// TopNav 仍显示时路由切换后主动刷新普通通知未读态，保证 PC/H5 铃铛图片同步。
const handleTopNavRouteChange = (path: string, previousPath?: string) => {
  if (path === previousPath || !isLoggedIn.value) {
    return
  }

  void notificationIndicatorStore.refreshStaticUnread()
}

// 页面从后台回到前台时，只要顶部导航当前规则允许，就主动刷新普通通知未读态。
const handleVisibilityChange = () => {
  if (document.visibilityState !== 'visible') {
    return
  }

  void refreshVisibleNotificationIndicator()
}

const handleUserMenuClickOutside = (event: MouseEvent) => {
  if (!showUserMenu.value || !userMenuRef.value) {
    return
  }

  const target = event.target as Node | null

  if (target && !userMenuRef.value.contains(target)) {
    showUserMenu.value = false
  }
}

// 组件挂载时加载用户信息
onMounted(() => {
  userStore.syncStoredUserData()
  siteConfigStore.syncStoredConfig()
  window.addEventListener('storage', handleStorageChange)
  document.addEventListener('click', handleUserMenuClickOutside)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  void refreshVisibleNotificationIndicator()
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageChange)
  document.removeEventListener('click', handleUserMenuClickOutside)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (h5FoldPulseTimer) {
    clearTimeout(h5FoldPulseTimer)
  }
  if (sidebarFoldPulseTimer) {
    clearTimeout(sidebarFoldPulseTimer)
  }
})

// 监听登录弹窗关闭，重新同步用户信息，供后续登录态判断使用。
watch(showLoginModal, visible => {
  if (!visible) {
    userStore.syncStoredUserData()
  }
})

// 监听登录态变化，在登录成功后主动拉取普通通知未读状态。
watch(isLoggedIn, (loggedIn, previousLoggedIn) => {
  handleLoginStateChange(loggedIn, previousLoggedIn)
})

// 监听路由切换，TopNav 存在时满足登录态即刷新普通通知未读状态。
watch(
  () => route.path,
  (path, previousPath) => {
    handleTopNavRouteChange(path, previousPath)
  }
)

const handleToggleSidebar = () => {
  runFoldIconScalePulse('sidebar')
  emit('toggle-sidebar')
}

const openLanguageModal = () => {
  modalType.value = 'language'
  showModal.value = true
}

const openCurrencyModal = () => {
  modalType.value = 'currency'
  showModal.value = true
}

const openLoggedInCurrencyPopup = () => {
  const anchorElement = isMobile.value
    ? mobileCurrencyAnchorRef.value
    : desktopCurrencyAnchorRef.value

  if (!isMobile.value && anchorElement) {
    const rect = anchorElement.getBoundingClientRect()
    currencyPopupAnchor.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  } else {
    currencyPopupAnchor.value = null
  }

  showCurrencyPopup.value = true
}

const openLoginModal = () => {
  authModalStore.openLoginModal()
}

const openRegisterModal = () => {
  authModalStore.openRegisterModal()
}

const openExploreModal = () => {
  showExplorehModal.value = true
}

const handleLanguageChange = (code: Locale) => {
  localeStore.setLanguage(code)
}

const handleCurrencyChange = (code: string) => {
  localeStore.setCurrency(code)
}

const handleLoggedInCurrencySelect = (code: string) => {
  setDisplayCurrency(code)
}

const openDeposit = () => {
  showCurrencyPopup.value = false
  showUserMenu.value = false
  showDepositPop.value = true
}

const toggleH5Menu = () => {
  runFoldIconScalePulse('h5')

  if (isH5MenuActive.value) {
    router.back()
    return
  }

  navigateTo('/menu')
}

// 处理通知图标点击。
const handleNotificationClick = () => {
  emit('notification-click')
}

// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// H5 点击头像
const handleAvatarClick = () => {
  navigateTo('/personal-center')
}

defineExpose({
  openLanguageModal
})
</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: v-bind('layoutStore.TOPNAV_HEIGHT + "px"');
  background-color: var(--color-background-level-1);
  z-index: 50;
}
.search {
  background-color: var(--color-background-level-3);
}
.fold-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  transform: rotate(0deg);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  backface-visibility: hidden;
}
.fold-icon-wrap--open {
  transform: rotate(180deg);
}
.fold-icon-inner {
  display: block;
  transform-origin: center;
  transform-box: fill-box;
  transform: scale(1);
}
.fold-icon-inner--pulse {
  animation: fold-icon-scale 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes fold-icon-scale {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
}
@media (prefers-reduced-motion: reduce) {
  .fold-icon-wrap {
    transition-duration: 0.01ms;
  }
  .fold-icon-inner--pulse {
    animation: none;
  }
}
.top-nav-currency-arrow-bg {
  width: 24px;
  height: 24px;
  border: 0;
  padding: 0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-opacity-10);
}
.top-nav-currency-arrow {
  width: 20px;
  height: 20px;
  color: var(--color-icon-level-2);
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  shape-rendering: geometricPrecision;
}
:global(:root.light) .top-nav-currency-arrow-bg {
  background: #d5dbe1;
}
:global(:root.light) .top-nav-currency-arrow {
  color: #3b4142;
}
.text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-level-2);
}
.line {
  background-color: #e4eaf019;
}

@media (max-width: 390px) {
  .top-nav-inner {
    width: 111%;
    transform: scale(0.9);
    transform-origin: left center;
  }
}
@media (max-width: 360px) {
  .top-nav-inner {
    width: 117%;
    transform: scale(0.85);
    transform-origin: left center;
  }
  .mobileLogo {
    margin-left: 2px;
  }
}
</style>
