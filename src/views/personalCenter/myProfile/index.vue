<template>
  <div class="fixed inset-0 overflow-y-auto bg-bg-1">
    <H5Header :title="t('personalCenter.myProfile.title')" />

    <div class="px-3.5 pb-10 pt-[25px]">
      <section>
        <div class="flex items-start justify-between">
          <div class="inline-flex min-w-[48px] h-[28px] items-center gap-1 bg-bg-4 rounded-lg px-2">
            <LikeIcon class="h-[18px] w-[18px]" />
            <span class="text-base font-bold text-text-1">0</span>
          </div>

          <div class="flex flex-col items-center text-center">
            <div class="relative h-[60px] w-[60px] overflow-visible">
              <div
                :class="[
                  'absolute overflow-hidden rounded-full',
                  selectedAvatarFrameImage ? 'inset-[6px]' : 'inset-0 border-2 border-icon-2'
                ]"
              >
                <img :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover" />
              </div>

              <img
                v-if="selectedAvatarFrameImage"
                :src="selectedAvatarFrameImage"
                alt="Avatar Frame"
                class="pointer-events-none absolute inset-0 h-full w-full object-contain"
              />

              <span
                class="absolute left-1/2 bottom-[-6px] z-10 flex h-[16px] min-w-[40px] -translate-x-1/2 items-center justify-center rounded border border-icon-1 bg-text-2 px-0.5 text-[10px] font-[700] text-text-1"
                >VIP{{ userInfo?.vipId || 0 }}</span
              >
            </div>
            <h2 class="mt-2 text-base font-bold text-text-1">{{ displayName }}</h2>
            <div class="mt-1 inline-flex items-center gap-0.5 text-xs font-[500] text-text-2">
              <span>{{ t('personalCenter.myProfile.profileId') }}: {{ profileId }}</span>
              <button type="button" class="rounded p-0.5" @click="copyMemberId">
                <CopyIcon class="h-4 w-4 text-text-2" />
              </button>
            </div>
          </div>

          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-4"
            :aria-label="t('personalCenter.myProfile.edit')"
            @click="goToEditProfile"
          >
            <EditIcon class="h-[18px] w-[18px] text-text-1" />
          </button>
        </div>
      </section>

      <section class="mt-[25px] rounded-[10px] bg-bg-2 px-2.5 py-3">
        <div class="flex items-center gap-1 border-b border-opacity-10 pb-3">
          <StatisticsIcon class="h-[18px] w-[18px] text-text-1" />
          <h3 class="text-xs font-bold text-text-1">
            {{ t('personalCenter.myProfile.statistics') }}
          </h3>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2.5">
          <div
            v-for="item in topStats"
            :key="item.label"
            class="rounded-lg bg-bg-3 px-3 py-2.5 text-center"
          >
            <div class="flex items-center justify-center gap-1">
              <component :is="item.icon" class="h-[18px] w-[18px] text-text-2" />
              <span class="text-xs font-[400] text-text-1">{{ item.label }}</span>
            </div>
            <p class="mt-1.5 text-base font-[700] text-text-1">{{ item.value }}</p>
          </div>
        </div>

        <div class="mt-2.5 rounded-lg bg-bg-3 px-3 py-2.5">
          <div class="flex items-center justify-center gap-1">
            <component :is="bottomStat.icon" class="h-[18px] w-[18px] text-text-2" />
            <span class="text-xs font-[400] text-text-1">{{ bottomStat.label }}</span>
          </div>
          <p class="mt-1.5 text-base font-[700] text-text-1 text-center">{{ bottomStat.value }}</p>
        </div>
      </section>

      <section class="mt-2.5 rounded-[10px] bg-bg-2 px-2.5 pt-3 pb-[50px]">
        <h3 class="border-b border-opacity-10 pb-3 text-sm font-bold text-text-1">
          {{ t('personalCenter.myProfile.topFavoriteGames') }}
        </h3>

        <div v-if="favoriteGameCards.length > 0" class="">
          <div
            v-for="(item, index) in favoriteGameCards"
            :key="`${item.name}-${index}`"
            class="flex items-center gap-2.5 pt-2.5"
          >
            <img
              :src="profileGameImage"
              alt="Game"
              class="h-[96px] w-[73px] shrink-0 object-contain"
            />

            <div class="min-w-0 flex-1">
              <p class="break-words text-xs font-bold text-text-1">
                {{ item.name }}
              </p>
              <div class="mt-2.5 flex items-center justify-between gap-2.5">
                <span class="text-xs text-text-2">
                  {{ t('personalCenter.myProfile.betAmount') }}
                </span>
                <span class="shrink-0 text-xs font-bold text-text-1">
                  {{ item.betAmount }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center">
          <img :src="noDataImage" alt="No Data" class="h-[200px] w-[220px] object-contain" />
          <p class="mt-2.5 text-xs font-[500] text-text-1">
            {{ t('personalCenter.myProfile.noFavorites') }}
          </p>
        </div>
      </section>

      <p class="mt-5 text-center text-xs text-text-2">
        {{ joinedOnText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import H5Header from '@/components/common/H5Header.vue'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency, getFormattedBalance } from '@/utils/locale'
import {
  DEFAULT_AVATAR_FRAME_ID,
  profileCustomizationState,
  type AvatarFrameId
} from '@/utils/profile-customization'
import { navigateTo } from '@/utils/router'
import CopyIcon from '@/static/svg/copy.svg?component'
import EditIcon from '@/static/svg/edit.svg?component'
import LikeIcon from '@/static/svg/Like.svg?skipsvgo'
import StatisticsIcon from '@/static/svg/personalCenter/icon80.svg?component'
import TotalWinsIcon from '@/static/svg/personalCenter/icon81.svg?component'
import TotalBetsIcon from '@/static/svg/personalCenter/icon82.svg?component'
import TotalWageredIcon from '@/static/svg/personalCenter/icon83.svg?component'
import border1Image from '@/static/img/personalCenter/border_1.png'
import border2Image from '@/static/img/personalCenter/border_2.png'
import border3Image from '@/static/img/personalCenter/border_3.png'
import border4Image from '@/static/img/personalCenter/border_4.png'
import border5Image from '@/static/img/personalCenter/border_5.png'
import noDataImage from '@/static/img/personalCenter/noData.png'
import profileGameImage from '@/static/img/personalCenter/myProfile.png'

interface FavoriteGame {
  name: string
  betAmount: string
}

const { t, locale } = useI18n()
const userStore = useUserStore()
const { userInfo, acctInfo } = storeToRefs(userStore)
const profileCustomization = profileCustomizationState

const avatarFrameImageMap: Record<Exclude<AvatarFrameId, 'none'>, string> = {
  border_1: border1Image,
  border_2: border2Image,
  border_3: border3Image,
  border_4: border4Image,
  border_5: border5Image
}

const favoriteGames = ref<FavoriteGame[]>([
  {
    name: 'I am the name of the gameI am the name of the gameI am the name of the game',
    betAmount: getFormattedBalance(4604434.88, 'PHP', 2)
  },
  {
    name: 'I am the name of the game',
    betAmount: getFormattedBalance(4604434.88, 'PHP', 2)
  },
  {
    name: 'I am the name of the game',
    betAmount: getFormattedBalance(4604434.88, 'PHP', 2)
  }
])

const avatarUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_GAME_IMAGE_BASE_URL
  return userInfo.value?.headPortrait && baseUrl
    ? `${baseUrl}${userInfo.value.headPortrait}`
    : '/src/static/img/home/avatar.png'
})

