<template>
  <div class="explore-pc-pagination mt-4 flex items-center justify-center gap-2">
    <button
      type="button"
      class="explore-pc-pagination-btn"
      :class="{ 'is-disabled': isFirstPage }"
      :disabled="isFirstPage"
      @click="setPage(page - 1)"
    >
      <LeftArrow class="explore-pc-pagination-icon" />
    </button>

    <button
      v-for="pageNum in visiblePages"
      :key="pageNum"
      type="button"
      class="explore-pc-pagination-btn explore-pc-pagination-page"
      :class="{ 'is-active': pageNum === page }"
      @click="setPage(pageNum)"
    >
      {{ pageNum }}
    </button>

    <button
      type="button"
      class="explore-pc-pagination-btn"
      :class="{ 'is-disabled': isLastPage }"
      :disabled="isLastPage"
      @click="setPage(page + 1)"
    >
      <RightArrow class="explore-pc-pagination-icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LeftArrow from '@/static/svg/explore/left-arrow.svg?component'
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'

const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    maxVisible?: number
  }>(),
  {
    maxVisible: 6
  }
)

const emit = defineEmits<{
  change: [page: number]
}>()

const safeTotalPages = computed(() => Math.max(1, props.totalPages))
const isFirstPage = computed(() => props.page <= 1)
const isLastPage = computed(() => props.page >= safeTotalPages.value)

const visiblePages = computed(() => {
  const total = safeTotalPages.value
  if (total <= props.maxVisible) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  let start = props.page >= props.maxVisible ? props.page - props.maxVisible + 1 : 1
  let end = start + props.maxVisible - 1
  if (end > total) {
    end = total
    start = end - props.maxVisible + 1
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const setPage = (nextPage: number) => {
  const targetPage = Math.min(Math.max(1, nextPage), safeTotalPages.value)
  if (targetPage === props.page) {
    return
  }

  emit('change', targetPage)
}
</script>

<style scoped lang="scss">
.explore-pc-pagination-btn {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: var(--color-background-level-3);
  color: var(--color-text-level-1);
  cursor: pointer;
}

.explore-pc-pagination-page {
  font-size: 12px;
  font-weight: 700;
  line-height: 12px;
}

.explore-pc-pagination-page.is-active {
  background: var(--color-theme-level-1);
  color: var(--color-text-level-4);
}

.explore-pc-pagination-btn.is-disabled {
  background: var(--color-background-level-4);
  color: var(--color-text-level-3);
  cursor: not-allowed;
}

.explore-pc-pagination-icon {
  width: 8px;
  height: 8px;
}

.explore-pc-pagination-icon :deep(path) {
  fill: currentColor;
}

:global(:root.light) .explore-pc-pagination-btn {
  background: var(--color-background-level-5);
  border: 1px solid var(--color-background-level-9);
}

:global(:root.light) .explore-pc-pagination-page.is-active {
  border-color: var(--color-theme-level-1);
  background: var(--color-theme-level-1);
  color: var(--color-text-level-4);
}

:global(:root.light) .explore-pc-pagination-btn.is-disabled {
  background: var(--color-background-level-4);
  color: var(--color-text-level-3);
}
</style>
