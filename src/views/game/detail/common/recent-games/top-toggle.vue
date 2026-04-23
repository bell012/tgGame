<template>
  <div class="top-toggle-card flex justify-between items-center" @click="toggleIsOpen">
    <div class="flex flex-col">
      <h3 class="text-[14px] font-extrabold">{{ gameName }}</h3>
      <div class="flex gap-[4px] text-[12px]">
        <div class="text-[var(--color-text-level-2)]">By</div>
        <div class="text-[var(--color-theme-level-1)] font-bold">{{ providerName }}</div>
      </div>
      <!-- <div class="text-[var(--color-theme-level-1)] text-[12px] font-bold">
        # {{ gameTypeName }}
      </div> -->
    </div>
    <div class="toggle-arrow-wrap">
      <ArrowDownIcon class="icon" :class="{ 'is-open': isOpen }" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { computed, inject, Ref, type ComputedRef } from 'vue'
// import { useI18n } from 'vue-i18n'

const isOpen = inject('isRgOpen') as Ref<boolean>
// const { t } = useI18n()

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

// const gameTypeName = computed(() => {
//   return String(currentGameDetail.value?.sysGameTypeName ?? '').trim() || t('home.Slots')
// })

const toggleIsOpen = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped lang="scss">
.top-toggle-card {
  border-radius: 10px;
  padding: 0;
}

.toggle-arrow-wrap {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-opacity-10);
}

.icon {
  width: 14px;
  height: 14px;
  fill: none;
  transition: transform 0.3s ease-in-out;
  transform: rotate(0deg);
}
.icon.is-open {
  transform: rotate(180deg);
}

:global(:root.light) .top-toggle-card {
  background: #ffffff;
}

:global(:root.light) .toggle-arrow-wrap {
  background: #e3e3e3;
  border: none;
  box-shadow: none;
}
</style>
