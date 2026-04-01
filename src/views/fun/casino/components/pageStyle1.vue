<template>
  <div class="modules mb-4" v-for="(item, index) in lobbyButtons" :key="index">
    <div class="mt-2 flex h-8 items-center font-inter sm:mt-6">
      <h2 class="flex items-center text-sm sm:text-base font-bold sm:font-extrabold text-text-1">
        {{ item.sysGameTypeName }}
      </h2>
      <button
        class="button ml-auto flex items-center gap-1 rounded-lg text-text-1 text-sm sm:text-base font-bold sm:font-extrabold h-8 bg-opacity-10 px-2 inactive"
        @click="handleViewAll(item)"
      >
        {{ t('casino.all') }}
      </button>
      <div class="hidden sm:flex ml-2 gap-x-1">
        <button
          type="button"
          class="button ml-auto flex items-center gap-1 rounded-lg font-extrabold h-8 bg-opacity-10 px-2 inactive"
          :disabled="!canScrollLeft[index]"
          @click="scrollLeft(index)"
        >
          <div class="icon size-4" :class="canScrollLeft[index] ? 'text-text-1' : 'text-icon-3'">
            <component :is="casinoIcons.chevron_left" class="size-4 fill-current" />
          </div>
        </button>
        <button
          type="button"
          class="button ml-auto flex items-center gap-1 rounded-lg font-extrabold h-8 bg-opacity-10 px-2 inactive"
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
        v-if="item.items && item.items.length > 0"
        :ref="el => setScrollRef(el as HTMLElement | null, index)"
        class="grid grid-flow-col gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pt-3 auto-cols-[30.25%] sm:auto-cols-[11.82%]"
      >
        <div
          v-for="(game, i) in getDisplayList(item.items)"
          :key="game.rowId ?? i"
          class="aspect-[330/438] min-h-[146px]"
        >
          <casinoGameCard :game="game" @click="handleClick(`/casino`)" />
        </div>
        <div>
          <a
            href="javascript:void(0);"
            class="game-item group relative flex size-full flex-col items-center overflow-hidden rounded-lg transition-all sm:hover:-translate-y-2 inactive aspect-[330/438] min-h-[146px]"
            @click="handleViewAll(item)"
          >
            <img class="h-full w-full" alt="all" src="@/static/img/test/game_all.webp" />
            <span
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-extrabold text-common-100 text-xs sm:text-sm"
            >
              View All
            </span>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-2 flex items-center sm:mt-6 h-8">
    <h2 class="flex items-center text-base font-extrabold text-primary">
      {{ t('casino.latest_bet') }}
    </h2>
    <span class="ml-auto"></span>
  </div>
  <div
    class="mt-2 flex w-full rounded bg-opacity-6 text-text-2 sm:!-mt-9 sm:ml-auto sm:max-w-[347px]"
  >
    <button
      :class="{
        'bg-opacity-10 text-text-4 dark:text-text-1 ': latestBetIndex === 0
      }"
      class="flex-1 h-10 shrink-0 rounded-lg font-bold text-sm flex items-center justify-center"
      @click.stop="latestBetIndex = 0"
    >
      {{ t('casino.latest_bet') }}
    </button>
    <button
      :class="{
        'bg-opacity-10 text-text-4 dark:text-text-1 ': latestBetIndex === 1
      }"
      class="flex-1 h-10 shrink-0 rounded-lg font-bold text-sm flex items-center justify-center"
      @click.stop="latestBetIndex = 1"
    >
      {{ t('casino.high_roller') }}
    </button>
  </div>
  <div class="my-3 h-[430px]">
    <liveBet />
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateTo } from '@/utils/router'
import { casinoIcons } from '@/static/svg/casino'
import type { CasinoLobbyButtonItem } from '@/composables/useCasinoTabButtons'
import type { GameDataItem } from '@/api/interface/game'
import { getGameListTabSlug } from '../casinoPageConfig'
import liveBet from './liveBet.vue'
import casinoGameCard from './casinoGameCard.vue'

const props = defineProps<{
  modules?: CasinoLobbyButtonItem[]
}>()

const { t } = useI18n()
const isMobile = useIsMobile()

const lobbyButtons = computed<CasinoLobbyButtonItem[]>(() => {
  return (props.modules ?? []).filter(item => item.sysGameTypeCode)
})

const latestBetIndex = ref(0)
const scrollRefs = ref<HTMLElement[]>([])
const canScrollLeft = ref<boolean[]>([])
const canScrollRight = ref<boolean[]>([])

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
  return isMobile.value ? list.slice(0, 11) : list.slice(0, 15)
}

const handleClick = (path: string) => {
  navigateTo(path)
}

const handleViewAll = (item: CasinoLobbyButtonItem) => {
  const tabSlug = getGameListTabSlug(item.sysGameTypeCode)

  if (!tabSlug) {
    return
  }

  navigateTo(`/gamelist/${tabSlug}`)
}
</script>
<style scoped lang="scss"></style>
