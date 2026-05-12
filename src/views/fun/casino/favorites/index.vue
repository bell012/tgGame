<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header :title="t('home.favorites_games')" />
      <div
        ref="mobileScrollRef"
        class="casino-fullpage-scroll-y flex-1 min-h-0 overflow-y-auto px-[14px] pt-2.5 pb-4"
      >
        <div
          v-if="isCollectionsListLoading && favoriteGames.length === 0"
          class="grid w-full grid-cols-3 gap-2.5"
        >
          <div
            v-for="index in 27"
            :key="`favorite-loading-mobile-${index}`"
            class="aspect-[330/438] animate-pulse rounded-lg bg-bg-2"
          />
        </div>
        <div v-else-if="favoriteGames.length > 0" class="grid w-full grid-cols-3 gap-2.5">
          <div
            v-for="(game, index) in favoriteGames"
            :key="game.rowId ?? index"
            class="aspect-[330/438]"
          >
            <casinoGameCard :game="game" show-favorite-badge @click="handleClick(game.rowId)" />
          </div>
        </div>
        <ThemedEmptyState
          v-else
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :message="t('search.stay')"
          container-class="mt-[17px]"
          image-class="w-[220px] h-[200px] object-contain mb-2.5"
          text-class="text-xs text-center text-text-1"
        />

        <template v-if="isRecommendedLoading || recommendedGames.length > 0">
          <h2 class="mt-5 mb-2.5 font-inter text-base font-bold text-text-1">
            {{ t('home.recommended_games') }}
          </h2>
          <div
            v-if="isRecommendedLoading && recommendedGames.length === 0"
            class="grid w-full grid-cols-3 gap-2.5"
          >
            <div
              v-for="index in 27"
              :key="`recommended-loading-mobile-${index}`"
              class="aspect-[330/438] animate-pulse rounded-lg bg-bg-2"
            />
          </div>
          <div v-else-if="recommendedGames.length > 0" class="grid w-full grid-cols-3 gap-2.5">
            <div
              v-for="(game, index) in recommendedGames"
              :key="`rec-${game.rowId ?? index}`"
              class="aspect-[330/438]"
            >
              <casinoGameCard :game="game" @click="handleClick(game.rowId)" />
            </div>
          </div>
        </template>
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
          {{ t('home.favorites_games') }}
        </h1>
      </div>

      <div
        v-if="isCollectionsListLoading && favoriteGames.length === 0"
        class="grid w-full grid-cols-8 gap-2.5"
      >
        <div
          v-for="index in 32"
          :key="`favorite-loading-pc-${index}`"
          class="aspect-[330/438] animate-pulse rounded-lg bg-bg-2"
        />
      </div>
      <div v-else-if="favoriteGames.length > 0" class="grid w-full grid-cols-8 gap-2.5">
        <div
          v-for="(game, index) in favoriteGames"
          :key="game.rowId ?? index"
          class="aspect-[330/438]"
        >
          <casinoGameCard :game="game" show-favorite-badge @click="handleClick(game.rowId)" />
        </div>
      </div>
      <ThemedEmptyState
        v-else
        :dark-image="defaultImgDark"
        :light-image="defaultImgLight"
        :message="t('search.stay')"
        container-class="mt-[17px]"
        image-class="w-[220px] h-[200px] object-contain mb-2.5"
        text-class="text-xs text-center text-text-1"
      />

      <template v-if="isRecommendedLoading || recommendedGames.length > 0">
        <h2 class="mt-4 font-inter text-xl font-bold text-text-1">
          {{ t('home.recommended_games') }}
        </h2>
        <div
          v-if="isRecommendedLoading && recommendedGames.length === 0"
          class="mt-2.5 grid w-full grid-cols-8 gap-2.5"
        >
          <div
            v-for="index in 32"
            :key="`recommended-loading-pc-${index}`"
            class="aspect-[330/438] animate-pulse rounded-lg bg-bg-2"
          />
        </div>
        <div v-else-if="recommendedGames.length > 0" class="mt-2.5 grid w-full grid-cols-8 gap-2.5">
          <div
            v-for="(game, index) in recommendedGames"
            :key="`rec-pc-${game.rowId ?? index}`"
            class="aspect-[330/438]"
          >
            <casinoGameCard :game="game" @click="handleClick(game.rowId)" />
          </div>
        </div>
      </template>

      <CommonFooter class="mt-[40px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { GameDataItem } from '@/api/interface/game'
import H5Header from '@/components/common/H5Header.vue'
import CommonFooter from '@/components/commonFooter.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { navigateToName } from '@/utils/router'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import casinoGameCard from '../components/casinoGameCard.vue'
import { getCasinoQueryOptions } from '../casinoPageConfig'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const mobileScrollRef = ref<HTMLElement | null>(null)

const gameStore = useGameStore()
const userStore = useUserStore()
const { acctInfo } = storeToRefs(userStore)
const { collectionsListData, isCollectionsListLoading } = storeToRefs(gameStore)
const favoriteGames = computed<GameDataItem[]>(() => collectionsListData.value as GameDataItem[])

const recommendedGames = ref<GameDataItem[]>([])
const isRecommendedLoading = ref(false)

const fetchRecommendedHotGames = async () => {
  const opts = getCasinoQueryOptions('hot_games', { isMobile: isMobile.value })
  if (!opts) {
    recommendedGames.value = []
    return
  }
  isRecommendedLoading.value = true
  try {
    const { list } = await gameStore.queryGameDataPage({ ...opts, page: 1 })
    recommendedGames.value = list
  } catch {
    recommendedGames.value = []
  } finally {
    isRecommendedLoading.value = false
  }
}

const fetchFavoritesData = async () => {
  const memberRowId = Number(acctInfo.value?.memberRowId)
  if (!Number.isFinite(memberRowId) || memberRowId <= 0) {
    return
  }

  await gameStore.fetchCollectionsListData(memberRowId)
}

const handleClick = (rowId?: number | string) => {
  if (!rowId) return
  navigateToName('gameDetail', { params: { rowId } })
}

const handleBack = () => {
  router.back()
}

const scrollPageToTop = () => {
  nextTick(() => {
    mobileScrollRef.value?.scrollTo({
      top: 0,
      behavior: 'auto'
    })

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    })
  })
}

onMounted(async () => {
  await Promise.all([fetchFavoritesData(), fetchRecommendedHotGames()])
  scrollPageToTop()
})

watch(
  () => route.fullPath,
  () => {
    scrollPageToTop()
  }
)
</script>

<style scoped lang="scss">
.casino-fullpage-scroll-y {
  scrollbar-width: thin;
  scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track);
}

.casino-fullpage-scroll-y::-webkit-scrollbar {
  display: block !important;
  width: 4px;
  height: 4px;
}

.casino-fullpage-scroll-y::-webkit-scrollbar-track {
  background-color: var(--color-scrollbar-track);
}

.casino-fullpage-scroll-y::-webkit-scrollbar-thumb {
  background-color: var(--color-scrollbar-thumb);
  border-radius: 4px;

  &:hover {
    background-color: var(--color-scrollbar-thumb-hover);
  }
}
</style>
