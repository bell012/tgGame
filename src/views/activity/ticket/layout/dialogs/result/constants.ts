import type { LuckySpinResultVariant } from '@/views/activity/ticket/shared/types'

export const TICKET_RESULT_HERO_VARIANTS = [
  'cash',
  'spin_again',
  'no_prize'
] as const satisfies readonly LuckySpinResultVariant[]

export const TICKET_RESULT_CARDS_VARIANTS = [
  'voucher_single',
  'voucher_multi'
] as const satisfies readonly LuckySpinResultVariant[]
