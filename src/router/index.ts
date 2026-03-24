import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import i18n from '@/i18n'

// 支持的语言列表
const supportedLocales = ['zh', 'en']

const baseRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页',
      description: '主页'
    }
  },
  {
    path: 'casino',
    name: 'casino',
    component: () => import('@/views/fun/casino/index.vue'),
    meta: {
      title: '娱乐城'
    },
    props: route => ({
      tabKey: route.params.tabKey as string | undefined
    })
  },
  {
    path: 'casino/:tabKey',
    name: 'casinoTabKey',
    component: () => import('@/views/fun/casino/index.vue'),
    meta: {
      title: '娱乐城'
    },
    props: route => ({
      tabKey: route.params.tabKey as string
    })
  },
  {
    path: 'originate',
    name: 'originate',
    component: () => import('@/views/fun/originate/index.vue'),
    meta: {
      title: 'BC原创'
    }
  },
  {
    path: 'exclusive',
    name: 'exclusive',
    component: () => import('@/views/fun/exclusive/index.vue'),
    meta: {
      title: 'BC独家'
    }
  },
  {
    path: 'sports',
    name: 'sports',
    component: () => import('@/views/sports/index.vue'),
    meta: {
      title: '体育'
    }
  },
  {
    path: 'menu',
    name: 'menu',
    component: () => import('@/views/menu/index.vue'),
    meta: {
      title: '选单'
    }
  },
  {
    path: 'explore',
    name: 'explore',
    component: () => import('@/views/explore/index.vue'),
    meta: {
      title: '搜索'
    }
  },
  {
    path: 'game/:id',
    name: 'gameDetail',
    component: () => import('@/views/game/detail/index.vue'),
    meta: {
      title: '游戏详情',
      description: '游戏详情',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'chat-public',
    name: 'chat-public',
    component: () => import('@/views/chat/chat-public/index.vue'),
    meta: {
      title: '聊天',
      mobile: {
        hideTopNav: true
      }
    }
  },
  {
    path: 'bet-history',
    name: 'bet-history',
    component: () => import('@/views/wallet/betHistory/index.vue'),
    meta: {
      title: '投注历史',
      description: '投注历史',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'bet-details/:id',
    name: 'bet-details',
    component: () => import('@/views/wallet/betDetails/index.vue'),
    meta: {
      title: '投注详情',
      description: '投注详情',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  }
]

// 生成带语言前缀的路由
const createLocaleRoute = (route: RouteRecordRaw, locale?: string): RouteRecordRaw => {
  const newRoute = {
    ...route,
    meta: { ...route.meta }
  }

  if (locale) {
    newRoute.name = `Locale${String(route.name)}`
  }

  return newRoute
}

const defaultChildren = baseRoutes.map(route => createLocaleRoute(route))
const localeChildren = baseRoutes.map(route => createLocaleRoute(route, 'locale'))

const routes: RouteRecordRaw[] = [
  {
    path: '/app-download',
    name: 'AppDownload',
    component: () => import('@/views/app-download/index.vue'),
    meta: {
      title: '应用程式下载',
      description: '下载应用程式'
    }
  },
  {
    path: '/:locale/app-download',
    name: 'LocaleAppDownload',
    component: () => import('@/views/app-download/index.vue'),
    meta: {
      title: '应用程式下载',
      description: '下载应用程式'
    }
  },
  {
    path: '/',
    component: MainLayout,
    children: defaultChildren
  },
  {
    path: '/:locale',
    component: MainLayout,
    children: localeChildren
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
      const languageCode = locale === 'zh' ? 'zh-CN' : 'en'

      if (i18n.global.locale.value !== i18nLocale) {
        i18n.global.locale.value = i18nLocale as 'zh' | 'en'
        localStorage.setItem('language', languageCode)
      }
    } else {
      next('/')
      return
    }
  } else {
    if (i18n.global.locale.value !== 'en') {
      i18n.global.locale.value = 'en'
      localStorage.setItem('language', 'en')
    }
  }

  next()
})

export default router
