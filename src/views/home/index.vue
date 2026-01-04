<template>
  <div class="home">
    <img src="./headBack.png" />
    <!-- {{ $t('locales.home.home') }} -->
    <div class="flex items-center sm:mt-6 h-8">
      <h2 class="flex items-center text-base font-extrabold text-primary">
        <div class="relative mx-4 mr-2 h-2 w-2">
          <div class="absolute left-0 top-0 h-full w-full rounded-full bg-success z-10"></div>
          <div
            class="absolute left-0 top-0 h-full w-full rounded-full bg-success animate-ping"
          ></div>
        </div>
        <div>近期大胜</div>
        <div class="ml-2 hidden gap-2 lg:!flex">
          <div
            @click="carousel(0)"
            class="button button-m center h-auto flex-1 whitespace-nowrap rounded-none border-b-2 p-1 text-xs"
            :class="
              carouselVal == 0
                ? 'border-b-brand font-semibold text-primary'
                : 'border-b-transparent font-normal text-secondary'
            "
          >
            全部
          </div>
          <div
            @click="carousel(1)"
            class="button button-m center h-auto flex-1 whitespace-nowrap rounded-none border-b-2 p-1 text-xs"
            :class="
              carouselVal == 1
                ? 'border-b-brand font-semibold text-primary'
                : 'border-b-transparent font-normal text-secondary'
            "
          >
            BC 原创
          </div>
          <div
            @click="carousel(2)"
            class="button button-m center h-auto flex-1 whitespace-nowrap rounded-none border-b-2 p-1 text-xs"
            :class="
              carouselVal == 2
                ? 'border-b-brand font-semibold text-primary'
                : 'border-b-transparent font-normal text-secondary'
            "
          >
            老虎机
          </div>
          <div
            @click="carousel(3)"
            class="button button-m center h-auto flex-1 whitespace-nowrap rounded-none border-b-2 p-1 text-xs"
            :class="
              carouselVal == 3
                ? 'border-b-brand font-semibold text-primary'
                : 'border-b-transparent font-normal text-secondary'
            "
          >
            真人娱乐城
          </div>
        </div>
      </h2>
    </div>
    <div class="overflow-hidden px-4 sm:rounded-xl sm:bg-layer3 sm:px-3">
      <div class="marquee">
        <div class="marquee-track">
          <a
            class="sm:w-13 flex h-28 w-14 flex-none flex-col items-center text-xs hover:opacity-80 sm:h-[106px] inactive"
            v-for="(item, idx) in duplicatedList"
            :key="idx"
            >{{ item }}</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const carouselVal = ref(0)
const carousel = (val: any) => {
  carouselVal.value = val
  console.log(carouselVal.value)
}

const list = ref([1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6])
const duplicatedList = computed(() => [...list.value, ...list.value])
</script>

<style scoped lang="scss">
.bg-success {
  background-color: #24ee89;
}
.border-b-brand {
  border-bottom-color: #24ee89;
}
.text-secondary {
  color: #b3bec1;
}

.marquee {
  overflow: hidden;
  width: 100%;
}
.marquee-track {
  display: inline-flex;
  gap: 0.75rem;
  /* 控制速度 */
  animation: marquee 12s linear infinite;
  will-change: transform;
}
.marquee-track:hover {
  animation-play-state: paused;
}
.marquee-track a {
  flex: none;
}
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
