<template>
  <section
    v-if="isReady && isMobile"
    class="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-bg-1 sm:hidden"
  >
    <H5Header
      :title="$t('activityPromotions.detailTitle')"
      :show-sort="true"
      :right-icon="CustomerServiceIcon"
      @sort="handleCustomerServiceClick"
    />
    <PromotionDetailContent :activity="activeActivity" variant="mobile" />
  </section>

  <PromotionsLayout v-else-if="isReady" :groups="groups" :active-group-code="groupCode">
    <div class="bg-bg-2 rounded-xl overflow-hidden min-h-[520px]">
      <PromotionDetailContent :activity="activeActivity" variant="desktop" />
    </div>
  </PromotionsLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { ActivityListItem } from '@/api/interface/activity'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { usePromotionsStore } from '@/stores/promotions'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import PromotionDetailContent from '../components/PromotionDetailContent.vue'
import PromotionsLayout from '../layout.vue'
import { resolveActivityById, resolveActivityListGroupCode, sortActivityList } from '../shared'

const ACTIVITY_LIST_PAGE_SIZE = 15
const MAX_ACTIVITY_LOOKUP_PAGES = 20

const route = useRoute()
const { t } = useI18n()
const isMobile = useIsMobile()
const promotionsStore = usePromotionsStore()

const handleCustomerServiceClick = () => {
  globalShowToast({
    message: t('sidebar_menu.customer_service'),
    type: 'success'
  })
}

const groups = computed(() => promotionsStore.groups)
const groupCode = computed(() => String(route.params.groupCode || ''))
const activityId = computed(() => String(route.params.activityId || ''))
const activeActivity = ref<ActivityListItem | null>(null)
const isReady = ref(false)

usePageScrollLock(() => isMobile.value)

const loadActivity = async () => {
  const id = activityId.value
  if (!id) {
    activeActivity.value = null
    return
  }

  const cached = promotionsStore.getActivityItem(id)
  if (cached) {
    activeActivity.value = cached
    return
  }

  const listGroupCode = resolveActivityListGroupCode(groups.value, groupCode.value)
  if (!listGroupCode) {
    activeActivity.value = null
    return
  }

  try {
    let page = 1
    let totalPages = 1

    while (page <= totalPages && page <= MAX_ACTIVITY_LOOKUP_PAGES) {
      const response = await Api.activity.queryActivityList({
        current: page,
        size: ACTIVITY_LIST_PAGE_SIZE,
        groupCode: listGroupCode
      })

      totalPages = Math.max(1, Number(response.result?.pages ?? 1))
      const records = sortActivityList(response.result?.records ?? [])
      const matched = resolveActivityById(
        id,
        records,
        promotionsStore.getActivityItem,
        promotionsStore.saveActivityItem
      )

      if (matched) {
        activeActivity.value = matched
        return
      }

      page += 1
    }

    activeActivity.value = null
  } catch {
    activeActivity.value = null
  }
}

watch(activityId, () => {
  void loadActivity()
})

onMounted(async () => {
  await promotionsStore.loadGroups()

  const codeFromRoute = groupCode.value
  const defaultCode = promotionsStore.getDefaultGroupCode()

  if (!codeFromRoute && defaultCode) {
    navigateTo(`/promotions/${defaultCode}`, { replace: true })
    return
  }

  if (!codeFromRoute || !activityId.value) {
    if (codeFromRoute) {
      navigateTo(`/promotions/${codeFromRoute}`, { replace: true })
    }
    return
  }

  await loadActivity()
  isReady.value = true
})
</script>
