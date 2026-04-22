<template>
  <div v-if="loading" class="w-full">
    <div v-for="sectionIndex in skeletonSectionCount" :key="sectionIndex" class="modules mb-4">
      <div class="mt-2 flex h-8 items-center font-inter sm:mt-6">
        <div class="h-5 w-24 rounded bg-bg-2 animate-pulse sm:h-6 sm:w-32" />
        <div class="ml-auto h-8 w-16 rounded-lg bg-bg-2 animate-pulse sm:w-20" />
        <div class="ml-2 hidden gap-x-1 sm:flex">
          <div class="h-8 w-8 rounded-lg bg-bg-2 animate-pulse" />
          <div class="h-8 w-8 rounded-lg bg-bg-2 animate-pulse" />
        </div>
      </div>

      <div
        class="grid grid-flow-col gap-2 overflow-hidden pt-3 auto-cols-[30.25%] sm:auto-cols-[11.82%]"
      >
        <div
          v-for="cardIndex in skeletonCardCount"
          :key="`${sectionIndex}-${cardIndex}`"
          class="aspect-[330/438] rounded-lg bg-bg-2 animate-pulse"
        />
      </div>
    </div>
  </div>

  <template v-else>
    <div class="modules mb-4" v-for="(item, index) in lobbyButtons" :key="index">
      <div class="mt-2 flex h-8 items-center font-inter sm:mt-6">
        <h2 class="flex items-center text-sm font-bold text-text-1 sm:text-base sm:font-extrabold">
          {{ item.sysGameTypeName }}
        </h2>
        <button
          class="button inactive ml-auto flex h-8 items-center gap-1 rounded-lg bg-opacity-10 px-2 text-sm font-bold text-text-1 sm:text-base sm:font-extrabold"
          @click="handleViewAll(item)"
        >
          {{ t('casino.all') }}
        </button>
        <div class="ml-2 hidden gap-x-1 sm:flex">
          <button
            type="button"
            class="button inactive ml-auto flex h-8 items-center gap-1 rounded-lg bg-opacity-10 px-2 font-extrabold"
            :disabled="!canScrollLeft[index]"
            @click="scrollLeft(index)"
          >
            <div class="icon size-4" :class="canScrollLeft[index] ? 'text-text-1' : 'text-icon-3'">
              <component :is="casinoIcons.chevron_left" class="size-4 fill-current" />
            </div>
          </button>
          <button
            type="button"
            class="button inactive ml-auto flex h-8 items-center gap-1 rounded-lg bg-opacity-10 px-2 font-extrabold"
            :disabled="!canScrollRight[index]"
            @click="scrollRight(index)"
          >
            <div
              class="icon size-4 rotate-180"
              :class="canScrollRight[index] ? 'text-text-1' : 'text-icon-3'"
            >
              <component :is="casinoIcons.chevron_left" class="size-4 fill-current" />
            </div>
          </button>
        </div>
      </div>
      <div class="w-full overflow-x-auto">
        <div
          v-if="
            item.sysGameTypeCode === 'providers' && item.brandItems && item.brandItems.length > 0
          "
          :ref="el => setScrollRef(el as HTMLElement | null, index)"
          class="grid grid-flow-col auto-cols-[30.25%] gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pt-3 sm:auto-cols-[11.82%]"
        >
          <div
            v-for="(brand, i) in getDisplayBrandList(item.brandItems)"
            :key="brand.rowId ?? i"
            class="flex h-16 shrink-0 items-center justify-center rounded-lg bg-bg-2"
            @click="handleBrandClick(brand)"
          >
            <div class="h-6 w-4/5 sm:h-11">
              <gameRemoteImg :img="getBrandImg(brand)" :alt="brand.brandName" />
            </div>
          </div>
        </div>
        <div
          v-else-if="item.items && item.items.length > 0"
          :ref="el => setScrollRef(el as HTMLElement | null, index)"
          class="grid grid-flow-col auto-cols-[30.25%] gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pt-3 sm:auto-cols-[11.82%]"
        >
          <div
            v-for="(game, i) in getDisplayList(item.items)"
            :key="game.rowId ?? i"
            class="aspect-[330/438]"
          >
            <casinoGameCard :game="game" @click="handleClick(game.rowId)" />
          </div>
          <button
            type="button"
            class="relative flex aspect-[330/438] flex-col items-center justify-center rounded-lg transition-transform duration-200 ease-out sm:hover:-translate-y-2 active:translate-y-0 inactive"
            @click="handleViewAll(item)"
          >
            <SmartImage :src="viewAllLightIcon" alt="view all" class="dark:!hidden w-full h-full" />
            <SmartImage
              :src="viewAllDarkIcon"
              alt="view all"
              class="!hidden dark:!block w-full h-full"
            />
            <span
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-common-100 sm:text-base"
            >
              {{ t('casino.view_all') }}
            </span>
          </button>
        </div>
      </div>
    </div>
    <template v-if="!hideLatestBet">
      <div class="mt-2 flex h-8 items-center sm:mt-6">
        <h2 class="flex items-center text-base font-extrabold text-primary">
          {{ t('casino.latest_bet') }}
        </h2>
        <span class="ml-auto"></span>
      </div>
      <div
        class="mt-2 flex w-full rounded-lg bg-bg-8 text-text-2 sm:!-mt-9 sm:ml-auto sm:max-w-[347px]"
      >
        <button
          :class="{
            'bg-bg-7 text-text-1': latestBetIndex === 0
          }"
          class="flex h-10 flex-1 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          @click.stop="latestBetIndex = 0"
        >
          {{ t('casino.latest_bet') }}
        </button>
        <button
          :class="{
            'bg-bg-7 text-text-1': latestBetIndex === 1
          }"
          class="flex h-10 flex-1 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          @click.stop="latestBetIndex = 1"
        >
          {{ t('casino.high_roller') }}
        </button>
      </div>
      <div class="mt-3 h-[430px]">
        <liveBet :type="latestBetIndex === 0 ? 1 : 2" />
      </div>
    </template>
  </template>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateTo, navigateToName } from '@/utils/router'
