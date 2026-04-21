<template>
  <header class="top-nav">
    <div class="top-nav-inner h-full flex items-center justify-between px-4">
      <!-- 左侧 -->
      <div class="flex items-center">
        <div
          class="hidden sm:flex cursor-pointer search w-[40px] h-[40px] rounded-lg items-center justify-center"
          @click="handleToggleSidebar"
        >
          <FoldIcon class="w-6 h-6 fill-none" />
        </div>
        <!-- h5菜单 -->
        <div
          class="sm:hidden cursor-pointer w-[40px] h-[40px] rounded-lg flex items-center justify-center"
          @click="toggleH5Menu"
        >
          <FoldIconH5 class="h-6" :class="isH5MenuActive ? 'text-theme-primary' : 'text-text-1'" />
        </div>
        <!-- PC端 Logo -->
        <div
          class="hidden sm:flex w-[150px] h-[48px] ml-0 sm:ml-5 items-center cursor-pointer"
          @click="navigateTo('/')"
        >
          <MainLogoIcon class="w-full h-full text-text-1" />
        </div>
        <!-- H5端 Logo (登录后小logo) -->
        <div v-if="isLoggedIn" class="flex md:hidden w-[26px] h-[26px] items-center cursor-pointer">
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
      <div class="flex-1 flex items-center justify-end">
        <div
          class="hidden sm:flex items-center justify-center cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3"
          @click="openExploreModal"
        >
          <SearchIcon class="w-6 h-6 fill-none" />
        </div>

        <!-- 未登录状态 -->
        <template v-if="!isLoggedIn">
          <!-- 登入 -->
          <div
            class="cursor-pointer w-[84px] h-[35px] sm:w-[100px] sm:h-[40px] text-[14px] sm:text-[16px] px-3 sm:px-4 rounded-lg flex items-center justify-center bg-transparent border-0 sm:border-2 border-[#e4eaf019] mr-1"
            @click="openLoginModal"
          >
            {{ t('home.sign_In') }}
          </div>
          <!-- 注册 -->
          <div
            class="cursor-pointer w-[84px] h-[35px] sm:w-[100px] sm:h-[40px] text-[14px] sm:text-[16px] px-3 sm:px-4 rounded-lg flex items-center justify-center btn-primary sm:mr-0 sm:mr-3"
            @click="openRegisterModal"
          >
            {{ t('home.sign_Up') }}
          </div>
        </template>

        <!-- 已登录状态 -->
        <template v-else>
          <div
            class="hidden sm:flex items-center justify-between search h-[40px] p-1 rounded-lg mr-3"
            style="width: 260px"
          >
            <div class="flex items-center justify-center cursor-pointer ml-1">
              <div class="w-10 h-10 mr-1">
                <img
                  :src="currentCurrencyIcon"
                  :alt="currentCurrencyCode"
                  class="w-full h-full object-cover"
                />
              </div>
              <!-- 金额 -->
              <span class="text-[14px] font-[600] text-text-1">
                {{ getCurrencySymbol(userInfo?.currency) }}{{ formatBalance(acctInfo?.balancePhp) }}
              </span>
            </div>
            <!-- 充值 -->
            <div class="flex items-center">
              <ArrowDownIcon class="w-5 h-5 mr-1 cursor-pointer" />
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
            class="flex sm:hidden items-center justify-between search w-[184px] h-[33px] p-1 rounded-lg mr-2"
          >
            <div class="flex items-center justify-center cursor-pointer ml-1">
              <div class="w-5 h-5 mr-1">
                <img
                  :src="currentCurrencyIcon"
                  :alt="currentCurrencyCode"
                  class="w-full h-full object-cover"
                />
              </div>
              <!-- 金额 -->
              <span class="text-[14px] font-[600] text-text-1">
                {{ getCurrencySymbol(userInfo?.currency) }}{{ formatBalance(acctInfo?.balancePhp) }}
              </span>
            </div>

            <div class="flex items-center">
              <ArrowDownIcon class="w-6 h-6 mr-1 cursor-pointer" />
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
              <BellIcon class="w-4 h-4 fill-none" />
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
              <BellIcon class="w-6 h-6 fill-none" />
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
          <ChatIcon class="w-6 h-6 fill-none" />
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

    <!-- PC 搜索弹窗 -->
    <ExploreDesktop v-model="showExplorehModal" />
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthModalStore } from '@/stores/authModal'
import { useLocaleStore } from '@/stores/locale'
import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'
import { resolveProfileAvatarUrl } from '@/utils/profile-customization'
import { navigateTo } from '@/utils/router'
import SelectModal from '@/components/SelectModal.vue'
import ExploreDesktop from '@/components/explore/desktop/index.vue'
import UserMenuDropdown from '@/views/personalCenter/components/UserMenuDropdown.vue'
import FoldIcon from '@/static/svg/fold.svg?component'
import FoldIconH5 from '@/static/svg/foldH5.svg?component'
import SearchIcon from '@/static/svg/search.svg?component'
import ChatIcon from '@/static/svg/chat.svg?component'
import LanguageIcon from '@/static/svg/language.svg?component'
import GiftIcon from '@/static/svg/login/gift.svg?component'
import BellIcon from '@/static/svg/bell.svg?component'
import Jia from '@/static/svg/login/jia.svg?component'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import MainLogoIcon from '@/static/svg/main-logo.svg?component'
import mobileLogoImage from '@/static/img/home/logo_h5.png'
import {
  getCurrencyImageByCode,
  getCurrencySymbol,
  formatBalance,
  stripLocalePrefix,
  type Locale
} from '@/utils/locale'

