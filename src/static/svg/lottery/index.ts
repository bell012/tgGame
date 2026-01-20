import type { Component } from 'vue'
import all_lotteries from './all_lotteries.svg?component'
import favorites from './favorites.svg?component'
import invite_rewards from './invite_rewards.svg?component'
import my_bets from './my_bets.svg?component'
import popular from './popular.svg?component'

export const lotteryIcons: Record<string, Component> = {
  all_lotteries,
  favorites,
  invite_rewards,
  my_bets,
  popular
}

export default lotteryIcons
