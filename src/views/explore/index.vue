<template>
  <div class="explore-page min-h-screen">
    <TopInput />
    <!-- 顶部横行滚动tab选择 -->
    <div class="w-full my-3.5 overflow-x-auto scrollbar-none flex flex-nowrap gap-2.5">
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
    <div class="w-full flex items-center justify-between gap-[11px]">
      <!-- 排序 -->
      <SortSelect />

      <!-- 供应商 -->
      <ProviderSelect />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopInput from '@/components/explore/TopInput.vue'
import SortSelect from '@/components/explore/SortSelect.vue'
import ProviderSelect from '@/components/explore/ProviderSelect.vue'
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

const currentTabId = ref(1)
const tabList = ref([
  { id: 1, name: '所有游戏', icon: g1Img, iconActive: g1aImg },
  { id: 2, name: '热门游戏', icon: g2Img, iconActive: g2aImg },
  { id: 3, name: '老虎机', icon: g3Img, iconActive: g3aImg },
  { id: 4, name: '娱乐城', icon: g4Img, iconActive: g4aImg },
  { id: 5, name: '棋牌游戏', icon: g5Img, iconActive: g5aImg }
])
</script>

<style scoped lang="scss"></style>
