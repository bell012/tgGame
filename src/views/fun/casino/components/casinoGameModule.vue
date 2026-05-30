<template>
  <div class="modules mb-2.5 sm:mb-4">
    <template v-if="props.loading">
      <div class="mt-2 flex h-8 items-center font-inter sm:mt-6">
        <div class="h-5 w-24 rounded bg-bg-2 animate-pulse sm:h-6 sm:w-32" />
        <div class="ml-auto h-8 w-16 rounded-lg bg-bg-2 animate-pulse sm:w-20" />
        <div class="ml-2 hidden gap-x-1 sm:flex">
          <div class="h-8 w-8 rounded-lg bg-bg-2 animate-pulse" />
          <div class="h-8 w-8 rounded-lg bg-bg-2 animate-pulse" />
        </div>
      </div>
      <div
        class="grid grid-flow-col gap-2 overflow-hidden pt-3 auto-cols-[31.2%] sm:auto-cols-[11.82%]"
      >
        <div
          v-for="cardIndex in skeletonCardCount"
          :key="cardIndex"
          class="aspect-[330/438] rounded-lg bg-bg-2 animate-pulse"
        />
      </div>
    </template>

    <template v-else-if="props.module">
      <div class="mt-2 flex h-8 items-center font-inter sm:mt-6">
        <h2 class="flex h-8 items-center text-base font-bold leading-none text-text-1 sm:text-xl">
          {{ props.module.sysGameTypeName }}
        </h2>
        <button
          type="button"
          class="button inactive ml-auto flex h-8 shrink-0 items-center justify-center gap-0.5 rounded-lg bg-opacity-10 px-2 text-xs font-bold leading-none text-text-1 whitespace-nowrap sm:text-sm"
          @click="handleViewAll(props.module)"
        >
          {{ t('casino.all') }}
          <div class="hidden size-4 shrink-0 rotate-180 text-text-1 sm:block">
            <component :is="casinoIcons.chevron_left" class="size-4 fill-current" />
          </div>
        </button>
        <div class="ml-2 hidden shrink-0 gap-x-1 sm:flex">
          <button
            type="button"
            class="button inactive flex size-8 shrink-0 items-center justify-center rounded-lg p-0"
            :class="canScrollLeft ? 'bg-opacity-10' : 'bg-bg-4'"
            :disabled="!canScrollLeft"
            @click="scrollLeft"
          >
            <div class="icon size-4" :class="canScrollLeft ? 'text-text-1' : 'text-icon-3'">
              <component :is="casinoIcons.chevron_left" class="size-4 fill-current" />
            </div>
          </button>
          <button
            type="button"
            class="button inactive flex size-8 shrink-0 items-center justify-center rounded-lg p-0"
            :class="canScrollRight ? 'bg-opacity-10' : 'bg-bg-4'"
            :disabled="!canScrollRight"
            @click="scrollRight"
          >
            <div
              class="icon size-4 rotate-180"
              :class="canScrollRight ? 'text-text-1' : 'text-icon-3'"
            >
              <component :is="casinoIcons.chevron_left" class="size-4 fill-current" />
            </div>
          </button>
        </div>
      </div>
      <div class="relative z-[2] w-full">
        <div
          v-if="
            props.module.sysGameTypeCode === 'providers' &&
            props.module.brandItems &&
            props.module.brandItems.length > 0
          "
          ref="scrollRef"
          class="relative -mx-[14px] grid snap-x snap-mandatory grid-flow-col auto-cols-[31.2%] gap-2 overflow-x-scroll overflow-y-hidden scroll-smooth px-[14px] pt-2.5 sm:pt-3 hide-scroll [scroll-padding-inline:14px] sm:mx-0 sm:auto-cols-[11.82%] sm:px-0 sm:[scroll-padding-inline:0]"
        >
          <div
            v-for="(brand, i) in getDisplayBrandList(props.module.brandItems)"
            :key="brand.rowId ?? i"
            class="flex h-16 shrink-0 snap-start items-center justify-center rounded-lg bg-bg-2"
            @click="handleBrandClick(brand)"
          >
            <div class="h-6 w-4/5 sm:h-11">
              <gameRemoteImg :img="getBrandImg(brand)" :alt="brand.brandName" />
            </div>
          </div>
        </div>
        <div
          v-else-if="props.module.items && props.module.items.length > 0"
          ref="scrollRef"
          class="relative -mx-[14px] grid snap-x snap-mandatory grid-flow-col auto-cols-[31.2%] gap-2 overflow-x-scroll overflow-y-hidden scroll-smooth px-[14px] pt-2.5 hide-scroll [scroll-padding-inline:14px] sm:mx-0 sm:auto-cols-[11.82%] sm:px-0 sm:[scroll-padding-inline:0]"
        >
          <div
            v-for="(game, i) in getDisplayList(props.module.items)"
            :key="resolveModuleGame(game).rowId ?? i"
            class="aspect-[330/438] snap-start"
          >
            <casinoGameCard
              :game="resolveModuleGame(game)"
              :show-favorite-badge="resolveFavoriteBadge(game)"
              @click="handleClick(resolveModuleGame(game).rowId)"
            />
          </div>
          <button
            type="button"
            class="relative flex aspect-[330/438] snap-start flex-col items-center justify-center rounded-lg transition-transform duration-200 ease-out sm:hover:-translate-y-2 active:translate-y-0 inactive"
            @click="handleViewAll(props.module)"
          >
            <SmartImage :src="viewAllLightIcon" alt="view all" class="dark:!hidden w-full h-full" />
            <SmartImage
              :src="viewAllDarkIcon"
              alt="view all"
              class="!hidden dark:!block w-full h-full"
            />
            <span
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-common-100 sm:text-base whitespace-nowrap"
            >
              {{ t('casino.view_all') }}
            </span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateTo, navigateToName } from '@/utils/router'
