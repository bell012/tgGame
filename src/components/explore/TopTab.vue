<template>
  <div class="flex w-full justify-between overflow-x-auto scrollbar-none my-3.5 md:justify-start">
    <div
      v-for="(item, inx) in tabList"
      :key="inx"
      :class="{ 'bg-[var(--color-opacity-10)]': item.id === currentTabId }"
      class="flex px-[7px] py-[9px] shrink-0 rounded-lg text-xs items-center cursor-pointer"
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
