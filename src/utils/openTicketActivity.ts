import i18n from '@/i18n'
import { useAuthModalStore } from '@/stores/authModal'
import { useUserStore } from '@/stores/user'
import { getLanguageCode } from '@/utils/locale'
import {
  fetchMbTicketListRecords,
  findMbTicketsByGameId
} from '@/views/activity/ticket/shared/mbTicketMapper'
import { globalShowToast } from '@/utils/toast'
import { openTicketToast, setTicketSession } from '@/views/activity/ticket/ticketToast'
import type { TicketGameId } from '@/views/activity/ticket/types'

/** 打开票券活动弹窗（未登录时弹出登录框；无对应票券时 Toast 提示） */
export const openTicketActivity = async (gameId: TicketGameId) => {
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
    const matches = findMbTicketsByGameId(records, gameId)

    if (matches.length === 0) {
      globalShowToast({
        message: i18n.global.t('ticketPage.noVoucherForActivity'),
        type: 'fail'
      })
      return
    }

    setTicketSession(matches[0]!, records)
    openTicketToast({ gameId })
  } catch {
    globalShowToast({
      message: i18n.global.t('ticketPage.mbTicketListFailed'),
      type: 'fail'
    })
  }
}
