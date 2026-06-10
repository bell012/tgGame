<template>
  <div>
    <!-- H5 -->
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <H5Header :title="$t('activityPromotions.title')" />
      <div
        v-if="groups.length > 0"
        ref="mobileTabScrollRef"
        class="flex gap-2 overflow-x-auto px-[14px] py-2.5 no-scrollbar"
      >
        <button
          v-for="group in groups"
          :key="group.groupCode"
          type="button"
          :data-group-code="group.groupCode"
          :class="getPromotionGroupMobileTabClass(activeGroupCode === group.groupCode)"
          @click="switchGroup(group.groupCode)"
        >
          <img
            v-if="getPromotionGroupIcon(group, activeGroupCode)"
            :src="getPromotionGroupIcon(group, activeGroupCode)"
            alt=""
            class="h-5 w-5 shrink-0 object-contain"
          />
          <span :class="getPromotionGroupMobileTabTextClass(activeGroupCode === group.groupCode)">
            {{ getLanguageName(group.groupName) }}
          </span>
        </button>
      </div>

      <div
        ref="mobileScrollRef"
        class="flex-1 min-h-0 overflow-y-auto px-[14px] pb-4"
        @scroll="onMobileScroll"
      >
        <PromotionsListSkeleton v-if="loading && list.length === 0" variant="mobile" />

        <div v-else-if="list.length > 0" class="flex flex-col gap-3">
          <button
            v-for="item in list"
            :key="item.rowId"
            type="button"
            class="w-full overflow-hidden rounded-lg bg-bg-2 text-left"
            @click="openActivity(item)"
          >
            <div class="aspect-[347/150] w-full overflow-hidden bg-bg-3">
              <img
                v-if="item.preImage"
                :src="item.preImage"
                :alt="getActivityTitle(item)"
                class="h-full w-full object-cover"
              />
            </div>
            <p class="px-3 py-3 text-sm font-[700] text-text-1 line-clamp-2">
              {{ getActivityTitle(item) }}
            </p>
          </button>
          <p v-if="loadingMore" class="py-3 text-center text-xs text-text-2">
            {{ $t('common.loading') }}
          </p>
        </div>

        <ThemedEmptyState
          v-else
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :message="$t('activityPromotions.empty')"
          container-class="mt-8 justify-center"
          image-class="mb-2.5 h-[200px] w-auto"
          text-class="text-text-1 text-sm font-[700]"
        />
      </div>
    </div>

    <!-- PC -->
    <PromotionsLayout v-else-if="isReady" :groups="groups" :active-group-code="activeGroupCode">
      <div class="bg-bg-2 rounded-xl p-4 min-h-[520px]">
        <PromotionsListSkeleton v-if="loading && list.length === 0" variant="desktop" />

        <div v-else-if="list.length > 0">
          <div class="grid grid-cols-3 gap-4">
            <button
              v-for="item in list"
              :key="item.rowId"
              type="button"
              class="overflow-hidden rounded-lg bg-bg-3 text-left cursor-pointer"
              @click="openActivity(item)"
            >
              <div class="aspect-[333/140] w-full overflow-hidden">
                <img
                  v-if="item.preImage"
                  :src="item.preImage"
                  :alt="getActivityTitle(item)"
                  class="h-full w-full object-cover"
                />
              </div>
              <p class="px-3 py-3 text-sm font-[700] text-text-1 line-clamp-2 min-h-[52px]">
                {{ getActivityTitle(item) }}
              </p>
            </button>
          </div>

          <div v-if="totalPages > 1" class="mt-5 flex justify-center">
            <DesktopPagination
              :current-page="currentPage"
              :total-pages="totalPages"
              @change="onPageChange"
            />
          </div>
        </div>

        <ThemedEmptyState
          v-else
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :message="$t('activityPromotions.empty')"
          container-class="h-[480px] justify-center"
          image-class="mb-2.5 h-[200px] w-auto"
          text-class="text-text-1 text-sm font-[700]"
        />
      </div>
    </PromotionsLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Api from '@/api'
import type { ActivityListItem } from '@/api/interface/activity'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { usePromotionsStore } from '@/stores/promotions'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import { navigateTo } from '@/utils/router'
import PromotionsLayout from '../layout.vue'
import PromotionsListSkeleton from './PromotionsListSkeleton.vue'
import {
  getActivityTitle,
  getLanguageName,
  getPromotionGroupIcon,
  getPromotionGroupMobileTabClass,
  getPromotionGroupMobileTabTextClass,
  replacePromotionsListUrl,
  openActivityExternalJump,
  shouldOpenDetailPage,
  sortActivityList
} from '../shared'

const PC_PAGE_SIZE = 12
const H5_PAGE_SIZE = 10

const route = useRoute()
const isMobile = useIsMobile()
const isReady = ref(false)
const promotionsStore = usePromotionsStore()

