<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleClose">
        <div class="modal-container rounded-xl max-w-[416px] min-h-[600px] w-full" @click.stop>
          <!-- 关闭按钮 -->
          <button
            class="w-full h-12 rounded-lg px-4 flex items-center justify-end"
            @click="handleClose"
          >
            <div class="w-8 h-8 bg-[#464f50] rounded-md flex items-center justify-center">
              <CloseIcon class="w-4 h-4 stroke-text-1" />
            </div>
          </button>

          <!-- 标签页 -->
          <div class="flex">
            <!-- 语言 -->
            <button
              :class="['tab', { active: activeTab === 'language' }]"
              @click="activeTab = 'language'"
            >
              {{ t('locales.home.language') }}
            </button>
            <!-- 以货币显示 -->
            <button
              :class="['tab', { active: activeTab === 'currency' }]"
              @click="activeTab = 'currency'"
            >
              {{ t('locales.home.view_currency') }}
            </button>
          </div>

          <!-- 语言选择 -->
          <div v-if="activeTab === 'language'" class="content">
            <!-- 搜索框 -->
            <div class="search-box mb-3 relative">
              <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 stroke-text-2" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('home.search')"
                class="search-input"
              />
            </div>

            <!-- 语言列表 -->
            <div class="options-list">
              <div
                v-for="lang in filteredLanguages"
                :key="lang.code"
                :class="['option-item', { selected: selectedLanguage === lang.code }]"
                @click="selectLanguage(lang.code)"
              >
                <span class="option-text">{{ lang.name }}</span>
                <RadioCheckedIcon
                  v-if="selectedLanguage === lang.code"
                  class="w-6 h-6 flex-shrink-0 stroke-text-1 fill-text-1"
                />
                <RadioUncheckedIcon v-else class="w-6 h-6 flex-shrink-0 stroke-text-1" />
              </div>
            </div>
          </div>

          <!-- 货币选择 -->
          <div v-if="activeTab === 'currency'" class="content">
            <!-- 选择要显示的货币。货币将以近似值显示。 -->
            <p class="currency-tip">
              {{ t('home.select_currency') }}
            </p>

            <!-- 搜索框 -->
            <div class="search-box mb-3 relative">
              <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 stroke-text-3" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('home.search')"
                class="search-input"
              />
            </div>

            <!-- 无选项 -->
            <div
              :class="['option-item', { selected: selectedCurrency === 'none' }]"
              @click="selectCurrency('none')"
            >
              <div class="flex items-center">
                <RadioCheckedIcon class="w-6 h-6 flex-shrink-0 stroke-text-1 fill-text-1 mr-3" />
                <!-- 无 -->
                <span class="option-text">{{ t('locales.home.none') }}</span>
              </div>
              <RadioCheckedIcon
                v-if="selectedCurrency === 'none'"
                class="w-6 h-6 flex-shrink-0 stroke-text-1 fill-text-1"
              />
              <RadioUncheckedIcon v-else class="w-6 h-6 flex-shrink-0 stroke-text-1" />
            </div>

            <!-- 提示信息 -->
            <div v-if="selectedCurrency === 'none'" class="warning-tip">
              <SearchIcon class="w-5 h-5 flex-shrink-0 mr-1.5 stroke-[#3cef86]" />
              <!-- 当未选择任何货币时，某些金额仍会以最后选择的法币显示(USD) -->
              <span>{{ t('locales.home.none_select_currency') }}(USD)</span>
            </div>

            <!-- 货币列表 -->
            <div class="options-list">
              <div
                v-for="currency in filteredCurrencies"
                :key="currency.code"
                :class="['option-item', { selected: selectedCurrency === currency.code }]"
                @click="selectCurrency(currency.code)"
              >
                <div class="flex items-center">
                  <img :src="currency.flag" alt="flag" class="w-6 h-6 mr-3 rounded" />
                  <span class="option-text">{{ currency.code }}</span>
                </div>
                <RadioCheckedIcon
                  v-if="selectedCurrency === currency.code"
                  class="w-6 h-6 flex-shrink-0 stroke-text-1 fill-text-1"
                />
                <RadioUncheckedIcon v-else class="w-6 h-6 flex-shrink-0 stroke-text-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import CloseIcon from '@/static/svg/close.svg?component'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'

