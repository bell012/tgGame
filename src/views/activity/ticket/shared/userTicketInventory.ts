import type { MbTicketRecord } from '@/api/interface/activity'
import { getLanguageCode } from '@/utils/locale'
import { reactive } from 'vue'
import { TICKET_TYPE_TO_GAME_ID, fetchMbTicketListRecords } from './mappers/mbTicketMapper'
import type { TicketGameId } from './types'

interface UserTicketInventoryState {
  records: MbTicketRecord[]
  loading: boolean
  loaded: boolean
}

/** 全局用户票券库存：跨菜单 / 活动入口共享，用于判断玩法是否对当前用户可用 */
export const userTicketInventoryState = reactive<UserTicketInventoryState>({
  records: [],
  loading: false,
  loaded: false
})

let pendingFetch: Promise<MbTicketRecord[]> | null = null

export const setUserTicketInventoryRecords = (records: MbTicketRecord[]) => {
  userTicketInventoryState.records = records
  userTicketInventoryState.loaded = true
}

export const refreshUserTicketInventory = async (): Promise<MbTicketRecord[]> => {
  if (pendingFetch) return pendingFetch

  userTicketInventoryState.loading = true
  pendingFetch = (async () => {
    try {
      const records = await fetchMbTicketListRecords(getLanguageCode())
      setUserTicketInventoryRecords(records)
      return records
    } catch {
      return userTicketInventoryState.records
    } finally {
      userTicketInventoryState.loading = false
      pendingFetch = null
    }
  })()

  return pendingFetch
}

export const clearUserTicketInventory = () => {
  userTicketInventoryState.records = []
  userTicketInventoryState.loaded = false
}

/** 当前用户是否持有指定玩法的票券（未加载完成时返回 true，避免误隐藏） */
export const hasUserTicketForGame = (gameId: TicketGameId): boolean => {
  if (!userTicketInventoryState.loaded) return true
  return userTicketInventoryState.records.some(
    record => TICKET_TYPE_TO_GAME_ID[Number(record.type)] === gameId
  )
}
