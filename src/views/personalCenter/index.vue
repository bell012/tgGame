<template>
  <div
    class="personal-center-mobile-page h-full min-h-0 w-full overflow-y-auto overscroll-contain bg-bg-1"
  >
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
        <div class="relative mr-3.5 h-[55px] w-[55px] overflow-visible">
          <div class="absolute overflow-hidden rounded-full inset-[4px] border-4 border-opacity-15">
            <img :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover" />
          </div>
        </div>
        <div class="flex flex-1 items-center justify-between">
          <div class="flex flex-col">
            <h2 class="text-text-1 text-base font-bold mb-1">
              {{ userInfo?.nickName || '-' }}
            </h2>
            <div class="flex items-center">
              <span class="text-text-2 text-xs font-[500]">ID: {{ displayLinkCode }}</span>
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
        class="relative rounded-[10px] overflow-hidden w-full h-[78px] flex justify-between items-start bg-gradient-to-r from-[#0D934D] to-[#084524]"
        @click="handleVip"
      >
        <div class="flex min-w-0 flex-1 flex-col">
          <div class="mb-[11px] flex w-full min-w-0 items-center justify-between">
            <div
              class="flex items-center px-3 py-[5px] rounded-[10px_0] bg-gradient-to-r from-[#10AC5D] to-[#018B6D]"
            >
              <SmartImage :src="vipLeft" alt="VIP" class="w-[25px] h-[16px] mr-[5px]" />
              <SmartImage :src="vipIcon" alt="VIP" class="w-[32px] h-[14px]" />
              <span class="text-common-100 text-lg font-bold leading-none italic">{{
                vipLevel
              }}</span>
            </div>
          </div>

          <div class="flex w-full min-w-0 items-center justify-between pl-[8px]">
            <div class="w-full min-w-0">
              <div class="flex w-full min-w-0 items-center justify-between mb-1">
                <span class="min-w-0 flex-1 text-theme-primary text-xs"
                  >{{
                    isMaxVipLevel
                      ? t('personalCenter.vipLevelGoalCompleted')
                      : `${t('personalCenter.upgrade')}: ${t('personalCenter.validBet')} ${remainingBetAmount} ${t('personalCenter.deposit')} ${remainingRechargeAmount}`
                  }}
                </span>
                <span class="shrink-0 text-theme-primary text-xs font-bold"
                  >VIP {{ nextVipLevel }}</span
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
          <SmartImage :src="vipRight" alt="Diamond" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <!-- Total Balance -->
    <div class="mb-2.5 mx-3.5">
      <div class="flex items-center justify-between bg-bg-2 py-2.5 px-3.5 rounded-lg">
        <div class="flex items-center gap-2">
          <SmartImage :src="balanceIcon" alt="Balance" class="w-5 h-5" />
          <span class="text-text-2 text-sm">{{ t('personalCenter.totalBalance') }}</span>
        </div>
        <span class="text-text-1 text-lg font-bold">{{ currentBalanceText }}</span>
      </div>
    </div>

    <!-- Buy 到 Bet History -->
    <div class="mx-3.5 mb-2.5">
      <div class="bg-bg-2 p-2.5 rounded-lg overflow-hidden">
        <div class="grid grid-cols-2 gap-2.5">
          <button
            class="bg-bg-3 h-[34px] rounded-lg text-xs font-bold text-text-1 flex items-center justify-center"
            @click.stop="navigateTo('/deposit')"
          >
            <DepositIocn class="w-5 h-5 text-text-1" />
            <div class="ml-[5px]">
              {{ t('personalCenter.deposit') }}
            </div>
          </button>
          <button
            class="bg-bg-3 h-[34px] rounded-lg text-xs font-bold text-text-1 flex items-center justify-center"
            @click.stop="navigateTo('/withdraw')"
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
        <SmartImage :src="referralIcon" alt="Referral" class="w-[56px] h-[53px]" />
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
        :selected-currency="currentCurrencyCode"
        :options="currencyOptions"
        @select="handleCurrencySelect"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import SignOutPopup from '@/components/common/SignOutPopup.vue'
