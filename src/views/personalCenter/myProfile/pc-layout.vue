<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[10010] flex items-center justify-center bg-mask-60-1"
    @click.self="handleClose"
  >
    <section
      class="modal-container flex max-h-[80vh] w-[480px] flex-col overflow-hidden rounded-[8px] bg-bg-1"
      @click.stop
    >
      <div class="relative flex h-[56px] items-center justify-center bg-bg-2">
        <h2 class="text-lg font-[700] text-text-1">{{ t('personalCenter.myProfile.title') }}</h2>
        <button
          type="button"
          class="absolute right-4 flex h-6 w-6 items-center justify-center rounded-[4px] bg-opacity-10"
          @click="handleClose"
        >
          <CloseIcon class="h-3 w-3 text-text-1" />
        </button>
      </div>

      <div class="overflow-y-auto px-4 pb-10 pt-[16px]">
        <section>
          <div class="flex items-start justify-between">
            <div class="inline-flex h-[28px] min-w-[48px] items-center"></div>
            <div class="flex flex-col items-center text-center">
              <div class="relative h-[60px] w-[60px] overflow-visible">
                <div class="absolute overflow-hidden rounded-full border-4 border-opacity-15">
                  <img :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover" />
                </div>
                <span
                  class="absolute bottom-[-6px] left-1/2 z-10 flex h-[20px] min-w-[44px] -translate-x-1/2 items-center justify-center rounded border border-icon-1 bg-text-2 px-0.5 text-xs font-[700] text-text-1 bg-[linear-gradient(90deg,#CACACA_0.27%,#6D6D6D_51.62%,#CACACA_99.82%)]"
                  >VIP{{ userInfo?.vipId || 0 }}</span
                >
              </div>
              <h2 class="mt-4 text-xl font-[700] leading-none text-text-1">{{ displayName }}</h2>
              <div class="mt-1 inline-flex items-center gap-0.5 text-sm font-[400] text-text-2">
                <span>{{ t('personalCenter.myProfile.profileId') }}: {{ profileId }}</span>
                <button type="button" class="rounded p-0.5" @click="copyMemberId">
                  <CopyIcon class="h-5 w-5 text-text-2" />
                </button>
              </div>
            </div>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-4"
              :aria-label="t('personalCenter.myProfile.edit')"
              @click="goToEditProfile"
            >
              <EditIcon class="h-[24px] w-[24px] text-text-1" />
            </button>
          </div>
        </section>

        <section class="mt-[28px] rounded-[12px] bg-bg-2 px-4 py-4">
          <div class="flex items-center gap-2 border-b border-opacity-10 pb-4">
            <StatisticsIcon class="h-[24px] w-[24px] text-text-1" />
            <h3 class="text-base font-bold text-text-1">
              {{ t('personalCenter.myProfile.statistics') }}
            </h3>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <div
              v-for="item in topStats"
              :key="item.label"
              class="rounded-xl bg-bg-3 px-3 py-3 text-center"
            >
              <div class="flex items-center justify-center gap-2">
                <component :is="item.icon" class="h-[24px] w-[24px] text-text-2" /><span
                  class="text-sm font-[400] text-text-1"
                  >{{ item.label }}</span
                >
              </div>
              <p class="mt-1.5 text-base font-[700] text-text-1">{{ item.value }}</p>
            </div>
          </div>
          <div class="mt-2.5 rounded-lg bg-bg-3 px-3 py-2.5">
            <div class="flex items-center justify-center gap-1">
              <component :is="bottomStat.icon" class="h-[18px] w-[18px] text-text-2" /><span
                class="text-xs font-[400] text-text-1"
                >{{ bottomStat.label }}</span
              >
            </div>
            <div
              class="mt-3 flex items-baseline justify-center gap-[4px] text-center text-xl font-[700] text-text-1"
            >
              <span>{{ bottomStatCurrencySymbol }}</span>
              <span>{{ bottomStatAmountText }}</span>
            </div>
          </div>
        </section>

        <section class="mt-4 rounded-[12px] bg-bg-2 px-4 pb-[50px] pt-4">
          <h3 class="border-b border-opacity-10 pb-4 text-base font-bold text-text-1">
            {{ t('personalCenter.myProfile.topFavoriteGames') }}
          </h3>
          <div v-if="favoriteGameCards.length > 0">
            <div
              v-for="(item, index) in favoriteGameCards"
              :key="`${item.name}-${index}`"
              class="flex items-center gap-3 pt-3"
            >
              <img
                :src="item.image"
                alt="Game"
                class="h-[112px] w-[112px] shrink-0 object-contain"
              />
              <div class="min-w-0 flex-1">
                <p class="break-words text-base font-bold text-text-1 line-clamp-2">
                  {{ item.name }}
                </p>
                <div class="mt-2 flex items-center justify-between gap-2">
                  <span class="text-base text-text-2">{{
                    t('personalCenter.myProfile.betAmount')
                  }}</span
                  ><span class="shrink-0 text-base font-bold text-text-1">{{
                    item.betAmount
                  }}</span>
                </div>
              </div>
            </div>
          </div>
          <ThemedEmptyState
            v-else
            :dark-image="defaultImgDark"
            :light-image="defaultImgLight"
            :image-alt="t('personalCenter.myProfile.noFavorites')"
            :message="t('personalCenter.myProfile.noFavorites')"
            container-class="mt-0"
            text-class="mt-2.5 text-xs font-[500] text-text-1"
          />
        </section>

        <p class="mt-5 text-center text-xs text-text-2">{{ joinedOnText }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import CopyIcon from '@/static/svg/copy.svg?component'
import EditIcon from '@/static/svg/edit.svg?component'
import StatisticsIcon from '@/static/svg/personalCenter/icon80.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import { useMyProfile } from './shared'

defineProps<{ visible: boolean }>()

const emit = defineEmits<{ close: []; edit: [] }>()
const { t } = useI18n()
const {
  userInfo,
  avatarUrl,
  displayName,
  profileId,
  topStats,
  bottomStat,
  bottomStatCurrencySymbol,
  bottomStatAmountText,
  favoriteGameCards,
  joinedOnText,
  copyMemberId,
  goToEditProfile
} = useMyProfile({ onEdit: () => emit('edit') })

const handleClose = () => {
  emit('close')
}
</script>
