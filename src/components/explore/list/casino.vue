<template>
  <!-- 游戏列表区域 -->
  <responsive-grid-pager
    :items="gameList"
    v-model:page="page"
    :total-pages="totalPages"
    @change="fetchPage"
    class="mt-[20px]"
  >
    <template #item="{ item }">
      <div class="w-full relative cursor-pointer" @click="itemClick(item)">
        <!-- 卡片-->
        <div class="w-full aspect-[0.75] overflow-hidden rounded-lg">
          <img :src="gameImg" alt="" class="w-full h-full object-contain" />
        </div>

        <div
          class="flex px-1 py-1 bg-[var(--color-mask-20)] rounded-md absolute items-center bottom-1 right-1"
        >
          <img :src="numImg" alt="" class="w-2.5 h-2.5 mr-0.5" />
          <div class="text-[10px] text-text-1">{{ item.num ?? item.gameItemHotVo?.hot ?? 0 }}</div>
        </div>
      </div>
    </template>
  </responsive-grid-pager>
</template>

<script setup lang="ts">
import ResponsiveGridPager from '@/components/common/ResponsiveGridPager.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import gameImg from '@/static/img/explore/game.png'
import numImg from '@/static/img/explore/num.png'
import { computed, inject, Ref, ref } from 'vue'
import { navigateTo } from '@/utils/router'

const isMobile = useIsMobile()
const isCloseDesktopModal = inject('search-close-desktop-modal') as Ref<boolean>

type CasinoGameItem = {
  id?: string | number
  rowId?: string | number
  num?: number
  gameItemHotVo?: {
    hot?: number
  }
}

const injectedGameList = inject<Ref<unknown[]>>('explore-game-list', ref([]))
const gameList = computed<CasinoGameItem[]>(() =>
  Array.isArray(injectedGameList.value) ? (injectedGameList.value as CasinoGameItem[]) : []
)

const page = ref(1)
const PAGE_SIZE = 10
const totalPages = computed(() => Math.max(1, Math.ceil(gameList.value.length / PAGE_SIZE)))

const itemClick = (item: CasinoGameItem) => {
  if (!isMobile.value) {
    isCloseDesktopModal.value = true
  }
  const gameId = item.id ?? item.rowId
  if (!gameId) return
  navigateTo('/game/' + gameId)
}

// 模拟彩票供应商数据
// const lotterySupplierList = ref([])

const fetchPage = (val: number) => {
  console.log('vvvv--->', val)
}
</script>

<style scoped lang="scss"></style>
