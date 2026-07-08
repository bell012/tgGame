<template>
  <div
    class="flex overflow-x-auto pb-0.5 scrollbar-none"
    :class="isMobile ? 'mt-3 gap-2.5' : 'mt-7 gap-2'"
  >
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
          :class="isMobile ? 'h-5 w-5 object-contain' : 'h-8 w-8 object-contain'"
          alt=""
        />
        <component
          v-else
          :is="category.icon"
          class="rebate-category-tab-icon"
          :class="isMobile ? 'h-5 w-5' : 'h-8 w-8'"
        />
      </template>
      <span :class="isMobile ? 'mt-1 text-[12px] font-[400] leading-none' : ''">
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
    ? 'group flex h-[60px] min-w-[60px] shrink-0 flex-col items-center justify-center rounded-[10px] px-2 outline-none focus:outline-none focus-visible:outline-none'
    : 'inline-flex h-[48px] min-w-[96px] shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-[700] outline-none focus:outline-none focus-visible:outline-none'

  const inactiveBg = props.isMobile ? 'bg-bg-2' : 'bg-bg-3'
  const stateClass = isActive
    ? 'bg-theme-primary text-text-4'
    : `border border-transparent ${inactiveBg} text-text-2`

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
