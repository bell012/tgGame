import Api from '@/api'
import type { MbTicketRecord, TicketProgressResult } from '@/api/interface/activity'
import { getLanguageCode } from '@/utils/locale'
import { computed, ref, unref, watch, type MaybeRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { getMbTicketLanguageCopy } from '../mappers/mbTicketMapper'
import { buildTaskItems } from './buildTaskItems'
import type { TaskItem } from './types'

interface UseTicketTaskDataOptions {
  visible: MaybeRef<boolean>
  ticketId: MaybeRef<number | undefined>
  rowId: MaybeRef<number | undefined>
}

const firstResult = <T>(result: T | T[] | undefined) => (Array.isArray(result) ? result[0] : result)

export const useTicketTaskData = ({ visible, ticketId, rowId }: UseTicketTaskDataOptions) => {
  const { t } = useI18n()
  const taskItems = ref<TaskItem[]>([])
  const voucherName = ref('')
  const currentLanguageCode = computed(() => getLanguageCode())

  const loadTaskData = async () => {
    const resolvedTicketId = unref(ticketId)
    if (!resolvedTicketId) return

    try {
      const [ticketResponse, progressResponse] = await Promise.all([
        Api.activity.mbTicketList({
          ticketId: resolvedTicketId,
          languageCode: currentLanguageCode.value
        }),
        Api.activity.ticketProgress({
          rowId: unref(rowId),
          ticketId: resolvedTicketId
        })
      ])

      const ticketData = firstResult(ticketResponse.result) as MbTicketRecord | undefined
      const progressData = firstResult(progressResponse.result) as TicketProgressResult | undefined

      voucherName.value = getMbTicketLanguageCopy(ticketData, currentLanguageCode.value).name
      taskItems.value = buildTaskItems(ticketData, progressData, {
        t: (key, params) => t(key, params ?? {}),
        locale: currentLanguageCode.value
      })
    } catch (error) {
      console.error('task-pop load failed:', error)
    }
  }

  watch(
    [() => unref(visible), () => unref(ticketId), () => unref(rowId)],
    ([nextVisible]) => {
      if (!nextVisible) return
      void loadTaskData()
    },
    { immediate: true }
  )

  return {
    taskItems,
    voucherName,
    loadTaskData
  }
}