const { t } = useI18n()
const localeStore = useLocaleStore()

interface Language {
  code: string
  name: string
  pinyin?: string
}

interface Currency {
  code: string
  flag: string
}

const props = defineProps<{
  modelValue: boolean
  type?: 'language' | 'currency'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select-language': [code: string]
  'select-currency': [code: string]
}>()

const activeTab = ref<'language' | 'currency'>(props.type || 'language')
const searchQuery = ref('')

// 更新 activeTab
watch(
  () => props.type,
  newType => {
    if (newType) {
      activeTab.value = newType
    }
  },
  { immediate: true }
)

// 使用 store 中的数据
const selectedLanguage = computed(() => {
  console.log('[SelectModal] selectedLanguage:', localeStore.currentLanguage)
  return localeStore.currentLanguage
})
const selectedCurrency = computed(() => {
  console.log('[SelectModal] selectedCurrency:', localeStore.currentCurrency)
  return localeStore.currentCurrency
})

// 语言列表
const languages: Language[] = [
  { code: 'en', name: 'English', pinyin: 'yingyu' },
  { code: 'zh-CN', name: '简体中文', pinyin: 'jiantizhongwen' }
]

// 货币列表
const currencies: Currency[] = [
  { code: 'USD', flag: new URL('@/static/img/flag/USD.webp', import.meta.url).href },
  { code: 'CNY', flag: new URL('@/static/img/flag/CNY.webp', import.meta.url).href }
]

// 搜索支持拼音首字母和中文
const filteredLanguages = computed(() => {
  if (!searchQuery.value) return languages

  const query = searchQuery.value.toLowerCase().trim()

  return languages.filter(lang => {
    const name = lang.name.toLowerCase()
    const code = lang.code.toLowerCase()
    const pinyin = lang.pinyin?.toLowerCase() || ''
    if (name.includes(query) || code.includes(query) || pinyin.includes(query)) {
      return true
    }
    if (pinyin) {
      const firstLetters = pinyin
        .split('')
        .filter((_, i) => i === 0 || pinyin[i - 1] === ' ')
        .join('')
      if (firstLetters.includes(query)) {
        return true
      }
    }

    return false
  })
})

const filteredCurrencies = computed(() => {
  if (!searchQuery.value) return currencies

  const query = searchQuery.value.toLowerCase().trim()

  return currencies.filter(currency => {
    return currency.code.toLowerCase().includes(query)
  })
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const selectLanguage = (code: string) => {
  emit('select-language', code)
  handleClose()
}

const selectCurrency = (code: string) => {
  emit('select-currency', code)
  handleClose()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(16, 18, 18, 0.8);
  visibility: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background-color: var(--color-background-level-1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.tab {
  flex: 1;
  padding: 0px 8px;
  background: none;
  border: none;
  color: var(--color-text-level-2);
  height: 40px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  position: relative;
}

.tab.active {
  color: var(--color-text-level-1);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-theme-level-1);
}

.content {
  padding: 20px 16px 16px 16px;
  overflow-y: auto;
  flex: 1;
}

.currency-tip {
  font-size: 14px;
  color: var(--color-text-level-1);
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  height: 40px;
  text-indent: 3.5em;
  background-color: var(--color-input-level-1);
  border: 1px solid var(--color-border-level-1);
  border-radius: 8px;
  color: var(--color-text-level-1);
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: var(--color-theme-level-1);
}

.search-input::placeholder {
  color: var(--color-text-level-2);
}

.options-list {
  display: flex;
  flex-direction: column;
}

.option-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0 8px 0 12px;
}

.option-item:hover {
  background-color: var(--color-background-level-4);
  border-radius: 8px;
}

.option-item.selected {
  background-color: var(--color-background-level-2);
  border-radius: 8px;
}

.option-text {
  font-size: 16px;
  color: var(--color-text-level-1);
  font-weight: 600;
}

.warning-tip {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  margin: 4px;
  background-color: #253a30;
  border-radius: 12px;
}

.warning-tip span {
  font-size: 14px;
  color: var(--color-text-level-2);
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
