import { useUserStore } from '@/stores/user'
import { getPopupContext, isPopupContextCurrent } from './popupContext'
import { setUserTicketInventoryRecords } from '@/views/activity/ticket/shared/userTicketInventory'
import { fetchMbTicketListRecords } from '@/views/activity/ticket/shared/mappers/mbTicketMapper'
import { getLanguageCode } from './locale'
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
  const context = getPopupContext()
  if (!context.memberId || !isPopupContextCurrent(context)) return

  isAutoOpenRunning = true
  try {
    // 自动弹出必须基于本次成功响应，不能用库存工具失败时返回的旧账号缓存。
    const records = await fetchMbTicketListRecords(getLanguageCode())
    if (!isPopupContextCurrent(context) || globalTicketToastState.visible) return
    setUserTicketInventoryRecords(records)

    const { sortedRecords, topRecord, gameId, shouldAutoPop } = resolveTicketAutoPop(
      records,
      context
    )

    if (!shouldAutoPop || !topRecord || !gameId) return

    setTicketSession(topRecord, sortedRecords)
    openTicketToast({ gameId })
    if (globalTicketToastState.visible) markAutoPopShown(topRecord, context)
  } catch (error) {
    console.error('Ticket auto popup failed', error)
  } finally {
    isAutoOpenRunning = false
    // 旧请求期间发生了账号/访问切换，新访问的触发可能被 running 拦下。
    if (!isPopupContextCurrent(context)) void maybeAutoOpenTicketActivity()
  }
}
