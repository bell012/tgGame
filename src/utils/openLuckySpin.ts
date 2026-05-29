import { useAuthModalStore } from '@/stores/authModal'
import { useLuckySpinModalStore } from '@/stores/luckySpinModal'
import { useUserStore } from '@/stores/user'

/** 打开 Lucky Spin 转盘弹窗（未登录时弹出登录框） */
export const openLuckySpin = () => {
  const userStore = useUserStore()
  const authModalStore = useAuthModalStore()
  const luckySpinModalStore = useLuckySpinModalStore()

  userStore.syncStoredUserData()
  const { userInfo, acctInfo } = userStore
  const isLoggedIn = Boolean(userInfo?.tradeToken || acctInfo?.memberId)

  if (!isLoggedIn) {
    authModalStore.openLoginModal()
    return
  }

  luckySpinModalStore.openModal()
}
