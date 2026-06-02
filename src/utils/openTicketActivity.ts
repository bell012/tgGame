import { useAuthModalStore } from '@/stores/authModal'
import { useUserStore } from '@/stores/user'
import { openTicketToast } from '@/views/activity/ticket/ticketToast'
import type { TicketGameId } from '@/views/activity/ticket/types'

/** 打开票券活动弹窗（未登录时弹出登录框） */
export const openTicketActivity = (gameId: TicketGameId) => {
  const userStore = useUserStore()
  const authModalStore = useAuthModalStore()

  userStore.syncStoredUserData()
  const { userInfo, acctInfo } = userStore
  const isLoggedIn = Boolean(userInfo?.tradeToken || acctInfo?.memberId)

  if (!isLoggedIn) {
    authModalStore.openLoginModal()
    return
  }

  openTicketToast({ gameId })
}
