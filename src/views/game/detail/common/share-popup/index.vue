<template>
  <div>
    <transition name="popup-fade">
      <div v-show="props.visible" class="fixed inset-0 z-[9999] bg-mask-60-1" @click.self="close" />
    </transition>
    <transition :name="props.desktop ? 'desktop-up-down' : 'up-down'">
      <div
        v-show="props.visible"
        :class="
          props.desktop
            ? 'z-[10000] w-full pointer-events-none relative'
            : 'fixed inset-x-0 bottom-0 z-[10000] w-full pointer-events-none'
        "
      >
        <div
          :class="
            props.desktop
              ? 'tp-panel pointer-events-auto w-full max-w-[560px] rounded-[16px] bg-bg-1'
              : 'tp-panel pointer-events-auto w-full max-w-none rounded-t-[16px] rounded-b-0 bg-bg-1'
          "
          @click.stop
        >
          <div class="tp-header h-[64px] px-5 flex items-center justify-between">
            <div class="w-10 h-10" />
            <div class="text-[16px]/[24px] text-[var(--color-text-level-1)] font-bold">
              {{ t('gameDetail.shareThisGame') }}
            </div>
            <button
              type="button"
              class="w-7 h-7 rounded-[8px] bg-[var(--color-opacity-10)] flex items-center justify-center"
              @click="close"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>
          </div>
          <div class="px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] sm:pb-5">
            <div class="text-[14px]/[20px] text-[var(--color-text-level-2)] font-normal">
              {{ t('gameDetail.shareViaSocialMedia') }}
            </div>
            <div class="share-channel-list mt-4">
              <button
                v-for="item in shareList"
                :key="item.key"
                type="button"
                class="share-channel-item flex flex-col items-center min-w-0"
                @click="handleChannelShare(item.key)"
              >
                <img :src="item.icon" alt="" class="size-[52px] rounded-full object-contain" />
                <div class="text-[11px]/[14px] mt-2 text-[var(--color-text-level-1)] text-center">
                  {{ item.label }}
                </div>
              </button>
            </div>

            <div class="text-[14px]/[20px] mt-5 text-[var(--color-text-level-2)] font-normal">
              {{ t('gameDetail.shareViaWebLink') }}
            </div>
            <div
              class="share-link-box mt-2.5 h-[40px] rounded-[10px] border px-2 flex items-center gap-2"
            >
              <div
                class="flex-1 min-w-0 text-[11px]/[14px] text-[var(--color-theme-level-1)] truncate px-2"
              >
                {{ shareUrl }}
              </div>
              <button
                type="button"
                class="share-copy-btn h-[27px] min-w-[53px] rounded-[8px] text-[12px]/[16px] text-[var(--color-text-level-1)] font-bold"
                @click="handleCopy"
              >
                {{ t('gameDetail.copy') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import shareRound1 from '@/static/svg/game/detail/share-round/1.svg?url'
import shareRound2 from '@/static/svg/game/detail/share-round/2.svg?url'
import shareRound3 from '@/static/svg/game/detail/share-round/3.svg?url'
import shareRound4 from '@/static/svg/game/detail/share-round/4.svg?url'
import shareRound5 from '@/static/svg/game/detail/share-round/5.svg?url'
import shareRound6 from '@/static/svg/game/detail/share-round/6.svg?url'
import shareRound7 from '@/static/svg/game/detail/share-round/7.svg?url'
import shareRound8 from '@/static/svg/game/detail/share-round/8.svg?url'
import shareRound9 from '@/static/svg/game/detail/share-round/9.svg?url'
import { globalShowToast } from '@/utils/toast'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

type ShareChannelKey =
  | 'mais'
  | 'facebook'
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'line'
  | 'x'
  | 'skype'
  | 'linkedin'
type ShareChannel = {
  key: ShareChannelKey
  label: string
  icon: string
}
type ChannelOpenConfig = {
  appUrl: string
  webUrl: string
  androidStoreUrl: string
  iosStoreUrl: string
}

const props = defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()

const { t } = useI18n()

const shareList = computed<ShareChannel[]>(() => [
  {
    key: 'mais',
    label: 'Mais',
    icon: shareRound1
  },
  {
    key: 'facebook',
    icon: shareRound2,
    label: t('gameDetail.shareChannelFacebook')
  },
  {
    key: 'whatsapp',
    icon: shareRound3,
    label: t('gameDetail.shareChannelWhatsapp')
  },
  {
    key: 'telegram',
    icon: shareRound4,
    label: t('gameDetail.shareChannelTelegram')
  },
  {
    key: 'email',
    icon: shareRound5,
    label: 'Email'
  },
  {
    key: 'line',
    icon: shareRound6,
    label: 'Line'
  },
  {
    key: 'x',
    icon: shareRound7,
    label: 'X'
  },
  {
    key: 'skype',
    icon: shareRound8,
    label: 'Skype'
  },
  {
    key: 'linkedin',
    icon: shareRound9,
    label: 'Linkedin'
  }
])

const shareUrl =
  typeof window !== 'undefined' ? window.location.href : 'https://translate.google.com'
const SHARE_TOAST_Z_INDEX = 11001

const close = () => {
  emit('update:visible', false)
}

const isAndroid = () =>
  typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent ?? '')
const isIOS = () =>
  typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent ?? '')
