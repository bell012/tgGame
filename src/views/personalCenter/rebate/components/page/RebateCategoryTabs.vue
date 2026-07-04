<template>
  <div class="mt-3 flex gap-2.5 overflow-x-auto pb-0.5 scrollbar-none">
    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      class="rebate-category-tab"
      :class="[
        buttonClass(category.id === activeCategory),
        category.id === activeCategory ? 'is-active' : 'is-inactive'
      ]"
      @click="handleCategoryClick(category.id, $event)"
    >
      <template v-if="hasRenderableIcon(category.icon)">
        <img
          v-if="isImageIcon(category.icon)"
          :src="category.icon as string"
          class="rebate-category-tab-icon"
          :class="isMobile ? 'h-6 w-6 object-contain' : 'h-4 w-4 object-contain'"
          alt=""
        />
        <component
          v-else
          :is="category.icon"
          class="rebate-category-tab-icon"
          :class="isMobile ? 'h-6 w-6' : 'h-4 w-4'"
        />
      </template>
      <span :class="isMobile ? 'mt-1 text-[12px] font-[500] leading-none' : ''">
        {{ category.label }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import type { RebateCategory } from '../../types'

const props = defineProps<{
  activeCategory: string
  categories: RebateCategory[]
  isMobile: boolean
}>()

const emit = defineEmits<{
  'update:activeCategory': [value: string]
}>()

const buttonClass = (isActive: boolean) => {
  const baseClass = props.isMobile
    ? 'group flex h-[68px] min-w-[68px] shrink-0 flex-col items-center justify-center rounded-[12px] px-2 outline-none focus:outline-none focus-visible:outline-none'
    : 'inline-flex h-[40px] min-w-[96px] shrink-0 items-center justify-center gap-1 rounded-full px-4 text-sm font-[600] outline-none focus:outline-none focus-visible:outline-none'

  const stateClass = isActive
    ? 'bg-theme-primary text-text-4'
    : 'border border-transparent bg-bg-2 text-text-2'

  return `${baseClass} ${stateClass}`
}

const isImageIcon = (icon: RebateCategory['icon']) => {
  return typeof icon === 'string' && icon.trim().length > 0
}

const hasRenderableIcon = (icon: RebateCategory['icon']) => {
  if (typeof icon === 'string') {
    return icon.trim().length > 0
  }

  return !!icon
}

const handleCategoryClick = async (categoryId: string, event: MouseEvent) => {
  emit('update:activeCategory', categoryId)

  await nextTick()
  const currentButton = event.currentTarget as HTMLButtonElement | null
  currentButton?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}
</script>

<style scoped lang="scss">
.rebate-category-tab {
}

/* 选中态为亮绿实心底，统一用普通图标压成深色，避免 API 下发的选中图标与背景同色而“消失” */
.rebate-category-tab.is-active .rebate-category-tab-icon {
  filter: brightness(0);
}

:global(:root.light) .rebate-category-tab.bg-bg-2 {
  background: var(--color-background-level-3);
  color: var(--color-text-level-2);
}
</style>
