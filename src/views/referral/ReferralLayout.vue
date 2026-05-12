<template>
  <div class="max-w-[1336px] mx-auto pt-[14px]">
    <h2 class="mb-4 text-xl font-[700] text-text-1">{{ props.pageTitle }}</h2>

    <div class="flex justify-center gap-6 px-2">
      <!-- 左侧菜单 -->
      <aside class="w-[280px] flex-shrink-0">
        <div class="rounded-xl bg-bg-2 p-4">
          <!-- 导航块 -->
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
              <img
                :src="props.currentTab === item.key ? item.activeIcon : item.icon"
                :alt="item.label"
                class="h-6 w-6 shrink-0"
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
import CommonFooter from '@/components/commonFooter.vue'
import DetailsActiveIcon from '@/static/svg/referral/details-active.svg?url'
import DetailsIcon from '@/static/svg/referral/details.svg?url'
import GuideActiveIcon from '@/static/svg/referral/guide-active.svg?url'
import GuideIcon from '@/static/svg/referral/guide.svg?url'
import ReferralActiveIcon from '@/static/svg/referral/referral-active.svg?url'
import ReferralIcon from '@/static/svg/referral/referral.svg?url'
import RulesActiveIcon from '@/static/svg/referral/rules-active.svg?url'
import RulesIcon from '@/static/svg/referral/rules.svg?url'
import TasksActiveIcon from '@/static/svg/referral/tasks-active.svg?url'
import TasksIcon from '@/static/svg/referral/tasks.svg?url'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

type ReferralDesktopTab = 'referral' | 'tasks' | 'details' | 'rules' | 'guide'

interface Props {
  currentTab: ReferralDesktopTab
  pageTitle: string
}

interface ReferralDesktopMenuItem {
  key: ReferralDesktopTab
  label: string
  path?: string
  icon: string
  activeIcon: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const menuItems = computed<ReferralDesktopMenuItem[]>(() => [
  {
    key: 'referral',
    label: t('referral.title'),
    path: '/referral',
    icon: ReferralIcon,
    activeIcon: ReferralActiveIcon
  },
  {
    key: 'tasks',
    label: t('referral.taskPage.title'),
    path: '/referral/tasks',
    icon: TasksIcon,
    activeIcon: TasksActiveIcon
  },
  {
    key: 'details',
    label: t('referral.detailsPage.detailText'),
    path: '/referral/details',
    icon: DetailsIcon,
    activeIcon: DetailsActiveIcon
  },
  {
    key: 'rules',
    label: t('referral.rulesPage.title'),
    path: '/referral/rules',
    icon: RulesIcon,
    activeIcon: RulesActiveIcon
  },
  {
    key: 'guide',
    label: t('referral.h5.quickActions.guide'),
    icon: GuideIcon,
    activeIcon: GuideActiveIcon
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
