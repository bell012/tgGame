<template>
  <div class="rounded-b-xl border-t border-opacity-10 bg-bg-9 px-5 pb-4 pt-5">
    <div class="flex min-h-9 items-center justify-between gap-3">
      <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <h1 class="min-w-0 break-words text-base font-bold leading-5 text-text-1">
          {{ displayName }}
        </h1>
        <button
          type="button"
          class="max-w-full truncate rounded bg-bg-2 p-1 text-xs font-normal leading-[15px] text-text-2"
          :title="providerName"
          @click="openProviderGames"
        >
          {{ providerName }}
        </button>
      </div>
      <GameDetailActions />
    </div>
    <GameDetailStats class="mt-4" />
  </div>
</template>
<script setup lang="ts">
import { computed, inject, type ComputedRef } from 'vue'
import type { GameDetailForPlatformPlay } from '@/composables/useGamePlatformPlay'
import { navigateToName } from '@/utils/router'
import GameDetailActions from '../../common/GameDetailActions.vue'
import GameDetailStats from '../../common/GameDetailStats.vue'

const detail = inject<ComputedRef<GameDetailForPlatformPlay>>(
  'game-detail-current-game',
  computed(() => null)
)
const displayName = computed(
  () => String(detail.value?.itemName ?? detail.value?.platformName ?? '').trim() || '--'
)
const providerName = computed(
  () => String(detail.value?.platformName ?? detail.value?.sysGameTypeName ?? '').trim() || '--'
)

const openProviderGames = () => {
  const brandCode =
    String(detail.value?.brandCode ?? '').trim() ||
    String(detail.value?.platformCode ?? '')
      .trim()
      .split('_')[0]
      ?.trim()
  if (!brandCode) return

  const brandName = String(detail.value?.brandName ?? '').trim() || `${brandCode} games`
  navigateToName('brandGameList', {
    params: { brandCode },
    query: { brandName }
  })
}
</script>
