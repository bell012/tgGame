<template>
  <div class="max-w-[1336px] mx-auto pt-[14px]">
    <h2 class="text-xl font-[700] text-text-1 mb-4">{{ $t('activityPromotions.title') }}</h2>
    <div class="flex justify-center gap-6">
      <aside class="w-[280px] flex-shrink-0">
        <div class="bg-bg-2 rounded-xl p-4">
          <nav class="space-y-2">
            <div
              v-for="group in groups"
              :key="group.rowId"
              :class="
                getPromotionGroupDesktopTabClass(isPromotionGroupActive(group, activeGroupCode))
              "
              @click="goGroup(getPromotionGroupRouteKey(group))"
            >
              <img
                v-if="getGroupIcon(group)"
                :src="getGroupIcon(group)"
                alt=""
                class="h-6 w-6 shrink-0 object-contain"
              />
              <span v-else class="h-6 w-6 shrink-0 rounded bg-bg-3" />
              <span class="text-base">{{ getLanguageName(group.groupName) }}</span>
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
import { useRoute } from 'vue-router'
import type { ActivityGroupItem } from '@/api/interface/activity'
import CommonFooter from '@/components/commonFooter.vue'
import { navigateTo } from '@/utils/router'
import {
  getLanguageName,
  getPromotionGroupDesktopTabClass,
  getPromotionGroupIcon,
  getPromotionGroupRouteKey,
  isPromotionGroupActive
} from './shared'

const props = defineProps<{
  groups: ActivityGroupItem[]
  activeGroupCode: string
}>()

const route = useRoute()
const groups = computed(() => props.groups)

const isPromotionsDetailRoute = () => {
  const routeName = String(route.name || '').replace(/^Locale/, '')
  return routeName === 'promotionsDetail'
}

const getGroupIcon = (group: ActivityGroupItem) => {
  return getPromotionGroupIcon(group, props.activeGroupCode)
}

const goGroup = (groupCode?: string) => {
  if (!groupCode) {
    return
  }

  if (!isPromotionsDetailRoute() && groupCode === props.activeGroupCode) {
    return
  }

  navigateTo(`/promotions/${groupCode}`)
}
</script>