const { t } = useI18n()
const authModalStore = useAuthModalStore()
const localeStore = useLocaleStore()
const layoutStore = useLayoutStore()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { acctInfo, userInfo } = storeToRefs(userStore)
const { visible: showLoginModal } = storeToRefs(authModalStore)

const emit = defineEmits<{
  'toggle-sidebar': []
  'notification-click': []
}>()

const showModal = ref(false)
const modalType = ref<'language' | 'currency'>('language')

const showExplorehModal = ref(false)

// 用户菜单下拉框
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

// 是否已登录
const isLoggedIn = computed(() => {
  return Boolean(userInfo.value?.tradeToken)
})

// 用户头像 URL
const avatarUrl = computed(() => {
  return resolveProfileAvatarUrl(userInfo.value?.headPortrait)
})
const isH5MenuActive = computed(() => stripLocalePrefix(route.path) === '/menu')

// 当前币种代码
const currentCurrencyCode = computed(() => {
  return String(userInfo.value?.currency || 'PHP').toUpperCase()
})

// 当前币种图片
const currentCurrencyIcon = computed(() => {
  return getCurrencyImageByCode(currentCurrencyCode.value)
})

const handleStorageChange = () => {
  userStore.syncStoredUserData()
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
  window.addEventListener('storage', handleStorageChange)
  document.addEventListener('click', handleUserMenuClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageChange)
  document.removeEventListener('click', handleUserMenuClickOutside)
})

// 监听登录弹窗关闭，重新加载用户信息
watch(showLoginModal, newVal => {
  if (!newVal) {
    userStore.syncStoredUserData()
  }
})

const handleToggleSidebar = () => {
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

const openDeposit = () => {
  navigateTo('/deposit')
}

const toggleH5Menu = () => {
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
  background-color: var(--color-background-level-5);
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.05);
  z-index: 50;
}
.search {
  background-color: var(--color-background-level-3);
}
.text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-level-2);
}
.line {
  background-color: #e4eaf019;
}

@media (max-width: 370px) {
  .top-nav-inner {
    width: 125%;
    transform: scale(0.79);
    transform-origin: left center;
  }
}
</style>
