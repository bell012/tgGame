<template>
  <div class="sports-page flex flex-col gap-4 p-4 mt-20">
    <div class="max-w-[420px] rounded-lg bg-bg-2 px-4 py-3">
      <MatchVersus
        :home-src="teamAImage"
        home-name="切尔西足球俱乐部"
        :away-src="teamBImage"
        away-name="曼城"
        :home-score="2"
        :away-score="1"
        center-caption="1X2"
      />
    </div>
    <div class="max-w-[420px] rounded-lg bg-bg-2 p-3">
      <MatchOdds v-model:expanded="oddsExpanded" :markets="oddsMarkets" />
    </div>
  </div>
</template>

<script setup lang="ts">
import teamAImage from '@/static/img/explore/a.png'
import teamBImage from '@/static/img/explore/b.png'
import { ref } from 'vue'
import MatchOdds from '@/views/sports/components/match-odds/index.vue'
import type { OddsMarket } from '@/views/sports/components/match-odds/types'
import MatchVersus from '@/views/sports/components/match-versus/index.vue'

const oddsExpanded = ref(true)

const oddsMarkets: OddsMarket[] = [
  {
    id: 'handicap',
    title: 'Handicap',
    options: [
      { id: 'h1', label: '-0/0.5', odds: '2.96', trend: 'up' },
      { id: 'h2', label: '+0/0.5', odds: '1.96' }
    ]
  },
  {
    id: 'ou',
    title: 'Over/Under',
    options: [
      { id: 'over', label: 'O 3.5', odds: '1.88', selected: true },
      { id: 'under', label: 'U 3.5', odds: '1.96', trend: 'down' }
    ]
  },
  {
    id: '1x2',
    title: '1X2',
    options: [
      { id: 'h', label: 'H', odds: '1.16' },
      { id: 'a', label: 'A', odds: '18.16' },
      { id: 'd', label: 'D', odds: '5.16' }
    ]
  }
]
</script>
