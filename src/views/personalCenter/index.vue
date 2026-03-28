<template>
  <div class="h-full w-full bg-bg-1 overflow-y-auto">
    <div class="flex items-center h-[49px] px-3.5">
      <button
        @click="handleBack"
        class="w-[33px] h-[33px] bg-opacity-5 rounded-lg flex items-center justify-center"
      >
        <ArrowLeftIcon class="w-4 h-4 text-text-1" />
      </button>
    </div>

    <!-- 用户信息区域 -->
    <div class="p-3.5">
      <div class="mb-3.5 flex items-center cursor-pointer" @click="goToMyProfile">
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
              <button class="p-1" @click.stop="copyMemberId">
                <CopyIcon class="w-4 h-4 text-text-2" />
              </button>
            </div>
          </div>
          <div class="bg-opacity-5 rounded-md w-5 h-5 flex items-center justify-center">
            <ArrowRightIcon class="w-3 h-3 text-text-3" />
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
        <span class="text-text-1 text-lg font-bold">{{ totalBalance }}</span>
      </div>
    </div>

    <!-- Buy 到 Bet History -->
    <div class="mx-3.5 mb-2.5">
      <div class="bg-bg-2 p-2.5 rounded-lg overflow-hidden">
        <div class="grid grid-cols-2 gap-2.5">
          <button
            class="bg-bg-3 h-[34px] rounded-lg text-xs font-bold text-text-1 flex items-center justify-center"
          >
            <DepositIocn class="w-5 h-5 text-text-1" />
            <div class="ml-[5px]">
              {{ t('personalCenter.deposit') }}
            </div>
          </button>
          <button
            class="bg-bg-3 h-[34px] rounded-lg text-xs font-bold text-text-1 flex items-center justify-center"
          >
            <WithdrawIcon class="w-5 h-5 text-text-1" />
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
              <component :is="item.icon" class="w-5 h-5 text-text-2" />
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
            <component :is="item.icon" class="w-5 h-5 text-text-2" />
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
              <ArrowRightIcon class="w-3 h-3 text-text-2" />
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
            <component :is="item.icon" class="w-5 h-5 text-text-2" />
            <span class="text-text-1 text-sm font-[700]">{{ item.name }}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <component v-if="item.rightIcon" :is="item.rightIcon" class="w-3.5 h-3.5 text-text-2" />
            <span v-if="item.value" class="text-text-2 text-xs">{{ item.value }}</span>
            <div v-if="item.isTheme" class="flex items-center bg-bg-1 rounded-md p-0.5">
              <button
                :class="[
                  'w-[22px] h-[22px] flex items-center justify-center transition-all',
                  themeStore.theme === 'dark' ? 'bg-bg-3 rounded-md' : ''
                ]"
                @click.stop="themeStore.setTheme('dark')"
              >
                <MoonIcon class="w-[15px] h-[15px] text-text-2" />
              </button>
              <button
                :class="[
                  'w-[22px] h-[22px] flex items-center justify-center transition-all',
                  themeStore.theme === 'light' ? 'bg-bg-3 rounded-md' : ''
                ]"
                @click.stop="themeStore.setTheme('light')"
              >
                <SunIcon class="w-[15px] h-[15px] text-text-2" />
              </button>
            </div>
            <div v-else class="w-5 h-5 bg-opacity-10 rounded-md flex items-center justify-center">
              <ArrowRightIcon class="w-3 h-3 text-text-2" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Referral & get -->
    <div class="bg-bg-2 rounded-lg mx-3.5 mb-2.5 px-3 py-2.5" @click="openReferralPopup">
      <div class="flex items-center gap-2.5">
        <img :src="referralIcon" alt="Referral" class="w-[56px] h-[53px]" />
        <div class="flex-1">
          <div class="mb-[5px] flex items-center">
            <span class="text-text-2 text-[12px]">{{ t('personalCenter.referralGet') }}</span>
            <div class="text-text-1 text-xs font-[700] mx-[1px]">
              <span class="inline-block">{{ referralRewardText }}</span>
              <span class="mx-[5px] inline-block">+</span>
              <span class="inline-block">{{ referralRewardText2 }}</span>
            </div>
            <span class="text-text-2 text-[12px]">{{ t('personalCenter.commission') }}</span>
          </div>
          <div
            class="flex items-center bg-input-3 border border-input-2 rounded-lg h-[40px] px-2.5"
          >
            <span class="text-theme-primary text-xs truncate flex-1">{{ referralLink }}</span>
            <button
              class="bg-bg-3 text-text-1 text-xs rounded-md px-1.5 py-[7px]"
              @click.stop="copyReferralLink"
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
            <component :is="item.icon" class="w-5 h-5 text-text-2" />
            <span class="text-text-1 text-sm font-[700]">{{ item.name }}</span>
          </div>
          <div class="w-5 h-5 bg-opacity-10 rounded-md flex items-center justify-center">
            <ArrowRightIcon class="w-3 h-3 text-text-2" />
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
          <component :is="social.icon" class="w-5 h-5 text-text-1" />
        </button>
      </div>
    </div>

    <!-- Sign Out -->
    <div class="mx-3.5 mb-[30px] flex items-center justify-center">
      <button class="flex items-center justify-center gap-1" @click="openSignOutPopup">
        <SignOut class="w-5 h-5 text-text-1" />
        <span class="text-sm font-[700] text-text-1">{{ t('personalCenter.signOut') }}</span>
      </button>
    </div>

    <SignOutPopup v-model:visible="showSignOutPopup" @confirm="confirmSignOut" />

    <Teleport to="body">
      <ReferralPopup
        v-model:visible="showReferralPopup"
        :reward-text="referralRewardText"
        :reward-text2="referralRewardText2"
        :link="referralLink"
        @copy="copyReferralLink"
      />
    </Teleport>

    <Teleport to="body">
      <LanguagePopup
        v-model:visible="showLanguagePopup"
        :selected-language="localeStore.currentLanguage"
        :options="languageOptions"
        @select="handleLanguageSelect"
      />
    </Teleport>

    <Teleport to="body">
      <CurrencyPopup
        v-model:visible="showCurrencyPopup"
        :selected-currency="currentCurrency"
        :options="currencyOptions"
        @select="handleCurrencySelect"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import SignOutPopup from '@/components/common/SignOutPopup.vue'
