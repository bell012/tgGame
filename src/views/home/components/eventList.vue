<template>
  <div class="eventList">
    <div class="mt-2 flex items-center sm:mt-6 h-8">
      <h2 class="flex items-center text-base font-extrabold text-primary">
        {{ $t('home.LiveSports') }}
      </h2>
      <a
        href="/gamelist/brand"
        class="button ml-auto flex items-center gap-1 rounded-lg font-extrabold h-8 bg-black_alpha5 px-2 dark:bg-[var(--color-background-level-3)]"
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
    </div>
    <div
      ref="listWrap"
      class="grid snap-x relative snap-mandatory grid-flow-col overflow-x-scroll overflow-y-hidden scroll-smooth hide-scroll mx-0 mt-3 gap-2 grid-col-1"
      style="--grid-gap: 0.75rem; --grid-padding: 0px; --aspect-ratio: 0.75"
    >
      <div v-for="(event, index) in events" :key="index" class="col-item rounded-[12px]">
        <div
          class="relative flex h-full w-full cursor-pointer flex-col rounded-xl bg-layer4 px-3 py-2.5"
        >
          <p class="flex max-w-full items-center text-ellipsis whitespace-nowrap font-semibold">
            <span>{{ event.sport }}</span
            ><span class="sports-dont ml-1.5"></span><span class="ml-1.5">{{ event.type }}</span>
          </p>
          <div
            class="text-[var(--color-secondary-level-4)] rounded-[6px] bg-[var(--color-secondary-level-3)] absolute right-2 top-2.5 flex h-6 items-center rounded-md px-1.5 bg-brand/10 text-brand"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="7"
              height="8"
              viewBox="0 0 7 8"
              fill="none"
            >
              <path
                d="M6.00976 3.14497L1.51853 0.421399C0.852092 0.0172616 0 0.497062 0 1.27646V6.7236C0 7.50299 0.852091 7.9828 1.51852 7.57866L6.00976 4.85509C6.65173 4.46579 6.65173 3.53427 6.00976 3.14497Z"
                fill="#2AEE88"
              />
            </svg>
            <span class="ml-0.5">{{ $t('home.Live') }}</span>
          </div>
          <div class="flex flex-grow flex-col justify-between">
            <div class="center flex flex-1 items-center">
              <div class="mt-4 flex w-full items-center justify-between">
                <div class="flex w-1/3 flex-none flex-col items-center justify-center">
                  <div class="sports-banner-match-icon h-12">
                    <div>
                      <img alt="icon" :src="event.team1.icon" />
                    </div>
                  </div>
                  <p class="mt-1.5 text-center font-semibold">{{ event.team1.name }}</p>
                </div>
                <div class="flex w-1/3 flex-none flex-col items-center justify-center">
                  <p class="text-2xl">
                    <span class="font-semibold">{{ event.score.team1 }}</span
                    ><span class="mx-1">:</span
                    ><span class="font-semibold">{{ event.score.team2 }}</span>
                  </p>
                  <p class="mt-2 text-[var(--color-text-level-2)]">{{ event.half }}</p>
                </div>
                <div class="flex w-1/3 flex-none flex-col items-center justify-center">
                  <div class="sports-banner-match-icon h-12">
                    <div>
                      <img alt="icon" :src="event.team2.icon" />
                    </div>
                  </div>
                  <p class="mt-1.5 text-center font-semibold">{{ event.team2.name }}</p>
                </div>
              </div>
            </div>
            <div class="mt-4 flex w-full items-center justify-between gap-2">
              <div
                class="flex h-10 flex-1 items-center justify-center rounded-lg font-semibold"
                style="background: rgba(252, 60, 60, 0.15)"
              >
                <span>{{ event.odds[0].label }}</span
                ><span class="ml-2 text-[var(--color-secondary-level-2)]">{{
                  event.odds[0].value
                }}</span>
              </div>
              <div
                class="flex h-10 flex-1 items-center justify-center rounded-lg font-semibold"
                style="background: rgba(252, 60, 60, 0.15)"
              >
                <span>{{ event.odds[1].label }}</span
                ><span class="ml-2 text-[var(--color-secondary-level-2)]">{{
                  event.odds[1].value
                }}</span>
              </div>
              <div
                class="flex h-10 flex-1 items-center justify-center rounded-lg font-semibold"
                style="background: rgba(252, 60, 60, 0.15)"
              >
                <span>{{ event.odds[2].label }}</span
                ><span class="ml-2 text-[var(--color-secondary-level-2)]">{{
                  event.odds[2].value
                }}</span>
              </div>
              <div
                class="flex h-10 flex-1 items-center justify-center rounded-lg bg-[var(--color-background-level-3)] font-semibold"
              >
                <span>+</span>
                <span>{{ event.extra }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import peopleNumber from './img/football.svg?url'
const events = ref([
  {
    sport: '足球',
    type: '俱乐部友谊赛',
    team1: { name: 'CFR克卢日', icon: peopleNumber },
    team2: { name: '根特', icon: peopleNumber },
    score: { team1: 0, team2: 0 },
    half: '上半场',
    odds: [
      { label: '1', value: '2.85' },
      { label: '平局', value: '3.9' },
      { label: '2', value: '2.08' }
    ],
    extra: 4
  },
  {
    sport: '足球',
    type: '俱乐部友谊赛',
    team1: { name: 'CFR克卢日', icon: peopleNumber },
    team2: { name: '根特', icon: peopleNumber },
    score: { team1: 0, team2: 0 },
    half: '上半场',
    odds: [
      { label: '1', value: '2.85' },
      { label: '平局', value: '3.9' },
      { label: '2', value: '2.08' }
    ],
    extra: 4
  },
  {
    sport: '足球',
    type: '俱乐部友谊赛',
    team1: { name: 'CFR克卢日', icon: peopleNumber },
    team2: { name: '根特', icon: peopleNumber },
    score: { team1: 0, team2: 0 },
    half: '上半场',
    odds: [
      { label: '1', value: '2.85' },
      { label: '平局', value: '3.9' },
      { label: '2', value: '2.08' }
    ],
    extra: 4
  },
  {
    sport: '足球',
    type: '俱乐部友谊赛',
    team1: { name: 'CFR克卢日', icon: peopleNumber },
    team2: { name: '根特', icon: peopleNumber },
    score: { team1: 0, team2: 0 },
    half: '上半场',
    odds: [
      { label: '1', value: '2.85' },
      { label: '平局', value: '3.9' },
      { label: '2', value: '2.08' }
    ],
    extra: 4
  }
])

const listWrap = ref<HTMLElement | null>(null)
const isMobile = ref(false)

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
    --grid-column: 1;
    --grid-gap: 0.5rem;
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
