import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'
import homeEn from './en-us/home.json'
import homeZn from './zh-cn/home.json'
import { getLanguageCode } from '@/utils/locale'

const i18n = createI18n({
  legacy: false,
  locale: getLanguageCode(),
  fallbackLocale: 'en',
  messages: {
    en: {
      locales: en,
      home: homeEn
    },
    zh: {
      locales: zh,
      home: homeZn
    }
  }
})

export default i18n
