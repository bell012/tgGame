import type { Component } from 'vue'
import type { MbTicketRecord } from '@/api/interface/activity'
import GoldenEggPop from '@/views/activity/ticket/components/golden-egg/golden-egg-pop.vue'
import { TICKET_TYPE_TO_GAME_ID } from '@/views/activity/ticket/shared/mappers/mbTicketMapper'
import {
  CASH_VOUCHER_RESULT_LOTTIE,
  LUCKY_SPIN_CASH_RESULT_LOTTIE,
  MYSTERY_BOX_OPEN_LOTTIE,
  RESULT_HERO_IMAGES
} from '@/views/activity/ticket/shared/constants'
import type {
  TicketResultDialogState,
  TicketResultHeroLottie
} from '@/views/activity/ticket/shell/ticketDialog'

export type HeroMediaSize = 'lg' | 'sm'

type LottieHeroMedia = {
  kind: 'lottie'
  path: string
  loop: boolean
  fallbackSrc?: string
  size: HeroMediaSize
}

export type HeroMedia =
  | { kind: 'component'; component: Component; size: HeroMediaSize }
  | LottieHeroMedia
  | { kind: 'image'; src: string; size: HeroMediaSize }
  | { kind: 'none' }

/** 新增玩法 hero 动画只需在此加一行 */
const HERO_LOTTIE_REGISTRY: Record<TicketResultHeroLottie, Omit<LottieHeroMedia, 'kind'>> = {
  mystery_box_open: {
    path: MYSTERY_BOX_OPEN_LOTTIE,
    loop: false,
    size: 'lg'
  },
  cash_voucher_result: {
    path: CASH_VOUCHER_RESULT_LOTTIE,
    loop: false,
    fallbackSrc: RESULT_HERO_IMAGES.cash,
    size: 'lg'
  }
}

const isGoldenEggCashResult = (
  variant: TicketResultDialogState['variant'],
  ticketRecord: MbTicketRecord | null | undefined
) =>
  variant === 'cash' &&
  TICKET_TYPE_TO_GAME_ID[Number(ticketRecord?.type)] === TICKET_TYPE_TO_GAME_ID[3]

export const resolveHeroMedia = (
  result: TicketResultDialogState,
  ticketRecord: MbTicketRecord | null | undefined,
  heroImage: string
): HeroMedia => {
  if (isGoldenEggCashResult(result.variant, ticketRecord)) {
    return { kind: 'component', component: GoldenEggPop, size: 'sm' }
  }

  if (result.heroLottie) {
    const lottieConfig = HERO_LOTTIE_REGISTRY[result.heroLottie]
    if (lottieConfig) {
      return { kind: 'lottie', ...lottieConfig }
    }
  }

  if (result.variant === 'cash') {
    return {
      kind: 'lottie',
      path: LUCKY_SPIN_CASH_RESULT_LOTTIE,
      loop: true,
      fallbackSrc: RESULT_HERO_IMAGES.cash,
      // Lottie 源文件 692×692，对应 H5 显示 231×231（÷3）
      size: 'lg'
    }
  }

  if (heroImage) {
    return { kind: 'image', src: heroImage, size: 'lg' }
  }

  return { kind: 'none' }
}
