<template>
  <div class="h-full w-full bg-bg-1 overflow-y-auto">
    <div class="flex items-center h-[49px] px-3.5">
      <button
        @click="handleBack"
        class="w-[33px] h-[33px] bg-opacity-5 rounded-lg flex items-center justify-center"
      >
        <ArrowLeftIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- 用户信息区域 -->
    <div class="p-3.5">
      <div class="flex items-center mb-3.5">
        <div
          class="w-[55px] h-[55px] rounded-full overflow-hidden bg-opacity-15 flex items-center justify-center mr-3.5"
        >
          <img :src="avatarUrl" alt="Avatar" class="w-[47px] h-[47px] object-cover" />
        </div>
        <div class="flex flex-1 items-center justify-between">
          <div class="flex flex-col">
            <h2 class="text-text-1 text-base font-bold mb-1">
              {{ userInfo?.nickName || 'Guest' }}
            </h2>
            <div class="flex items-center">
              <span class="text-text-2 text-xs font-[500]"
                >ID: {{ userInfo?.memberId || '-' }}</span
              >
              <button class="p-1">
                <CopyIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="bg-opacity-5 rounded-md w-5 h-5 flex items-center justify-center">
            <ArrowRightIcon class="w-3 h-3" />
          </div>
        </div>
      </div>

      <!-- VIP 模块 -->
      <div
        class="relative rounded-lg overflow-hidden w-full h-[78px] flex justify-between items-start"
        :style="{ backgroundImage: `url(${vipBG})`, backgroundSize: 'cover' }"
      >
        <div class="flex min-w-0 flex-1 flex-col">
          <div class="mb-[5px] mt-1 flex w-full min-w-0 items-center justify-between">
            <div class="flex items-center">
              <img :src="vipLeft" alt="VIP" class="w-[25px] h-[16px] mx-[5px]" />
              <img :src="vipIcon" alt="VIP" class="w-[32px] h-[14px]" />
              <span class="text-text-1 text-lg font-bold">{{ vipLevel }}</span>
            </div>
          </div>

          <div class="flex w-full min-w-0 items-center justify-between pl-[8px]">
            <div class="w-full min-w-0">
              <div class="flex w-full min-w-0 items-center justify-between mb-1">
                <span class="min-w-0 flex-1 text-theme-primary text-xs"
                  >{{ t('personalCenter.upgrade') }}: {{ t('personalCenter.deposit') }} 600
                  {{ t('personalCenter.validBet') }} 800</span
                >
                <span class="shrink-0 text-theme-primary text-xs font-bold"
                  >VIP {{ vipLevel + 1 }}</span
                >
              </div>
              <div class="w-full h-[6px] bg-mask-20 rounded-full overflow-hidden">
                <div
                  class="h-full bg-theme-primary rounded-full"
                  :style="{ width: `${vipProgress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-[66px] h-[63px] shrink-0 mx-[6px] my-[8px]">
          <img :src="vipRight" alt="Diamond" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <!-- Total Balance -->
    <div class="mb-[5px] mx-3.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img :src="balanceIcon" alt="Balance" class="w-5 h-5" />
          <span class="text-text-2 text-sm">{{ t('personalCenter.totalBalance') }}</span>
        </div>
        <span class="text-text-1 text-lg font-bold">₱ {{ totalBalance }}</span>
      </div>
    </div>

    <!-- Buy 到 Bet History -->
    <div class="mx-3.5 mb-2.5">
      <div class="bg-bg-2 p-2.5 rounded-lg overflow-hidden">
        <div class="grid grid-cols-2 gap-2.5">
          <button
            class="bg-bg-3 h-[34px] rounded-lg text-xs font-bold text-text-1 flex items-center justify-center"
          >
            <DepositIocn class="w-5 h-5" />
            <div class="ml-[5px]">
              {{ t('personalCenter.deposit') }}
            </div>
          </button>
          <button
            class="bg-bg-3 h-[34px] rounded-lg text-xs font-bold text-text-1 flex items-center justify-center"
          >
            <WithdrawIcon class="w-5 h-5" />
            <div class="ml-[5px]">
              {{ t('userMenu.withdraw') }}
            </div>
          </button>
        </div>
        <div class="grid grid-cols-4 gap-[15px] py-[10px]">
          <div
            v-for="item in quickActions"
            :key="item.id"
            class="flex flex-col items-center gap-1"
            @click="item.handler"
          >
            <div class="flex items-center justify-center">
              <component :is="item.icon" class="w-5 h-5" />
            </div>
            <span class="text-text-1 text-xs font-[700] text-center">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification 到 Affiliate -->
    <div class="mx-3.5 mb-2.5">
      <div class="bg-bg-2 rounded-lg overflow-hidden">
        <div
          v-for="item in settingsMenus"
          :key="item.id"
          class="flex items-center justify-between px-3 py-[10px]"
          @click="item.handler"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="w-5 h-5" />
            <span class="text-text-1 text-sm font-[700]">{{ item.name }}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span
              v-if="item.badge"
              class="bg-theme-primary text-text-4 text-[10px] font-[700] px-[5px] rounded-full"
            >
              {{ item.badge }}
            </span>
            <div class="w-5 h-5 bg-opacity-10 rounded-md flex items-center justify-center">
              <ArrowRightIcon class="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Setting, Theme, Language, Currency -->
    <div class="mx-3.5 mb-2.5">
      <div class="bg-bg-2 rounded-lg overflow-hidden">
        <div
          v-for="item in globalSettings"
          :key="item.id"
          class="flex items-center justify-between px-3 py-[10px]"
          @click="item.handler"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="w-5 h-5" />
            <span class="text-text-1 text-sm font-[700]">{{ item.name }}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <component v-if="item.rightIcon" :is="item.rightIcon" class="w-5 h-5" />
            <span v-if="item.value" class="text-text-2 text-xs">{{ item.value }}</span>
            <div v-if="item.isTheme" class="flex items-center bg-bg-1 rounded-md p-0.5">
              <button
                :class="[
                  'w-[22px] h-[22px] flex items-center justify-center transition-all',
                  themeStore.theme === 'dark' ? 'bg-bg-3 rounded-md' : ''
                ]"
                @click.stop="themeStore.setTheme('dark')"
              >
                <MoonIcon class="w-[15px] h-[15px]" />
              </button>
              <button
                :class="[
                  'w-[22px] h-[22px] flex items-center justify-center transition-all',
                  themeStore.theme === 'light' ? 'bg-bg-3 rounded-md' : ''
                ]"
                @click.stop="themeStore.setTheme('light')"
              >
                <SunIcon class="w-[15px] h-[15px]" />
              </button>
            </div>
            <div v-else class="w-5 h-5 bg-opacity-10 rounded-md flex items-center justify-center">
              <ArrowRightIcon class="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Referral & get -->
    <div class="bg-bg-2 rounded-lg mx-3.5 mb-2.5 px-3 py-2.5">
      <div class="flex items-center gap-2.5">
        <img :src="referralIcon" alt="Referral" class="w-[56px] h-[53px]" />
        <div class="flex-1">
          <div class="mb-[5px]">
            <span class="text-text-2 text-[12px]">{{ t('personalCenter.referralGet') }}</span>
            <span class="text-text-1 text-xs font-[700] mx-[1px]">US$1,000.00 + 25%</span>
            <span class="text-text-2 text-[12px]">{{ t('personalCenter.commission') }}</span>
          </div>
          <div
            class="flex items-center bg-input-3 border border-input-2 rounded-lg h-[40px] px-2.5"
          >
            <span class="text-theme-primary text-xs truncate flex-1"
              >https://www.baidu.com/jh/ocja...</span
            >
            <button
              class="bg-bg-3 text-text-1 text-xs rounded-md px-1.5 py-[7px]"
              @click="copyReferralLink"
            >
              {{ t('personalCenter.copy') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Support 和 Leave Feedback -->
    <div class="mx-3.5 mb-2.5">
      <div class="overflow-hidden">
        <div
          v-for="item in supportMenus"
          :key="item.id"
          class="flex items-center justify-between px-3 py-[10px] mb-2.5 bg-bg-2 rounded-lg"
          @click="item.handler"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="w-5 h-5" />
            <span class="text-text-1 text-sm font-[700]">{{ item.name }}</span>
          </div>
          <div class="w-5 h-5 bg-opacity-10 rounded-md flex items-center justify-center">
            <ArrowRightIcon class="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Join Our Community -->
    <div class="mx-3.5 mb-4 bg-bg-2 rounded-lg px-3 py-2.5">
      <h3 class="text-text-1 text-sm font-bold mb-3.5 text-center">
        {{ t('personalCenter.joinCommunity') }}
      </h3>
      <div class="flex items-center justify-between gap-2">
        <button
          v-for="social in socialLinks"
          :key="social.id"
          class="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md bg-bg-5"
          @click="social.handler"
        >
          <component :is="social.icon" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Sign Out -->
    <div class="mx-3.5 mb-[30px] flex items-center justify-center">
      <button class="flex items-center justify-center gap-1" @click="handleSignOut">
        <SignOut class="w-5 h-5" />
        <span class="text-sm font-[700] text-text-1">{{ t('personalCenter.signOut') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { navigateTo } from '@/utils/router'
import { formatBalance, getCurrentCurrency, getLanguageCode } from '@/utils/locale'
import { showToast } from 'vant'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import CopyIcon from '@/static/svg/copy.svg?component'
import MoonIcon from '@/static/svg/personalCenter/icon32.svg?component'
import SunIcon from '@/static/svg/personalCenter/icon33.svg?component'
import DepositIocn from '@/static/svg/personalCenter/icon1.svg?component'
import WithdrawIcon from '@/static/svg/personalCenter/icon2.svg?component'
import SignOut from '@/static/svg/personalCenter/icon18.svg?component'
import vipBG from '@/static/img/personalCenter/vigBG.png'
import vipLeft from '@/static/img/personalCenter/vip_left.png'
import vipIcon from '@/static/img/personalCenter/vip.png'
import vipRight from '@/static/img/personalCenter/vip_right.png'
import balanceIcon from '@/static/img/personalCenter/balance.png'
import referralIcon from '@/static/img/personalCenter/yaoqing.png'

const router = useRouter()
const { t } = useI18n()
const themeStore = useThemeStore()
const userStore = useUserStore()

// 动态导入图标
const getIcon = (iconNumber: number) => {
  return defineAsyncComponent(
    () => import(`@/static/svg/personalCenter/icon${iconNumber}.svg?component`)
  )
}

// 用户信息
const userInfo = ref<any>(null)
const acctInfo = ref<any>(null)

// 头像 URL
const avatarUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_GAME_IMAGE_BASE_URL
  const headPortrait = userInfo.value?.headPortrait

  if (headPortrait && baseUrl) {
    return `${baseUrl}${headPortrait}`
  }
  return '/src/static/img/home/avatar.png'
})

// VIP 等级
const vipLevel = computed(() => userInfo.value?.vipId || 0)

// VIP 进度
const vipProgress = computed(() => {
  return 65
})

// 总余额
const totalBalance = computed(() => {
  const balance = userInfo.value?.balancePhp || 0
  return formatBalance(balance, 2)
})

// 当前语言
const currentLanguage = computed(() => {
  const lang = getLanguageCode()
  return lang === 'zh' ? t('personalCenter.chinese') : t('personalCenter.english')
})

// 当前货币
const currentCurrency = computed(() => {
  return getCurrentCurrency()
})

// 返回
const handleBack = () => {
  router.back()
}

// 快捷操作
const quickActions = computed(() => [
  {
    id: 'buy',
    name: t('personalCenter.buy'),
    icon: getIcon(3),
    handler: () => console.log('Buy clicked')
  },
  {
    id: 'swap',
    name: t('personalCenter.swap'),
    icon: getIcon(4),
    handler: () => console.log('Swap clicked')
  },
  {
    id: 'vault-pro',
    name: t('personalCenter.vaultPro'),
    icon: getIcon(5),
    handler: () => console.log('Vault Pro clicked')
  },
  {
    id: 'transaction',
    name: t('personalCenter.transaction'),
    icon: getIcon(6),
    handler: () => console.log('Transaction clicked')
  },
  {
    id: 'rollover',
    name: t('personalCenter.rollover'),
    icon: getIcon(7),
    handler: () => console.log('Rollover clicked')
  },
  {
    id: 'bet-history',
    name: t('personalCenter.betHistory'),
    icon: getIcon(8),
    handler: () => navigateTo('/bet-history')
  }
])

// 设置菜单
const settingsMenus = computed(() => [
  {
    id: 'notification',
    name: t('personalCenter.notification'),
    icon: getIcon(9),
    badge: '2',
    handler: () => console.log('Notification clicked')
  },
  {
    id: 'refer-earn',
    name: t('personalCenter.referEarn'),
    icon: getIcon(10),
    handler: () => console.log('Refer and Earn clicked')
  },
  {
    id: 'affiliate',
    name: t('personalCenter.affiliate'),
    icon: getIcon(11),
    handler: () => console.log('Affiliate clicked')
  }
])

// 复制推荐链接
const copyReferralLink = async () => {
  const link = 'https://www.baidu.com/jh/ocja...'
  try {
    await navigator.clipboard.writeText(link)
    showToast({
      message: t('personalCenter.copySuccess'),
      position: 'top'
    })
  } catch (err) {
    console.error(err)
  }
}

// 全局设置
const globalSettings = computed(() => [
  {
    id: 'global-setting',
    name: t('personalCenter.globalSetting'),
    icon: getIcon(12),
    rightIcon: getIcon(31),
    handler: () => console.log('Global Setting clicked')
  },
  {
    id: 'language',
    name: t('personalCenter.language'),
    icon: getIcon(13),
    value: currentLanguage.value,
    handler: () => console.log('Language clicked')
  },
  {
    id: 'currency',
    name: t('personalCenter.currency'),
    icon: getIcon(14),
    value: currentCurrency.value,
    handler: () => console.log('Currency clicked')
  },
  {
    id: 'theme',
    name: t('personalCenter.theme'),
    icon: getIcon(15),
    isTheme: true,
    handler: () => {}
  }
])

// 支持菜单
const supportMenus = computed(() => [
  {
    id: 'live-support',
    name: t('personalCenter.liveSupport'),
    icon: getIcon(16),
    handler: () => console.log('Live Support clicked')
  },
  {
    id: 'leave-feedback',
    name: t('personalCenter.leaveFeedback'),
    icon: getIcon(17),
    handler: () => console.log('Leave Feedback clicked')
  }
])

// 社交链接
const socialLinks = computed(() => [
  {
    id: 'telegram',
    icon: getIcon(41),
    handler: () => console.log('Telegram clicked')
  },
  {
    id: 'youtube',
    icon: getIcon(42),
    handler: () => console.log('YouTube clicked')
  },
  {
    id: 'facebook',
    icon: getIcon(43),
    handler: () => console.log('Facebook clicked')
  },
  {
    id: 'twitter',
    icon: getIcon(44),
    handler: () => console.log('Twitter clicked')
  },
  {
    id: 'discord',
    icon: getIcon(45),
    handler: () => console.log('Discord clicked')
  },
  {
    id: 'bitcoin',
    icon: getIcon(46),
    handler: () => console.log('Bitcoin clicked')
  },
  {
    id: 'instagram',
    icon: getIcon(47),
    handler: () => console.log('Instagram clicked')
  },
  {
    id: 'tiktok',
    icon: getIcon(48),
    handler: () => console.log('TikTok clicked')
  }
])

// 退出登录
const handleSignOut = () => {
  userStore.logout()
}

// 加载用户信息
const loadUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo)
    } catch (error) {
      console.error(error)
      userInfo.value = null
    }
  }

  const storedAcctInfo = localStorage.getItem('acctInfo')
  if (storedAcctInfo) {
    try {
      acctInfo.value = JSON.parse(storedAcctInfo)
    } catch (error) {
      console.error(error)
      acctInfo.value = null
    }
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped></style>
