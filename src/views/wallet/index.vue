<template>
  <div class="max-w-[1336px] mx-auto">
    <h2 class="text-xl font-[700] text-text-1 mb-4">{{ $t('wallet.title') }}</h2>
    <div class="flex justify-center gap-6">
      <!-- 左侧菜单 -->
      <aside class="w-[280px] flex-shrink-0">
        <div class="bg-bg-2 rounded-xl p-4">
          <nav class="space-y-2.5">
            <div
              v-for="item in menuItems"
              :key="item.tab"
              :class="[
                'flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer transition-all text-base',
                currentTab === item.tab ? 'bg-theme-primary text-text-4 font-bold' : 'text-text-2'
              ]"
              @click="handleMenuClick(item.path)"
            >
              <component
                :is="item.icon"
                :class="['w-6 h-6', currentTab === item.tab ? 'text-text-4' : 'text-text-2']"
              />
              {{ item.label }}
            </div>
          </nav>
        </div>
      </aside>
      <!-- 右侧内容区 -->

      <main class="flex-1 min-w-0">
        <slot />
      </main>
    </div>

    <CommonFooter class="mt-[40px]" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import CommonFooter from '@/components/commonFooter.vue'
import BetSvg from '@/static/svg/bet.svg?component'
import DepositIocn from '@/static/svg/personalCenter/icon1.svg?component'
import WithdrawIcon from '@/static/svg/personalCenter/icon2.svg?component'
import OrderIcon from '@/static/svg/deposit/order-details.svg?component'
import Transaction from '@/static/svg/personalCenter/icon6.svg?component'
import Rollover from '@/static/svg/personalCenter/icon7.svg?component'
type WalletTab = 'bet-history' | 'deposit' | 'withdraw' | 'my-orders' | 'transaction' | 'rollover'

defineProps<{
  currentTab: WalletTab
}>()

const { t } = useI18n()

const menuItems = computed(() => [
  {
    path: '/bet-history',
    tab: 'bet-history' as WalletTab,
    label: t('wallet.betHistory'),
    icon: BetSvg
  },
  {
    path: '/deposit',
    tab: 'deposit' as WalletTab,
    label: t('wallet.deposit'),
    icon: DepositIocn
  },
  {
    path: '/withdraw',
    tab: 'withdraw' as WalletTab,
    label: t('wallet.withdraw'),
    icon: WithdrawIcon
  },
  {
    path: '/my-orders',
    tab: 'my-orders' as WalletTab,
    label: t('wallet.myOrders'),
    icon: OrderIcon
  },
  {
    path: '/transaction',
    tab: 'transaction' as WalletTab,
    label: t('personalCenter.transaction'),
    icon: Transaction
  },
  {
    path: '/rollover',
    tab: 'rollover' as WalletTab,
    label: t('wallet.rollover'),
    icon: Rollover
  }
])

const handleMenuClick = (path: string) => {
  navigateTo(path)
}
</script>

<style scoped lang="scss"></style>
