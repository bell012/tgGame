<template>
  <!-- 游戏列表区域 -->
  <responsive-grid-pager
    :items="list"
    v-model:page="page"
    :total-pages="totalPages"
    @change="fetchPage"
    class="mt-[20px]"
  >
    <template #item="{ item }">
      <div class="w-full relative" @click="itemClick(item)">
        <!-- 卡片-->
        <div class="w-full aspect-[0.75] overflow-hidden rounded-lg">
          <img :src="gameImg" alt="" class="w-full h-full object-contain" />
        </div>

        <div
          class="flex px-1 py-1 bg-[var(--color-mask-20)] rounded-md absolute items-center bottom-1 right-1"
        >
          <img :src="numImg" alt="" class="w-2.5 h-2.5 mr-0.5" />
          <div class="text-[10px] text-text-1">{{ item.num }}</div>
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
import { inject, Ref, ref } from 'vue'
import { useRouter } from 'vue-router'

const isMobile = useIsMobile()
const router = useRouter()
const isCloseDesktopModal = inject('search-close-desktop-modal') as Ref<boolean>

const list = ref([
  { id: 1, num: 60 },
  { id: 2, num: 61 },
  { id: 3, num: 64 },
  { id: 4, num: 67 },
  { id: 5, num: 68 },
  { id: 6, num: 65 },
  { id: 7, num: 63 },
  { id: 8, num: 62 },
  { id: 9, num: 61 },
  { id: 10, num: 68 },
  { id: 11, num: 67 }
])

const page = ref(1)
const totalPages = ref(10)

const itemClick = (item: any) => {
  if (!isMobile.value) {
    isCloseDesktopModal.value = true
  }
  router.push('/game/' + item.id)
}

// 模拟彩票供应商数据
// const lotterySupplierList = ref([])

const fetchPage = (val: number) => {
  console.log('vvvv--->', val)
}
</script>

<style scoped lang="scss"></style>
