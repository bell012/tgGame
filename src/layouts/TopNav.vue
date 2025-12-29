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
        <div class="cursor-pointer min-w-[96px] h-[40px] px-4 rounded-lg flex items-center justify-center bg-transparent border-2 border-[#e4eaf019] mr-1">登入</div>
        <div class="cursor-pointer min-w-[96px] h-[40px] px-4 rounded-lg flex items-center justify-center btn-primary mr-3">注册</div>
        <div class="cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3">
          <ChatIcon class="w-6 h-6 fill-text-2 fill-none" />
        </div>
        <div class="flex items-center justify-center w-auto h-[40px] rounded-lg overflow-hidden relative">
          <div class="cursor-pointer search w-[40px] h-[40px]" @click="openLanguageModal">
            <LanguageIcon class="w-6 h-6 fill-text-2 fill-none" />
          </div>
          <template v-if="currentCurrency !== 'none'">
            <div class="absolute left-10 top-2 h-6 w-[1px] line"></div>
            <div class="cursor-pointer search w-auto h-[40px] px-2" @click="openCurrencyModal">
              <span class="text">{{ currentCurrency }}</span>
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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SelectModal from '@/components/SelectModal.vue'
import FoldIcon from '@/static/svg/fold.svg?component'
import SearchIcon from '@/static/svg/search.svg?component'
import ChatIcon from '@/static/svg/chat.svg?component'
import LanguageIcon from '@/static/svg/language.svg?component'

const { locale } = useI18n()

const showModal = ref(false)
const modalType = ref<'language' | 'currency'>('language')
const currentLanguage = ref(localStorage.getItem('language') || 'en')
const currentCurrency = ref(localStorage.getItem('currency') || 'none')

// 计算实际使用的货币（用于计价）
const actualCurrency = computed(() => {
  return currentCurrency.value === 'none' ? 'USD' : currentCurrency.value
})

const openLanguageModal = () => {
  modalType.value = 'language'
  showModal.value = true
}

const openCurrencyModal = () => {
  modalType.value = 'currency'
  showModal.value = true
}

const handleLanguageChange = (code: string) => {
  currentLanguage.value = code
  // 切换 i18n 语言
  const i18nLocale = code === 'zh-CN' ? 'zh' : 'en'
  locale.value = i18nLocale
  localStorage.setItem('language', code)
  console.log('语言切换为:', code, '实际 i18n locale:', i18nLocale)
}

const handleCurrencyChange = (code: string) => {
  currentCurrency.value = code
  localStorage.setItem('currency', code)
  console.log('货币切换为:', code, '实际计价货币:', actualCurrency.value)
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
