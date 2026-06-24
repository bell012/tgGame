import { useUserStore } from '@/stores/user'
import { refreshUserTicketInventory } from '@/views/activity/ticket/shared/userTicketInventory'
import {
  markAutoPopShown,
  resolveTicketAutoPop
} from '@/views/activity/ticket/shared/ticketAutoPop'
import {
  globalTicketToastState,
  openTicketToast,
  setTicketSession
} from '@/views/activity/ticket/shell/ticketToast'

/**
 * 进入首页时按 unusedTicketPopWay 自动弹出票券活动。
 * 未登录或不满足频率规则时静默跳过（不弹登录框、不提示）。
 */
let isAutoOpenRunning = false

export const maybeAutoOpenTicketActivity = async (): Promise<void> => {
  // 已弹出或正在判定中时直接跳过，避免 onMounted 与 watch(isLogin) 双触发并发
  if (isAutoOpenRunning || globalTicketToastState.visible) return

  const userStore = useUserStore()
  userStore.syncStoredUserData()
  const { userInfo, acctInfo } = userStore
  const isLoggedIn = Boolean(userInfo?.tradeToken || acctInfo?.memberId)
  if (!isLoggedIn) return

  isAutoOpenRunning = true
  try {
    const loginToken = String(userInfo?.tradeToken ?? '')
    const records = await refreshUserTicketInventory()

    const { sortedRecords, topRecord, gameId, shouldAutoPop } = resolveTicketAutoPop(
      records,
      loginToken
    )

    if (!shouldAutoPop || !topRecord || !gameId) return

    markAutoPopShown(topRecord, loginToken)
    setTicketSession(topRecord, sortedRecords)
    openTicketToast({ gameId })
  } finally {
    isAutoOpenRunning = false
  }
}
