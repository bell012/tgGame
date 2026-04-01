<template>
  <div class="w-full">
    <div v-if="isLoading" class="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-7">
      <div
        v-for="index in resolvedPageSize"
        :key="index"
        class="h-[60px] rounded-lg bg-bg-2 animate-pulse"
      />
    </div>

    <div v-else class="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-7">
      <a
        v-for="item in brandList"
        :key="item.rowId"
        href="javascript:void(0);"
        class="flex h-16 shrink-0 items-center justify-center rounded-lg bg-bg-2"
      >
        <gameErrImg class="h-6 w-4/5 sm:h-11" :img="getBrandImg(item)" />
      </a>
    </div>

    <div v-if="total > 0" class="mt-4 flex items-center justify-center">
      <button
        type="button"
        class="flex h-9 items-center justify-center rounded-bl-lg rounded-tl-lg bg-bg-2 px-2.5 text-xs"
        :class="canPrev ? 'text-text-1 ' : 'text-text-2 opacity-50'"
        :disabled="!canPrev"
        @click="goPrev"
      >
        <LeftArrow class="w-2 h-2" />
      </button>

      <div class="mx-0.5 flex items-center bg-bg-2 px-2.5 py-1">
        <!-- 当前页码-->
        <div
          class="flex items-center justify-center rounded-md bg-bg-3 px-2 py-2 text-xs font-bold leading-3 text-text-1"
        >
          {{ page < 10 ? '0' + page : page }}
        </div>

        <!-- of -->
        <span class="mx-0.5 text-xs lowercase text-text-2">of</span>

        <!-- 总页码 -->
        <span
          class="flex items-center justify-center rounded-md px-2 py-2 text-xs font-bold leading-3 text-text-1"
          >{{ totalPages }}</span
        >
      </div>

      <button
        type="button"
        class="flex h-9 items-center justify-center rounded-br-lg rounded-tr-lg bg-bg-2 px-2.5 text-xs"
        :class="canNext ? 'text-text-1 ' : 'text-text-2 opacity-50'"
        :disabled="!canNext"
        @click="goNext"
      >
        <RightArrow class="w-2 h-2" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import type { GameBrandItem } from '@/api/interface/game'
import type { GameQueryOptions } from '@/stores/game'
import LeftArrow from '@/static/svg/explore/left-arrow.svg?component'
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'
import gameErrImg from '@/components/common/gameErrImg.vue'

interface Props {
  queryOptions?: GameQueryOptions & { keyword?: string }
  modules?: GameQueryOptions & { keyword?: string }
}

const props = defineProps<Props>()
const gameStore = useGameStore()
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)
const brandList = ref<GameBrandItem[]>([])
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)
const resolvedQueryOptions = computed(() => props.queryOptions ?? props.modules ?? {})
const resolvedPageSize = computed(() => Math.max(1, resolvedQueryOptions.value.pageSize ?? 28))
const resolvedQueryKey = computed(() => JSON.stringify(resolvedQueryOptions.value))

const getBrandImg = (item: GameBrandItem) => {
  const imagePath = item.banner || item.icon
  const src = imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''

  return {
    maintain: false,
    src,
    fit: 'contain' as const
  }
}

const goPrev = () => {
  page.value = Math.min(Math.max(1, page.value - 1), Math.max(1, totalPages.value))
}

const goNext = () => {
  page.value = Math.min(Math.max(1, page.value + 1), Math.max(1, totalPages.value))
}

const getBrandData = async () => {
  isLoading.value = true

  try {
    const res = await gameStore.queryGameBrandDataPage({
      keyword: resolvedQueryOptions.value.keyword,
      page: page.value,
      pageSize: resolvedPageSize.value
    })

    total.value = res.total
    totalPages.value = res.totalPages
    brandList.value = res.list
  } finally {
    isLoading.value = false
  }
}

watch(
  resolvedQueryKey,
  () => {
    if (page.value !== 1) {
      page.value = 1
      return
    }

    void getBrandData()
  },
  { immediate: true }
)

watch(page, () => {
  if (!resolvedQueryKey.value) {
    return
  }

  void getBrandData()
})
</script>
<style scoped lang="scss"></style>
