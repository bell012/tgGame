<template>
  <div class="gameList">
    <div class="mt-[14px] flex items-center sm:mt-6 h-8">
      <h2 class="flex items-center text-[14px] font-extrabold text-primary leading-none">
        {{ props.title }}
      </h2>
      <button
        type="button"
        class="button ml-auto flex items-center justify-center bg-bg-3 rounded-lg font-extrabold h-[24px] min-w-[31px] text-[12px] leading-none bg-black_alpha5 px-[6px] dark:bg-layer5"
        @click="emit('all-click')"
      >
        {{ $t('home.All') }}
      </button>
      <div v-if="!isMobile" class="ml-2 flex gap-x-1">
        <button
          @click="scrollPrev"
          :disabled="prevDisabled"
          :class="[
            'button button-icon button-second button-m size-8 !p-0 hover:opacity-80',
            prevDisabled
              ? 'bg-[var(--color-background-level-4)] cursor-not-allowed'
              : 'bg-[var(--color-button-secondary)]'
          ]"
          type="button"
        >
          <div class="icon size-4">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div>
        </button>
        <button
          @click="scrollNext"
          :disabled="nextDisabled"
          :class="[
            'button button-icon button-second button-m size-8 !p-0 hover:opacity-80',
            nextDisabled
              ? 'bg-[var(--color-background-level-4)] cursor-not-allowed'
              : 'bg-[var(--color-button-secondary)]'
          ]"
          type="button"
        >
          <div class="icon size-4 rotate-180">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div>
        </button>
      </div>
    </div>
    <div
      class="grid snap-x relative snap-mandatory grid-flow-col overflow-x-scroll overflow-y-hidden scroll-smooth hide-scroll gap-2 pt-[14px] mx-0 grid-col-3"
      ref="listWrap"
      style="--grid-gap: 0.5rem; --grid-padding: 0px; --aspect-ratio: 0.75"
    >
      <div
        v-for="(value, index) in normalizedList"
        :key="`${value.rowId ?? 'game'}-${index}`"
        class="aspect-[330/438]"
      >
        <casinoGameCard class="size-full" :game="value" @click="handleGameClick(value)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateToName } from '@/utils/router'
import casinoGameCard from '@/views/fun/casino/components/casinoGameCard.vue'
import type { GameDataItem } from '@/api/interface/game'

interface RawGameItem {
  rowId?: string | number
  itemName?: string
  platformName?: string
  initScoreNum?: number | string
  initScoreStar?: number | string
  icon2?: string
  conUrl?: string
  icon1?: string
  icon3?: string
  [key: string]: unknown
}

interface Props {
  title: string
  list: RawGameItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'all-click': []
}>()
const listWrap = ref<HTMLElement | null>(null)
const isMobile = useIsMobile()

const prevDisabled = ref(true)
const nextDisabled = ref(false)

const normalizedList = computed<GameDataItem[]>(() => {
  return (Array.isArray(props.list) ? props.list : []).map(item => {
    return {
      ...(item as Record<string, unknown>),
      itemName: String(item.itemName ?? item.platformName ?? '').trim(),
      icon2: String(item.icon2 ?? item.conUrl ?? '').trim(),
      conUrl: String(item.conUrl ?? '').trim()
    } as GameDataItem
  })
})

const updateButtons = () => {
  const el = listWrap.value
  if (!el) return
  const left = el.scrollLeft
  const max = el.scrollWidth - el.clientWidth
  prevDisabled.value = left <= 1
  nextDisabled.value = left >= Math.max(0, max - 1)
}

onMounted(async () => {
  await nextTick()
  updateButtons()
  const el = listWrap.value
  if (el) {
    el.addEventListener('scroll', updateButtons, { passive: true })
    window.addEventListener('resize', updateButtons)
  }
})

watch(
  () => normalizedList.value.length,
  async () => {
    await nextTick()
    updateButtons()
  }
)

onBeforeUnmount(() => {
  const el = listWrap.value
  if (el) el.removeEventListener('scroll', updateButtons)
  window.removeEventListener('resize', updateButtons)
})

const getScrollUnit = (el: HTMLElement) => {
  return Math.round(el.clientWidth)
}

const scrollNext = () => {
  const el = listWrap.value
  if (!el || nextDisabled.value) return
  const unit = getScrollUnit(el)
  el.scrollBy({ left: unit, behavior: 'smooth' })
  // 延迟更新以配合平滑滚动
  setTimeout(updateButtons, 350)
}

const scrollPrev = () => {
  const el = listWrap.value
  if (!el || prevDisabled.value) return
  const unit = getScrollUnit(el)
  el.scrollBy({ left: -unit, behavior: 'smooth' })
  setTimeout(updateButtons, 350)
}

const handleGameClick = (item: GameDataItem) => {
  const rowId = String(item.rowId ?? '').trim()
  if (!rowId) {
    return
  }

  navigateToName('gameDetail', {
    params: {
      rowId
    }
  })
}
</script>

<style scoped lang="scss">
.gameList {
  .button-icon {
    display: flex;
    width: 32px;
    height: 32px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
  }
}

.grid-col-3 {
  --grid-column: 4;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - (var(--grid-column) - 1) * var(--grid-gap)) / var(--grid-column));
  gap: var(--grid-gap);
  padding-left: var(--grid-padding);
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x pan-y;
}

@media (min-width: 1280px) {
  .grid-col-3 {
    --grid-column: 8;
  }
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .grid-col-3 {
    --grid-column: 7;
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .grid-col-3 {
    --grid-column: 5;
  }
}
@media (max-width: 767px) {
  .grid-col-3 {
    --grid-column: 3.15;
  }
}

@media (max-width: 639px) {
  /* 关闭平滑滚动（手机滑动使用原生体验） */
  .grid-col-3 {
    scroll-behavior: auto !important;
    -webkit-overflow-scrolling: touch;
  }
}
.button[disabled] {
  pointer-events: none;
  opacity: 0.6;
}
</style>
