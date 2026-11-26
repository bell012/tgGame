<template>
  <div>
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <H5Header
        :title="$t('activityPromotions.title')"
        :show-sort="true"
        :right-icon="PromotionRecordIcon"
        @sort="handlePromotionRecordClick"
      />
      <div class="flex items-center gap-2 px-[14px] py-3.5">
        <button
          type="button"
          data-group-code="comprehensive"
          class="shrink-0"
          :class="getPromotionGroupMobileTabClass(isComprehensiveActive)"
          @click="switchGroup(PROMOTION_COMPREHENSIVE_GROUP_CODE)"
        >
          <PromotionGroupIcon
            :src="comprehensiveIcon"
            :active="isComprehensiveActive"
            class="h-5 w-5"
          />
          <span :class="getPromotionGroupMobileTabTextClass(isComprehensiveActive)">
            {{ $t('activityPromotions.comprehensive') }}
          </span>
        </button>
        <div
          ref="mobileTabScrollRef"
          class="flex min-w-0 flex-1 gap-2 overflow-x-auto no-scrollbar"
        >
          <button
            v-for="group in groups"
            :key="group.rowId"
            type="button"
            :data-group-code="getPromotionGroupRouteKey(group)"
            :class="getPromotionGroupMobileTabClass(isPromotionGroupActive(group, activeGroupCode))"
            @click="switchGroup(getPromotionGroupRouteKey(group))"
          >
            <PromotionGroupIcon
              v-if="getPromotionGroupIcon(group, activeGroupCode)"
              :src="getPromotionGroupIcon(group, activeGroupCode)"
              :active="isPromotionGroupActive(group, activeGroupCode)"
              class="h-5 w-5"
            />
            <span
              :class="
                getPromotionGroupMobileTabTextClass(isPromotionGroupActive(group, activeGroupCode))
              "
            >
              {{ getLanguageName(group.groupName) }}
            </span>
          </button>
        </div>
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
                v-if="getPromotionCardCover(item)"
                :src="getPromotionCardCover(item)"
                :alt="getActivityTitle(item)"
                class="h-full w-full object-cover"
              />
            </div>
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

    <PromotionsLayout
      v-if="isReady && !isMobile"
      :groups="groups"
      :active-group-code="activeGroupCode"
    >
      <div class="min-h-[520px] overflow-hidden">
        <PromotionsListSkeleton v-if="loading && list.length === 0" variant="desktop" />

        <div v-else-if="list.length > 0">
          <div class="flex flex-col gap-[10px]">
            <button
              v-for="item in list"
              :key="item.rowId"
              type="button"
              class="w-full cursor-pointer overflow-hidden rounded-[20px] bg-bg-3 text-left"
              @click="openActivity(item)"
            >
              <img
                v-if="hasPromotionCover(item)"
                :src="getPromotionCardCover(item)"
                :alt="getActivityTitle(item)"
                class="block h-auto w-full"
                @error="markPromotionImageFailed(item.rowId)"
              />
              <div v-else class="aspect-[1032/250] w-full" />
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
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Api from '@/api'
import type { ActivityListItem } from '@/api/interface/activity'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { usePromotionsStore } from '@/stores/promotions'
import { useUserStore } from '@/stores/user'
import comprehensiveIcon from '@/static/img/explore/comprehensive.svg?url'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import PromotionRecordIcon from '@/static/svg/deposit/record.svg?component'
import { navigateTo } from '@/utils/router'
import {
  getPromotionCardCover,
  PROMOTION_DETAIL_MOCK_LIST,
  type PromotionDetailMockItem
} from '../detail-mock'
import PromotionsLayout from '../layout.vue'
import PromotionGroupIcon from '../components/PromotionGroupIcon.vue'
import PromotionsListSkeleton from './PromotionsListSkeleton.vue'
import {
  getActivityTitle,
  getLanguageName,
  getPromotionGroupIcon,
  getPromotionGroupMobileTabClass,
  getPromotionGroupMobileTabTextClass,
  getPromotionGroupRouteKey,
  getVisiblePromotionGroups,
  isPromotionComprehensiveActive,
  isPromotionGroupActive,
  PROMOTION_COMPREHENSIVE_GROUP_CODE,
  openActivityExternalJump,
  parsePromotionsPath,
  replacePromotionsListUrl,
  resolveActivityListGroupCode,
  shouldOpenDetailPage,
  sortActivityList
} from '../shared'

const ACTIVITY_LIST_PAGE_SIZE = 15

const route = useRoute()
const { locale } = useI18n()
const isMobile = useIsMobile()

const handlePromotionRecordClick = () => {
  navigateTo('/reward-center')
}
const isReady = ref(false)
const promotionsStore = usePromotionsStore()
const userStore = useUserStore()