import balanceIcon from '@/static/img/personalCenter/balance.png'
import vipIcon from '@/static/img/personalCenter/vip.png'
import vipLeft from '@/static/img/personalCenter/vip_left.png'
import vipRight from '@/static/img/personalCenter/vip_right.png'
import referralIcon from '@/static/img/personalCenter/yaoqing.png'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import CopyIcon from '@/static/svg/copy.svg?component'
import DepositIocn from '@/static/svg/personalCenter/icon1.svg?component'
import SignOut from '@/static/svg/personalCenter/icon18.svg?component'
import WithdrawIcon from '@/static/svg/personalCenter/icon2.svg?component'
import MoonIcon from '@/static/svg/personalCenter/icon32.svg?component'
import SunIcon from '@/static/svg/personalCenter/icon33.svg?component'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useLocaleStore } from '@/stores/locale'
import { useNotificationIndicatorStore } from '@/stores/notificationIndicator'
import { useThemeStore } from '@/stores/theme'
import { useTradeMessageSyncStore } from '@/stores/tradeMessageSync'
import { useUserStore } from '@/stores/user'
import { useVipStore } from '@/stores/vip'
import {
  formatBalance,
  getLocaleLabel,
  getLocaleOptions,
  type Locale,
  type LocaleOption
} from '@/utils/locale'
import { resolveProfileAvatarUrl } from '@/utils/profile-customization'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast.ts'
import CurrencyPopup from '@/views/personalCenter/components/CurrencyPopup.vue'
import LanguagePopup from '@/views/personalCenter/components/LanguagePopup.vue'
import ReferralPopup from '@/views/personalCenter/components/ReferralPopup.vue'
import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useI18n()
const localeStore = useLocaleStore()
const notificationIndicatorStore = useNotificationIndicatorStore()
const themeStore = useThemeStore()
const tradeMessageSyncStore = useTradeMessageSyncStore()
const userStore = useUserStore()
const vipStore = useVipStore()
const { userInfo } = storeToRefs(userStore)
const { currentCurrencyCode, currentBalanceText, currencyOptions, setDisplayCurrency } =
  useDisplayCurrency()
const { totalUnreadCount } = storeToRefs(notificationIndicatorStore)
const { myVipInfo, vipList } = storeToRefs(vipStore)

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

const showReferralPopup = ref(false)
const showLanguagePopup = ref(false)
const showCurrencyPopup = ref(false)
const showSignOutPopup = ref(false)

const referralRewardText = ref('US$1,000.00')
const referralRewardText2 = ref('15%')
const referralLink = ref('https://www.baidu.com/jh/ocja...')

// 头像 URL
const avatarUrl = computed(() => {
  return resolveProfileAvatarUrl(userInfo.value?.headPortrait)
})

const displayLinkCode = computed(() => {
  return userInfo.value?.rowId || '-'
})

// VIP 等级
const vipLevel = computed(() => myVipInfo.value?.vipId || userInfo.value?.vipId || 0)

// VIP 列表中的最高等级
const maxVipLevel = computed(() => {
  if (!vipList.value.length) {
    return vipLevel.value
  }

  return vipList.value.reduce((maxVipId, item) => Math.max(maxVipId, item.vipId ?? 0), 0)
})

const isMaxVipLevel = computed(() => {
  return vipList.value.length > 0 && vipLevel.value === maxVipLevel.value
})

const vipTargetConfig = computed(() => vipStore.getVipTargetConfig(vipLevel.value))

const getClampedRatio = (currentValue: number, targetValue: number) => {
  if (!targetValue || targetValue <= 0) {
    return 0
  }

  return Math.min(Math.max(currentValue / targetValue, 0), 1)
}

/**
 * 计算当前 VIP 升级还差多少有效投注，按当前等级配置减去 myVipInfo 当前投注值。
 */
const remainingBetAmount = computed(() => {
  if (
    vipTargetConfig.value?.betAmountLine === undefined ||
    vipTargetConfig.value?.betAmountLine === null
  ) {
    return '-'
  }

  return formatBalance(
    Math.max(vipTargetConfig.value.betAmountLine - Number(myVipInfo.value?.betAmount ?? 0), 0),
    2
  )
})