import type { QueryAcctInfoResult, SelectMemberResult } from '@/api/interface/user'
import CurrencyPopup from '@/views/personalCenter/components/CurrencyPopup.vue'
import LanguagePopup from '@/views/personalCenter/components/LanguagePopup.vue'
import ReferralPopup from '@/views/personalCenter/components/ReferralPopup.vue'
import { useLocaleStore } from '@/stores/locale'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { applyProfileCustomization } from '@/utils/profile-customization'
import { navigateTo } from '@/utils/router'
import {
  getCurrentCurrency,
  getFormattedBalance,
  getLocaleLabel,
  getLocaleOptions,
  type Locale,
  type LocaleOption
} from '@/utils/locale'
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
const localeStore = useLocaleStore()
const themeStore = useThemeStore()
const userStore = useUserStore()

type PersonalCenterUserInfo = Partial<SelectMemberResult> & {
  headPortrait?: string
}

const balanceFieldMap = {
  BRL: 'balanceBrl',
  CNY: 'balanceCny',
  IDR: 'balanceIdr',
  INR: 'balanceInr',
  JPY: 'balanceJpy',
  KRW: 'balanceKrw',
  MXN: 'balanceMxn',
  MYR: 'balanceMyr',
  PHP: 'balancePhp',
  SGD: 'balanceSgd',
  USD: 'balanceUsd',
  USDT: 'balanceUsdt',
  VND: 'balanceVnd'
} as const

type BalanceFieldKey = (typeof balanceFieldMap)[keyof typeof balanceFieldMap]
type BalanceCarrier = Partial<Record<BalanceFieldKey, number>> & { balance?: number }

const originalColorIconNumbers = new Set([16, 31])

// 动态导入图标
const getIcon = (iconNumber: number) => {
  if (originalColorIconNumbers.has(iconNumber)) {
    return defineAsyncComponent(
      () => import(`@/static/svg/personalCenter/icon${iconNumber}.svg?skipsvgo`)
    )
  }

  return defineAsyncComponent(
    () => import(`@/static/svg/personalCenter/icon${iconNumber}.svg?component`)
  )
}

// 用户信息
const userInfo = ref<PersonalCenterUserInfo | null>(null)
const acctInfo = ref<QueryAcctInfoResult | null>(null)

const showReferralPopup = ref(false)
const showLanguagePopup = ref(false)
const showCurrencyPopup = ref(false)
const showSignOutPopup = ref(false)

const referralRewardText = ref('US$1,000.00')
const referralRewardText2 = ref('15%')
const referralLink = ref('https://www.baidu.com/jh/ocja...')

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
const currentBalance = computed(() => {
  return (
    getBalanceByCurrency(acctInfo.value, currentCurrency.value) ??
    getBalanceByCurrency(userInfo.value, currentCurrency.value) ??
    acctInfo.value?.balancePhp ??
    userInfo.value?.balancePhp ??
    0
  )
})

