<template>
  <div class="flex justify-between items-center" @click="toggleIsOpen">
    <div class="flex flex-col">
      <h3 class="text-[14px]">{{ gameName }}</h3>
      <div class="flex gap-[4px] text-[12px]">
        <div class="text-[var(--color-text-level-2)]">{{ t('gameDetail.by') }}</div>
        <div class="text-[var(--color-theme-level-1)]">{{ providerName }}</div>
      </div>
      <div class="text-[var(--color-theme-level-1)] text-[12px]"># {{ gameTypeName }}</div>
    </div>
    <div class="bg-[var(--color-text-level-3)] rounded-md">
      <div class="icon" :class="{ 'is-open': isOpen }">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
          ></path>
        </svg>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, inject, Ref, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

const isOpen = inject('isRgOpen') as Ref<boolean>
const { t } = useI18n()

type CurrentGameDetail = {
  itemName?: string
  platformName?: string
  sysGameTypeName?: string
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

const gameTypeName = computed(() => {
  return String(currentGameDetail.value?.sysGameTypeName ?? '').trim() || t('home.Slots')
})

const toggleIsOpen = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped lang="scss">
.icon {
  width: 20px;
  height: 20px;
  padding: 2px;
  fill: currentColor;
  transition: transform 0.3s ease-in-out;
  transform: rotate(-270deg);
}
.icon.is-open {
  transform: rotate(-90deg);
}
</style>