const isMobile = () => isAndroid() || isIOS()

const openInNewTab = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const openAppWithStoreFallback = (config: ChannelOpenConfig) => {
  if (typeof window === 'undefined') {
    return
  }
  if (!isMobile()) {
    openInNewTab(config.webUrl)
    return
  }

  let appOpened = false
  let timer: number | null = null

  const clear = () => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    if (timer) {
      window.clearTimeout(timer)
      timer = null
    }
  }

  const onVisibilityChange = () => {
    if (document.hidden) {
      appOpened = true
      clear()
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.location.href = config.appUrl

  timer = window.setTimeout(() => {
    if (!appOpened) {
      if (isIOS()) {
        window.location.href = config.iosStoreUrl
      } else if (isAndroid()) {
        window.location.href = config.androidStoreUrl
      } else {
        openInNewTab(config.webUrl)
      }
    }
    clear()
  }, 1300)
}

const copyText = async (value: string) => {
  if (typeof navigator === 'undefined' || !navigator?.clipboard?.writeText) {
    return
  }
  await navigator.clipboard.writeText(value)
}

const handleMoreShare = async () => {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: typeof document !== 'undefined' ? document.title : t('gameDetail.shareDefaultTitle'),
        text: shareUrl,
        url: shareUrl
      })
      return
    } catch (error) {
      console.error(error)
    }
  }
  try {
    await copyText(shareUrl)
  } catch (error) {
    console.error(error)
  }
}

const handleChannelShare = async (channel: ShareChannelKey) => {
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(`${shareUrl}`)

  if (channel === 'mais') {
    await handleMoreShare()
    return
  }

  if (channel === 'facebook') {
    const webUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    openAppWithStoreFallback({
      appUrl: `fb://facewebmodal/f?href=${encodeURIComponent(webUrl)}`,
      webUrl,
      androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.facebook.katana',
      iosStoreUrl: 'https://apps.apple.com/app/facebook/id284882215'
    })
    return
  }

  if (channel === 'whatsapp') {
    const webUrl = `https://wa.me/?text=${encodedText}`
    openAppWithStoreFallback({
      appUrl: `whatsapp://send?text=${encodedText}`,
      webUrl,
      androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.whatsapp',
      iosStoreUrl: 'https://apps.apple.com/app/whatsapp-messenger/id310633997'
    })
    return
  }

  if (channel === 'telegram') {
    const webUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    openAppWithStoreFallback({
      appUrl: `tg://msg_url?url=${encodedUrl}&text=${encodedText}`,
      webUrl,
      androidStoreUrl: 'https://play.google.com/store/apps/details?id=org.telegram.messenger',
      iosStoreUrl: 'https://apps.apple.com/app/telegram-messenger/id686449807'
    })
    return
  }

  if (channel === 'email') {
    openInNewTab(
      `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(
        t('gameDetail.shareDefaultTitle')
      )}&body=${encodedText}`
    )
    return
  }

  if (channel === 'line') {
    openInNewTab(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`)
    return
  }

  if (channel === 'x') {
    const webUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
    openAppWithStoreFallback({
      appUrl: `twitter://post?message=${encodedText}`,
      webUrl,
      androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.twitter.android',
      iosStoreUrl: 'https://apps.apple.com/app/x/id333903271'
    })
    return
  }

  if (channel === 'skype') {
    openInNewTab(`https://web.skype.com/share?url=${encodedUrl}`)
    return
  }

  if (channel === 'linkedin') {
    openInNewTab(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)
    return
  }
}

const handleCopy = async () => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    await copyText(shareUrl)
    globalShowToast({
      message: t('betDetails.copy'),
      type: 'success',
      zIndex: SHARE_TOAST_Z_INDEX
    })
  } catch (error) {
    console.error(error)
    globalShowToast({
      message: t('gameDetail.copyFailedRetry'),
      type: 'fail',
      zIndex: SHARE_TOAST_Z_INDEX
    })
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.tp-panel {
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
}

.share-link-box {
  border-color: var(--color-opacity-10);
  background: var(--color-input-level-1);
}

.share-copy-btn {
  background: var(--color-input-level-1);
  border: 1px solid transparent;
}

.share-channel-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 8px;
  row-gap: 20px;
}

.share-channel-item {
  width: calc((100% - 32px) / 5);
}

:global(:root.light) .tp-panel {
  box-shadow: 0 12px 28px rgba(28, 45, 74, 0.16);
}

:global(:root.light) .share-link-box {
  border-color: #d9dee5;
  background: var(--color-input-level-1);
}

:global(:root.light) .share-copy-btn {
  background: var(--color-input-level-1);
  border-color: #d0d6dd;
}

// .tp-header {
//   border-bottom: 1px solid rgba(255, 255, 255, 0.04);
// }

@include popup-transition;

.desktop-up-down-enter-active,
.desktop-up-down-leave-active {
  transition: all 0.2s ease;
}

.desktop-up-down-enter-from,
.desktop-up-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
