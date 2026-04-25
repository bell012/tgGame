<template>
  <div class="eventList">
    <div class="mt-2 flex h-8 items-center sm:mt-6">
      <template v-if="loading">
        <div class="h-5 w-24 rounded bg-bg-2 animate-pulse"></div>
        <div class="ml-auto h-8 w-14 rounded-lg bg-bg-2 animate-pulse"></div>
        <div v-if="!isMobile" class="ml-2 flex gap-x-1">
          <div class="size-8 rounded-lg bg-bg-2 animate-pulse"></div>
          <div class="size-8 rounded-lg bg-bg-2 animate-pulse"></div>
        </div>
      </template>

      <template v-else>
        <h2 class="flex items-center text-base font-extrabold text-primary">
          {{ $t('home.LiveSports') }}
        </h2>
        <a
          href="/gamelist/brand"
          class="button ml-auto flex h-8 items-center gap-1 rounded-lg bg-black_alpha5 px-2 font-extrabold dark:bg-[var(--color-background-level-3)]"
          >{{ $t('home.All') }}</a
        >
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
      </template>
    </div>

    <div
      v-if="loading"
      class="grid-col-1 mx-0 mt-3 grid grid-flow-col gap-2 overflow-hidden"
      style="--grid-gap: 0.75rem; --grid-padding: 0px; --aspect-ratio: 0.75"
    >
      <div v-for="index in skeletonCount" :key="index" class="col-item rounded-[12px]">
        <div class="aspect-[2.12] rounded-xl bg-bg-2 animate-pulse"></div>
      </div>
    </div>

    <div
      v-else
      ref="listWrap"
      class="grid-col-1 hide-scroll relative mx-0 mt-3 grid snap-x snap-mandatory grid-flow-col gap-2 overflow-x-scroll overflow-y-hidden scroll-smooth"
      style="--grid-gap: 0.75rem; --grid-padding: 0px; --aspect-ratio: 0.75"
    >
      <div
        v-for="(event, index) in props.list"
        :key="event.image + '-' + index"
        class="col-item rounded-[12px]"
      >
        <div class="h-full w-full cursor-pointer" @click="handleClick(event.rowId)">
          <div class="relative aspect-[2.12] overflow-hidden rounded-xl bg-layer4">
            <gameErrImg :img="{ src: event.image, maintain: false }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gameErrImg from '@/components/common/gameErrImg.vue'
import { navigateToName } from '@/utils/router'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface EventItem {
  image: string
  rowId: number
}

interface Props {
  list?: EventItem[]
  loading?: boolean
}
// TODO：点击进入游戏详情页
const handleClick = (rowId: number) => navigateToName('gameDetail', { params: { id: rowId } })

const props = withDefaults(defineProps<Props>(), {
  list: () => [],
  loading: false
})

const listWrap = ref<HTMLElement | null>(null)
const isMobile = ref(false)
const skeletonCount = 3

const prevDisabled = ref(true)
const nextDisabled = ref(false)

const updateButtons = () => {
  const el = listWrap.value
  if (!el) return
  const left = el.scrollLeft
  const max = el.scrollWidth - el.clientWidth
  prevDisabled.value = left <= 1
  nextDisabled.value = left >= Math.max(0, max - 1)
}

onMounted(async () => {
  isMobile.value = window.matchMedia('(max-width: 640px)').matches
  await nextTick()
  updateButtons()
  const el = listWrap.value
  if (el) {
    el.addEventListener('scroll', updateButtons, { passive: true })
    window.addEventListener('resize', updateButtons)
  }
})

onBeforeUnmount(() => {
  const el = listWrap.value
  if (el) el.removeEventListener('scroll', updateButtons)
  window.removeEventListener('resize', updateButtons)
})

watch(
  () => props.list.length,
  async () => {
    await nextTick()
    updateButtons()
  }
)

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
</script>

<style scoped lang="scss">
.eventList {
  .icon {
    fill: currentColor;
  }
  a:hover {
    color: inherit;
  }
  .button-icon {
    display: flex;
    width: 32px;
    height: 32px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
  }
}

.grid-col-1 {
  --grid-gap: 0.75rem;
  --grid-column: 3;
  grid-auto-flow: column;
  gap: var(--grid-gap);
  padding-left: var(--grid-padding);
  /* 计算每列宽度：总宽减去间隙后平均分配 */
  grid-auto-columns: calc((100% - (var(--grid-column) - 1) * var(--grid-gap)) / var(--grid-column));
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  box-sizing: border-box;
  /* 让每个直接子项成为列的容器并保持内边距一致 */
  > .col-item {
    box-sizing: border-box;
    padding-left: calc(var(--grid-gap) / 2);
    padding-right: calc(var(--grid-gap) / 2);
    width: 100%;
    background-color: var(--color-background-level-2);
  }
  > .col-item > div {
    width: 100%;
    height: 100%;
  }
}

@media (min-width: 1280px) {
  .grid-col-1 {
    --grid-column: 3;
    --grid-gap: 1rem;
  }
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .grid-col-1 {
    --grid-column: 2;
    --grid-gap: 0.9rem;
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .grid-col-1 {
    --grid-column: 2;
    --grid-gap: 0.75rem;
  }
}
@media (min-width: 640px) and (max-width: 767px) {
  .grid-col-1 {
    --grid-column: 1;
    --grid-gap: 0.6rem;
  }
}
@media (max-width: 639px) {
  .grid-col-1 {
    --grid-column: 1.05;
    --grid-gap: 0.5rem !important;
    grid-auto-columns: calc(
      (100% - (var(--grid-column) - 1) * var(--grid-gap)) / var(--grid-column)
    );
  }
}

.button[disabled] {
  pointer-events: none;
  opacity: 0.6;
}
</style>
