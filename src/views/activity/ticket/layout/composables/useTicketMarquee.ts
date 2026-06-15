import Api from '@/api'
import { isMarqueeSupportedTicketType } from '../../shared/mappers/mbTicketMapper'
import { mapMarqueeRecords } from '../../shared/mappers/mapTicketMarquee'
import { globalTicketToastState } from '../../shell/ticketToast'
import type { WinnerTickerItem } from '../../shared/types'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'

export const useTicketMarquee = (visible: Ref<boolean>) => {
  const winnerRecords = ref<WinnerTickerItem[]>([])

  const loadMarquee = async (ticketTypeOverride?: number) => {
    const type = ticketTypeOverride ?? globalTicketToastState.activeTicketRecord?.type

    if (!isMarqueeSupportedTicketType(type)) {
      winnerRecords.value = []
      return
    }

    try {
      const response = await Api.activity.queryTicketMarquee(
        { ticketType: type },
        { showErrorToast: false }
      )

      if (
        response.success &&
        response.result?.enabled &&
        Array.isArray(response.result.records) &&
        response.result.records.length > 0
      ) {
        winnerRecords.value = mapMarqueeRecords(response.result.records)
        return
      }

      winnerRecords.value = []
    } catch {
      winnerRecords.value = []
    }
  }

  watch(
    () => globalTicketToastState.activeTicketRecord?.type,
    () => {
      if (!visible.value) return
      void loadMarquee()
    }
  )

  watch(visible, nextVisible => {
    if (nextVisible) {
      void loadMarquee(globalTicketToastState.activeTicketRecord?.type)
      return
    }
    winnerRecords.value = []
  })

  return {
    winnerRecords,
    loadMarquee
  }
}
