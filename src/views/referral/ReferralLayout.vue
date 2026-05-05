<template>
  <div class="max-w-[1336px] mx-auto pt-[14px]">
    <h2 class="mb-4 text-xl font-[700] text-text-1">{{ props.pageTitle }}</h2>

    <div class="flex justify-center gap-6">
      <!-- 左侧菜单 -->
      <aside class="w-[280px] flex-shrink-0">
        <div class="rounded-xl bg-bg-2 p-4">
          <nav class="space-y-2.5">
            <div
              v-for="item in menuItems"
              :key="item.key"
              :class="[
                'flex cursor-pointer items-center gap-4 rounded-lg px-4 py-2 text-base transition-all',
                props.currentTab === item.key
                  ? 'bg-theme-primary text-text-4 font-bold'
                  : 'text-text-2'
              ]"
              @click="handleMenuClick(item.key, item.path)"
            >
              <component
                :is="item.icon"
                :class="['h-6 w-6', props.currentTab === item.key ? 'text-text-4' : 'text-text-2']"
              />

              <span>{{ item.label }}</span>
            </div>
          </nav>
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>
  </div>

  <CommonFooter class="mt-[40px]" />
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import CommonFooter from '@/components/commonFooter.vue'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import ReferralIcon from '@/static/svg/side/newIcon/referral.svg?component'
import TaskCenterIcon from '@/static/svg/side/newIcon/task-center.svg?component'
import MyOrdersIcon from '@/static/svg/side/newIcon/my-orders.svg?component'
import LegalIcon from '@/static/svg/side/newIcon/legal.svg?component'
import AboutIcon from '@/static/svg/side/newIcon/about.svg?component'

type ReferralDesktopTab = 'referral' | 'tasks' | 'details' | 'rules' | 'guide'

interface Props {
  currentTab: ReferralDesktopTab
  pageTitle: string
}

interface ReferralDesktopMenuItem {
  key: ReferralDesktopTab
  label: string
  path?: string
  icon: unknown
}

const props = defineProps<Props>()

const { t } = useI18n()

const menuItems = computed<ReferralDesktopMenuItem[]>(() => [
  {
    key: 'referral',
    label: t('referral.title'),
    path: '/referral',
    icon: markRaw(ReferralIcon)
  },
  {
    key: 'tasks',
    label: t('referral.taskPage.title'),
    path: '/referral/tasks',
    icon: markRaw(TaskCenterIcon)
  },
  {
    key: 'details',
    label: t('referral.detailsPage.title'),
    path: '/referral/details',
    icon: markRaw(MyOrdersIcon)
  },
  {
    key: 'rules',
    label: t('referral.rulesPage.title'),
    path: '/referral/rules',
    icon: markRaw(LegalIcon)
  },
  {
    key: 'guide',
    label: t('referral.h5.quickActions.guide'),
    icon: markRaw(AboutIcon)
  }
])

/**
 * 处理左侧菜单点击。
 */
function handleMenuClick(tab: ReferralDesktopTab, path?: string) {
  if (tab === 'guide') {
    globalShowToast({
      message: `${t('referral.h5.quickActions.guide')} ${t('referral.comingSoon')}`,
      type: 'success'
    })
    return
  }

  if (!path) {
    return
  }

  navigateTo(path)
}
</script>
