import { useUserStore } from '@/stores/user'
import { homePopVisitState } from './homePopVisit'
import { getPopupLoginSession } from './popupSession'
import type { PopupFrequencyContext } from './popupFrequency'

export const getPopupContext = (): PopupFrequencyContext => {
  const user = useUserStore()
  const loggedIn = Boolean(user.userInfo?.tradeToken || user.acctInfo?.memberId)
  const memberId = loggedIn ? String(user.userInfo?.memberId || user.acctInfo?.memberId || '') : ''
  return {
    memberId,
    loginSessionId: getPopupLoginSession(memberId),
    homeVisitId: homePopVisitState.id
  }
}

export const isPopupContextCurrent = (context: PopupFrequencyContext) => {
  const current = getPopupContext()
  if (useUserStore().userInfo?.tradeToken && !current.memberId) return false
  return (
    homePopVisitState.isHome &&
    Boolean(context.homeVisitId) &&
    context.memberId === current.memberId &&
    context.loginSessionId === current.loginSessionId &&
    context.homeVisitId === current.homeVisitId
  )
}
