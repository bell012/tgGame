import { createI18n } from 'vue-i18n'
import eng from './locales/en.json'
import zh from './locales/zh.json'
import { getLanguageCode, DEFAULT_LOCALE } from '@/utils/locale'

const i18n = createI18n({
  legacy: false,
  locale: getLanguageCode(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    eng: {
      ...eng
    },
    zh: {
      ...zh
    }
  }
})

export default i18n
