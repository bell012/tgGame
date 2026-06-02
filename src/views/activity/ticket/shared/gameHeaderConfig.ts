import type { ComposerTranslation } from 'vue-i18n'
import type { LuckySpinInfoResult, TicketGameId, TicketModalHeaderData } from './types'

const GAME_HEADER_COPY: Record<
  TicketGameId,
  { titleKey?: string; title?: string; expiresKey?: string; expires?: string }
> = {
  lucky_spin: { titleKey: 'luckySpinPage.title', expiresKey: 'luckySpinPage.spinExpiresIn' },
  golden_egg: {
    titleKey: 'ticketPage.goldenEgg.title',
    expiresKey: 'ticketPage.goldenEgg.expiresIn'
  },
  mystery_box: {
    titleKey: 'ticketPage.mysteryBox.title',
    expiresKey: 'ticketPage.mysteryBox.expiresIn'
  },
  cash_voucher: {
    titleKey: 'ticketPage.cashVoucher.title',
    expiresKey: 'ticketPage.cashVoucher.expiresIn'
  },
  lucky_red_envelope: {
    titleKey: 'ticketPage.redPacket.title',
    expiresKey: 'ticketPage.redPacket.expiresIn'
  }
}

export const buildGameHeader = (
  gameId: TicketGameId,
  info: Pick<LuckySpinInfoResult, 'maxPrizeText' | 'endTime'>,
  t: ComposerTranslation
): TicketModalHeaderData => {
  const copy = GAME_HEADER_COPY[gameId]

  return {
    title: copy.titleKey ? t(copy.titleKey) : (copy.title ?? ''),
    subtitle: t('luckySpinPage.subtitle', { amount: info.maxPrizeText }),
    endTime: info.endTime,
    expiresLabel: copy.expiresKey ? t(copy.expiresKey) : copy.expires,
    theme: gameId
  }
}

export const findGameIndex = (games: { id: string }[], gameId: TicketGameId) => {
  const index = games.findIndex(item => item.id === gameId)
  return index >= 0 ? index : 0
}