const selectedAvatarFrameImage = computed(() => {
  const avatarFrameId = profileCustomization.value.avatarFrameId ?? DEFAULT_AVATAR_FRAME_ID
  if (avatarFrameId === DEFAULT_AVATAR_FRAME_ID) return ''
  return avatarFrameImageMap[avatarFrameId as Exclude<AvatarFrameId, 'none'>]
})

const displayName = computed(() => userInfo.value?.nickName || '')
const profileId = computed(() => userInfo.value?.memberId || acctInfo.value?.memberId || '--')
const currentCurrency = computed(
  () => acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency()
)

const profileStats = computed(() => [
  {
    label: t('personalCenter.myProfile.totalWins'),
    value: '1',
    icon: TotalWinsIcon
  },
  { label: t('personalCenter.myProfile.totalBets'), value: '2', icon: TotalBetsIcon },
  {
    label: t('personalCenter.myProfile.totalWagered'),
    value: getFormattedBalance(0, currentCurrency.value, 2),
    icon: TotalWageredIcon
  }
])

const topStats = computed(() => profileStats.value.slice(0, 2))
const bottomStat = computed(() => profileStats.value[2])
const favoriteGameCards = computed(() => favoriteGames.value.slice(0, 3))

const joinedDateText = computed(() => {
  const rawTime = userInfo.value?.createTime
  if (!rawTime) return '2025-12-08'
  const normalizedTime = rawTime > 1_000_000_000_000 ? rawTime : rawTime * 1000
  return new Date(normalizedTime).toISOString().slice(0, 10)
})

const joinedOnText = computed(() => {
  const baseDate = new Date(`${joinedDateText.value}T00:00:00`)
  const isZh = String(locale.value).toLowerCase().startsWith('zh')
  const formattedDate = new Intl.DateTimeFormat(isZh ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: isZh ? 'long' : 'short',
    day: 'numeric'
  }).format(baseDate)

  return t('personalCenter.myProfile.joinedOn', { date: formattedDate })
})

const fallbackCopyText = (value: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

const copyMemberId = async () => {
  const value = profileId.value
  if (!value || value === '--') return
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
    } else if (!fallbackCopyText(value)) {
      throw new Error('Copy failed')
    }
    showToast({ message: t('personalCenter.copySuccess'), position: 'middle', type: 'success' })
  } catch (error) {
    if (fallbackCopyText(value)) {
      showToast({ message: t('personalCenter.copySuccess'), position: 'middle', type: 'success' })
      return
    }
    console.error(error)
  }
}

const goToEditProfile = () => {
  navigateTo('/personal-center/edit-profile')
}

const initializeMyProfile = async () => {
  userStore.syncStoredUserData()
  await userStore.refreshCurrentUserData()
}

onMounted(() => {
  void initializeMyProfile()
})

onActivated(() => {
  userStore.syncStoredUserData()
})
</script>

<style scoped></style>