const canQueryPromotionList = () => {
  const { userInfo, acctInfo } = userStore.syncStoredUserData()
  return Boolean(userInfo?.tradeToken || acctInfo?.memberId)
}

const groups = computed(() => getVisiblePromotionGroups(promotionsStore.groups))
const routeActiveGroupCode = computed(() => {
  if (isMobile.value && promotionsStore.h5ListGroupCode) {
    return promotionsStore.h5ListGroupCode
  }
  return String(route.params.groupCode || '')
})

// 切换语言后同一分组的 rowId 可能变化，选中态和列表请求都使用映射后的当前语言分组 key。
const activeGroupCode = computed(() => {
  const code = routeActiveGroupCode.value
  if (!code || isPromotionComprehensiveActive(code)) {
    return PROMOTION_COMPREHENSIVE_GROUP_CODE
  }
  const currentCode = promotionsStore.resolveCurrentGroupRouteKey(code) || code
  if (groups.value.some(group => getPromotionGroupRouteKey(group) === currentCode)) {
    return currentCode
  }
  return PROMOTION_COMPREHENSIVE_GROUP_CODE
})
const isComprehensiveActive = computed(() => isPromotionComprehensiveActive(activeGroupCode.value))

const list = ref<ActivityListItem[]>([])
const failedPromotionImageIds = ref<Record<string, true>>({})
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const mobileScrollRef = ref<HTMLElement | null>(null)
const mobileTabScrollRef = ref<HTMLElement | null>(null)
const wasOnPromotionsDetail = ref(false)
const justRestoredFromDetail = ref(false)

let requestId = 0
let skipNextRouteReload = false

usePageScrollLock(() => isMobile.value)

const hasPromotionCover = (item: ActivityListItem) => {
  const imageId = String(item.rowId ?? '')
  return Boolean(getPromotionCardCover(item)) && !failedPromotionImageIds.value[imageId]
}

const markPromotionImageFailed = (rowId?: number) => {
  if (rowId == null) {
    return
  }
  failedPromotionImageIds.value = {
    ...failedPromotionImageIds.value,
    [String(rowId)]: true
  }
}

const isPromotionsListRoute = () => {
  const routeName = String(route.name || '').replace(/^Locale/, '')
  return routeName === 'promotionsList'
}

/** 菜单等真实路由进入时，params 与地址栏一致 */
const isSyncedListNavigation = () => {
  const paramCode = String(route.params.groupCode || '')
  const urlCode = parsePromotionsPath().groupCode
  return Boolean(paramCode && urlCode && paramCode === urlCode)
}

const restoreMobileListGroupFromStore = () => {
  if (!isMobile.value || !isPromotionsListRoute()) {
    return
  }

  const storeCode = promotionsStore.h5ListGroupCode
  if (!storeCode) {
    return
  }

  justRestoredFromDetail.value = true
  replacePromotionsListUrl(storeCode)

  void nextTick(() => {
    scrollActiveTabIntoView(storeCode)
    justRestoredFromDetail.value = false
  })
}

