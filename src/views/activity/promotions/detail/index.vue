<template>
  <div>
    <!-- H5 详情 -->
    <section
      v-if="isReady && isMobile"
      class="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <H5Header :title="$t('activityPromotions.detailTitle')" @back="goBack" />
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div v-if="activity?.preImage" class="w-full">
          <img
            :src="activity.preImage"
            :alt="pageTitle"
            class="w-full object-cover aspect-[375/180]"
          />
        </div>

        <main class="px-[14px] py-[14px]">
          <article v-if="activity" class="flex flex-col gap-3">
            <h1 class="text-base font-[700] text-text-1">{{ pageTitle }}</h1>
            <div
              v-if="descriptionHtml"
              class="promotion-detail-html text-sm text-text-1 leading-relaxed"
              v-html="descriptionHtml"
            />
            <p
              v-else-if="descriptionText"
              class="text-sm text-text-1 leading-relaxed whitespace-pre-wrap"
            >
              {{ descriptionText }}
            </p>
          </article>
          <p v-else class="py-10 text-center text-sm text-text-2">
            {{ $t('activityPromotions.notFound') }}
          </p>
        </main>
      </div>
    </section>

    <!-- PC 详情 -->
    <PromotionsLayout v-else-if="isReady" :groups="groups" :active-group-code="activeGroupCode">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <div v-if="activity?.preImage" class="w-full">
          <img
            :src="activity.preImage"
            :alt="pageTitle"
            class="w-full max-h-[280px] object-cover"
          />
        </div>
        <div class="p-6">
          <article v-if="activity" class="flex flex-col gap-4">
            <h1 class="text-xl font-[700] text-text-1">{{ pageTitle }}</h1>
            <div
              v-if="descriptionHtml"
              class="promotion-detail-html text-sm text-text-1 leading-relaxed"
              v-html="descriptionHtml"
            />
            <p
              v-else-if="descriptionText"
              class="text-sm text-text-1 leading-relaxed whitespace-pre-wrap"
            >
              {{ descriptionText }}
            </p>
          </article>
          <p v-else class="py-16 text-center text-sm text-text-2">
            {{ $t('activityPromotions.notFound') }}
          </p>
        </div>
      </div>
    </PromotionsLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ActivityListItem } from '@/api/interface/activity'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { usePromotionsStore } from '@/stores/promotions'
import { navigateTo } from '@/utils/router'
import PromotionsLayout from '../layout.vue'
import { getActivityDescription, getActivityTitle } from '../shared'

const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const isReady = ref(false)
const promotionsStore = usePromotionsStore()

const activity = ref<ActivityListItem | null>(null)
const groups = computed(() => promotionsStore.groups)
const activeGroupCode = computed(() => String(route.params.groupCode || ''))
const activityId = computed(() => String(route.params.activityId || ''))

const pageTitle = computed(() => {
  if (!activity.value) {
    return ''
  }
  return getActivityTitle(activity.value)
})

// 描述原文，可能是纯文本，也可能是后台配的富文本
const descriptionRaw = computed(() => {
  if (!activity.value) {
    return ''
  }
  return getActivityDescription(activity.value) || ''
})

// 含尖括号标签的当作富文本处理
const isHtmlDescription = computed(() => {
  const text = descriptionRaw.value
  return text.includes('<') && text.includes('>')
})

const descriptionHtml = computed(() => (isHtmlDescription.value ? descriptionRaw.value : ''))
const descriptionText = computed(() => (isHtmlDescription.value ? '' : descriptionRaw.value))

usePageScrollLock(() => isMobile.value)

const readActivityFromRoute = () => {
  const state = window.history.state as { activity?: ActivityListItem }
  if (state?.activity?.rowId) {
    return state.activity
  }

  const cached = promotionsStore.getActivityItem(activityId.value)
  if (cached) {
    return cached
  }

  return null
}

const goBack = () => {
  const groupCode = activeGroupCode.value
  if (groupCode) {
    navigateTo(`/promotions/${groupCode}`)
    return
  }
  router.back()
}

onMounted(async () => {
  await promotionsStore.loadGroups()
  activity.value = readActivityFromRoute()

  if (!activity.value && activeGroupCode.value) {
    navigateTo(`/promotions/${activeGroupCode.value}`, { replace: true })
    return
  }

  isReady.value = true
})
</script>

<style scoped>
.promotion-detail-html :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