const totalBalance = computed(() => {
  return getFormattedBalance(currentBalance.value, currentCurrency.value, 2)
})

// 当前语言
const currentLanguage = computed(() => {
  return getLocaleLabel(localeStore.currentLanguage)
})

// 当前货币
const currentCurrency = computed(() => {
  const selectedCurrency = localeStore.currentCurrency

  if (selectedCurrency && selectedCurrency !== 'none') {
    return selectedCurrency
  }

  return acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency()
})

const languageOptions = computed<LocaleOption[]>(() => getLocaleOptions())

const currencyOptions = computed(() => [
  {
    code: currentCurrency.value,
    balanceText: getFormattedBalance(currentBalance.value, currentCurrency.value, 2)
  }
])

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
const getBalanceByCurrency = (data: BalanceCarrier | null | undefined, currency: string) => {
  if (!data) return undefined

  const balanceKey = balanceFieldMap[currency.toUpperCase() as keyof typeof balanceFieldMap]

  if (balanceKey && typeof data[balanceKey] === 'number') {
    return data[balanceKey]
  }

  return typeof data.balance === 'number' ? data.balance : undefined
}

const fallbackCopyText = (value: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

const copyText = async (value?: string) => {
  if (!value) return

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
    } else if (!fallbackCopyText(value)) {
      throw new Error('Copy failed')
    }

    showToast({
      message: t('personalCenter.copySuccess'),
      position: 'middle',
      type: 'success'
    })
  } catch (err) {
    if (fallbackCopyText(value)) {
      showToast({
        message: t('personalCenter.copySuccess'),
        position: 'middle',
        type: 'success'
      })
      return
    }

    console.error(err)
  }
}

const copyReferralLink = async () => {
  await copyText(referralLink.value)
}

const copyMemberId = async () => {
  await copyText(userInfo.value?.memberId)
}

const goToMyProfile = () => {
  navigateTo('/personal-center/my-profile')
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
    handler: () => openLanguagePopup()
  },
  {
    id: 'currency',
    name: t('personalCenter.currency'),
    icon: getIcon(14),
    value: currentCurrency.value,
    handler: () => openCurrencyPopup()
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
const confirmSignOut = () => {
  userStore.logout()
}

const openSignOutPopup = () => {
  showSignOutPopup.value = true
}

const openReferralPopup = () => {
  showReferralPopup.value = true
}

const openLanguagePopup = () => {
  showLanguagePopup.value = true
}

const openCurrencyPopup = () => {
  showCurrencyPopup.value = true
}

const handleLanguageSelect = (code: Locale) => {
  localeStore.setLanguage(code)
}

const handleCurrencySelect = (code: string) => {
  localeStore.setCurrency(code)
}

const parseStoredItem = <T,>(key: string): T | null => {
  const storedValue = localStorage.getItem(key)

  if (!storedValue) {
    return null
  }

  try {
    return JSON.parse(storedValue) as T
  } catch (error) {
    console.error(error)
    return null
  }
}

// 加载用户信息
const loadUserInfo = () => {
  userInfo.value = applyProfileCustomization(parseStoredItem<PersonalCenterUserInfo>('userInfo'))
  acctInfo.value = parseStoredItem<QueryAcctInfoResult>('acctInfo')
}

const refreshAcctInfo = async () => {
  try {
    const response = await Api.user.queryAcctInfo({})
    if (response?.result) {
      acctInfo.value = response.result
      localStorage.setItem('acctInfo', JSON.stringify(response.result))
    }
    return response?.result
  } catch (error) {
    console.error(error)
    return null
  }
}

const refreshUserInfo = async (memberId: string) => {
  try {
    const response = await Api.user.selectMember({ memberId })
    if (response?.result) {
      const mergedUserInfo = applyProfileCustomization({
        ...(userInfo.value ?? {}),
        ...response.result
      })
      userInfo.value = mergedUserInfo
      localStorage.setItem('userInfo', JSON.stringify(mergedUserInfo))
    }
  } catch (error) {
    console.error(error)
  }
}

const initializePersonalCenter = async () => {
  loadUserInfo()

  const storedMemberId = userInfo.value?.memberId || acctInfo.value?.memberId

  if (storedMemberId) {
    await Promise.all([refreshAcctInfo(), refreshUserInfo(storedMemberId)])
    return
  }

  const latestAcctInfo = await refreshAcctInfo()
  const memberId = latestAcctInfo?.memberId || acctInfo.value?.memberId

  if (memberId) {
    await refreshUserInfo(memberId)
  }
}

onMounted(() => {
  void initializePersonalCenter()
})
</script>

<style scoped></style>
