import { computed, onScopeDispose, ref, watch, type Ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { cancelHashGameBet, placeHashGameBet } from '@/api/modules/hash_game'
import type {
  HashGameLotteryInfo,
  HashGamePlaceBetParams,
  HashGamePlaceBetResult
} from '@/api/interface/hash_game.interface'
import { getBetAmountLimitError } from './betAmountLimits'
import type { ChipColor } from './chips'
import { BET_KEYS, timestampMillis, type BetKey } from './lotteryDisplay'

type Stake = { option: BetKey; amount: number; color: ChipColor }
export type HashGameBetChip = Stake & { id: number }

type Round = Pick<HashGamePlaceBetParams, 'gameCode' | 'currency' | 'anchorBlockNum'>
type PlacedBet = Round & { orderNo?: string; chips: HashGameBetChip[] }
type Value<T> = Readonly<Ref<T>>

const sumChips = (chips: readonly Stake[]) => chips.reduce((total, chip) => total + chip.amount, 0)

const OPPOSITE_BETS: Partial<Record<BetKey, BetKey>> = {
  big: 'small',
  small: 'big',
  odd: 'even',
  even: 'odd',
  banker: 'player',
  player: 'banker',
  win: 'lose',
  lose: 'win'
}

export function useHashGameBetting(options: {
  account: Value<string>
  currency: Value<string>
  gameCode: Value<string>
  info: Value<HashGameLotteryInfo | null>
  now: Value<number>
  markets: Value<readonly HashGamePlaceBetParams['betOption'][]>
  balance: Value<number>
  quickBet: Value<boolean>
  openLogin: () => void
  refreshBalance: () => Promise<boolean>
  notify: (key: string, type?: 'success' | 'fail', params?: { amount: number }) => void
  onPlaced: (request: HashGamePlaceBetParams, result: HashGamePlaceBetResult) => void
}) {
  const draft = ref<HashGameBetChip[]>([])
  const placed = ref<PlacedBet[]>([])
  const busy = ref(false)
  let nextChipId = 0
  let accountVersion = 0
  let balanceNeedsRefresh = false
  let disposed = false

  const round = computed<Round | null>(() => {
    const info = options.info.value
    if (!info || info.gameCode !== options.gameCode.value || !options.currency.value) return null
    const anchorBlockNum = info.anchorBlockNum
    if (
      typeof anchorBlockNum !== 'number' ||
      !Number.isSafeInteger(anchorBlockNum) ||
      anchorBlockNum <= 0
    )
      return null
    return { gameCode: info.gameCode, currency: options.currency.value, anchorBlockNum }
  })
  const roundKey = (value: Round | null) =>
    value ? `${value.gameCode}:${value.currency}:${value.anchorBlockNum}` : ''
  const currentRoundKey = computed(() => roundKey(round.value))
  const marketOpen = computed(() => {
    const deadline = timestampMillis(options.info.value?.nextAnchorEstimatedTime)
    return Boolean(
      round.value && !options.info.value?.sealed && (!deadline || options.now.value < deadline)
    )
  })
  const activeBets = computed(() =>
    placed.value.filter(bet => roundKey(bet) === currentRoundKey.value)
  )
  const cancellableBets = computed(() => activeBets.value.filter(bet => bet.orderNo))
  const betTotals = computed(() => {
    const totals: Partial<Record<BetKey, number>> = {}
    for (const { option, amount } of draft.value) totals[option] = (totals[option] ?? 0) + amount
    return totals
  })
  const canConfirm = computed(() => !busy.value && marketOpen.value && draft.value.length > 0)
  const canRepeat = computed(
    () => !busy.value && marketOpen.value && (draft.value.length > 0 || activeBets.value.length > 0)
  )
  const canCancel = computed(
    () =>
      !busy.value &&
      (draft.value.length > 0 || (marketOpen.value && cancellableBets.value.length > 0))
  )

  watch(
    [currentRoundKey, options.quickBet],
    () => {
      draft.value = []
    },
    { flush: 'sync' }
  )
  watch(
    currentRoundKey,
    () => {
      if (!round.value) return
      const { gameCode, currency, anchorBlockNum } = round.value
      placed.value = placed.value.filter(
        order =>
          order.gameCode !== gameCode ||
          order.currency !== currency ||
          order.anchorBlockNum >= anchorBlockNum
      )
    },
    { flush: 'sync' }
  )
  watch(
    options.account,
    () => {
      accountVersion++
      draft.value = []
      placed.value = []
      balanceNeedsRefresh = false
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    disposed = true
  })

  const requireAccount = () => {
    if (options.account.value) return true
    options.openLogin()
    return false
  }
  const sameAccount = (account: number) => !disposed && accountVersion === account
  const sameRound = (account: number, key: string) =>
    sameAccount(account) && currentRoundKey.value === key

  const syncBalance = async (account: number) => {
    const refreshed = await options.refreshBalance().catch(() => false)
    if (sameAccount(account)) balanceNeedsRefresh = !refreshed
    return refreshed
  }

  const hasBalance = (amount: number) => {
    const balance = options.balance.value
    if (Number.isFinite(balance) && amount <= balance) return true
    options.notify('hashGame.insufficientBalance')
    return false
  }

  const canBetOptions = (pending: Iterable<BetKey>) => {
    const restricted = options.info.value?.restrictOpposite
    if (restricted !== 1 && restricted !== true) return true

    const pendingOptions = new Set(pending)
    const chosen = new Set(pendingOptions)
    for (const bet of activeBets.value) {
      for (const chip of bet.chips) chosen.add(chip.option)
    }
    for (const option of pendingOptions) {
      const opposite = OPPOSITE_BETS[option]
      if (opposite && chosen.has(opposite)) {
        options.notify('hashGame.oppositeBetRestricted')
        return false
      }
    }
    return true
  }

  const withinLimits = (amounts: Iterable<number>) => {
    for (const amount of amounts) {
      const limitError = getBetAmountLimitError(options.info.value, amount)
      if (limitError) {
        options.notify(limitError.key, 'fail', limitError.params)
        return false
      }
      if (!Number.isSafeInteger(amount) || amount <= 0) {
        options.notify('hashGame.betAmountOutOfRange')
        return false
      }
    }
    return true
  }

  const removeDraftChips = (entries: readonly HashGameBetChip[]) => {
    const ids = new Set(entries.map(chip => chip.id))
    draft.value = draft.value.filter(chip => !ids.has(chip.id))
  }

  const submitDraft = async () => {
    const activeRound = round.value
    if (!activeRound || !canConfirm.value || !requireAccount()) return
    const account = accountVersion
    const key = roundKey(activeRound)
    const quick = options.quickBet.value
    let notified = false
    const groups = new Map<BetKey, HashGameBetChip[]>()
    for (const chip of draft.value) {
      const group = groups.get(chip.option) ?? []
      group.push(chip)
      groups.set(chip.option, group)
    }
    busy.value = true
    try {
      if (balanceNeedsRefresh && !(await syncBalance(account))) {
        options.notify('common.requestError')
        return
      }
      if (!sameRound(account, key) || !marketOpen.value) return
      if (
        !canBetOptions(groups.keys()) ||
        !withinLimits(draft.value.map(chip => chip.amount)) ||
        !withinLimits([...groups.values()].map(sumChips)) ||
        !hasBalance(sumChips(draft.value))
      )
        return
      for (const [option, entries] of groups) {
        if (!sameRound(account, key) || !marketOpen.value) break
        if (!canBetOptions([option])) break
        const betOption = options.markets.value.find(market => BET_KEYS[market] === option)
        if (!betOption) continue
        const request = {
          ...activeRound,
          requestId: uuidv4(),
          betOption,
          amount: sumChips(entries)
        }
        try {
          const response = await placeHashGameBet(request)
          if (response.success !== true) {
            if (!response.message && sameRound(account, key)) options.notify('common.requestError')
            break
          }
          if (!sameAccount(account)) break
          const result = response.result
          const orderNo =
            result?.currency === request.currency &&
            result.anchorBlockNum === request.anchorBlockNum
              ? result.orderNo
              : undefined
          balanceNeedsRefresh = true
          placed.value = [...placed.value, { ...activeRound, orderNo, chips: entries }]
          removeDraftChips(entries)
          if (!notified) {
            notified = true
            options.notify('hashGame.betSuccess', 'success')
          }
          if (orderNo && sameRound(account, key)) options.onPlaced(request, result)
        } catch {
          if (sameAccount(account)) {
            balanceNeedsRefresh = true
            removeDraftChips(entries)
            if (sameRound(account, key)) options.notify('hashGame.betResultUnknown')
          }
          break
        }
      }
    } finally {
      if (quick) removeDraftChips([...groups.values()].flat())
      if (sameAccount(account) && balanceNeedsRefresh) await syncBalance(account)
      busy.value = false
    }
  }

  const addChips = async (stakes: Stake[]) => {
    if (busy.value || !requireAccount()) return
    if (!marketOpen.value) {
      options.notify('hashGame.bettingUnavailable')
      return
    }
    const account = accountVersion
    const key = currentRoundKey.value
    if (balanceNeedsRefresh) {
      busy.value = true
      try {
        if (!(await syncBalance(account))) {
          options.notify('common.requestError')
          return
        }
      } finally {
        busy.value = false
      }
      if (!sameRound(account, key) || !marketOpen.value) return
    }
    const next = [...draft.value, ...stakes]
    const totals = new Map<BetKey, number>()
    for (const { option, amount } of next) totals.set(option, (totals.get(option) ?? 0) + amount)
    if (
      !canBetOptions(totals.keys()) ||
      !withinLimits(stakes.map(stake => stake.amount)) ||
      !withinLimits(totals.values()) ||
      !hasBalance(sumChips(next))
    )
      return
    draft.value = [...draft.value, ...stakes.map(stake => ({ ...stake, id: ++nextChipId }))]
    if (options.quickBet.value) await submitDraft()
  }

  const repeatBets = () => {
    if (!canRepeat.value) return
    const stakes = new Map<BetKey, Stake>()
    for (const chip of [...activeBets.value.flatMap(bet => bet.chips), ...draft.value]) {
      stakes.set(chip.option, {
        option: chip.option,
        amount: (stakes.get(chip.option)?.amount ?? 0) + chip.amount,
        color: chip.color
      })
    }
    return addChips([...stakes.values()])
  }

  const cancelBet = async () => {
    if (!canCancel.value || !requireAccount()) return
    const orders = cancellableBets.value
    const order = marketOpen.value ? orders[orders.length - 1] : undefined
    if (!order?.orderNo) {
      draft.value = []
      return
    }
    const account = accountVersion
    const { gameCode, currency, orderNo } = order
    busy.value = true
    try {
      const response = await cancelHashGameBet({ gameCode, currency, orderNo })
      if (response.success !== true) {
        if (!response.message && sameAccount(account)) options.notify('common.requestError')
        return
      }
      if (!sameAccount(account)) return
      const cancelled = new Set([orderNo])
      if (Array.isArray(response.result?.cancelled)) {
        for (const item of response.result.cancelled) {
          if (item.currency === currency && item.anchorBlockNum === order.anchorBlockNum)
            cancelled.add(item.orderNo)
        }
      }
      balanceNeedsRefresh = true
      placed.value = placed.value.filter(item => !item.orderNo || !cancelled.has(item.orderNo))
      options.notify('hashGame.cancelSuccess', 'success')
    } catch {
      if (sameAccount(account)) {
        balanceNeedsRefresh = true
        options.notify('common.requestError')
      }
    } finally {
      if (sameAccount(account) && balanceNeedsRefresh) await syncBalance(account)
      busy.value = false
    }
  }

  return {
    chips: draft,
    betTotals,
    busy,
    canCancel,
    canRepeat,
    canConfirm,
    addChips,
    submitDraft,
    cancelBet,
    repeatBets
  }
}
