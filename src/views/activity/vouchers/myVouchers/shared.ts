import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { MbTicketRecord, TicketProgressResult } from '@/api/interface/activity'
import { formatTimestamp } from '@/utils/date'
import { getStorageLanguageCode } from '@/utils/locale'
import { openTicketActivity } from '@/utils/openTicketActivity'
import {
  normalizeLanguageCode,
  normalizeMbTicketRecords,
  resolveLanguageInfo,
  TICKET_TYPE_TO_GAME_ID
} from '@/views/activity/ticket/shared/mappers/mbTicketMapper'
import {
  globalTicketToastState,
  openTicketTaskPop
} from '@/views/activity/ticket/shell/ticketToast'
import voucherIcon1 from '@/static/img/vouchers/icon1.png'
import voucherIcon2 from '@/static/img/vouchers/icon2.png'
import voucherIcon3 from '@/static/img/vouchers/icon3.png'
import voucherIcon4 from '@/static/img/vouchers/icon4.png'
import voucherIcon6 from '@/static/img/vouchers/icon6.png'

export const MY_VOUCHERS_PAGE_SIZE = 10

export type VoucherRecord = MbTicketRecord

export interface VoucherItem {
  id: string
  type: number
  icon: string
  title: string
  description: string
  validFromText: string
  expiresInText: string
  rawData: VoucherRecord
}

const VOUCHER_ICON_MAP: Record<number, string> = {
  1: voucherIcon1,
  2: voucherIcon2,
  3: voucherIcon3,
  4: voucherIcon4,
  5: voucherIcon6,
  6: voucherIcon6
}

const normalizeText = (value: unknown) => String(value ?? '').trim()
const padTimeUnit = (value: number) => String(Math.max(0, Math.floor(value))).padStart(2, '0')
const firstResult = <T>(result: T | T[] | undefined) => (Array.isArray(result) ? result[0] : result)

/** 票券结束时间，优先使用 endUseTime，没有时回退到 expireTime。 */
const getVoucherEndUseTime = (record: VoucherRecord): number => {
  const endUseTime = Number(record.endUseTime)
  if (Number.isFinite(endUseTime) && endUseTime > 0) {
    return endUseTime
  }

  const expireTime = Number(record.expireTime)
  return Number.isFinite(expireTime) && expireTime > 0 ? expireTime : 0
}

/** 将结束时间转成倒计时；如果已过期或时间非法，按需求显示 99:99:99。 */
export const formatVoucherCountdown = (
  endUseTime: number | undefined,
  nowTimestamp: number
): string => {
  const targetTime = Number(endUseTime)

  if (!Number.isFinite(targetTime) || targetTime <= 0) {
    return '99:99:99'
  }

  const remaining = targetTime - nowTimestamp

  if (remaining <= 0) {
    return '99:99:99'
  }

  const totalSeconds = Math.floor(remaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${padTimeUnit(hours)}:${padTimeUnit(minutes)}:${padTimeUnit(seconds)}`
}

/** 共用页面逻辑：请求列表、处理多语言、生成倒计时，并暴露 Use Now 操作。 */
export const useMyVouchersPage = () => {
  const { t, locale } = useI18n()
  const loading = ref(false)
  const error = ref<unknown | null>(null)
  const useNowPending = ref(false)
  const nowTimestamp = ref(Date.now())
  const voucherRecords = ref<VoucherRecord[]>([])
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  const currentLanguageCode = computed(() =>
    normalizeLanguageCode(getStorageLanguageCode(String(locale.value)))
  )

  const dataList = computed<VoucherItem[]>(() => {
    return voucherRecords.value.map(record => {
      const languageInfo = resolveLanguageInfo(record.languageInfo, currentLanguageCode.value)
      const endUseTime = getVoucherEndUseTime(record)

      return {
        id: String(record.rowId ?? record.ticketId ?? `${record.type ?? 'voucher'}-${endUseTime}`),
        type: Number(record.type ?? 0),
        icon: VOUCHER_ICON_MAP[Number(record.type)] ?? voucherIcon1,
        title: normalizeText(languageInfo?.name) || '--',
        description: normalizeText(languageInfo?.description) || '--',
        validFromText: formatTimestamp(endUseTime),
        expiresInText: formatVoucherCountdown(endUseTime, nowTimestamp.value),
        rawData: record
      }
    })
  })

  /** 接口请求 */
  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await Api.activity.mbTicketList({
        current: 1,
        size: MY_VOUCHERS_PAGE_SIZE,
        status: [1]
      })

      if (!response.success) {
        throw new Error(response.message || t('common.requestError'))
      }

      voucherRecords.value = normalizeMbTicketRecords(response.result)
    } catch (requestError) {
      error.value = requestError
    } finally {
      loading.value = false
    }
  }

  /** 根据票券类型打开票卷（type 5 拼多多为预留，无玩法入口）；打开前查询进度，任务未完成时自动弹任务进度弹窗 */
  const handleUseNow = async (item: VoucherItem) => {
    if (item.type === 5) {
      return
    }

    const gameId = TICKET_TYPE_TO_GAME_ID[item.type]

    if (!gameId || useNowPending.value) {
      return
    }

    useNowPending.value = true
    let available = true

    try {
      const response = await Api.activity.ticketProgress({ rowId: item.rawData.rowId })
      const progressData = firstResult(response.result) as TicketProgressResult | undefined
      available = progressData?.available !== false
    } catch {
      // 进度查询失败时降级为原逻辑，直接打开活动弹窗
    }

    try {
      await openTicketActivity(gameId, { record: item.rawData })

      if (!available && globalTicketToastState.visible) {
        openTicketTaskPop()
      }
    } finally {
      useNowPending.value = false
    }
  }

  /** 倒计时 */
  const startCountdown = () => {
    nowTimestamp.value = Date.now()

    if (countdownTimer) {
      clearInterval(countdownTimer)
    }

    countdownTimer = setInterval(() => {
      nowTimestamp.value = Date.now()
    }, 1000)
  }

  /** 组件销毁时清理定时器 */
  const stopCountdown = () => {
    if (!countdownTimer) {
      return
    }

    clearInterval(countdownTimer)
    countdownTimer = null
  }

  // 活动弹窗关闭（true→false）后刷新我的票券列表，反映已使用/领取的票券变化
  watch(
    () => globalTicketToastState.visible,
    (visible, prevVisible) => {
      if (prevVisible && !visible) {
        void fetchData()
      }
    }
  )

  onMounted(() => {
    startCountdown()
    void fetchData()
  })

  onBeforeUnmount(() => {
    stopCountdown()
  })

  return {
    loading,
    error,
    dataList,
    fetchData,
    handleUseNow
  }
}
