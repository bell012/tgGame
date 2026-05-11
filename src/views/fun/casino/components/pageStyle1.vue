<template>
  <div v-if="loading" class="w-full">
    <casinoGameModule v-for="sectionIndex in skeletonSectionCount" :key="sectionIndex" loading />
  </div>

  <template v-else>
    <casinoGameModule
      v-for="(item, index) in lobbyButtons"
      :key="index"
      :module="item"
      view-all-mode="casino"
    />
    <template v-if="!hideLatestBet">
      <div class="mt-2 flex h-8 items-center sm:mt-6">
        <h2 class="flex items-center text-base font-bold text-text-1 sm:text-xl">
          {{ t('casino.latest_bet') }}
        </h2>
        <span class="ml-auto"></span>
      </div>
      <div
        class="mt-2 flex w-full rounded-lg bg-bg-8 text-text-2 sm:!-mt-9 sm:ml-auto sm:max-w-[347px]"
      >
        <button
          :class="{
            'bg-bg-7 text-text-1': latestBetIndex === 0
          }"
          class="flex h-10 flex-1 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          @click.stop="latestBetIndex = 0"
        >
          {{ t('casino.latest_bet') }}
        </button>
        <button
          :class="{
            'bg-bg-7 text-text-1': latestBetIndex === 1
          }"
          class="flex h-10 flex-1 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          @click.stop="latestBetIndex = 1"
        >
          {{ t('casino.high_roller') }}
        </button>
      </div>
      <div class="mt-3 h-[430px]">
        <LatestBetTable :type="latestBetIndex === 0 ? 1 : 2" />
      </div>
    </template>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { CasinoLobbyButtonItem } from '@/composables/useCasinoTabButtons'
import casinoGameModule from './casinoGameModule.vue'
import LatestBetTable from '@/components/common/latestBetTable.vue'

const props = defineProps<{
  modules?: CasinoLobbyButtonItem[]
  loading?: boolean
  hideLatestBet?: boolean
}>()

const { t } = useI18n()
const isMobile = useIsMobile()
const hideLatestBet = computed(() => Boolean(props.hideLatestBet))

const lobbyButtons = computed<CasinoLobbyButtonItem[]>(() => {
  return (props.modules ?? []).filter(item => item.sysGameTypeCode)
})

const latestBetIndex = ref(0)
const skeletonSectionCount = computed(() => (isMobile.value ? 3 : 4))
</script>

<style scoped lang="scss"></style>
