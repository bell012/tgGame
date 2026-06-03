import type { MbTicketRecord } from '@/api/interface/activity'
import i18n from '@/i18n'
import { useAuthModalStore } from '@/stores/authModal'
import { useUserStore } from '@/stores/user'
import { getLanguageCode } from '@/utils/locale'
import {
  fetchMbTicketListRecords,
  resolveTicketActivitySession
} from '@/views/activity/ticket/shared/mbTicketMapper'
import { globalShowToast } from '@/utils/toast'
import { openTicketToast, setTicketSession } from '@/views/activity/ticket/ticketToast'
import type { TicketGameId } from '@/views/activity/ticket/types'

export type OpenTicketActivityOptions = {
  /** 我的票券等入口：指定要打开的票券记录 */
  record?: MbTicketRecord
}

/** 打开票券活动弹窗（未登录时弹出登录框；无对应票券时 Toast 提示） */
export const openTicketActivity = async (
  gameId: TicketGameId,
  options?: OpenTicketActivityOptions
) => {
  const userStore = useUserStore()
  const authModalStore = useAuthModalStore()

  userStore.syncStoredUserData()
  const { userInfo, acctInfo } = userStore
  const isLoggedIn = Boolean(userInfo?.tradeToken || acctInfo?.memberId)

  if (!isLoggedIn) {
    authModalStore.openLoginModal()
    return
  }

  const languageCode = getLanguageCode()

  try {
    const records = await fetchMbTicketListRecords(languageCode)
    const session = resolveTicketActivitySession(records, gameId, options?.record)

    if (!session) {
      globalShowToast({
        message: i18n.global.t('ticketPage.noVoucherForActivity'),
        type: 'fail'
      })
      return
    }

    setTicketSession(session.activeRecord, session.sessionRecords)
    openTicketToast({ gameId })
  } catch {
    globalShowToast({
      message: i18n.global.t('ticketPage.mbTicketListFailed'),
      type: 'fail'
    })
  }
}
