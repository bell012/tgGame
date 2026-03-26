import { createI18n } from 'vue-i18n'
import eng from './locales/en.json'
import zh from './locales/zh.json'
import homeEng from './en-us/home.json'
import homeZh from './zh-cn/home.json'
import { getLanguageCode, DEFAULT_LOCALE } from '@/utils/locale'

const i18n = createI18n({
  legacy: false,
  locale: getLanguageCode(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    eng: {
      ...eng,
      home: homeEng
    },
    zh: {
      ...zh,
      home: homeZh
    }
  }
})

export default i18n
