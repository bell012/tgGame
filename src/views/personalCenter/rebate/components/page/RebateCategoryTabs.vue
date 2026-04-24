<template>
  <div class="mt-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      :class="buttonClass(category.id === activeCategory)"
      @click="$emit('update:activeCategory', category.id)"
    >
      <component :is="category.icon" :class="isMobile ? 'h-[18px] w-[18px]' : 'h-4 w-4'" />
      <span :class="isMobile ? 'mt-1 text-[12px] font-[500] leading-none' : ''">
        {{ category.label }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { RebateCategory } from '../../types'

const props = defineProps<{
  activeCategory: string
  categories: RebateCategory[]
  isMobile: boolean
}>()

defineEmits<{
  'update:activeCategory': [value: string]
}>()

const buttonClass = (isActive: boolean) => {
  const baseClass = props.isMobile
    ? 'group flex min-w-[72px] shrink-0 flex-col items-center justify-center rounded-[12px] px-2 py-2'
    : 'inline-flex h-[40px] min-w-[96px] shrink-0 items-center justify-center gap-1 rounded-full px-4 text-sm font-[600]'

  const stateClass = isActive
    ? 'border border-theme-primary bg-theme-3 text-theme-primary'
    : 'border border-transparent bg-bg-2 text-text-2'

  return `${baseClass} ${stateClass}`
}
</script>

<style scoped lang="scss"></style>
