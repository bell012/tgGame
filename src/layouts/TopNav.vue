<template>
  <header class="top-nav">
    <div class="h-full flex items-center justify-between">
      <!-- 左侧 -->
      <div class="flex items-center px-4">
        <div class="cursor-pointer search w-[40px] h-[40px] rounded-lg">
          <FoldIcon class="w-6 h-6 fill-text-2 fill-none" />
        </div>
        <router-link to="/" class="w-[150px] h-[48px] ml-5 flex items-center">
          <img src="/src/static/img/home/logo.png" alt="" class="w-full h-full">
        </router-link>
      </div>

      <!-- 右侧 -->
      <div class="flex-1 flex items-center justify-end px-3">
        <div class="cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3">
          <SearchIcon class="w-6 h-6 fill-text-2 fill-none" />
        </div>
        <!-- 登入 -->
        <div class="cursor-pointer min-w-[96px] h-[40px] px-4 rounded-lg flex items-center justify-center bg-transparent border-2 border-[#e4eaf019] mr-1">
          {{ t('home.sign_In') }}
        </div>
        <!-- 注册 -->
        <div class="cursor-pointer min-w-[96px] h-[40px] px-4 rounded-lg flex items-center justify-center btn-primary mr-3">{{ t('home.sign_Up') }}</div>
        <div class="cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3">
          <ChatIcon class="w-6 h-6 fill-text-2 fill-none" />
        </div>
        <div class="flex items-center justify-center w-auto h-[40px] rounded-lg overflow-hidden relative">
          <div class="cursor-pointer search w-[40px] h-[40px]" @click="openLanguageModal">
            <LanguageIcon class="w-6 h-6 fill-text-2 fill-none" />
          </div>
          <template v-if="localeStore.currentCurrency !== 'none'">
            <div class="absolute left-10 top-2 h-6 w-[1px] line"></div>
            <div class="cursor-pointer search w-auto h-[40px] px-2" @click="openCurrencyModal">
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
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import SelectModal from '@/components/SelectModal.vue'
import FoldIcon from '@/static/svg/fold.svg?component'
import SearchIcon from '@/static/svg/search.svg?component'
import ChatIcon from '@/static/svg/chat.svg?component'
import LanguageIcon from '@/static/svg/language.svg?component'

const { t } = useI18n()
const localeStore = useLocaleStore()

const showModal = ref(false)
const modalType = ref<'language' | 'currency'>('language')

const openLanguageModal = () => {
  modalType.value = 'language'
  showModal.value = true
}

const openCurrencyModal = () => {
  modalType.value = 'currency'
  showModal.value = true
}

const handleLanguageChange = (code: string) => {
  localeStore.setLanguage(code)
}

const handleCurrencyChange = (code: string) => {
  localeStore.setCurrency(code)
}
</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--color-background-level-5);
  box-shadow:0px 4px 8px 0px rgba(0, 0, 0, 0.05);
  z-index: 50;
}
.search {
  display: flex;
  align-items: center;
  justify-content: center;
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
