<template>
  <div v-if="loading" class="w-full">
    <casinoGameModule v-for="sectionIndex in skeletonSectionCount" :key="sectionIndex" loading />
  </div>

  <template v-else>
    <!-- 首屏外的分组接近视口时再创建，避免首次进入同时初始化所有卡片、图片和字号测量。 -->
    <LazySection
      v-for="(item, index) in lobbyButtons"
      :key="item.sysGameTypeCode || index"
      :eager="!deferOffscreenSections || index < 2"
      root-margin="120px 0px"
    >
      <casinoGameModule :module="item" view-all-mode="casino" />
      <template #placeholder>
        <casinoGameModule loading />
      </template>
    </LazySection>
    <LazySection v-if="!hideLatestBet" :eager="!deferOffscreenSections" root-margin="120px 0px">
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
          class="flex h-[39px] flex-1 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          @click.stop="switchLatestBet(0)"
        >
          {{ t('casino.latest_bet') }}
        </button>
        <button
          :class="{
            'bg-bg-7 text-text-1': latestBetIndex === 1
          }"
          class="flex h-[39px] flex-1 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          @click.stop="switchLatestBet(1)"
        >
          {{ t('casino.high_roller') }}
        </button>
      </div>
      <div
        class="filter-slide-stage mt-3 overflow-hidden rounded-lg h-[520px] sm:h-[430px] sm:rounded-xl"
      >
        <Transition :name="slideName">
          <LatestBetTable
            :key="latestBetIndex"
            :type="latestBetIndex === 0 ? 1 : 2"
            class="filter-slide-pane"
          />
        </Transition>
      </div>
      <template #placeholder>
        <div class="mt-2 h-8 w-32 rounded bg-bg-2 animate-pulse" />
        <div class="mt-2 h-[39px] rounded-lg bg-bg-2 animate-pulse" />
        <div class="mt-3 h-[520px] rounded-lg bg-bg-2 animate-pulse" />
      </template>
    </LazySection>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { CasinoLobbyButtonItem } from '@/composables/useCasinoTabButtons'
import casinoGameModule from './casinoGameModule.vue'
import LatestBetTable from '@/components/common/latestBetTable.vue'
import LazySection from '@/views/home/components/LazySection.vue'

const props = defineProps<{
  modules?: CasinoLobbyButtonItem[]
  loading?: boolean
  hideLatestBet?: boolean
}>()

const { t } = useI18n()
const isMobile = useIsMobile()
// 仅安卓推迟首屏外分组和最新投注表格的创建，iOS 保持原来的首次渲染时机。
const deferOffscreenSections = computed(
  () => isMobile.value && typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
)
const hideLatestBet = computed(() => Boolean(props.hideLatestBet))

const lobbyButtons = computed<CasinoLobbyButtonItem[]>(() => {
  return (props.modules ?? []).filter(item => item.sysGameTypeCode)
})

const latestBetIndex = ref(0)
const slideName = ref<'filter-slide-left' | 'filter-slide-right'>('filter-slide-left')
const skeletonSectionCount = computed(() => (isMobile.value ? 3 : 4))

const switchLatestBet = (index: 0 | 1) => {
  if (index === latestBetIndex.value) return
  slideName.value = index > latestBetIndex.value ? 'filter-slide-left' : 'filter-slide-right'
  latestBetIndex.value = index
}
</script>

<style scoped lang="scss"></style>
