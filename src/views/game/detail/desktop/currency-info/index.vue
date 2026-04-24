<template>
  <div class="currency-info-container">
    <div class="image-content relative w-full h-[640px] overflow-hidden rounded-t-[20px]">
      <template v-if="!isFallbackImage">
        <SmartImage
          class="image-main absolute inset-0 h-full w-full object-cover"
          alt=""
          :src="displayGameImg"
        />
      </template>
      <div
        v-else
        class="image-placeholder absolute inset-0 z-[1] flex items-center justify-center bg-[var(--color-background-level-2)]"
      >
        <SmartImage class="image-placeholder-icon" :src="placeholderIcon" alt="" />
      </div>
      <div
        v-if="isLogin"
        class="play-card absolute z-[2] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[var(--color-background-level-1)] p-[28px] rounded-lg"
      >
        <play-form></play-form>
      </div>
      <div
        v-else
        class="play-card absolute z-[2] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[var(--color-background-level-1)] p-[28px] rounded-lg"
      >
        <div class="text-[12px] text-center pb-[8px] text-[var(--color-text-level-2)]">
          {{ t('gameDetail.signInPrompt', { gameName: displayGameName }) }}
        </div>
        <div class="play-btn w-[408px] h-[40px] cursor-pointer" @click="handleSignIn">
          <div class="w-[16px] h-[16px]">
            <play-icon class="w-full h-full" />
          </div>
          <div class="text-[15px] font-bold text-[#000]">{{ t('home.sign_In') }}</div>
        </div>
      </div>
    </div>
    <currency-bar></currency-bar>
  </div>
</template>
<script setup lang="ts">
import errorImg from '@/static/img/home/errImg.png'
import errorImg1 from '@/static/img/home/errImg1.png'
import PlayIcon from '@/static/svg/game/detail/play.svg'
import { useAuthModalStore } from '@/stores/authModal'
import { useThemeStore } from '@/stores/theme'
import CurrencyBar from '../currency-bar/index.vue'
import PlayForm from './play-form.vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { computed, ComputedRef, inject, onMounted } from 'vue'
import SmartImage from '@/components/common/SmartImage.vue'

const userStore = useUserStore()
const themeStore = useThemeStore()
const authModalStore = useAuthModalStore()
const { t } = useI18n()
const { userInfo } = storeToRefs(userStore)
const { theme } = storeToRefs(themeStore)
const isLogin = computed(() => Boolean(userInfo.value?.tradeToken))

const handleSignIn = () => {
  authModalStore.openLoginModal()
}

onMounted(() => {
  userStore.syncStoredUserData()
})

type CurrentGameDetail = {
  itemName?: string
  platformName?: string
  icon2?: string
  conUrl?: string
  gameItemHotVo?: {
    defaultImage?: string
  }
} | null

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const toImageUrl = (value: string) => {
  const imagePath = value.trim()
  if (!imagePath) return ''
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }
  return `${String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '')}${imagePath}`
}

const rawGameImage = computed(() => {
  // 详情页仅使用真实游戏图，后端 defaultImage 视为占位图，不在此处使用
  const rawImage = currentGameDetail.value?.icon2 ?? currentGameDetail.value?.conUrl ?? ''
  return toImageUrl(String(rawImage))
})

const placeholderIcon = computed(() => (theme.value === 'dark' ? errorImg : errorImg1))
const isFallbackImage = computed(() => !rawGameImage.value)
const displayGameImg = computed(() => rawGameImage.value || placeholderIcon.value)
const displayGameName = computed(() => {
  return (
    String(
      currentGameDetail.value?.itemName ?? currentGameDetail.value?.platformName ?? ''
    ).trim() || '--'
  )
})
</script>
<style scoped lang="scss">
.image-main {
  z-index: 1;
  object-position: center 15%;
}

.image-placeholder-icon {
  width: 31px;
  object-fit: contain;
  opacity: 0.82;
}

.play-btn {
  border-radius: 8px;
  background: linear-gradient(90deg, #24ee89 0%, #9fe871 100%);
  box-shadow:
    0 0 12px 0 rgba(35, 238, 136, 0.3),
    0 -2px 0 0 #1dca6a inset;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

:global(:root.light) .currency-info-container .play-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(96, 116, 144, 0.28);
  box-shadow:
    0 14px 36px rgba(28, 45, 74, 0.18),
    0 4px 12px rgba(28, 45, 74, 0.1);
  backdrop-filter: blur(6px);
}
</style>
