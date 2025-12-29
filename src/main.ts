import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import './styles/colors.css'
import './styles/main.scss'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')

import { useThemeStore } from './stores/theme'
import { useLocaleStore } from './stores/locale'

const themeStore = useThemeStore()
themeStore.initTheme()

// 初始化语言
router.isReady().then(() => {
  const localeStore = useLocaleStore()
  localeStore.initLanguage()
})
