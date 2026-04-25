<template>
  <div class="mt-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      :class="buttonClass(category.id === activeCategory)"
      @click="$emit('update:activeCategory', category.id)"
    >
      <img
        v-if="isImageIcon(getIcon(category, category.id === activeCategory))"
        :src="getIcon(category, category.id === activeCategory) as string"
        :class="isMobile ? 'h-[18px] w-[18px] object-contain' : 'h-4 w-4 object-contain'"
        alt=""
      />
      <component
        v-else
        :is="getIcon(category, category.id === activeCategory)"
        :class="isMobile ? 'h-[18px] w-[18px]' : 'h-4 w-4'"
      />
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

const getIcon = (category: RebateCategory, isActive: boolean) => {
  if (isActive && category.activeIcon) {
    return category.activeIcon
  }

  return category.icon
}

const isImageIcon = (icon: RebateCategory['icon']) => {
  return typeof icon === 'string' && icon.trim().length > 0
}
</script>

<style scoped lang="scss"></style>
