<template>
  <div class="max-w-[1336px] mx-auto pt-[14px]">
    <h2 class="mb-4 text-xl font-[700] text-text-1">{{ $t('rewardCenter.title') }}</h2>
    <div class="flex justify-center gap-6">
      <aside class="w-[280px] shrink-0">
        <div class="rounded-xl bg-bg-2 p-4">
          <nav class="space-y-2">
            <button
              v-for="tab in tabs"
              :key="tab"
              type="button"
              :class="getRewardCenterDesktopTabClass(activeTab === tab)"
              @click="emit('change-tab', tab)"
            >
              {{ tabLabel(tab) }}
            </button>
          </nav>
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>
  </div>

  <CommonFooter class="mt-[40px]" />
</template>

<script setup lang="ts">
import CommonFooter from '@/components/commonFooter.vue'
import { getRewardCenterDesktopTabClass, REWARD_CENTER_TABS, type RewardCenterTab } from './shared'
import { useI18n } from 'vue-i18n'

defineProps<{
  activeTab: RewardCenterTab
}>()

const emit = defineEmits<{
  'change-tab': [tab: RewardCenterTab]
}>()

const { t } = useI18n()
const tabs = REWARD_CENTER_TABS

const tabLabel = (tab: RewardCenterTab) =>
  tab === 'pending' ? t('rewardCenter.tabs.pending') : t('rewardCenter.tabs.claimed')
</script>
