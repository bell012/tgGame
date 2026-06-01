<template>
  <div class="max-w-[1336px] mx-auto pt-[14px]">
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
  </div>

  <CommonFooter class="mt-[40px]" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import CommonFooter from '@/components/commonFooter.vue'
type VouchersTab = 'myVouchers' | 'voucherHistory'

defineProps<{
  currentTab: VouchersTab
}>()

const { t } = useI18n()

// 动态导入图标
const getIcon = (iconNumber: number) => {
  return defineAsyncComponent(() => import(`@/static/svg/vouchers/icon${iconNumber}.svg?component`))
}

const menuItems = computed(() => [
  {
    path: '/myVouchers',
    tab: 'myVouchers' as VouchersTab,
    label: t('vouchers.myVouchers'),
    icon: getIcon(1)
  },
  {
    path: '/voucherHistory',
    tab: 'voucherHistory' as VouchersTab,
    label: t('vouchers.voucherHistory'),
    icon: getIcon(2)
  }
])

const handleMenuClick = (path: string) => {
  navigateTo(path)
}
</script>

<style scoped lang="scss"></style>
