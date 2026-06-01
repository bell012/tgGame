import { openTicketActivity } from '@/utils/openTicketActivity'

/** 打开 Lucky Spin 转盘弹窗（未登录时弹出登录框） */
export const openLuckySpin = () => {
  openTicketActivity('lucky_spin')
}
