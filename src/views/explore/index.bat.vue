<template>
  <div class="explore-page min-h-screen">
    <TopInput @change-type="id => (currentTypeId = id)" />
    <!-- 顶部横行滚动tab选择 -->
    <div class="flex w-full justify-between overflow-x-auto scrollbar-none my-3.5">
      <div
        v-for="(item, inx) in tabList"
        :key="inx"
        :class="{ 'bg-[var(--color-opacity-10)]': item.id === currentTabId }"
        class="flex px-[7px] py-[9px] shrink-0 rounded-lg text-xs items-center"
        @click="currentTabId = item.id"
      >
        <img
          :src="item.id === currentTabId ? item.iconActive : item.icon"
          alt=""
          class="w-5 h-5 mr-[7px]"
        />
        <div class="font-[700]">
          {{ item.name }}
        </div>
      </div>
    </div>

    <!-- 排序和供应商筛选 -->
    <div
      v-show="currentTypeId == 1"
      class="w-full flex items-center justify-between gap-[11px] mb-[13px]"
    >
      <!-- 排序 -->
      <SortSelect />

      <!-- 供应商 -->
      <ProviderSelect />
    </div>

    <!-- 暂定为单独的供应商盒子占位 (彩票模式显示) -->
    <div v-show="currentTypeId == 3" class="mb-[13px]">
      <!-- :list="lotterySupplierList" -->
      <ProviderSelect />
    </div>

    <!-- 游戏列表区域 -->
    <ResponsiveGridPager
      :items="list"
      v-model:page="page"
      :total-pages="totalPages"
      @change="fetchPage"
      v-show="currentTypeId != 2"
    >
      <template #item="{ item }">
        <div class="w-full relative">
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
    </ResponsiveGridPager>

    <!-- 比赛列表 -->
    <LiveList v-show="currentTypeId == 2" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopInput from '@/components/explore/top-input/index.vue'
import SortSelect from '@/components/explore/mobile/SortSelect.vue'
import ProviderSelect from '@/components/explore/mobile/ProviderSelect.vue'
import ResponsiveGridPager from '@/components/common/ResponsiveGridPager.vue'
import LiveList from '@/components/explore/mobile/LiveList.vue'
import g1Img from '@/static/img/explore/g1.png'
import g1aImg from '@/static/img/explore/g1a.png'
import g2Img from '@/static/img/explore/g2.png'
import g2aImg from '@/static/img/explore/g2a.png'
import g3Img from '@/static/img/explore/g3.png'
import g3aImg from '@/static/img/explore/g3a.png'
import g4Img from '@/static/img/explore/g4.png'
import g4aImg from '@/static/img/explore/g4a.png'
import g5Img from '@/static/img/explore/g5.png'
import g5aImg from '@/static/img/explore/g5a.png'
import gameImg from '@/static/img/explore/game.png'
import numImg from '@/static/img/explore/num.png'

const currentTabId = ref(1)
const currentTypeId = ref(1) //类型选择
const tabList = ref([
  { id: 1, name: '所有游戏', icon: g1Img, iconActive: g1aImg },
  { id: 2, name: '热门游戏', icon: g2Img, iconActive: g2aImg },
  { id: 3, name: '老虎机', icon: g3Img, iconActive: g3aImg },
  { id: 4, name: '娱乐城', icon: g4Img, iconActive: g4aImg },
  { id: 5, name: '棋牌游戏', icon: g5Img, iconActive: g5aImg }
])

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

// 模拟彩票供应商数据
// const lotterySupplierList = ref([])

const fetchPage = (val: number) => {
  console.log('vvvv--->', val)
}
</script>

<style scoped lang="scss"></style>
