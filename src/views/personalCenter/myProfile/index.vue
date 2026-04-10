<template>
  <div class="fixed inset-0 overflow-y-auto bg-bg-1">
    <H5Header :title="t('personalCenter.myProfile.title')" />

    <div class="px-3.5 pb-10 pt-[25px]">
      <section>
        <div class="flex items-start justify-between">
          <!-- gap-1 bg-bg-4 rounded-lg px-2 -->
          <div class="inline-flex min-w-[48px] h-[28px] items-center">
            <!-- <LikeIcon class="h-[18px] w-[18px]" />
            <span class="text-base font-bold text-text-1">0</span> -->
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
            <img :src="item.image" alt="Game" class="h-[96px] w-[73px] shrink-0 object-contain" />

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

        <!-- 空状态 -->
        <ThemedEmptyState
          v-else
          :dark-image="noDataImage"
          :image-alt="t('personalCenter.myProfile.noFavorites')"
          :message="t('personalCenter.myProfile.noFavorites')"
          container-class="mt-0"
          text-class="mt-2.5 text-xs font-[500] text-text-1"
        />
      </section>

      <p class="mt-5 text-center text-xs text-text-2">
        {{ joinedOnText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import CopyIcon from '@/static/svg/copy.svg?component'
import EditIcon from '@/static/svg/edit.svg?component'
import StatisticsIcon from '@/static/svg/personalCenter/icon80.svg?component'
import noDataImage from '@/static/img/personalCenter/noData.png'
import { useMyProfile } from './shared'

const { t } = useI18n()
const {
  userInfo,
  avatarUrl,
  selectedAvatarFrameImage,
  displayName,
  profileId,
  topStats,
  bottomStat,
  favoriteGameCards,
  joinedOnText,
  copyMemberId,
  goToEditProfile
} = useMyProfile()
</script>

<style scoped></style>
