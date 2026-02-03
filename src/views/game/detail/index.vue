<template>
  <div class="w-full h-full max-w-[1248px] mx-auto">
    <h5-header class="block sm:block md:hidden lg:hidden">Queen of Bounty</h5-header>
    <div class="mt-[12px] rounded-md">
      <currency-info></currency-info>
      <currency-bar></currency-bar>
    </div>
    <recent-games></recent-games>
    <game-list :title="gamelist1.title" :list="gamelist1.list"></game-list>
    <bets-list></bets-list>
  </div>
</template>
<script setup lang="ts">
import H5Header from './h5/header.vue'
import CurrencyInfo from './h5/currency-info/index.vue'
import CurrencyBar from './currency-bar/index.vue'
import BetsList from './bets-list/index.vue'
import RecentGames from './recent-games/index.vue'
// 游戏列表 ------------ start
import GameList from './game-list/index.vue'
import game1 from '@/static/img/test/game1.png'
import game2 from '@/static/img/test/game2.png'
import game3 from '@/static/img/test/game3.png'
import game4 from '@/static/img/test/game4.png'
import game5 from '@/static/img/test/game5.png'
import game6 from '@/static/img/test/game6.png'
const gamelist1 = {
  title: 'home.HotGames',
  list: [
    {
      img: {
        maintain: false,
        src: game1
      },
      number: 2234
    },
    {
      img: {
        maintain: false,
        src: game2
      },
      number: 2234
    },
    {
      img: {
        maintain: false,
        src: game3
      },
      number: 2234
    },
    {
      img: {
        maintain: false,
        src: game4
      },
      number: 2234
    },
    {
      img: {
        maintain: false,
        src: game5
      },
      number: 2234
    },
    {
      img: {
        maintain: false,
        src: game6
      },
      number: 2234
    }
  ]
}
// 游戏列表 ------------ end
</script>
<style scoped lang="scss"></style>
