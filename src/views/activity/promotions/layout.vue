<template>
  <div class="max-w-[1336px] mx-auto pt-[14px] px-[14px]">
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
                :class="getGroupIconClass(group)"
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

// 菜单栏数据是接口返回的，过滤 加密货币 不显示
const groups = computed(() => props.groups.filter(group => !isCryptoPromotionGroup(group)))

const isCryptoPromotionGroup = (group: ActivityGroupItem) => {
  const groupCode = String(group.groupCode ?? '')
    .trim()
    .toLowerCase()
  if (groupCode.includes('crypto')) {
    return true
  }

  return (group.groupName ?? []).some(item => {
    const name = String(item.name ?? '')
      .trim()
      .toLowerCase()
    return name === '加密货币' || name === 'crypto' || name === 'cryptocurrency'
  })
}

const isPromotionsDetailRoute = () => {
  const routeName = String(route.name || '').replace(/^Locale/, '')
  return routeName === 'promotionsDetail'
}

const getGroupIcon = (group: ActivityGroupItem) => {
  return getPromotionGroupIcon(group, props.activeGroupCode)
}

const getGroupIconClass = (group: ActivityGroupItem) => {
  // 接口图标是 PNG，不能直接吃 text-* 颜色；保留 img 展示，用 filter 近似 icon-2/icon-4。
  return isPromotionGroupActive(group, props.activeGroupCode)
    ? 'text-icon-4 promotion-group-icon--active'
    : 'text-icon-2 promotion-group-icon--default'
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

<style scoped>
.promotion-group-icon--active {
  filter: brightness(0) saturate(100%);
}

.promotion-group-icon--default {
  filter: brightness(0) saturate(100%) invert(82%) sepia(8%) saturate(350%) hue-rotate(151deg)
    brightness(91%) contrast(86%);
}

:global(.light) .promotion-group-icon--default {
  filter: brightness(0) saturate(100%) invert(41%) sepia(10%) saturate(558%) hue-rotate(131deg)
    brightness(92%) contrast(90%);
}
</style>
