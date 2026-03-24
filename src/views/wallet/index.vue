<template>
  <div class="wallet-container flex gap-4">
    <!-- 左侧菜单 -->
    <aside class="w-[220px] flex-shrink-0">
      <div class="bg-bg-2 rounded-lg p-4">
        <!-- 钱包标题 -->
        <h2 class="text-xl font-bold text-text-1 mb-4 px-4">{{ $t('wallet.title') }}</h2>
        <nav class="space-y-1">
          <div
            v-for="item in menuItems"
            :key="item.tab"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all text-sm',
              currentTab === item.tab
                ? 'bg-bg-3 text-text-1 font-bold'
                : 'text-text-2 hover:bg-bg-3 hover:text-text-1'
            ]"
            @click="handleMenuClick(item.path)"
          >
            {{ item.label }}
          </div>
        </nav>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="flex-1 min-w-0">
      <div class="bg-bg-2 rounded-lg overflow-hidden">
        <BetHistoryPage v-if="currentTab === 'bet-history'" :is-pc-layout="true" />
      </div>
    </main>
  </div>

  <CommonFooter class="hidden sm:block" />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BetHistoryPage from './betHistory/index.vue'
import CommonFooter from '@/components/commonFooter.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 调试：组件挂载时打印信息
onMounted(() => {
  console.log('PersonalCenter mounted, current route:', route.path)
  console.log('Current tab:', currentTab.value)
})

// 当前选中的 tab（从 route.meta 中获取）
const currentTab = computed(() => {
  return (route.meta.walletTab as string) || 'bet-history'
})

// 菜单项
const menuItems = computed(() => [
  {
    path: '/wallet/bet-history',
    tab: 'bet-history',
    label: t('wallet.betHistory')
  }
])

// 菜单点击
const handleMenuClick = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
/* 自定义样式 */
</style>
