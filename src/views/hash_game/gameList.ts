import type { HashGameLotteryGame } from '@/api/interface/hash_game.interface'
import { getHashGameList } from '@/api/modules/hash_game'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'

type GameListRequest = {
  currency: string
  locale: string
  pending: boolean
  promise: Promise<HashGameLotteryGame[]>
}

let latestRequest: GameListRequest | undefined

/** 规则路由复用当前币种和语言的游戏列表，游戏页进入时仍可刷新列表。 */
export const requestHashGames = (currency: string, locale: string, { refresh = false } = {}) => {
  if (
    latestRequest?.currency === currency &&
    latestRequest.locale === locale &&
    (!refresh || latestRequest.pending)
  ) {
    return latestRequest.promise
  }

  const promise = getHashGameList({ currency })
    .then(response => {
      const { result } = ensureApiBusinessSuccess(response)
      if (
        !Array.isArray(result) ||
        result.some(
          game =>
            !game ||
            typeof game.gameCode !== 'string' ||
            !game.gameCode.trim() ||
            typeof game.gameName !== 'string'
        )
      )
        throw new Error('Invalid hash game catalogue')
      if (latestRequest?.promise === promise) latestRequest.pending = false
      return result
    })
    .catch(error => {
      if (latestRequest?.promise === promise) latestRequest = undefined
      throw error
    })

  latestRequest = { currency, locale, pending: true, promise }
  return promise
}
