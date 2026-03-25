import { getLanguageCode } from '@/utils/locale'
import { createI18n } from 'vue-i18n'
import homeEn from './en-us/home.json'
import en from './locales/en.json'
import zh from './locales/zh.json'
import homeZn from './zh-cn/home.json'

const i18n = createI18n({
  legacy: false,
  locale: getLanguageCode(),
  fallbackLocale: 'eng',
  messages: {
    eng: {
      ...en,
      homeEn
    },
    zh: {
      ...zh,
      homeZn
    }
  }
})

export default i18n
