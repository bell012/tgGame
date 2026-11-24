<template>
  <div ref="pageRootRef" class="w-full">
    <div v-if="loading && !loaded" class="grid grid-cols-3 gap-2.5" :class="gridClass">
      <div
        v-for="index in pageSize"
        :key="index"
        class="aspect-[330/438] animate-pulse rounded-lg bg-bg-2"
      />
    </div>
    <div v-else-if="visibleGames.length" class="grid grid-cols-3 gap-2.5" :class="gridClass">
      <div v-for="game in visibleGames" :key="game.gameCode" class="aspect-[330/438] min-w-0">
        <CasinoGameCard
          responsive-pc
          :game="{ itemName: game.gameName, icon2: game.imageUrl }"
          :show-platform-logo="false"
          :show-maintenance="false"
          :player-count="getPlayerCount(game)"
          @click="handleGameClick(game)"
        />
      </div>
    </div>
    <ThemedEmptyState
      v-else
      :dark-image="defaultImgDark"
      :light-image="defaultImgLight"
      :message="failed && !loaded ? t('common.loadFailed') : t('search.stay')"
      container-class="mt-[17px]"
      image-class="w-[220px] h-[200px] object-contain mb-2.5"
      text-class="text-xs text-center text-text-1"
    />
    <div v-if="failed" class="mt-4 text-center">
      <button
        type="button"
        class="rounded-lg bg-bg-2 px-4 py-2 text-sm text-text-1"
        :disabled="loading"
        @click="catalog.load(true)"
      >
        {{ t('common.retry') }}
      </button>
    </div>
    <div
      v-if="isMobile && visibleGames.length < filteredGames.length"
      :key="visibleCount"
      ref="loadMoreRef"
      class="h-1 w-full"
    />
    <div
      v-if="!isMobile && totalPages > 1"
      class="mt-4 flex items-center justify-center gap-0.5 text-xs text-text-1"
    >
      <button
        type="button"
        class="flex h-9 items-center rounded-l-lg bg-bg-2 px-2.5 disabled:opacity-50"
        :disabled="page === 1"
        :aria-label="t('common.previous')"
        @click="changePage(page - 1)"
      >
        <LeftArrow class="size-2" />
      </button>
      <div class="flex h-9 items-center gap-2 bg-bg-2 px-2.5">
        <span class="rounded-md bg-bg-3 px-2 py-2 font-bold">{{
          String(page).padStart(2, '0')
        }}</span>
        <span class="text-text-2">of</span>
        <span class="font-bold">{{ String(totalPages).padStart(2, '0') }}</span>
      </div>
      <button
        type="button"
        class="flex h-9 items-center rounded-r-lg bg-bg-2 px-2.5 disabled:opacity-50"
        :disabled="page === totalPages"
        :aria-label="t('common.next')"
        @click="changePage(page + 1)"
      >
        <RightArrow class="size-2" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onActivated, onDeactivated, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import type { HashGameLotteryGame } from '@/api/interface/hash_game.interface'
import { HASH_CASINO_TAB_CODE, useHashGameCatalogStore } from '@/stores/hashGameCatalog'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePcGameCardLayout } from '@/composables/usePcGameCardLayout'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import { navigateTo } from '@/utils/router'
import CasinoGameCard from '@/components/common/CasinoGameCard.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import LeftArrow from '@/static/svg/explore/left-arrow.svg?component'
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'

const props = withDefaults(defineProps<{ keyword?: string }>(), { keyword: '' })
const { t } = useI18n()
const route = useRoute()
const catalog = useHashGameCatalogStore()
const { games, loaded, loading, failed, scope } = storeToRefs(catalog)
const isMobile = useIsMobile()
const { gridClass } = usePcGameCardLayout()
const active = ref(false)
const pageRootRef = ref<HTMLElement | null>(null)
const page = ref(1)
const visibleCount = ref(27)
const loadMoreRef = ref<HTMLElement | null>(null)
const pageSize = computed(() => (isMobile.value ? 27 : 32))
const filteredGames = computed(() => {
  const keyword = props.keyword.trim().toLowerCase()
  return games.value.filter(
    game =>
      !keyword ||
      game.gameName.toLowerCase().includes(keyword) ||
      game.gameCode.toLowerCase().includes(keyword)
  )
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredGames.value.length / 32)))
const visibleGames = computed(() =>
  isMobile.value
    ? filteredGames.value.slice(0, visibleCount.value)
    : filteredGames.value.slice((page.value - 1) * 32, page.value * 32)
)

watch([() => props.keyword, scope, isMobile], () => {
  page.value = 1
  visibleCount.value = 27
})
watch(totalPages, value => {
  page.value = Math.min(page.value, value)
})

const changePage = async (nextPage: number) => {
  const targetPage = Math.min(Math.max(1, nextPage), totalPages.value)
  if (isMobile.value || targetPage === page.value) return
  page.value = targetPage
  await nextTick()

  const target = pageRootRef.value
  if (!active.value || isMobile.value || !target?.isConnected) return

  // 与热门列表一致：优先滚动所在容器，无容器时回到页面顶部。
  let parent = target.parentElement
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent)
    if (
      ['auto', 'scroll', 'overlay'].includes(overflowY) &&
      parent.scrollHeight > parent.clientHeight
    ) {
      parent.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    parent = parent.parentElement
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const activate = () => {
  active.value = true
  void catalog.load(true)
}
onMounted(activate)
onActivated(activate)
onDeactivated(() => {
  active.value = false
})

// 仅成功返回空目录时离开此分类；异常不能当成菜单被关闭。
watch(
  [loaded, loading, games, active],
  () => {
    if (
      route.params.tabKey === HASH_CASINO_TAB_CODE &&
      active.value &&
      loaded.value &&
      !loading.value &&
      !failed.value &&
      !games.value.length
    ) {
      void navigateTo('/casino', { replace: true })
    }
  },
  { flush: 'post' }
)

useIntersectionObserver({
  target: loadMoreRef,
  enabled: () => active.value && isMobile.value,
  rootMargin: '0px 0px 120px 0px',
  onChange: ({ isIntersecting }) => {
    if (isIntersecting)
      visibleCount.value = Math.min(visibleCount.value + 27, filteredGames.value.length)
  }
})

const getPlayerCount = (game: HashGameLotteryGame) => {
  const count = game.onlineCount
  return typeof count === 'number' && Number.isFinite(count) && count >= 0 ? count : null
}
// 哈希游戏跳转进入目标游戏
const handleGameClick = (game: HashGameLotteryGame) => {
  void navigateTo('/hash-game', { query: { gameCode: game.gameCode } })
}
</script>
