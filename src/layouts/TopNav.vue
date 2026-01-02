<template>
  <header class="top-nav">
    <div class="h-full flex items-center justify-between px-4">
      <!-- 左侧 -->
      <div class="flex items-center">
        <div
          class="hidden md:flex cursor-pointer search w-[40px] h-[40px] rounded-lg"
          @click="handleToggleSidebar"
        >
          <FoldIcon class="w-6 h-6 fill-text-2 fill-none" />
        </div>
        <div
          class="w-[150px] h-[48px] ml-0 md:ml-5 flex items-center cursor-pointer"
          @click="navigateTo('/')"
        >
          <img src="/src/static/img/home/logo.png" alt="" class="w-full h-full" />
        </div>
      </div>

      <!-- 右侧 -->
      <div class="flex-1 flex items-center justify-end">
        <div
          class="hidden md:flex items-center justify-center cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3"
        >
          <SearchIcon class="w-6 h-6 fill-text-2 fill-none" />
        </div>
        <!-- 登入 -->
        <div
          class="cursor-pointer min-w-[96px] h-[40px] px-4 rounded-lg flex items-center justify-center bg-transparent border-2 border-[#e4eaf019] mr-1"
          @click="openLoginModal"
        >
          {{ t('locales.home.sign_In') }}
        </div>
        <!-- 注册 -->
        <div
          class="cursor-pointer min-w-[96px] h-[40px] px-4 rounded-lg flex items-center justify-center btn-primary mr-3"
          @click="openRegisterModal"
        >
          {{ t('locales.home.sign_Up') }}
        </div>
        <div
          class="hidden md:flex items-center justify-center cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3"
        >
          <ChatIcon class="w-6 h-6 fill-text-2 fill-none" />
        </div>
        <div
          class="flex items-center justify-center w-auto h-[40px] rounded-lg overflow-hidden relative"
        >
          <div
            class="hidden md:flex items-center justify-center cursor-pointer search w-[40px] h-[40px]"
            @click="openLanguageModal"
          >
            <LanguageIcon class="w-6 h-6 fill-text-2 fill-none" />
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
    <LoginModal
      v-model="showLoginModal"
      :default-tab="loginModalTab"
    />
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import { useLayoutStore } from '@/stores/layout'
import { navigateTo } from '@/utils/router'
import SelectModal from '@/components/SelectModal.vue'
import LoginModal from '@/components/login_register/LoginModal.vue'
import FoldIcon from '@/static/svg/fold.svg?component'
import SearchIcon from '@/static/svg/search.svg?component'
import ChatIcon from '@/static/svg/chat.svg?component'
import LanguageIcon from '@/static/svg/language.svg?component'

const { t } = useI18n()
const localeStore = useLocaleStore()
const layoutStore = useLayoutStore()

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const showModal = ref(false)
const modalType = ref<'language' | 'currency'>('language')

const showLoginModal = ref(false)
const loginModalTab = ref<'login' | 'register'>('login')

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

const handleLanguageChange = (code: string) => {
  localeStore.setLanguage(code)
}

const handleCurrencyChange = (code: string) => {
  localeStore.setCurrency(code)
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
