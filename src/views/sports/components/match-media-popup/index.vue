<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[2200] flex items-center justify-center bg-mask-60-1"
      @click.self="emit('close')"
    >
      <section
        ref="panel"
        class="relative overflow-hidden bg-bg-5 text-common-100"
        :class="
          fullscreen ? 'h-full w-full' : 'aspect-[900/506] max-h-[90dvh] w-4/5 rounded-[10px]'
        "
        role="dialog"
        aria-modal="true"
        :aria-label="t(mode === 'video' ? 'sports.video' : 'sports.animation')"
        :data-mode="mode"
        :data-fullscreen="fullscreen"
      >
        <div
          v-if="!isLoggedIn"
          class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-text-1"
        >
          <p class="font-bold">{{ t('sports.loginToWatch') }}</p>
          <button
            type="button"
            class="w-full max-w-[272px] rounded-full bg-theme-primary py-2 font-bold text-text-4"
            @click="requireLogin()"
          >
            {{ t('sports.logIn') }}
          </button>
        </div>
        <LivePlayer
          v-else-if="mode === 'video' && match.liveStreamUrl"
          :src="match.liveStreamUrl"
          :show-fullscreen="false"
          class="[&_.sports-live-controls]:pr-9"
        />
        <LiveAnimation v-else-if="mode === 'animation'" :src="animationUrl" />
        <div
          v-else
          class="flex h-full items-center justify-center text-sm text-text-2"
          role="status"
        >
          {{ t('sports.noVideo') }}
        </div>

        <button
          ref="closeButton"
          type="button"
          class="absolute right-[5px] top-[5px] z-20 flex size-[15px] items-center justify-center rounded-full bg-mask-60-1 text-common-100 before:absolute before:-inset-1"
          :aria-label="t('sports.mediaClose')"
          @click.stop="emit('close')"
        >
          <CloseIcon class="size-[9px]" aria-hidden="true" />
        </button>
        <button
          v-if="isLoggedIn"
          type="button"
          class="absolute bottom-[5px] right-[5px] z-20 flex size-[22px] items-center justify-center rounded-[3.333px] bg-mask-60-1 text-common-100 before:absolute before:-inset-1"
          :aria-label="t(fullscreen ? 'sports.mediaExitFullscreen' : 'sports.mediaFullscreen')"
          :disabled="fullscreenPending"
          @click.stop="toggleFullscreen"
        >
          <img class="size-[19px]" :src="fullscreenIcon" alt="" draggable="false" />
        </button>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { useSiteConfigStore } from '@/stores/siteConfig'
import CloseIcon from '@/static/svg/close.svg?component'
import fullscreenIcon from '../../event-details/components/match-header/icon/fullscreen.svg?url'
import LivePlayer from '../../event-details/components/match-media-panel/live-player.vue'
import LiveAnimation from '../../event-details/components/match-media-panel/live-animation.vue'
import {
  animationLanguageCode,
  buildAnimationUrl
} from '../../event-details/components/match-media-panel/animation-url'
import type { SportsMatch } from '../../shared/types'

const props = defineProps<{ match: SportsMatch; mode: 'video' | 'animation' }>()
const emit = defineEmits<{ close: [] }>()
const { t, locale } = useI18n()
const { isLoggedIn, requireLogin } = useRequireLoginAction()
const siteConfigStore = useSiteConfigStore()
const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const fullscreen = ref(false)
const fullscreenPending = ref(false)
let disposed = false
let fullscreenGeneration = 0
let previousFocus: HTMLElement | null = null

usePageScrollLock(() => true, { preventTouchMove: true })

// 只读首页已提供的媒体信息，不触发赛事查询或调整首页轮询。
const animationUrl = computed(() =>
  buildAnimationUrl(
    siteConfigStore.getConfigString('common.static.resource.url'),
    props.match.brEventId ?? 0,
    animationLanguageCode(String(locale.value))
  )
)

const exitFullscreen = () => {
  fullscreenGeneration += 1
  fullscreen.value = false
  if (panel.value && document.fullscreenElement === panel.value) {
    void document.exitFullscreen().catch(() => {})
  }
}

const toggleFullscreen = async () => {
  if (fullscreenPending.value) return
  if (fullscreen.value) {
    exitFullscreen()
    return
  }
  const element = panel.value
  if (!element) return
  const generation = ++fullscreenGeneration
  // 不支持或拒绝原生全屏时，保留页面内全屏布局。
  fullscreen.value = true
  if (!element.requestFullscreen || !document.fullscreenEnabled) return
  fullscreenPending.value = true
  try {
    await element.requestFullscreen()
    if (
      (disposed || !isLoggedIn.value || generation !== fullscreenGeneration) &&
      document.fullscreenElement === element
    ) {
      await document.exitFullscreen()
    }
  } catch {
    // 原生全屏失败不影响页面内放大。
  } finally {
    fullscreenPending.value = false
  }
}

const onFullscreenChange = () => {
  fullscreen.value = document.fullscreenElement === panel.value
}
const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  if (fullscreen.value) exitFullscreen()
  else emit('close')
}

watch(isLoggedIn, loggedIn => {
  if (!loggedIn) exitFullscreen()
})

onMounted(() => {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  closeButton.value?.focus({ preventScroll: true })
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  disposed = true
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('keydown', onKeydown)
  exitFullscreen()
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
})
</script>
