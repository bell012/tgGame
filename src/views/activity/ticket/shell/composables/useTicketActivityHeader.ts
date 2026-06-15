import { getLanguageCode } from '@/utils/locale'
import { buildGameHeader } from '../../shared/mappers/gameHeaderConfig'
import { getMbTicketLanguageCopy } from '../../shared/mappers/mbTicketMapper'
import { getTicketActivityEndUseTime } from '../../shared/utils/ticketActivityCountdown'
import type { TicketActivitySession } from '../../shared/types'
import { globalTicketToastState } from '../ticketToast'
import type { Ref } from 'vue'
import { computed } from 'vue'

export function useTicketActivityHeader(
  activitySession: Ref<TicketActivitySession | null>,
  t: (key: string, ...args: unknown[]) => string
) {
  const toastState = globalTicketToastState

  const headerData = computed(() => {
    const record = globalTicketToastState.activeTicketRecord
    const { description: voucherDescription } = getMbTicketLanguageCopy(record, getLanguageCode())
    const voucherEndTime = getTicketActivityEndUseTime(record)

    if (!activitySession.value) {
      return {
        title: '',
        subtitle: voucherDescription,
        theme: toastState.gameId,
        endTime: voucherEndTime > 0 ? voucherEndTime : undefined
      }
    }

    const baseHeader = buildGameHeader(toastState.gameId, activitySession.value, t)

    return {
      ...baseHeader,
      subtitle: voucherDescription || baseHeader.subtitle,
      endTime: voucherEndTime > 0 ? voucherEndTime : undefined
    }
  })

  return { headerData }
}
