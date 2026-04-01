<template>
  <!-- pc中公共分页组件 -->
  <div v-if="safeTotalPages > 1" class="flex items-center justify-center gap-2">
    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-[10px] border border-opacity-5 bg-bg-4"
      :class="isFirstPage ? 'cursor-not-allowed text-text-3' : 'text-text-2'"
      :disabled="isFirstPage"
      @click="setPage(currentPage - 1)"
    >
      <ArrowLeftIcon class="h-4 w-4" />
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-[10px] border text-sm"
      :class="
        page === currentPage
          ? 'border-theme-primary bg-theme-primary text-text-4 font-[700]'
          : 'border-opacity-5 bg-bg-4 text-text-2'
      "
      @click="setPage(page)"
    >
      {{ page }}
    </button>

    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-[10px] border border-opacity-5 bg-bg-4"
      :class="isLastPage ? 'cursor-not-allowed text-text-3' : 'text-text-2'"
      :disabled="isLastPage"
      @click="setPage(currentPage + 1)"
    >
      <ArrowRightIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'

const props = withDefaults(
  defineProps<{ currentPage: number; totalPages: number; maxVisible?: number }>(),
  { maxVisible: 6 }
)

const emit = defineEmits<{ change: [page: number] }>()

const safeTotalPages = computed(() => Math.max(1, props.totalPages))
const isFirstPage = computed(() => props.currentPage <= 1)
const isLastPage = computed(() => props.currentPage >= safeTotalPages.value)

const visiblePages = computed(() => {
  const total = safeTotalPages.value
  if (total <= props.maxVisible) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  let start = props.currentPage >= props.maxVisible ? props.currentPage - props.maxVisible + 1 : 1
  let end = start + props.maxVisible - 1
  if (end > total) {
    end = total
    start = end - props.maxVisible + 1
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const setPage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), safeTotalPages.value)
  if (nextPage === props.currentPage) return
  emit('change', nextPage)
}
</script>
