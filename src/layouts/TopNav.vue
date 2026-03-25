<template>
  <header class="top-nav">
    <div class="h-full flex items-center justify-between px-4">
      <!-- 左侧 -->
      <div class="flex items-center">
        <div
          class="hidden md:flex cursor-pointer search w-[40px] h-[40px] rounded-lg flex items-center justify-center"
          @click="handleToggleSidebar"
        >
          <FoldIcon class="w-6 h-6 fill-none" />
        </div>
        <!-- PC端 Logo -->
        <div
          class="hidden md:flex w-[150px] h-[48px] ml-0 md:ml-5 items-center cursor-pointer"
          @click="navigateTo('/')"
        >
          <img src="/src/static/img/home/logo.png" alt="" class="w-full h-full" />
        </div>
        <!-- H5端 Logo (登录后小logo) -->
        <div
          v-if="isLoggedIn"
          class="flex md:hidden w-[26px] h-[26px] items-center cursor-pointer"
          @click="navigateTo('/')"
        >
          <img src="/src/static/img/home/logo_h5.png" alt="" class="w-full h-full" />
        </div>
        <!-- H5端 Logo (未登录大logo) -->
        <div
          v-else
          class="flex md:hidden w-[150px] h-[48px] items-center cursor-pointer"
          @click="navigateTo('/')"
        >
          <img src="/src/static/img/home/logo.png" alt="" class="w-full h-full" />
        </div>
      </div>

      <!-- 右侧 -->
      <div class="flex-1 flex items-center justify-end">
        <div
          class="hidden md:flex items-center justify-center cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3"
          @click="openExploreModal"
        >
          <SearchIcon class="w-6 h-6 fill-none" />
        </div>

        <!-- 未登录状态 -->
        <template v-if="!isLoggedIn">
          <!-- 登入 -->
          <div
            class="cursor-pointer w-[84px] h-[35px] sm:w-[100px] sm:h-[40px] text-[14px] sm:text-[16px] px-3 sm:px-4 rounded-lg flex items-center justify-center bg-transparent border-0 md:border-2 border-[#e4eaf019] mr-1"
            @click="openLoginModal"
          >
            {{ t('home.sign_In') }}
          </div>
          <!-- 注册 -->
          <div
            class="cursor-pointer w-[84px] h-[35px] sm:w-[100px] sm:h-[40px] text-[14px] sm:text-[16px] px-3 sm:px-4 rounded-lg flex items-center justify-center btn-primary sm:mr-0 md:mr-3"
            @click="openRegisterModal"
          >
            {{ t('home.sign_Up') }}
          </div>
          <!-- 充值 -->
          <div
            class="cursor-pointer w-[84px] h-[35px] sm:w-[96px] sm:h-[40px] text-[14px] sm:text-[16px] px-3 sm:px-4 rounded-lg flex items-center justify-center btn-primary sm:mr-0 md:mr-3"
            @click="openDeposit"
          >
            {{ t('deposit.title') }}
          </div>
        </template>

        <!-- 已登录状态 -->
        <template v-else>
          <div
            class="hidden md:flex items-center justify-between search h-[40px] p-1 rounded-lg mr-3"
            style="width: 260px"
          >
            <div class="flex items-center justify-center cursor-pointer ml-1">
              <div class="w-10 h-10 mr-1">
                <img
                  src="/src/static/img/home/php.png"
                  alt="php"
                  class="w-full h-full object-cover"
                />
              </div>
              <!-- 金额 -->
              <span class="text-[14px] font-[600] text-text-1">
                {{ getCurrencySymbol(userInfo?.currency) }}{{ formatBalance(acctInfo?.balancePhp) }}
              </span>
            </div>

            <!-- 充值 -->
            <div
              class="cursor-pointer w-[84px] h-[35px] sm:w-[96px] sm:h-[40px] text-[14px] sm:text-[16px] px-3 sm:px-4 rounded-lg flex items-center justify-center btn-primary sm:mr-0 md:mr-3"
              @click="openDeposit"
            >
              {{ t('deposit.title') }}
            </div>

            <div class="flex items-center">
              <ArrowDownIcon class="w-5 h-5 mr-1 cursor-pointer" />
              <div
                class="cursor-pointer h-8 text-[14px] font-[600] px-2 flex items-center justify-center btn-primary rounded-lg"
              >
                Deposit
              </div>
            </div>
          </div>

          <!-- H5 余额和充值容器 -->
          <div
            class="flex md:hidden items-center justify-between search w-[184px] h-[33px] p-1 rounded-lg mr-2"
          >
            <div class="flex items-center justify-center cursor-pointer ml-1">
              <div class="w-5 h-5 mr-1">
                <img
                  src="/src/static/img/home/php.png"
                  alt="php"
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
              >
                <Jia class="w-3 h-3" />
              </div>
            </div>
          </div>

          <!-- H5 礼物、通知、头像 -->
          <div class="flex md:hidden items-center">
            <!-- 礼物图标 -->
            <div
              class="cursor-pointer search w-[33px] h-[33px] flex items-center justify-center rounded-lg mr-2"
            >
              <GiftIcon class="w-4 h-4 fill-none" />
            </div>
            <!-- 通知图标 -->
            <div
              class="cursor-pointer search w-[33px] h-[33px] flex items-center justify-center rounded-lg mr-2"
            >
              <BellIcon class="w-4 h-4 fill-none" />
            </div>
            <!-- 用户头像 -->
            <div
              class="cursor-pointer w-[33px] h-[33px] border border-opacity-15 flex items-center justify-center bg-opacity-5 rounded-full overflow-hidden"
            >
              <img :src="avatarUrl" alt="Avatar" class="w-[28px] h-[28px] object-cover" />
            </div>
          </div>

          <!-- 礼物图标 -->
          <div
            class="hidden md:flex items-center justify-center cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3"
          >
            <GiftIcon class="w-6 h-6 fill-none" />
          </div>

          <!-- 聊天和通知容器 (带边框和分隔线) -->
          <div class="hidden md:flex items-center search h-[40px] rounded-lg mr-3">
            <!-- 聊天图标 -->
            <div class="flex items-center justify-center cursor-pointer w-[40px] h-[40px]">
              <ChatIcon class="w-6 h-6 fill-none" />
            </div>

            <!-- 竖线分隔 -->
            <div class="h-6 w-[1px] bg-[#e4eaf019]"></div>

            <!-- 通知图标 -->
            <div class="flex items-center justify-center cursor-pointer w-[40px] h-[40px]">
              <BellIcon class="w-6 h-6 fill-none" />
            </div>
          </div>

          <!-- 用户头像 (PC端) -->
          <div
            class="hidden md:flex cursor-pointer w-[44px] h-[44px] border border-opacity-15 items-center justify-center bg-opacity-5 rounded-full overflow-hidden mr-2"
          >
            <img :src="avatarUrl" alt="Avatar" class="w-[38px] h-[38px] object-cover" />
          </div>
        </template>

        <!-- 未登录时显示的聊天图标 -->
        <div
          v-if="!isLoggedIn"
          class="hidden md:flex items-center justify-center cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3"
        >
          <ChatIcon class="w-6 h-6 fill-none" />
        </div>

        <!-- 语言和币种选择 (未登录时显示) -->
        <div
          v-if="!isLoggedIn"
          class="flex items-center justify-center w-auto h-[40px] rounded-lg overflow-hidden relative"
        >
          <div
            class="hidden md:flex items-center justify-center cursor-pointer search w-[40px] h-[40px]"
            @click="openLanguageModal"
          >
            <LanguageIcon class="w-6 h-6 fill-none" />
          </div>
          <template v-if="localeStore.currentCurrency !== 'none'">
            <div class="absolute left-10 top-2 h-6 w-[1px] line"></div>
            <div
              class="hidden md:flex items-center justify-center cursor-pointer search w-auto h-[40px] px-2"
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

    <!-- 登录/注册弹窗 -->
    <LoginModal v-model="showLoginModal" :default-tab="loginModalTab" />

    <!-- PC 搜索弹窗 -->
    <ExploreDesktop v-model="showExplorehModal" />

    <!-- 充值 -->
    <DepositPop v-model="showDepositPop" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import { useLayoutStore } from '@/stores/layout'
