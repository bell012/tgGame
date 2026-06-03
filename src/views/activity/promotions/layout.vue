<template>
  <div class="max-w-[1336px] mx-auto pt-[14px]">
    <h2 class="text-xl font-[700] text-text-1 mb-4">{{ $t('activityPromotions.title') }}</h2>
    <div class="flex justify-center gap-6">
      <aside class="w-[280px] flex-shrink-0">
        <div class="bg-bg-2 rounded-xl p-4">
          <nav class="space-y-2.5">
            <div
              v-for="group in groups"
              :key="group.groupCode"
              :class="[
                'flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer transition-all text-base',
                activeGroupCode === group.groupCode
                  ? 'bg-theme-primary text-text-4 font-bold'
                  : 'text-text-2'
              ]"
              @click="goGroup(group.groupCode)"
            >
              <img
                v-if="getGroupIcon(group)"
                :src="getGroupIcon(group)"
                alt=""
                class="w-6 h-6 object-contain"
              />
              <span v-else class="w-6 h-6 rounded bg-bg-3" />
              {{ getLanguageName(group.groupName) }}
            </div>
          </nav>
        </div>
      </aside>

      <main class="flex-1 min-w-0">
        <slot />
      </main>
    </div>
  </div>

  <CommonFooter />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityGroupItem } from '@/api/interface/activity'
import CommonFooter from '@/components/commonFooter.vue'
import { navigateTo } from '@/utils/router'
import { getLanguageName } from './shared'

const props = defineProps<{
  groups: ActivityGroupItem[]
  activeGroupCode: string
}>()

const groups = computed(() => props.groups)

const getGroupIcon = (group: ActivityGroupItem) => {
  if (props.activeGroupCode === group.groupCode && group.activeIcon) {
    return group.activeIcon
  }
  return group.defaultIcon || ''
}

const goGroup = (groupCode?: string) => {
  if (!groupCode || groupCode === props.activeGroupCode) {
    return
  }
  navigateTo(`/promotions/${groupCode}`)
}
</script>
