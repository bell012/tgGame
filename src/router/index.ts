import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import i18n from '@/i18n'
import {
  getLocaleFromRouteParam,
  getPersistedLocale,
  getStorageLanguageCode,
  withLocalePrefix,
  DEFAULT_LOCALE
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
    path: 'gamelist/:tabKey',
    name: 'gameList',
    component: () => import('@/views/fun/casino/gameList/index.vue'),
    meta: {
      title: '游戏列表',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    },
    props: route => ({
      tabKey: route.params.tabKey as string
    })
  },
  {
    path: 'brand-games/:brandCode',
    name: 'brandGameList',
    component: () => import('@/views/fun/casino/brandGameList/index.vue'),
    meta: {
      title: '厂商游戏列表',
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    },
    props: route => ({
      brandCode: route.params.brandCode as string,
      brandName: typeof route.query.brandName === 'string' ? route.query.brandName : undefined
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
    path: 'game/:rowId',
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
    path: 'game/detail/recommended',
    name: 'gameDetailRecommended',
    component: () => import('@/views/game/detail/recommended/index.vue'),
    meta: {
      title: '推荐游戏',
      description: '推荐游戏',
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
      mobileOnly: true, //pc中路由不可见 H5中路由可见
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
    component: () => import('@/views/personalCenter/components/mobile.vue'),
    meta: {
      title: '个人中心',
      description: '个人中心',
      mobileOnly: true, //pc中路由不可见 H5中路由可见
      slideTransition: true, // 启用滑动动画
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'rule',
    name: 'rule',
    component: () => import('@/views/rule/index.vue'),
    meta: {
      title: '规则',
      description: '规则',
      mobileOnly: true, //pc中路由不可见 H5中路由可见
      slideTransition: true, // 启用滑动动画
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'vip',
    name: 'vip',
    component: () => import('@/views/vip/index.vue'),
    meta: {
      title: 'VIP俱乐部',
      description: 'VIP俱乐部',
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'personal-center/my-profile',
    name: 'personal-center-my-profile',
    component: () => import('@/views/personalCenter/myProfile/index.vue'),
    meta: {
      title: '我的资料',
      description: '我的资料',
      mobileOnly: true,
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'personal-center/edit-profile',
    name: 'personal-center-edit-profile',
    component: () => import('@/views/personalCenter/editProfile/index.vue'),
    meta: {
      title: '编辑资料',
      description: '编辑资料',
      mobileOnly: true,
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'personal-center/feedback',
    name: 'personal-center-feedback',
    component: () => import('@/views/personalCenter/feedback/index.vue'),
    meta: {
      title: '意见反馈',
      description: '意见反馈',
      mobileOnly: true,
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'personal-center/feedback/detail/:recordId',
    name: 'personal-center-feedback-detail',
    component: () => import('@/views/personalCenter/feedback/detail/index.vue'),
    meta: {
      title: '记录详情',
      description: '记录详情',
      mobileOnly: true,
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'transaction-details/:id',
    name: 'transaction-details',
    component: () => import('@/views/wallet/transactionDetails/index.vue'),
    meta: {
      title: '资金详情',
      description: '资金详情',
      mobileOnly: true, //pc中路由不可见 H5中路由可见
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'transaction',
    name: 'transaction',
    component: () => import('@/views/wallet/transaction/index.vue'),
    meta: {
      title: '资金明细',
      description: '资金明细',
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'rollover-details/:id',
    name: 'rollover-details/:id',
    component: () => import('@/views/wallet/rolloverDetails/index.vue'),
    meta: {
      title: '流水稽查详情',
      description: '流水稽查详情',
      mobileOnly: true, //pc中路由不可见 H5中路由可见
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'rollover',
    name: 'rollover',
    component: () => import('@/views/wallet/rollover/index.vue'),
    meta: {
      title: '流水稽查',
      description: '流水稽查',
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'deposit',
    name: 'deposit',
    component: () => import('@/views/wallet/deposit/index.vue'),
    meta: {
      title: '充值',
      description: '充值',
      slideTransition: true, // 启用滑动动画
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'my-orders',
    name: 'my-orders',
    component: () => import('@/views/wallet/myOrders/index.vue'),
    meta: {
      title: '我的订单',
      description: '我的订单',
      slideTransition: true,
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'withdraw',
    name: 'withdraw',
    component: () => import('@/views/wallet/withdraw/index.vue'),
    meta: {
      title: '提现',
      description: '提现',
      slideTransition: true, // 启用滑动动画
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'settings',
    name: 'settings',
    component: () => import('@/views/settings/index.vue'),
    meta: {
      title: '全局设定',
      description: '全局设定',
      slideTransition: true, // 启用滑动动画
      mobile: {
        hideBottomBar: true,
        hideTopNav: true
      }
    }
  },
  {
    path: 'security',
    name: 'security',
    component: () => import('@/views/settings/security/index.vue'),
    meta: {
      title: '安全性',
      description: '安全性',
      slideTransition: true, // 启用滑动动画
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
  const routeLocaleParam = to.params.locale as string | undefined
  const routeLocale = getLocaleFromRouteParam(routeLocaleParam)
  const persistedLocale = getPersistedLocale()

  if (routeLocaleParam && !routeLocale) {
    next(withLocalePrefix('/', persistedLocale ?? DEFAULT_LOCALE))
    return
  }

  const targetLocale = persistedLocale ?? routeLocale ?? DEFAULT_LOCALE
  const canonicalPath = withLocalePrefix(to.path, targetLocale)

  if (canonicalPath !== to.path) {
    next({
      path: canonicalPath,
      query: to.query,
      hash: to.hash,
      replace: true
    })
    return
  }

  const languageCode = getStorageLanguageCode(targetLocale)

  if (i18n.global.locale.value !== targetLocale) {
    i18n.global.locale.value = targetLocale
  }

  if (localStorage.getItem('language') !== languageCode) {
    localStorage.setItem('language', languageCode)
  }

  next()
})

export default router
