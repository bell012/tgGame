// 主逻辑文件
import Api from '@/api'
import type { UseTicketResponse, UseTicketResult } from '@/api/interface/activity'
import { normalizeApiResponseMessage, translateApiMessageByCode } from '@/utils/request'
import { globalShowToast } from '@/utils/toast'
import { ref } from 'vue'
import {
  getActiveTicketParams,
  globalTicketToastState,
  openTicketTaskPop
} from '../shell/ticketToast'

export const isUseTicketSuccess = (response: UseTicketResponse) =>
  response.code === 'C2' && response.result != null

export const resolveUseTicketErrorMessage = (
  response: Pick<UseTicketResponse, 'code' | 'message'>,
  fallback: string
) => {
  const normalized = normalizeApiResponseMessage(response)
  const translated = translateApiMessageByCode(normalized.code, normalized.message || '')

  return translated || normalized.message || fallback
}

export interface RunUseTicketOptions {
  /** 兜底错误文案（API 失败 / 异常时显示） */
  fallbackErrorMessage: string
  /** 成功回调，拿到 UseTicketResult 后由调用方决定后续动作（弹窗 / 启动动画等） */
  onSuccess: (result: UseTicketResult) => void | Promise<void>
  /** 失败 / 异常时的清理回调（可选，例如转盘需要 clearSectorHighlight） */
  onError?: () => void
  /** 缺 rowId 时是否打开任务弹窗，默认 true */
  openReminderOnMissingRow?: boolean
  /** use 接口返回业务失败时是否打开任务弹窗，默认 true */
  openTaskPopOnFailure?: boolean
  /** 兼容旧调用，task-pop 会基于当前票券自行加载任务数据 */
  voucherName?: string
}

/**
 * 票据使用（5 种票券共享）：
 * - 校验 rowId，缺失 → 弹 task-pop
 * - 调 /ticket/api/use，统一关掉 request.ts 自带的错误 toast，由本文件做错误提示
 * - 业务码非 C2 → 弹 task-pop + onError
 * - 异常 → globalShowToast + onError
 * - 业务成功 → 透传 UseTicketResult 给 onSuccess，由调用方决定弹窗 / 动画时序
 */
export const useTicketUseAction = () => {
  const isPending = ref(false)

  const runUseTicket = async (options: RunUseTicketOptions) => {
    if (isPending.value) return

    const params = getActiveTicketParams()

    if (!params.rowId) {
      if (options.openReminderOnMissingRow !== false) {
        openTicketTaskPop()
      }
      return
    }

    isPending.value = true

    try {
      const response = await Api.activity.useTicket(
        { rowId: params.rowId, ticketId: params.ticketId },
        { showErrorToast: false }
      )

      if (!isUseTicketSuccess(response)) {
        if (options.openTaskPopOnFailure !== false) {
          openTicketTaskPop()
        } else {
          globalShowToast({
            message: resolveUseTicketErrorMessage(response, options.fallbackErrorMessage),
            type: 'fail'
          })
        }
        options.onError?.()
        return
      }

      const activeRecord = globalTicketToastState.activeTicketRecord
      if (activeRecord) {
        globalTicketToastState.lastConsumedTicketRecord = { ...activeRecord }
      }

      await options.onSuccess(response.result!)
    } catch {
      globalShowToast({
        message: options.fallbackErrorMessage,
        type: 'fail'
      })
      options.onError?.()
    } finally {
      isPending.value = false
    }
  }

  return { runUseTicket, isPending }
}
