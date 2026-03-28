import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import i18n from '@/i18n'
import {
  getStorageLanguageCode,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type Locale
} from '@/utils/locale'

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
    path: 'menu/referral',
    name: 'menuReferral',
    component: () => import('@/views/menu/referral/index.vue'),
    meta: {
      title: '代理',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'menu/referral/commission-records',
    name: 'menuReferralCommissionRecords',
    component: () => import('@/views/menu/referral/commission-records/index.vue'),
    meta: {
      title: '佣金记录列表',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'menu/referral/commission-rules',
    name: 'menuReferralCommissionRules',
    component: () => import('@/views/menu/referral/commission-rules/index.vue'),
    meta: {
      title: 'Commission Rules',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'menu/referral/referral-records',
    name: 'menuReferralReferralRecords',
    component: () => import('@/views/menu/referral/referral-records/index.vue'),
    meta: {
      title: '我的代理-推荐记录列表',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'menu/notifications',
    name: 'menuNotifications',
    component: () => import('@/views/menu/notifications/index.vue'),
    meta: {
      title: '通知',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'menu/notifications/detail',
    name: 'menuNotificationDetail',
    component: () => import('@/views/menu/notifications/detail/index.vue'),
    meta: {
      title: '通知详情',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
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
      slideTransition: true, // 启用滑动动画
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
      slideTransition: true, // 启用滑动动画
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'personal-center',
    name: 'personal-center',
    component: () => import('@/views/personalCenter/mobile.vue'),
    meta: {
      title: '个人中心',
      description: '个人中心',
      slideTransition: true, // 启用滑动动画
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'transaction-bet-details/:id',
    name: 'transaction-bet-details',
    component: () => import('@/views/transaction/betDetails/index.vue'),
    meta: {
      title: '资金详情',
      description: '资金详情',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'transaction',
    name: 'transaction',
    component: () => import('@/views/transaction/index.vue'),
    meta: {
      title: '资金明细',
      description: '资金明细',
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
    if (SUPPORTED_LOCALES.includes(locale as Locale)) {
      const i18nLocale = locale as Locale
      const languageCode = getStorageLanguageCode(locale)

      if (i18n.global.locale.value !== i18nLocale) {
        i18n.global.locale.value = i18nLocale
        localStorage.setItem('language', languageCode)
      }
    } else {
      next('/')
      return
    }
  } else {
    if (i18n.global.locale.value !== DEFAULT_LOCALE) {
      i18n.global.locale.value = DEFAULT_LOCALE
      localStorage.setItem('language', DEFAULT_LOCALE)
    }
  }

  next()
})

export default router
