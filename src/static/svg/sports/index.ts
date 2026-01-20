import type { Component } from 'vue'
import american_football from './american_football.svg?component'
import badminton from './badminton.svg?component'
import basketball from './basketball.svg?component'
import boxing from './boxing.svg?component'
import darts from './darts.svg?component'
import fifa from './fifa.svg?component'
import soccer from './soccer.svg?component'
import table_tennis from './table-tennis.svg?component'
import tennis from './tennis.svg?component'
import volleyball from './volleyball.svg?component'

export const sportsIcons: Record<string, Component> = {
  american_football,
  badminton,
  basketball,
  boxing,
  darts,
  fifa,
  soccer,
  table_tennis,
  tennis,
  volleyball
}

export default sportsIcons