/**
 * 计算当前 VIP 升级还差多少存款，按当前等级配置减去 myVipInfo 当前存款值。
 */
const remainingRechargeAmount = computed(() => {
  if (
    vipTargetConfig.value?.rechargeAmount === undefined ||
    vipTargetConfig.value?.rechargeAmount === null
  ) {
    return '-'
  }

  return formatBalance(
    Math.max(
      vipTargetConfig.value.rechargeAmount - Number(myVipInfo.value?.rechargeAmount ?? 0),
      0
    ),
    2
  )
})

// VIP 进度
const vipProgress = computed(() => {
  if (isMaxVipLevel.value) {
    return 100
  }

  const betProgress = getClampedRatio(
    myVipInfo.value?.betAmount ?? 0,
    vipTargetConfig.value?.betAmountLine ?? 0
  )
  const rechargeProgress = getClampedRatio(
    myVipInfo.value?.rechargeAmount ?? 0,
    vipTargetConfig.value?.rechargeAmount ?? 0
  )

  return Math.min(betProgress * 50 + rechargeProgress * 50, 100)
})

// 跳转到vip路由
const handleVip = () => {
  navigateTo('/vip')
}

// 下一个等级
const nextVipLevel = computed(() => {
  return Math.min(vipLevel.value + 1, maxVipLevel.value)
})

const notificationUnreadBadge = computed(() => {
  if (totalUnreadCount.value <= 0) {
    return ''
  }

  return totalUnreadCount.value > 99 ? '99+' : String(totalUnreadCount.value)
})

// 当前语言
const currentLanguage = computed(() => {
  return getLocaleLabel(localeStore.currentLanguage)
})

const languageOptions = computed<LocaleOption[]>(() => getLocaleOptions())

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
    handler: () => navigateTo('/transaction')
  },
  {
    id: 'rollover',
    name: t('personalCenter.rollover'),
    icon: getIcon(7),
    handler: () => navigateTo('/rollover')
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
    badge: notificationUnreadBadge.value,
    handler: () => navigateTo('/menu/notifications')
  },
  {
    id: 'refer-earn',
    name: t('personalCenter.referEarn'),
    icon: getIcon(10),
    handler: () => console.log('Refer and Earn clicked')
  },
  {
    id: 'myVouchers',
    name: t('personalCenter.myVouchers'),
    icon: getIcon(84),
    handler: () => navigateTo('/myVouchers')
  },
  {
    id: 'rebate',
    name: t('personalCenter.rebate'),
    icon: getIcon(3),
    handler: () => navigateTo('/personal-center/rebate')
  },
  {
    id: 'affiliate',
    name: t('personalCenter.affiliate'),
    icon: getIcon(11),
    handler: () => console.log('Affiliate clicked')
  }
])

// 复制推荐链接
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
    globalShowToast(t('personalCenter.copySuccess'))
  } catch (err) {
    if (fallbackCopyText(value)) {
      globalShowToast(t('personalCenter.copySuccess'))
      return
    }

    console.error(err)
  }
}

const copyReferralLink = async () => {
  await copyText(referralLink.value)
}

const copyMemberId = async () => {
  await copyText(String(userInfo.value?.rowId ?? ''))
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
    handler: () => navigateTo('/settings')
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
    value: currentCurrencyCode.value,
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
    handler: () => navigateTo('/personal-center/feedback')
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
  setDisplayCurrency(code)
}

const initializePersonalCenter = async () => {
  userStore.syncStoredUserData()
  await Promise.all([userStore.refreshCurrentUserData(), vipStore.refreshVipData()])
  await Promise.all([
    notificationIndicatorStore.refreshStaticUnread(),
    tradeMessageSyncStore.forceSyncTradeMessages()
  ])
}

onMounted(() => {
  void initializePersonalCenter()
})
</script>

<style scoped>
.personal-center-mobile-page {
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
