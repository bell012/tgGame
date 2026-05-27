<template>
  <div class="latest-wrap max-w-[1248px] mx-auto sm:px-4 sm:py-4">
    <div class="header">
      <h2>{{ $t('home.LatestRound&Race') }}</h2>

      <div class="tabs bg-bg-7">
        <button
          v-for="tab in tabItems"
          :key="tab.type"
          type="button"
          :class="['tab rounded-lg', { active: activeType !== tab.type }]"
          @click="activeType = tab.type"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <LatestBetTable :type="activeType" class="mt-3" />
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

.header h2 {
  font-size: 16px;
  font-weight: 600;
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

@media (max-width: 767px) {
  .latest-wrap {
    padding: 0;
  }

  .tabs .tab {
    width: 520px;
  }
}
</style>
