<template>
  <div
    ref="anchorRef"
    class="w-[320px] shrink-0 self-start"
    :style="floating ? { height: `${placeholderHeight}px` } : undefined"
  >
    <section
      class="flex w-[320px] flex-col gap-2 rounded-xl bg-bg-5 p-2 font-inter"
      :class="floating ? 'fixed z-10' : ''"
      :style="floating ? { top: `${stickTop}px`, left: `${floatLeft}px` } : undefined"
      data-testid="match-media-panel"
      :data-pinned="pinned"
    >
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-[264px] rounded-lg bg-bg-2">
          <button
            type="button"
            class="flex h-8 w-[132px] items-center justify-center gap-2 rounded-lg text-xs"
            :class="
              mode === 'video' ? 'bg-[#3B4142] font-bold text-white' : 'font-normal text-text-2'
            "
            @click="mode = 'video'"
          >
            <img
              class="h-4 w-4 shrink-0 object-contain"
              :src="mode === 'video' ? videoOnIcon : videoOffIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            Video
          </button>
          <button
            type="button"
            class="flex h-8 w-[132px] items-center justify-center gap-2 rounded-lg text-xs"
            :class="
              mode === 'animation' ? 'bg-[#3B4142] font-bold text-white' : 'font-normal text-text-2'
            "
            @click="mode = 'animation'"
          >
            <img
              class="h-4 w-4 shrink-0 object-contain"
              :src="mode === 'animation' ? animationOnIcon : animationOffIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            Animation
          </button>
        </div>
        <button
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3B4142]"
          :aria-pressed="pinned"
          aria-label="Pin"
          @click="pinned = !pinned"
        >
          <img
            class="h-4 w-4 object-contain"
            :src="pinned ? pinOnIcon : pinOffIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
        </button>
      </div>

      <div class="relative h-[171px] overflow-hidden rounded-lg" :data-mode="mode">
        <template v-if="mode === 'animation'">
          <img
            class="absolute inset-0 h-full w-full object-cover"
            :src="bgLayer1"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <img
            class="absolute inset-0 h-full w-full object-cover"
            :src="bgLayer2"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <img
            class="absolute inset-0 h-full w-full object-cover"
            :src="bgLayer3"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
        </template>
        <img v-else class="h-full w-full object-fill" :src="videoPoster" alt="" draggable="false" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLayoutStore } from '@/stores/layout'
import videoOnIcon from './icon/video-on.svg?url'
import videoOffIcon from './icon/video-off.svg?url'
import animationOnIcon from './icon/animation-on.svg?url'
import animationOffIcon from './icon/animation-off.svg?url'
import pinOnIcon from './icon/pin-on.svg?url'
import pinOffIcon from './icon/pin-off.svg?url'
import videoPoster from './icon/video-poster-853dbb.png?url'
import bgLayer1 from '../match-header/icon/bg-layer-1.png?url'
import bgLayer2 from '../match-header/icon/bg-layer-2.png?url'
import bgLayer3 from '../match-header/icon/bg-layer-3-34b3a2.png?url'

const layoutStore = useLayoutStore()
const mode = ref<'video' | 'animation'>('video')
const pinned = ref(true)
const floating = ref(false)
const floatLeft = ref(0)
const placeholderHeight = ref(0)
const anchorRef = ref<HTMLElement | null>(null)

const stickTop = computed(() => layoutStore.TOPNAV_HEIGHT + 24)

const updatePin = () => {
  const anchor = anchorRef.value
  if (!anchor || !pinned.value) {
    floating.value = false
    return
  }

  const rect = anchor.getBoundingClientRect()
  if (rect.top <= stickTop.value) {
    if (!floating.value) placeholderHeight.value = anchor.offsetHeight
    floatLeft.value = rect.left
    floating.value = true
    return
  }

  floating.value = false
}

watch(pinned, () => {
  floating.value = false
  requestAnimationFrame(updatePin)
})

onMounted(() => {
  window.addEventListener('scroll', updatePin, true)
  window.addEventListener('resize', updatePin)
  updatePin()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updatePin, true)
  window.removeEventListener('resize', updatePin)
})
</script>