import { casinoIcons } from '@/static/svg/casino'
import type { CasinoLobbyButtonItem } from '@/composables/useCasinoTabButtons'
import type { GameBrandItem, GameDataItem } from '@/api/interface/game'
import type { HomeCollectionDisplayItem } from '@/stores/game'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import { getGameListTabSlug } from '../casinoPageConfig'
import casinoGameCard from './casinoGameCard.vue'
import viewAllDarkIcon from '@/static/img/casino/all_view_dark.png'
import viewAllLightIcon from '@/static/img/casino/all_view_light.png'

const props = withDefaults(
  defineProps<{
    module?: CasinoLobbyButtonItem
    loading?: boolean
    viewAllMode?: 'casino' | 'home'
    /** 收藏横滑等：卡片左上角收藏图标 */
    showFavoriteCardBadge?: boolean
  }>(),
  {
    viewAllMode: 'casino',
    showFavoriteCardBadge: false
  }
)

const { t } = useI18n()
const isMobile = useIsMobile()
const skeletonCardCount = computed(() => (isMobile.value ? 4 : 8))
const closeDesktopModalFlag = inject<Ref<boolean> | null>('search-close-desktop-modal', null)
const scrollRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const SCROLL_EDGE_EPS_PX = 2

const closeDesktopModal = () => {
  if (closeDesktopModalFlag) {
    closeDesktopModalFlag.value = true
  }
}

const updateScrollState = () => {
  const el = scrollRef.value
  if (!el) return
  const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
  const sl = el.scrollLeft
  const eps = SCROLL_EDGE_EPS_PX
  canScrollLeft.value = sl > eps
  canScrollRight.value = maxScrollLeft > eps && maxScrollLeft - sl > eps
}

const scrollLeft = () => {
  const el = scrollRef.value
  if (!el) return
  const eps = SCROLL_EDGE_EPS_PX
  const sl = el.scrollLeft
  if (sl <= eps) return
  const target = sl - el.clientWidth
  el.scrollTo({ left: Math.max(target, 0), behavior: 'smooth' })
}

const scrollRight = () => {
  const el = scrollRef.value
  if (!el) return
  const eps = SCROLL_EDGE_EPS_PX
  const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
  const sl = el.scrollLeft
  if (maxScrollLeft <= eps || maxScrollLeft - sl <= eps) return
  const target = sl + el.clientWidth
  el.scrollTo({ left: Math.min(target, maxScrollLeft), behavior: 'smooth' })
}

type ModuleGameItem = GameDataItem | HomeCollectionDisplayItem

const isHomeCollectionItem = (item: ModuleGameItem): item is HomeCollectionDisplayItem => {
  return typeof item === 'object' && item !== null && 'source' in item && 'game' in item
}

const resolveModuleGame = (item: ModuleGameItem): GameDataItem => {
  return isHomeCollectionItem(item) ? item.game : item
}

const resolveFavoriteBadge = (item: ModuleGameItem): boolean => {
  if (!props.showFavoriteCardBadge) {
    return false
  }

  if (isHomeCollectionItem(item)) {
    return item.source === 'favorite'
  }

  return true
}

const getDisplayList = (list: ModuleGameItem[]) => {
  return list.slice(0, 10)
}

const getDisplayBrandList = (list: GameBrandItem[]) => {
  return list.slice(0, 10)
}

const getBrandImg = (item: GameBrandItem) => {
  const imagePath = item.banner || item.icon || item.icon2
  const src = imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''
  return {
    maintain: false,
    src,
    fit: 'contain' as const
  }
}

const handleClick = (rowId?: string | number) => {
  if (!rowId) return
  closeDesktopModal()
  navigateToName('gameDetail', { params: { rowId } })
}

const handleBrandClick = (brand: GameBrandItem) => {
  const brandCode = String(brand.brandCode || '').trim()
  if (!brandCode) return
  closeDesktopModal()
  navigateToName('brandGameList', {
    params: { brandCode },
    query: {
      brandName: brand.brandName?.trim() || undefined
    }
  })
}

const handleViewAll = (item: CasinoLobbyButtonItem) => {
  const sysGameTypeCode = String(item.sysGameTypeCode ?? '').trim()
  if (!sysGameTypeCode) return

  if (props.viewAllMode === 'home' && sysGameTypeCode === 'favorites') {
    navigateTo('/favorites-games')
    return
  }

  const tabSlug = getGameListTabSlug(sysGameTypeCode)
  if (!tabSlug) return
  if (props.viewAllMode !== 'home') {
    closeDesktopModal()
  }
  navigateTo(`/gamelist/${tabSlug}`)
}

const onScroll = () => updateScrollState()
let resizeObserver: ResizeObserver | undefined

watch(
  () =>
    [
      props.loading,
      props.module?.sysGameTypeCode,
      props.module?.items?.length,
      props.module?.brandItems?.length
    ] as const,
  () => {
    nextTick(() => {
      updateScrollState()
      requestAnimationFrame(() => updateScrollState())
    })
  }
)

onMounted(() => {
  nextTick(() => {
    updateScrollState()
    if (!scrollRef.value) return
    scrollRef.value.addEventListener('scroll', onScroll, { passive: true })
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateScrollState())
      resizeObserver.observe(scrollRef.value)
    }
  })
})

onUnmounted(() => {
  scrollRef.value?.removeEventListener('scroll', onScroll)
  resizeObserver?.disconnect()
})
</script>
