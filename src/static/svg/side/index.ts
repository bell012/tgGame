import type { Component } from 'vue'
import { aboutUsIcons } from '../about_us'
import { casinoIcons } from '../casino'
import { legalIcons } from '../legal'
import { lotteryIcons } from '../lottery'
import { sponsorshipsIcons } from '../sponsorships'
import { sportsIcons } from '../sports'
import { supportIcons } from '../support'
import accountIcon from './account.svg?component'
import affiliateIcon from './affiliate.svg?component'
import anniversaryIcon from './anniversary.svg?component' // import { casinoIcons } from '../casino'
import bettingInsightsIcon from './betting_insights.svg?component'
import blogIcon from './blog.svg?component'
import bonusIcon from './bonus.svg?component'
import casinoIcon from './casino.svg?component'
import fairIcon from './fair.svg?component'
import forumIcon from './forum.svg?component'
import helpIcon from './help.svg?component'
import icon_1 from './icon_1.svg?component'
import icon_18 from './icon_18.svg?component'
import icon_19 from './icon_19.svg?component'
import legalIcon from './legal.svg?component'
import logoIcon from './logo.svg?component'
import lotteryIcon from './lottery.svg?component'
import promotionIcon from './promotion.svg?component'
import sponsorshipsIcon from './sponsorships.svg?component'
import sportsIcon from './sports.svg?component'
import tipsHelpIcon from './tips_help.svg?component'
import tradingIcon from './trading.svg?component'
import vipClubIcon from './vip_club.svg?component'

const sideBaseIcons: Record<string, Component> = {
  accountIcon,
  affiliateIcon,
  bettingInsightsIcon,
  blogIcon,
  bonusIcon,
  casinoIcon,
  fairIcon,
  forumIcon,
  helpIcon,
  icon_1,
  icon_18,
  icon_19,
  legalIcon,
  logoIcon,
  lotteryIcon,
  promotionIcon,
  sponsorshipsIcon,
  sportsIcon,
  tipsHelpIcon,
  tradingIcon,
  anniversaryIcon,
  vipClubIcon
}

export const sideIcons = {
  side: sideBaseIcons,
  casino: casinoIcons,
  sports: sportsIcons,
  lottery: lotteryIcons,
  support: supportIcons,
  sponsorships: sponsorshipsIcons,
  aboutUs: aboutUsIcons,
  legal: legalIcons
}
export default sideIcons
