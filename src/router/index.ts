import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import i18n from '@/i18n'

// 支持的语言列表
const supportedLocales = ['zh', 'en'] // en 默认语言

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/index.vue')
      },
      {
        path: 'casino',
        name: 'Casino',
        component: () => import('@/views/casino/index.vue')
      },
      {
        path: 'sports',
        name: 'Sports',
        component: () => import('@/views/sports/index.vue')
      }
    ]
  },
  {
    path: '/:locale',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'LocaleHome',
        component: () => import('@/views/home/index.vue')
      },
      {
        path: 'casino',
        name: 'LocaleCasino',
        component: () => import('@/views/casino/index.vue')
      },
      {
        path: 'sports',
        name: 'LocaleSports',
        component: () => import('@/views/sports/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const locale = to.params.locale as string

  if (locale) {
    if (supportedLocales.includes(locale)) {
      const i18nLocale = locale === 'zh' ? 'zh' : 'en'
      if (i18n.global.locale.value !== i18nLocale) {
        i18n.global.locale.value = i18nLocale as 'zh' | 'en'
        localStorage.setItem('locale', locale)
      }
    } else {
      next('/')
      return
    }
  } else {
    if (i18n.global.locale.value !== 'en') {
      i18n.global.locale.value = 'en'
    }
  }

  next()
})

export default router

