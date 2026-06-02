import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { MbTicketListResult } from '@/api/interface/activity'
import { formatTimestamp } from '@/utils/date'
import { getStorageLanguageCode } from '@/utils/locale'
import { openLuckySpin } from '@/utils/openLuckySpin'
import { openTicketActivity } from '@/utils/openTicketActivity'
import type { TicketGameId } from '@/views/activity/ticket/types'
import voucherIcon1 from '@/static/img/vouchers/icon1.png'
import voucherIcon2 from '@/static/img/vouchers/icon2.png'
import voucherIcon3 from '@/static/img/vouchers/icon3.png'
import voucherIcon4 from '@/static/img/vouchers/icon4.png'
import voucherIcon6 from '@/static/img/vouchers/icon6.png'

export const MY_VOUCHERS_PAGE_SIZE = 10

interface VoucherLanguageInfoItem {
  description?: string
  imageUrl?: string
  languageCode?: string
  name?: string
}

export type VoucherRecord = Partial<MbTicketListResult> & {
  endUseTime?: number
  expireTime?: number
  languageInfo?: VoucherLanguageInfoItem[]
}

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

const VOUCHER_GAME_ID_MAP: Partial<Record<number, TicketGameId>> = {
  1: 'cash_voucher',
  2: 'lucky_red_envelope',
  3: 'golden_egg',
  4: 'lucky_spin',
  5: 'mystery_box',
  6: 'mystery_box'
}

const normalizeText = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) => normalizeText(value).toLowerCase()
const padTimeUnit = (value: number) => String(Math.max(0, Math.floor(value))).padStart(2, '0')

const isSameLanguageCode = (sourceLanguageCode: unknown, currentLanguageCode: string) => {
  const normalizedSourceLanguageCode = normalizeLanguageCode(sourceLanguageCode)

  if (!normalizedSourceLanguageCode) {
    return false
  }

  if (normalizedSourceLanguageCode === currentLanguageCode) {
    return true
  }

  if (currentLanguageCode === 'eng') {
    return normalizedSourceLanguageCode === 'en'
  }

  if (currentLanguageCode === 'zh') {
    return normalizedSourceLanguageCode === 'zh-cn' || normalizedSourceLanguageCode === 'zh_cn'
  }

  return normalizedSourceLanguageCode.startsWith(currentLanguageCode)
}

/** 兼records 数组或数组本身，统一转成列表。 */
const normalizeVoucherRecords = (result: unknown): VoucherRecord[] => {
  if (Array.isArray(result)) {
    return result as VoucherRecord[]
  }

  if (!result || typeof result !== 'object') {
    return []
  }

  const container = result as {
    records?: unknown
    list?: unknown
    data?: unknown
  }

  if (Array.isArray(container.records)) {
    return container.records as VoucherRecord[]
  }

  if (Array.isArray(container.list)) {
    return container.list as VoucherRecord[]
  }

  if (Array.isArray(container.data)) {
    return container.data as VoucherRecord[]
  }

  return [result as VoucherRecord]
}

/** 票券结束时间，优先使用 endUseTime，没有时回退到 expireTime。 */
const getVoucherEndUseTime = (record: VoucherRecord): number => {
  const endUseTime = Number(record.endUseTime)
  if (Number.isFinite(endUseTime) && endUseTime > 0) {
    return endUseTime
  }

  const expireTime = Number(record.expireTime)
  return Number.isFinite(expireTime) && expireTime > 0 ? expireTime : 0
}

/** 根据当前站点语言，从 languageInfo 中优先挑选匹配项。 */
const resolveLanguageInfo = (
  languageInfo: VoucherLanguageInfoItem[] | undefined,
  currentLanguageCode: string
) => {
  if (!Array.isArray(languageInfo) || languageInfo.length === 0) {
    return undefined
  }

  return (
    languageInfo.find(item => isSameLanguageCode(item.languageCode, currentLanguageCode)) ??
    languageInfo[0]
  )
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
        status: 1
      })

      if (!response.success) {
        throw new Error(response.message || t('common.requestError'))
      }

      voucherRecords.value = normalizeVoucherRecords(response.result)
    } catch (requestError) {
      error.value = requestError
    } finally {
      loading.value = false
    }
  }

  /** 根据票券类型打开票卷 */
  const handleUseNow = (item: VoucherItem) => {
    const gameId = VOUCHER_GAME_ID_MAP[item.type]

    if (!gameId) {
      return
    }

    if (gameId === 'lucky_spin') {
      openLuckySpin()
      return
    }

    openTicketActivity(gameId)
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
