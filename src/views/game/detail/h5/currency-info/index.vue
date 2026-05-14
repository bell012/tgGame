<template>
  <div class="currency-info-panel w-full h-full p-[14px] pb-[20px] rounded-t-[10px]">
    <div class="flex gap-[10px]">
      <div
        class="w-[110px] h-[146px] rounded-md bg-[var(--color-background-level-2)] flex items-center justify-center overflow-hidden"
      >
        <img
          :src="displayGameImg"
          alt=""
          :class="
            isFallbackImage
              ? 'w-[31px] h-[31px] object-contain opacity-85'
              : 'w-full h-full object-contain'
          "
        />
      </div>
      <div class="flex-1 flex flex-col justify-between">
        <template v-if="isLogin">
          <div class="flex-1 flex flex-col justify-around">
            <div class="text-[15px] font-bold">{{ t('gameDetail.playWithSelectedCurrency') }}</div>
            <currency-select @change="handleCurrencyChange"></currency-select>
            <div
              class="text-[12px] leading-[12px] font-[400] text-[var(--color-text-level-2)] text-center"
            >
              {{ t('gameDetail.playNowHint') }}
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex-1 flex flex-col justify-start pt-[4px]">
            <div
              class="line-clamp-2 text-[15px] font-bold leading-[18px] text-[var(--color-text-level-1)]"
            >
              {{ displayGameName }}
            </div>
            <div class="mt-[4px] text-[12px] leading-[16px] text-[var(--color-text-level-2)]">
              {{ t('gameDetail.by') }}
              <span class="text-[var(--color-theme-level-1)]">{{ displayProviderName }}</span>
            </div>
          </div>
        </template>

        <div class="play-btn cursor-pointer" @click="handlePlayAction">
          <div class="w-[16px] h-[16px]">
            <play-icon class="w-full h-full" />
          </div>
          <div class="text-[15px] font-bold text-[#000]">
            {{ playButtonText }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <currency-bar></currency-bar>
</template>
<script setup lang="ts">
import errorImg from '@/static/img/home/errImg.png'
import errorImg1 from '@/static/img/home/errImg1.png'
import PlayIcon from '@/static/svg/game/detail/play.svg'
import CurrencySelect from '../currency-select/index.vue'
import CurrencyBar from '../currency-bar/index.vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGamePlatformPlay } from '@/composables/useGamePlatformPlay'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/authModal'
import { storeToRefs } from 'pinia'

const { gamePlay, currentGameDetail } = useGamePlatformPlay()
const { t } = useI18n()
const themeStore = useThemeStore()
const userStore = useUserStore()
const authModalStore = useAuthModalStore()
const { theme } = storeToRefs(themeStore)
const { userInfo } = storeToRefs(userStore)
const isLogin = computed(() => Boolean(userInfo.value?.tradeToken))

const selectedData = ref<{ value: string; label: string; icon: string } | undefined>(undefined)
const handleCurrencyChange = (
  value: { value: string; label: string; icon: string } | undefined
) => {
  selectedData.value = value
}

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
  return String(currentGameDetail.value?.itemName ?? '').trim() || '--'
})
const displayGameType = computed(() => {
  const typeName = String(
    (currentGameDetail.value as { sysGameTypeName?: string } | null)?.sysGameTypeName ?? ''
  ).trim()
  const platformName = String(currentGameDetail.value?.platformName ?? '').trim()
  return typeName || platformName || '--'
})
const displayProviderName = computed(() => {
  const providerName = String(currentGameDetail.value?.platformName ?? '').trim()
  return providerName || displayGameType.value
})
const playButtonText = computed(() => (isLogin.value ? t('gameDetail.playNow') : t('home.sign_In')))

const handlePlayAction = () => {
  if (!isLogin.value) {
    authModalStore.openLoginModal()
    return
  }

  void gamePlay()
}

onMounted(() => {
  userStore.syncStoredUserData()
})
</script>
<style scoped lang="scss">
.currency-info-panel {
  background: var(--color-background-level-2);
}

:global(:root.light) .currency-info-panel {
  background: #ffffff;
  border: none;
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
</style>
