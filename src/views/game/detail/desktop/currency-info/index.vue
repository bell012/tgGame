<template>
  <div>
    <GameDetailPreview class="aspect-[1336/680] rounded-t-xl">
      <div
        class="absolute left-1/2 top-1/2 z-[2] w-[480px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-bg-5 p-4 lg:p-8"
      >
        <PlayForm v-if="isLogin" />
        <template v-else>
          <div class="mb-4 text-center text-[13px] font-normal leading-4 text-text-2">
            {{ t('gameDetail.signInPrompt', { gameName: displayGameName }) }}
          </div>
          <button
            type="button"
            class="flex min-h-10 w-full items-center justify-center gap-1 rounded-lg bg-theme-primary px-2 py-1 text-sm font-bold text-text-4"
            @click="authModalStore.openLoginModal()"
          >
            <img :src="playIcon" alt="" class="size-4 shrink-0 object-contain" />
            {{ t('gameDetail.guestCta') }}
          </button>
        </template>
      </div>
    </GameDetailPreview>
    <CurrencyBar />
  </div>
</template>
<script setup lang="ts">
import { computed, inject, onMounted, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/authModal'
import type { GameDetailForPlatformPlay } from '@/composables/useGamePlatformPlay'
import playIcon from '@/static/img/game/detail/play.png'
import GameDetailPreview from '../../common/GameDetailPreview.vue'
import CurrencyBar from '../currency-bar/index.vue'
import PlayForm from './play-form.vue'

const userStore = useUserStore()
const authModalStore = useAuthModalStore()
const { t } = useI18n()
const currentGameDetail = inject<ComputedRef<GameDetailForPlatformPlay>>(
  'game-detail-current-game',
  computed(() => null)
)
const isLogin = computed(() => Boolean(userStore.userInfo?.tradeToken))
const displayGameName = computed(
  () =>
    String(
      currentGameDetail.value?.itemName ?? currentGameDetail.value?.platformName ?? ''
    ).trim() || '--'
)
onMounted(() => userStore.syncStoredUserData())
</script>