import { casinoIcons } from '@/static/svg/casino'
import type { CasinoLobbyButtonItem } from '@/composables/useCasinoTabButtons'
import type { GameBrandItem, GameDataItem } from '@/api/interface/game'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import { getGameListTabSlug } from '../casinoPageConfig'
import casinoGameCard from './casinoGameCard.vue'
import liveBet from './liveBet.vue'
import viewAllDarkIcon from '@/static/img/casino/all_view_dark.png'
import viewAllLightIcon from '@/static/img/casino/all_view_light.png'

const props = defineProps<{
  modules?: CasinoLobbyButtonItem[]
  loading?: boolean
  hideLatestBet?: boolean
}>()

const { t } = useI18n()
const isMobile = useIsMobile()
const hideLatestBet = computed(() => Boolean(props.hideLatestBet))

const lobbyButtons = computed<CasinoLobbyButtonItem[]>(() => {
  return (props.modules ?? []).filter(item => item.sysGameTypeCode)
})

const latestBetIndex = ref(0)
const scrollRefs = ref<HTMLElement[]>([])
const canScrollLeft = ref<boolean[]>([])
const canScrollRight = ref<boolean[]>([])
const skeletonSectionCount = computed(() => (isMobile.value ? 3 : 4))
const skeletonCardCount = computed(() => (isMobile.value ? 4 : 8))
const closeDesktopModalFlag = inject<Ref<boolean> | null>('search-close-desktop-modal', null)

const closeDesktopModal = () => {
  if (closeDesktopModalFlag) {
    closeDesktopModalFlag.value = true
  }
}

const setScrollRef = (el: HTMLElement | null, index: number) => {
  if (!el) return
  scrollRefs.value[index] = el

  nextTick(() => {
    updateScrollState(index)
    el.addEventListener('scroll', () => updateScrollState(index))
  })
}

const updateScrollState = (index: number) => {
  const el = scrollRefs.value[index]
  if (!el) return

  const max = el.scrollWidth - el.clientWidth

  canScrollLeft.value[index] = el.scrollLeft > 1
  canScrollRight.value[index] = el.scrollLeft < max - 1
}

const scrollLeft = (index: number) => {
  const el = scrollRefs.value[index]
  if (!el) return

  const target = el.scrollLeft - el.clientWidth

  el.scrollTo({
    left: Math.max(target, 0),
    behavior: 'smooth'
  })
}

const scrollRight = (index: number) => {
  const el = scrollRefs.value[index]
  if (!el) return

  const maxScrollLeft = el.scrollWidth - el.clientWidth
  const target = el.scrollLeft + el.clientWidth

  el.scrollTo({
    left: Math.min(target, maxScrollLeft),
    behavior: 'smooth'
  })
}

const getDisplayList = (list: GameDataItem[]) => {
  return isMobile.value ? list.slice(0, 10) : list.slice(0, 10)
}

const getDisplayBrandList = (list: GameBrandItem[]) => {
  return isMobile.value ? list.slice(0, 10) : list.slice(0, 10)
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
  if (!rowId) {
    return
  }

  closeDesktopModal()
  navigateToName('gameDetail', { params: { rowId } })
}

const handleBrandClick = (brand: GameBrandItem) => {
  const brandCode = String(brand.brandCode || '').trim()

  if (!brandCode) {
    return
  }

  closeDesktopModal()
  navigateToName('brandGameList', {
    params: { brandCode },
    query: {
      brandName: brand.brandName?.trim() || undefined
    }
  })
}

const handleViewAll = (item: CasinoLobbyButtonItem) => {
  const tabSlug = getGameListTabSlug(item.sysGameTypeCode)

  if (!tabSlug) {
    return
  }

  closeDesktopModal()
  navigateTo(`/gamelist/${tabSlug}`)
}
</script>

<style scoped lang="scss"></style>
