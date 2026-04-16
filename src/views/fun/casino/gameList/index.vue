<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header :title="pageTitle" />
      <div class="flex-1 min-h-0 overflow-y-auto px-[14px] pt-2.5 pb-4">
        <component
          :is="currentPageComponent"
          v-bind="currentPageProps"
          @update:sort="handleSortChange"
          @update:providerFilter="handleProviderFilterChange"
        />
      </div>
    </div>

    <div v-else class="w-full p-4">
      <div class="mb-4 flex items-center gap-3">
        <button
          type="button"
          class="flex size-[33px] items-center justify-center rounded-md bg-opacity-5"
          @click="handleBack"
        >
          <ArrowLeftIcon class="h-3.5 w-3.5 text-text-1" />
        </button>
        <h1 class="font-inter text-2xl font-extrabold text-text-1">
          {{ pageTitle }}
        </h1>
      </div>

      <component
        :is="currentPageComponent"
        v-bind="currentPageProps"
        @update:sort="handleSortChange"
        @update:providerFilter="handleProviderFilterChange"
      />
      <CommonFooter class="mt-[40px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { SelectMemberResult } from '@/api/interface/user'
import H5Header from '@/components/common/H5Header.vue'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { useCasinoTabButtons } from '@/composables/useCasinoTabButtons'
import { useIsMobile } from '@/composables/useMediaQuery'
import {
  getCasinoPageMode,
  getCasinoQueryOptions,
  getGameListTabCodeFromSlug
} from '../casinoPageConfig'
import pageStyle2 from '../components/pageStyle2.vue'
import pageStyle3 from '../components/pageStyle3.vue'
import pageStyle4 from '../components/pageStyle4.vue'
import CommonFooter from '@/components/commonFooter.vue'

interface Props {
  tabKey: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const userInfo = ref<SelectMemberResult | null>(null)
const isLoggedIn = computed(() => {
  return Boolean(userInfo.value?.tradeToken)
})
const { tabButtons, loadCasinoTabButtons } = useCasinoTabButtons({ isLoggedIn })

const currentTabCode = computed(() => getGameListTabCodeFromSlug(props.tabKey))
const currentPageMode = computed(() => getCasinoPageMode(currentTabCode.value))
const currentPageComponent = computed(() => {
  switch (currentPageMode.value) {
    case 'pageStyle2':
      return pageStyle2
    case 'pageStyle4':
      return pageStyle4
    default:
      return pageStyle3
  }
})
const normalizedSort = computed(() => {
  const sortValue = route.query.sort
  return typeof sortValue === 'string' && sortValue.trim() ? sortValue.trim().toLowerCase() : 'hot'
})
const normalizedProviderCodes = computed(() => {
  const providerQueryValue = route.query.providerCode
  const rawProviderCodes = Array.isArray(providerQueryValue)
    ? providerQueryValue.join(' ')
    : String(providerQueryValue ?? '')

  return rawProviderCodes
    .split(/[+,，\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
})
const currentPageProps = computed(() => {
  const queryOptions = getCasinoQueryOptions(currentTabCode.value, {
    isMobile: isMobile.value
  })

  if (currentPageMode.value === 'pageStyle4') {
    return {}
  }

  if (currentPageMode.value === 'pageStyle3') {
    return {
      queryOptions,
      sortValue: normalizedSort.value,
      providerCodes: normalizedProviderCodes.value
    }
  }

  return {
    queryOptions
  }
})
const pageTitle = computed(() => {
  const matchedTab = tabButtons.value.find(tab => tab.sysGameTypeCode === currentTabCode.value)

  if (matchedTab?.sysGameTypeName) {
    return matchedTab.sysGameTypeName
  }

  switch (currentTabCode.value) {
    case 'originals':
      return t('casino.tg_originals')
    case 'hot_games':
      return t('casino.hot_games')
    case 'providers':
      return t('sidebar_menu.casino.children.game_providers')
    default:
      return t('sidebar_menu.casino.title')
  }
})

const updateRouteQuery = (nextQuery: Record<string, string | undefined>) => {
  const mergedQuery = {
    ...route.query,
    ...nextQuery
  }

  Object.keys(mergedQuery).forEach(key => {
    if (mergedQuery[key] === undefined) {
      delete mergedQuery[key]
    }
  })

  void router.replace({
    query: mergedQuery
  })
}

const handleSortChange = (sortValue: string) => {
  updateRouteQuery({
    sort: sortValue || undefined
  })
}

const handleProviderFilterChange = (payload: {
  providerCodes: string[]
  providerNames: string[]
}) => {
  updateRouteQuery({
    providerCode: payload.providerCodes.length > 0 ? payload.providerCodes.join(' ') : undefined
  })
}

const handleBack = () => {
  router.back()
}

const loadUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo')

  if (!storedUserInfo) {
    userInfo.value = null
    return
  }

  try {
    userInfo.value = JSON.parse(storedUserInfo)
  } catch (error) {
    console.error(error)
    userInfo.value = null
  }
}

onMounted(() => {
  loadUserInfo()
  void loadCasinoTabButtons()
})
</script>

<style scoped lang="scss"></style>
