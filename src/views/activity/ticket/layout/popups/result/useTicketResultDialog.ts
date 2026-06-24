import { resolveNextRoundTickets } from '@/views/activity/ticket/shared/ticketPostTrigger'
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
    // 结果弹窗关闭时，是否触发下一轮票券由已消耗票券的 enableTrigger 决定（避免
    // enableTrigger=0 误触发）；领取浮窗内容优先取 use 接口返回的完整 nextTickets，
    // 缺失时回退 triggerConfig（见 resolveNextRoundTickets）。
    if (group === 'hero') {
      const consumedRecord = globalTicketToastState.lastConsumedTicketRecord
      const nextRoundTickets = resolveNextRoundTickets(result.value.nextTickets, consumedRecord)
      if (nextRoundTickets.length > 0) {
        openTicketReceiveDialog({ nextTickets: nextRoundTickets })
        return
      }
    }

    closeTicketDialog()
  }

  return { visible, result, close }
}