const groups = computed(() => promotionsStore.groups)
/** H5 tab 切换走组件内状态，避免 router 导航触发整页滑入 */
const mobileActiveGroupCode = ref('')
const activeGroupCode = computed(() => {
  if (isMobile.value && mobileActiveGroupCode.value) {
    return mobileActiveGroupCode.value
  }
  return String(route.params.groupCode || '')
})

const list = ref<ActivityListItem[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const mobileScrollRef = ref<HTMLElement | null>(null)
const mobileTabScrollRef = ref<HTMLElement | null>(null)

// 每次请求自增，回包时只认最后一次，避免快速切换分组时旧数据覆盖新数据
let requestId = 0

usePageScrollLock(() => isMobile.value)

const loadList = async (page: number, append: boolean) => {
  const groupCode = activeGroupCode.value
  if (!groupCode) {
    list.value = []
    return
  }

  requestId += 1
  const currentRequestId = requestId

  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const pageSize = isMobile.value ? H5_PAGE_SIZE : PC_PAGE_SIZE
    const response = await Api.activity.queryActivityList({
      current: page,
      size: pageSize,
      groupCode
    })

    // 已有更新的请求发出，本次结果作废
    if (currentRequestId !== requestId) {
      return
    }

    const records = sortActivityList(response.result?.records ?? [])
    const pages = Number(response.result?.pages ?? 1)

    totalPages.value = pages > 0 ? pages : 1
    currentPage.value = page

    if (append) {
      list.value = list.value.concat(records)
    } else {
      list.value = records
    }
  } catch {
    if (currentRequestId === requestId && !append) {
      list.value = []
    }
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

const reloadList = () => {
  currentPage.value = 1
  loadList(1, false)
}

const scrollActiveTabIntoView = (groupCode: string) => {
  const container = mobileTabScrollRef.value
  if (!container || !groupCode) {
    return
  }

  const tab = container.querySelector<HTMLElement>(`[data-group-code="${groupCode}"]`)
  tab?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

const switchGroup = (groupCode?: string) => {
  if (!groupCode || groupCode === activeGroupCode.value) {
    return
  }

  scrollActiveTabIntoView(groupCode)

  if (isMobile.value) {
    mobileActiveGroupCode.value = groupCode
    replacePromotionsListUrl(groupCode)
    mobileScrollRef.value?.scrollTo({ top: 0 })
    reloadList()
    return
  }

  navigateTo(`/promotions/${groupCode}`)
}

const onPageChange = (page: number) => {
  loadList(page, false)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onMobileScroll = () => {
  if (!isMobile.value || loading.value || loadingMore.value) {
    return
  }
  if (currentPage.value >= totalPages.value) {
    return
  }

  const el = mobileScrollRef.value
  if (!el) {
    return
  }

  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80
  if (nearBottom) {
    loadList(currentPage.value + 1, true)
  }
}

const openActivity = (item: ActivityListItem) => {
  if (!item.rowId) {
    return
  }

  promotionsStore.saveActivityItem(item)

  if (!shouldOpenDetailPage(item)) {
    openActivityExternalJump(item)
    return
  }

  const groupCode = activeGroupCode.value || item.groupCode || ''
  navigateTo(`/promotions/${groupCode}/${item.rowId}`, {
    state: { activity: item }
  })
}

const syncMobileGroupFromRoute = (groupCode: string) => {
  if (!isMobile.value || !groupCode) {
    return
  }
  mobileActiveGroupCode.value = groupCode
}

watch(
  () => route.params.groupCode,
  groupCode => {
    const code = String(groupCode || '')
    if (!code) {
      return
    }

    syncMobileGroupFromRoute(code)

    if (!isReady.value) {
      isReady.value = true
    }

    if (isMobile.value) {
      void nextTick(() => {
        scrollActiveTabIntoView(code)
      })
    }

    reloadList()
  }
)

watch(
  () => activeGroupCode.value,
  (groupCode, previousGroupCode) => {
    if (!groupCode || !isMobile.value) {
      return
    }

    if (previousGroupCode && previousGroupCode !== groupCode) {
      mobileScrollRef.value?.scrollTo({ top: 0 })
    }
  }
)

onMounted(async () => {
  await promotionsStore.loadGroups()

  const codeFromRoute = String(route.params.groupCode || '')
  const defaultCode = promotionsStore.getDefaultGroupCode()

  if (!codeFromRoute && defaultCode) {
    navigateTo(`/promotions/${defaultCode}`, { replace: true })
    return
  }

  if (!codeFromRoute) {
    return
  }

  syncMobileGroupFromRoute(codeFromRoute)
  isReady.value = true
  reloadList()

  if (isMobile.value) {
    void nextTick(() => {
      scrollActiveTabIntoView(codeFromRoute)
    })
  }
})
</script>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
