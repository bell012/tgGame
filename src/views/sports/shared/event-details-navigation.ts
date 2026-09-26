import { toRaw } from 'vue'
import type { SportsMatch } from './types'

const STORAGE_KEY = 'tgGame:sportsEventDetailsMatch'

/** 跳转详情前写入可序列化的赛事快照，避免 history.state 过大或含 Proxy 导致导航失败。 */
export const persistEventDetailsMatch = (match: SportsMatch) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toRaw(match)))
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

export const readEventDetailsMatch = (sportId: number, eventId: number): SportsMatch | null => {
  if (!Number.isFinite(sportId) || !Number.isFinite(eventId) || sportId <= 0 || eventId <= 0) {
    return null
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const match = JSON.parse(raw) as SportsMatch
    if (match.sportId !== sportId || match.EventId !== eventId) {
      return null
    }
    return match
  } catch {
    return null
  }
}
