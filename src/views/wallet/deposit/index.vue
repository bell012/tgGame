<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header :title="t('deposit.title')" showSort :rightIcon="DetailsIcon" />
      <div class="flex-1 min-h-0">
        <depositContentPanel v-model="tabType" class="h-full" />
      </div>
    </div>
    <div v-else class="max-w-[1336px] mx-auto">
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
                <component :is="item.icon" class="w-6 h-6" />
                {{ item.label }}
              </div>
            </nav>
          </div>
        </aside>

        <!-- 右侧内容区 -->
        <main class="flex-1 min-w-0">
          <div class="overflow-hidden">
            <personalCenterDepositContentPanel />
          </div>
        </main>
      </div>

      <!-- 公共底部 -->
      <CommonFooter class="mt-[40px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Header from '@/components/common/H5Header.vue'
import depositContentPanel, {
  type DepositTabType
} from '@/components/deposit/deposit/depositContentPanel.vue'
import personalCenterDepositContentPanel from '@/components/deposit/deposit/personalCenterDepositContentPanel.vue'
import CommonFooter from '@/components/commonFooter.vue'
import BetSvg from '@/static/svg/bet.svg?component'
import DepositIocn from '@/static/svg/personalCenter/icon1.svg?component'
import WithdrawIcon from '@/static/svg/personalCenter/icon2.svg?component'
import DetailsIcon from '@/static/svg/deposit/order-details.svg?component'

const { t } = useI18n()

const isMobile = useIsMobile()
const tabType = ref<DepositTabType>('Crypto')
const currentTab = ref('deposit')
const menuItems = computed(() => [
  {
    path: '/bet-history',
    tab: 'bet-history',
    label: t('wallet.betHistory'),
    icon: BetSvg
  },
  {
    path: '/deposit',
    tab: 'deposit',
    label: t('wallet.deposit'),
    icon: DepositIocn
  },
  {
    path: '/withdraw',
    tab: 'withdraw',
    label: t('wallet.withdraw'),
    icon: WithdrawIcon
  }
])

const handleMenuClick = (path: string) => {
  navigateTo(path)
}
</script>

<style scoped lang="scss"></style>
