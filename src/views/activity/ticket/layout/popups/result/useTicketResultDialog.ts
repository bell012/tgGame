import {
  getTriggerReceiveTickets,
  shouldOpenTriggerReceiveOnClose
} from '@/views/activity/ticket/shared/ticketPostTrigger'
import {
  closeTicketDialog,
  globalTicketDialogState,
  openTicketReceiveDialog
} from '@/views/activity/ticket/shell/ticketDialog'
import { globalTicketToastState } from '@/views/activity/ticket/shell/ticketToast'
import { TICKET_RESULT_CARDS_VARIANTS, TICKET_RESULT_HERO_VARIANTS } from './constants'
import { computed } from 'vue'

export type TicketResultDialogGroup = 'hero' | 'cards'

export function useTicketResultDialog(group: TicketResultDialogGroup) {
  const dialogState = globalTicketDialogState
  const variants = group === 'hero' ? TICKET_RESULT_HERO_VARIANTS : TICKET_RESULT_CARDS_VARIANTS

  const visible = computed(
    () =>
      dialogState.kind === 'result' &&
      (variants as readonly string[]).includes(dialogState.result.variant)
  )
  const result = computed(() => dialogState.result)

  const close = () => {
    // 结果弹窗关闭时，是否触发下一轮票券完全由已消耗票券的 enableTrigger 决定：
    // enableTrigger=1 且 triggerConfig 有指定票券 → 打开领取浮窗；其余情况仅关闭。
    if (group === 'hero') {
      const consumedRecord = globalTicketToastState.lastConsumedTicketRecord
      if (shouldOpenTriggerReceiveOnClose(consumedRecord)) {
        const triggerTickets = getTriggerReceiveTickets(consumedRecord)
        if (triggerTickets.length > 0) {
          openTicketReceiveDialog({ nextTickets: triggerTickets })
          return
        }
      }
    }

    closeTicketDialog()
  }

  return { visible, result, close }
}
