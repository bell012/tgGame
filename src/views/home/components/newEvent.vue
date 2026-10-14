<template>
  <div class="latest-wrap max-w-[1248px] mx-auto sm:px-4 sm:py-4">
    <div class="header">
      <h2 class="text-base font-bold text-text-1 sm:text-xl">{{ $t('home.LatestRound&Race') }}</h2>

      <div class="tabs bg-bg-7">
        <button
          v-for="tab in tabItems"
          :key="tab.type"
          type="button"
          :class="[
            'tab rounded-lg h-[39px] flex-1 shrink-0 items-center justify-center font-bold',
            { active: activeType === tab.type }
          ]"
          @click="switchType(tab.type)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="table-viewport filter-slide-stage mt-3">
      <Transition :name="slideName">
        <LatestBetTable :key="activeType" :type="activeType" class="filter-slide-pane" />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LatestBetTable from '@/components/common/latestBetTable.vue'

const { t } = useI18n()

const tabItems = computed(() => [
  { type: 1 as const, label: t('home.LatestBet') },
  { type: 2 as const, label: t('home.HighRoller') }
])

const activeType = ref<1 | 2>(1)
const TAB_ORDER = [1, 2] as const
const slideName = ref<'filter-slide-left' | 'filter-slide-right'>('filter-slide-left')

const switchType = (type: 1 | 2) => {
  if (type === activeType.value) return
  const nextIndex = TAB_ORDER.indexOf(type)
  const previousIndex = TAB_ORDER.indexOf(activeType.value)
  slideName.value = nextIndex > previousIndex ? 'filter-slide-left' : 'filter-slide-right'
  activeType.value = type
}
</script>

<style scoped>
.latest-wrap {
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  background: var(--color-background-level-8);
  border-radius: 8px;
  overflow: hidden;
}

.tab {
  padding: 6px 12px;
  background: transparent;
  color: #9ca3af;
  border: none;
  width: 132px;
}

.tab.active {
  background: var(--color-background-level-7);
  color: var(--color-text-level-1);
}

.table-viewport {
  position: relative;
  height: 430px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--color-background-level-2);
}

@media (min-width: 640px) {
  .table-viewport {
    border-radius: 12px;
  }
}

@media (max-width: 767px) {
  .latest-wrap {
    padding: 0;
  }

  .tabs .tab {
    width: 520px;
  }
}
</style>