const loadList = async (page: number, append: boolean) => {
  const isComprehensive = isPromotionComprehensiveActive(activeGroupCode.value)
  const listGroupCode = isComprehensive
    ? ''
    : resolveActivityListGroupCode(groups.value, activeGroupCode.value)
  if (!isComprehensive && !listGroupCode) {
    list.value = []
    return
  }

  if (!canQueryPromotionList()) {
    list.value = isComprehensive ? [...PROMOTION_DETAIL_MOCK_LIST] : []
    loading.value = false
    loadingMore.value = false
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
    const response = await Api.activity.queryActivityList({
      current: page,
      size: ACTIVITY_LIST_PAGE_SIZE,
      ...(listGroupCode ? { groupCode: listGroupCode } : {})
    })

    console.log('活动中心', response.result)

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
      list.value = isComprehensive ? [...PROMOTION_DETAIL_MOCK_LIST, ...records] : records
    }
  } catch {
    if (currentRequestId === requestId && !append) {
      list.value = isComprehensive ? [...PROMOTION_DETAIL_MOCK_LIST] : []
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
    promotionsStore.setH5ListGroupCode(groupCode)
    replacePromotionsListUrl(groupCode)
    mobileScrollRef.value?.scrollTo({ top: 0 })
    currentPage.value = 1
    // 切到综合时由分组状态监听拉全量列表，避免和这里重复请求。
    if (!isPromotionComprehensiveActive(groupCode)) {
      loadList(1, false)
    }
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

const openActivity = async (item: ActivityListItem) => {
  if (!item.rowId) {
    return
  }

  const mockRouteId = String((item as PromotionDetailMockItem).mockRouteId || '')
  if (mockRouteId) {
    promotionsStore.saveActivityItem(item)
    navigateTo(`/promotions/mock/${mockRouteId}`)
    return
  }

  promotionsStore.saveActivityItem(item)

  if (!shouldOpenDetailPage(item)) {
    openActivityExternalJump(item)
    return
  }

  const detailGroupCode = isComprehensiveActive.value
    ? resolveActivityListGroupCode(groups.value, String(item.groupCode || '')) ||
      (groups.value[0] ? getPromotionGroupRouteKey(groups.value[0]) : '')
    : activeGroupCode.value ||
      resolveActivityListGroupCode(groups.value, String(item.groupCode || ''))
  if (!detailGroupCode) {
    return
  }

  const listGroupCode = isComprehensiveActive.value
    ? PROMOTION_COMPREHENSIVE_GROUP_CODE
    : detailGroupCode

  if (isMobile.value) {
    promotionsStore.setH5ListGroupCode(listGroupCode)
    // 先把列表历史记录同步到当前 tab，避免详情返回时 router 回到初次进入的分组
    await navigateTo(`/promotions/${listGroupCode}`, { replace: true })
    navigateTo(`/promotions/${detailGroupCode}/${item.rowId}`)
    return
  }

  navigateTo(`/promotions/${detailGroupCode}/${item.rowId}`)
}

const handleMobileListRouteChange = () => {
  if (!isMobile.value || !isPromotionsListRoute()) {
    return
  }

  if (!isReady.value) {
    isReady.value = true
  }

  if (!isSyncedListNavigation()) {
    return
  }

  const code = String(route.params.groupCode || '')
  const previousCode = promotionsStore.h5ListGroupCode
  promotionsStore.setH5ListGroupCode(code)

  if (previousCode !== code) {
    mobileScrollRef.value?.scrollTo({ top: 0 })
    reloadList()
  }

  void nextTick(() => {
    scrollActiveTabIntoView(code)
  })
}

const getNormalizedRouteName = () => String(route.name || '').replace(/^Locale/, '')

watch(
  () => getNormalizedRouteName(),
  routeName => {
    if (routeName === 'promotionsDetail') {
      wasOnPromotionsDetail.value = true
      return
    }

    if (routeName === 'promotionsList' && wasOnPromotionsDetail.value && isMobile.value) {
      wasOnPromotionsDetail.value = false
      restoreMobileListGroupFromStore()
      return
    }

    if (routeName !== 'promotionsDetail') {
      wasOnPromotionsDetail.value = false
    }
  }
)

watch(
  () => route.params.groupCode,
  groupCode => {
    const code = String(groupCode || '')
    if (!code) {
      return
    }

    if (skipNextRouteReload) {
      skipNextRouteReload = false
      return
    }

    if (!isReady.value) {
      isReady.value = true
    }

    if (isMobile.value) {
      if (justRestoredFromDetail.value || wasOnPromotionsDetail.value) {
        return
      }
      handleMobileListRouteChange()
      return
    }

    reloadList()
  }
)

watch(
  () => promotionsStore.h5ListGroupCode,
  code => {
    if (!isMobile.value || !isReady.value || !isPromotionsListRoute()) {
      return
    }
    if (!isPromotionComprehensiveActive(code)) {
      return
    }

    replacePromotionsListUrl(PROMOTION_COMPREHENSIVE_GROUP_CODE)
    mobileScrollRef.value?.scrollTo({ top: 0 })
    reloadList()
  }
)

watch(locale, () => {
  promotionsStore.syncGroupsLanguage()
  if (isReady.value) {
    reloadList()
  }
})

onMounted(async () => {
  const codeFromRoute = String(route.params.groupCode || '')
  if (isMobile.value && (!codeFromRoute || isPromotionComprehensiveActive(codeFromRoute))) {
    promotionsStore.setH5ListGroupCode(PROMOTION_COMPREHENSIVE_GROUP_CODE)
  }

  if (canQueryPromotionList()) {
    await promotionsStore.loadGroups()
  }

  const resolvedCode = isPromotionComprehensiveActive(codeFromRoute)
    ? PROMOTION_COMPREHENSIVE_GROUP_CODE
    : promotionsStore.resolveCurrentGroupRouteKey(codeFromRoute) || codeFromRoute
  const isKnownGroup =
    isPromotionComprehensiveActive(resolvedCode) ||
    groups.value.some(group => getPromotionGroupRouteKey(group) === resolvedCode)
  const initialCode =
    !codeFromRoute || !isKnownGroup ? PROMOTION_COMPREHENSIVE_GROUP_CODE : resolvedCode

  if (isMobile.value) {
    promotionsStore.setH5ListGroupCode(initialCode)
  }

  if (initialCode !== codeFromRoute) {
    skipNextRouteReload = true
    navigateTo(`/promotions/${initialCode}`, { replace: true })
  }

  isReady.value = true
  reloadList()

  if (isMobile.value) {
    void nextTick(() => {
      scrollActiveTabIntoView(initialCode)
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
