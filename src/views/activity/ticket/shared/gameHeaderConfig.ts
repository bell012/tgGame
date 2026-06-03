import type { MbTicketRecord } from '@/api/interface/activity'
import type { ComposerTranslation } from 'vue-i18n'
import type {
  LuckySpinInfoResult,
  TicketGameId,
  TicketModalHeaderData,
  VoucherGameItem
} from './types'

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
  info: Pick<LuckySpinInfoResult, 'maxPrizeText'>,
  t: ComposerTranslation
): TicketModalHeaderData => {
  const copy = GAME_HEADER_COPY[gameId]

  return {
    title: copy.titleKey ? t(copy.titleKey) : (copy.title ?? ''),
    subtitle: t('luckySpinPage.subtitle', { amount: info.maxPrizeText }),
    expiresLabel: copy.expiresKey ? t(copy.expiresKey) : copy.expires,
    theme: gameId
  }
}

export const findTicketIndex = (
  games: VoucherGameItem[],
  options: { gameId?: TicketGameId; record?: MbTicketRecord | null }
) => {
  const { gameId, record } = options

  if (record?.rowId != null) {
    const byRowId = games.findIndex(item => item.rowId === record.rowId)
    if (byRowId >= 0) return byRowId
  }

  if (record?.ticketId != null) {
    const byTicketId = games.findIndex(item => {
      if (item.ticketId !== record.ticketId) return false
      if (record.rowId != null && item.rowId != null) {
        return item.rowId === record.rowId
      }
      return true
    })
    if (byTicketId >= 0) return byTicketId
  }

  if (gameId) {
    const byGameId = games.findIndex(item => item.gameId === gameId)
    if (byGameId >= 0) return byGameId
  }

  return 0
}

export const findGameIndex = (games: VoucherGameItem[], gameId: TicketGameId) =>
  findTicketIndex(games, { gameId })
