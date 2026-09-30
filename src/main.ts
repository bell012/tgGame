import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import SmartImage from '@/components/common/SmartImage.vue'
import { useThemeStore } from './stores/theme'
import { useGameStore } from './stores/game'
import { useLocaleStore } from './stores/locale'
import { useSiteConfigStore } from './stores/siteConfig'
import { useTradeMessageSyncStore } from './stores/tradeMessageSync'
import { initGlobalDicCache } from './utils/global-dic'
import './styles/fonts.css'
import './styles/colors.css'
import './styles/main.scss'
import './style.css'
import 'vant/lib/index.css'

const app = createApp(App)
const pinia = createPinia()

app.component('SmartImage', SmartImage)
app.use(pinia)
app.use(router)
app.use(i18n)

const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')

// 初始化语言
router.isReady().then(async () => {
  const localeStore = useLocaleStore()
  localeStore.initLanguage()

  const siteConfigStore = useSiteConfigStore()
  const siteConfig = await siteConfigStore.initSiteConfig()
  // 页面刷新时，当前语言和货币以 /sy/dlicgh 返回的默认配置为准。
  localeStore.applySiteDefaults(siteConfig)

  const gameStore = useGameStore()

  // 初始化全局游戏列表缓存。
  void gameStore.ensureGameData()

  // 初始化全局多语言字典缓存。
  void initGlobalDicCache()

  const tradeMessageSyncStore = useTradeMessageSyncStore()
  tradeMessageSyncStore.init()
})
