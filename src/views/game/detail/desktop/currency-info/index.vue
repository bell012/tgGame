<template>
  <div class="currency-info-container">
    <div class="image-content relative w-full h-[640px]">
      <img
        class="absolute top-0 left-0 w-full h-full object-cover rounded-t-[20px]"
        alt=""
        :src="displayGameImg"
      />
      <div
        v-if="isLogin"
        class="play-card absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[var(--color-background-level-1)] p-[28px] rounded-lg"
      >
        <play-form></play-form>
      </div>
      <div
        v-else
        class="play-card absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[var(--color-background-level-1)] p-[28px] rounded-lg"
      >
        <div class="text-[12px] text-center pb-[8px] text-[var(--color-text-level-2)]">
          {{ t('gameDetail.signInPrompt') }}
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
import defaultGameImg from '@/static/img/explore/game.png'
import PlayIcon from '@/static/svg/game/detail/play.svg'
import { useAuthModalStore } from '@/stores/authModal'
import CurrencyBar from '../currency-bar/index.vue'
import PlayForm from './play-form.vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { computed, ComputedRef, inject, onMounted } from 'vue'

const userStore = useUserStore()
const authModalStore = useAuthModalStore()
const { t } = useI18n()
const { userInfo } = storeToRefs(userStore)
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

const displayGameImg = computed(() => {
  const rawImage =
    currentGameDetail.value?.icon2 ??
    currentGameDetail.value?.conUrl ??
    currentGameDetail.value?.gameItemHotVo?.defaultImage ??
    ''
  return toImageUrl(String(rawImage)) || defaultGameImg
})
</script>
<style scoped lang="scss">
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
