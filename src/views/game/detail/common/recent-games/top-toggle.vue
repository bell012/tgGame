<template>
  <div class="top-toggle-card flex justify-between items-center" @click="toggleIsOpen">
    <div class="flex flex-col">
      <h3 class="text-[14px] font-extrabold">{{ gameName }}</h3>
      <button
        type="button"
        class="provider-link flex gap-[4px] text-[12px]"
        @click.stop="openProviderGames"
      >
        <span class="text-[var(--color-text-level-2)]">By</span>
        <span class="text-[var(--color-theme-level-1)] font-extrabold">{{ providerName }}</span>
      </button>
    </div>
    <div class="toggle-arrow-wrap">
      <ArrowDownIcon class="icon" :class="{ 'is-open': isOpen }" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { navigateToName } from '@/utils/router'
import { computed, inject, Ref, type ComputedRef } from 'vue'

const isOpen = inject('isRgOpen') as Ref<boolean>

type CurrentGameDetail = {
  brandCode?: string
  brandName?: string
  itemName?: string
  platformCode?: string
  platformName?: string
} | null

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const gameName = computed(() => {
  return String(currentGameDetail.value?.itemName ?? '').trim() || '-'
})

const providerName = computed(() => {
  return String(currentGameDetail.value?.platformName ?? '').trim() || 'PG Soft'
})

const providerCode = computed(() => {
  return String(currentGameDetail.value?.platformCode ?? '').trim()
})

const brandCode = computed(() => {
  const currentBrandCode = String(currentGameDetail.value?.brandCode ?? '').trim()
  if (currentBrandCode) {
    return currentBrandCode
  }

  return providerCode.value.split('_')[0]?.trim() ?? ''
})

const brandPageTitle = computed(() => {
  const currentBrandName = String(currentGameDetail.value?.brandName ?? '').trim()
  if (currentBrandName) {
    return currentBrandName
  }

  return brandCode.value ? `${brandCode.value} games` : providerName.value
})

const toggleIsOpen = () => {
  isOpen.value = !isOpen.value
}

const openProviderGames = () => {
  if (!brandCode.value) {
    return
  }

  navigateToName('brandGameList', {
    params: {
      brandCode: brandCode.value
    },
    query: {
      brandName: brandPageTitle.value
    }
  })
}
</script>

<style scoped lang="scss">
.top-toggle-card {
  border-radius: 10px;
  padding: 0;
}

.toggle-arrow-wrap {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b4142;
}

.icon {
  width: 13px;
  height: 13px;
  color: var(--color-icon-level-2);
  transition: transform 0.3s ease-in-out;
  transform: rotate(0deg);
}

.icon :deep(path) {
  fill: currentColor;
}
.icon.is-open {
  transform: rotate(180deg);
}

.provider-link {
  appearance: none;
  border: 0;
  padding: 0;
  background: transparent;
  line-height: 16px;
  cursor: pointer;
  text-align: left;
}

:global(:root.light .top-toggle-card) {
  background: transparent;
}

:global(:root.light .toggle-arrow-wrap) {
  background: #f0f1f1;
  border: none;
  box-shadow: none;
}
</style>