import { navigateTo } from '@/utils/router'
import SelectModal from '@/components/SelectModal.vue'
import LoginModal from '@/components/login_register/LoginModal.vue'
import ExploreDesktop from '@/components/explore/desktop/index.vue'
import DepositPop from '@/components/deposit/depositPop.vue'
import FoldIcon from '@/static/svg/fold.svg?component'
import SearchIcon from '@/static/svg/search.svg?component'
import ChatIcon from '@/static/svg/chat.svg?component'
import LanguageIcon from '@/static/svg/language.svg?component'
import GiftIcon from '@/static/svg/login/gift.svg?component'
import BellIcon from '@/static/svg/bell.svg?component'
import Jia from '@/static/svg/login/jia.svg?component'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { getCurrencySymbol, formatBalance } from '@/utils/locale'

const { t } = useI18n()
const localeStore = useLocaleStore()
const layoutStore = useLayoutStore()

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const showModal = ref(false)
const modalType = ref<'language' | 'currency'>('language')

const showLoginModal = ref(false)
const showDepositPop = ref(false)
const loginModalTab = ref<'login' | 'register'>('login')

const showExplorehModal = ref(false)

// 用户信息
const userInfo = ref<any>(null)
// 账户信息
const acctInfo = ref<any>(null)

// 是否已登录
const isLoggedIn = computed(() => {
  return userInfo.value && userInfo.value.tradeToken
})

// 用户头像 URL
const avatarUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_GAME_IMAGE_BASE_URL
  const headPortrait = userInfo.value?.headPortrait

  if (headPortrait && baseUrl) {
    return `${baseUrl}${headPortrait}`
  }
  return '/src/static/img/home/avatar.png'
})

// localStorage 用户信息
const loadUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo)
    } catch (error) {
      console.error(error)
      userInfo.value = null
    }
  }

  // 加载账户信息
  const storedAcctInfo = localStorage.getItem('acctInfo')
  if (storedAcctInfo) {
    try {
      acctInfo.value = JSON.parse(storedAcctInfo)
    } catch (error) {
      console.error(error)
      acctInfo.value = null
    }
  }
}

// 监听 localStorage 变化
const handleStorageChange = () => {
  loadUserInfo()
}

// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo()
  window.addEventListener('storage', handleStorageChange)
})

// 监听登录弹窗关闭，重新加载用户信息
watch(showLoginModal, newVal => {
  if (!newVal) {
    loadUserInfo()
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
  loginModalTab.value = 'login'
  showLoginModal.value = true
}

const openRegisterModal = () => {
  loginModalTab.value = 'register'
  showLoginModal.value = true
}

const openExploreModal = () => {
  showExplorehModal.value = true
}

const handleLanguageChange = (code: string) => {
  localeStore.setLanguage(code)
}

const handleCurrencyChange = (code: string) => {
  localeStore.setCurrency(code)
}

const openDeposit = () => {
  showDepositPop.value = true
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
</style>
