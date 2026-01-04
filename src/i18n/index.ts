import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') === 'zh-CN' ? 'zh' : 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      locales: en
    },
    zh: {
      locales: zh
    }
  }
})

export default i18n
