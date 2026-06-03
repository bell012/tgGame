import Api from '@/api'
import { getLanguageCode } from '@/utils/locale'
import {
  fetchMbTicketListRecords,
  findMbTicketsByGameId,
  mapMbTicketListToFooter
} from '../../shared/mbTicketMapper'
import type { LuckySpinInfoResult, LuckySpinResult } from '../../shared/types'
import {
  closeTicketDialog,
  openTicketReminderDialog,
  openTicketResultDialog
} from '../../shell/ticketDialog'
import {
  closeTicketToast,
  getActiveTicketParams,
  globalTicketToastState
} from '../../shell/ticketToast'
import { globalShowToast } from '@/utils/toast'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const buildFallbackFooter = () => ({
  games: [] as LuckySpinInfoResult['voucherGames'],
  totalVouchers: 0
})

const fetchVoucherFooter = async () => {
  const languageCode = getLanguageCode()
  const cachedRecords = globalTicketToastState.mbTicketRecords

  if (cachedRecords.length > 0) {
    return mapMbTicketListToFooter(cachedRecords, languageCode)
  }

  try {
    const records = await fetchMbTicketListRecords(languageCode)
    globalTicketToastState.mbTicketRecords = records
    return mapMbTicketListToFooter(records, languageCode)
  } catch {
    // mbTicketList 失败不阻断活动页
  }

  return buildFallbackFooter()
}

const refreshTicketSessionAfterList = (
  records: Awaited<ReturnType<typeof fetchMbTicketListRecords>>
) => {
  globalTicketToastState.mbTicketRecords = records
  const matches = findMbTicketsByGameId(records, globalTicketToastState.gameId)

  if (matches.length > 0) {
    globalTicketToastState.activeTicketRecord = matches[0]!
  }
}

export interface LuckySpinWheelExpose {
  stopAt: (index: number) => void
  init: () => void
}

export const useLuckySpinGame = (
  wheelRef: Ref<LuckySpinWheelExpose | null>,
  visible: Ref<boolean>
) => {
  const { t } = useI18n()

  const isLoading = ref(false)
  const loadError = ref(false)
  const isSpinning = ref(false)
  const spinInfo = ref<LuckySpinInfoResult | null>(null)
  const activeGameIndex = ref(0)
  const pendingResult = ref<LuckySpinResult | null>(null)

  const syncActiveGameIndex = (info: LuckySpinInfoResult, gameId?: string) => {
    const targetId = gameId ?? 'lucky_spin'
    const index = info.voucherGames.findIndex(item => item.id === targetId)
    activeGameIndex.value = index >= 0 ? index : 0
  }

  const resetModalState = () => {
    isSpinning.value = false
    pendingResult.value = null
    loadError.value = false
    spinInfo.value = null
    closeTicketDialog()
    wheelRef.value?.init()
  }

  const loadSpinInfo = async () => {
    isLoading.value = true
    loadError.value = false

    try {
      const [spinResponse, footer] = await Promise.all([
        Api.activity.queryLuckySpinInfo(getActiveTicketParams()),
        fetchVoucherFooter()
      ])

      if (spinResponse.success && spinResponse.result) {
        spinInfo.value = {
          ...spinResponse.result,
          voucherGames: footer.games,
          totalVouchers: footer.totalVouchers
        }
        syncActiveGameIndex(spinInfo.value, globalTicketToastState.gameId)
        return
      }

      spinInfo.value = null
      loadError.value = true
    } catch {
      spinInfo.value = null
      loadError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const openResult = (result: LuckySpinResult) => {
    const { prize } = result

    if (prize.type === 'cash') {
      openTicketResultDialog({
        variant: 'cash',
        highlightText: prize.label
      })
      return
    }

    if (prize.type === 'spin_again') {
      openTicketResultDialog({
        variant: 'spin_again',
        highlightText: t('luckySpinPage.result.spinAgain')
      })
      return
    }

    if (prize.type === 'no_prize') {
      openTicketResultDialog({
        variant: 'no_prize',
        highlightText: t('luckySpinPage.result.noPrize')
      })
      return
    }

    if (prize.type === 'voucher') {
      const vouchers = result.vouchers ?? []
      openTicketResultDialog({
        variant: vouchers.length > 1 ? 'voucher_multi' : 'voucher_single',
        vouchers
      })
    }
  }

  const handleWheelGo = async () => {
    if (isSpinning.value) return

    if (!spinInfo.value?.remainingSpins) {
      openTicketReminderDialog({
        tasks: spinInfo.value?.tasks ?? [],
        rules: spinInfo.value?.rules ?? [],
        voucherName: t('luckySpinPage.title'),
        maxPrizeText: spinInfo.value?.maxPrizeText ?? ''
      })
      return
    }

    isSpinning.value = true

    try {
      const response = await Api.activity.doLuckySpin(getActiveTicketParams())
      if (!response.success || !response.result) {
        isSpinning.value = false
        wheelRef.value?.init()
        globalShowToast({
          message: t('luckySpinPage.loadFailed'),
          type: 'fail'
        })
        return
      }

      pendingResult.value = response.result
      wheelRef.value?.stopAt(response.result.prizeIndex)
    } catch {
      isSpinning.value = false
      wheelRef.value?.init()
      globalShowToast({
        message: t('luckySpinPage.loadFailed'),
        type: 'fail'
      })
    }
  }

  const handleSpinEnd = async () => {
    isSpinning.value = false
    if (pendingResult.value) {
      openResult(pendingResult.value)
      pendingResult.value = null
    }

    try {
      const languageCode = getLanguageCode()
      const [spinResponse, records] = await Promise.all([
        Api.activity.queryLuckySpinInfo(getActiveTicketParams()),
        fetchMbTicketListRecords(languageCode).catch(() => null)
      ])

      if (records) {
        refreshTicketSessionAfterList(records)
      }

      const footer =
        records != null
          ? mapMbTicketListToFooter(records, languageCode)
          : await fetchVoucherFooter()

      if (spinInfo.value) {
        spinInfo.value.voucherGames = footer.games
        spinInfo.value.totalVouchers = footer.totalVouchers
      }

      if (spinResponse.success && spinResponse.result && spinInfo.value) {
        spinInfo.value.remainingSpins = spinResponse.result.remainingSpins
      }
    } catch {
      // ignore refresh failure
    }
  }

  const handleGamePrev = () => {
    if (!spinInfo.value?.voucherGames.length) return
    activeGameIndex.value =
      (activeGameIndex.value - 1 + spinInfo.value.voucherGames.length) %
      spinInfo.value.voucherGames.length
  }

  const handleGameNext = () => {
    if (!spinInfo.value?.voucherGames.length) return
    activeGameIndex.value = (activeGameIndex.value + 1) % spinInfo.value.voucherGames.length
  }

  const handleClosePage = () => {
    if (isSpinning.value) return
    closeTicketToast()
  }

  watch(
    visible,
    nextVisible => {
      if (nextVisible) {
        void loadSpinInfo()
        return
      }
      resetModalState()
    },
    { immediate: false }
  )

  return {
    isLoading,
    loadError,
    isSpinning,
    spinInfo,
    activeGameIndex,
    loadSpinInfo,
    syncActiveGameIndex,
    handleWheelGo,
    handleSpinEnd,
    handleGamePrev,
    handleGameNext,
    handleClosePage
  }
}
