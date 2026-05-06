<template>
  <div class="top-toggle-card flex justify-between items-center" @click="toggleIsOpen">
    <div class="flex flex-col">
      <h3 class="text-[14px] font-extrabold">{{ gameName }}</h3>
      <div class="flex gap-[4px] text-[12px]">
        <div class="text-[var(--color-text-level-2)]">By</div>
        <button
          type="button"
          class="provider-link text-[var(--color-theme-level-1)] font-extrabold"
          @click.stop="openProviderGames"
        >
          {{ providerName }}
        </button>
      </div>
    </div>
    <div class="toggle-arrow-wrap">
      <ArrowDownIcon class="icon" :class="{ 'is-open': isOpen }" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { navigateTo } from '@/utils/router'
import { computed, inject, Ref, type ComputedRef } from 'vue'

const isOpen = inject('isRgOpen') as Ref<boolean>

type CurrentGameDetail = {
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

const toggleIsOpen = () => {
  isOpen.value = !isOpen.value
}

const openProviderGames = () => {
  if (!providerCode.value) {
    return
  }

  navigateTo('/game/detail/recommended', {
    query: {
      platformCode: providerCode.value,
      title: providerName.value
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
  transition: transform 0.3s ease-in-out;
  transform: rotate(0deg);
}

.icon :deep(path) {
  fill: #f2f5f5 !important;
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
}

:global(:root.light .top-toggle-card) {
  background: transparent;
}

:global(:root.light .toggle-arrow-wrap) {
  background: #f0f1f1;
  border: none;
  box-shadow: none;
}

:global(:root.light .icon path) {
  fill: #111111 !important;
}
</style>
