<template>
  <section class="fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1 font-inter">
    <H5Header
      :title="t('betDetails.title')"
      :show-sort="true"
      :right-icon="KefuIcon"
      @sort="openOnlineCustomer"
    />
    <main class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5">
      <HistoryDetail v-if="betDetail" :key="betDetail.id" :item="betDetail" />
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useOnlineCustomerService } from '@/composables/useOnlineCustomerService'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { navigateTo } from '@/utils/router'
import { useUserStore } from '@/stores/user'
import type { SportsBetHistoryWager } from '@/api/interface/sport'
import KefuIcon from '@/static/svg/vip/kefu.svg?component'
import HistoryDetail from '../bet-history/components/HistoryDetail.vue'
import { mapHistoryWager } from '../bet-history/shared'

const { t } = useI18n()
const route = useRoute()
const { currentCurrencyCode } = useDisplayCurrency()
const userStore = useUserStore()
const detailOwner = computed(() =>
  JSON.stringify([
    userStore.userInfo?.memberId,
    userStore.acctInfo?.memberId,
    currentCurrencyCode.value
  ])
)
const { open: openOnlineCustomer } = useOnlineCustomerService()
usePageScrollLock(() => true)

// 详情只消费列表携带的当前订单，不将状态文字作为提前结算按钮。
const source = computed(() => {
  const id = String(route.params.id)
  if (history.state?.sportsBetOwner && history.state.sportsBetOwner !== detailOwner.value)
    return null
  const raw: unknown = history.state?.sportsBetData ?? history.state?.data
  try {
    const data: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (
      !data ||
      typeof data !== 'object' ||
      !('wid' in data) ||
      String(data.wid) !== id ||
      !('wil' in data) ||
      !Array.isArray(data.wil)
    )
      return null
    return data as SportsBetHistoryWager
  } catch {
    return null
  }
})
const betDetail = computed(() =>
  source.value ? mapHistoryWager(source.value, currentCurrencyCode.value, t) : null
)
if (!source.value) navigateTo('/sports/bet-history', { replace: true })
watch(detailOwner, () => navigateTo('/sports/bet-history', { replace: true }))
</script>
