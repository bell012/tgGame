import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency } from '@/utils/locale'
import QRCode from 'qrcode'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'

export interface ReferralMetric {
  key: string
  value: string
  label: string
  iconText: string
}

export interface ReferralTab {
  key: string
  label: string
  active: boolean
}

export const useReferralPage = () => {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { userInfo, acctInfo } = storeToRefs(userStore)
  const isMobile = useIsMobile()
  const activePcTab = ref('referral')

  const qrCodeCanvas = ref<HTMLCanvasElement>()
  const showQrDialog = ref(false)
  const showShareSheet = ref(false)
  const showClaimPopup = ref(false)
  const isClaimingCommission = ref(false)

  const estimatedCommission = ref('0.00')
  const claimedCommission = ref('0.00')
  const invitationStats = ref<any>({})
  const referralPhoneNumbers = ref<string[]>([])
  const shareChannels = ref<any[]>([])
  const whatsappConfig = ref<any>(null)
  const smsConfig = ref<any>(null)

  const agentChannelId = computed(() => (isMobile.value ? '4' : '3'))

  const currentMemberId = computed(() =>
    String(userInfo.value?.memberId || acctInfo.value?.memberId || '').trim()
  )

  const referralLink = computed(() => {
    if (typeof window === 'undefined') {
      return currentMemberId.value ? `/h5?id=${encodeURIComponent(currentMemberId.value)}` : '/h5'
    }

    const baseUrl = `${window.location.origin}/h5`
    if (!currentMemberId.value) {
      return baseUrl
    }

    return `${baseUrl}?id=${encodeURIComponent(currentMemberId.value)}`
  })

  const toNumber = (value: unknown) => {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) ? numericValue : 0
  }

  const formatAmount = (value: unknown) => toNumber(value).toFixed(2)

  const referralMetrics = computed<ReferralMetric[]>(() => [
    {
      key: 'total',
      value: String(toNumber(invitationStats.value?.teamNum)),
      label: t('referral.totalReferrals'),
      iconText: 'T'
    },
    {
      key: 'week',
      value: String(toNumber(invitationStats.value?.newTeamNum)),
      label: t('referral.newReferralsThisWeek'),
      iconText: 'N'
    },
    {
      key: 'lastWeek',
      value: String(toNumber(invitationStats.value?.lastNewTeamNum)),
      label: t('referral.newReferralsLastWeek'),
      iconText: 'Y'
    }
  ])

  const pcTabs = computed<ReferralTab[]>(() => [
    {
      key: 'referral',
      label: t('referral.pcTabs.referral'),
      active: activePcTab.value === 'referral'
    },

    {
      key: 'commission-records',
      label: t('referral.pcTabs.commissionRecords'),
      active: activePcTab.value === 'commission-records'
    },
    {
      key: 'referral-records',
      label: t('referral.pcTabs.referralRecords'),
      active: activePcTab.value === 'referral-records'
    },
    {
      key: 'commission-rules',
      label: t('referral.pcTabs.commissionRules'),
      active: activePcTab.value === 'commission-rules'
    }
  ])

  // 解析当前佣金弹窗的币种。
  const claimCurrencySymbol = computed(() => getCurrentCurrency())

  // 生成移动端代理邀请二维码。
  const generateQRCode = async () => {
    if (!qrCodeCanvas.value) return

    try {
      await QRCode.toCanvas(qrCodeCanvas.value, referralLink.value, {
        width: 84,
        margin: 0,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  // 复制代理邀请链接。
  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink.value)
      showToast({
        message: t('referral.copySuccess'),
        type: 'success'
      })
    } catch (error) {
      console.error(error)
      showToast({
        message: t('referral.copyFailed'),
        type: 'fail'
      })
    }
  }

  const loadEstimatedCommission = async () => {
    const response = await Api.agent.queryEstimatedCommission({
      channelId: agentChannelId.value
    })

    estimatedCommission.value = formatAmount(response?.result)
  }

  const loadInvitationStats = async () => {
    const response = await Api.agent.queryInvitationStats({
      channelId: agentChannelId.value
    })

    invitationStats.value = response?.result || {}
  }

  const loadShareChannels = async () => {
    const response = await Api.agent.queryShareChannels(
      { openStatus: 1 },
      {
        channelId: agentChannelId.value
      }
    )

    shareChannels.value = Array.isArray(response?.result) ? response.result : []
  }

  const loadNumberPool = async () => {
    const response = await Api.agent.queryNumberPool({
      channelId: agentChannelId.value
    })
    const result = response?.result || {}

    referralPhoneNumbers.value = Array.isArray(result.numList) ? result.numList.map(String) : []
    whatsappConfig.value = result.whatsappConfig || null
    smsConfig.value = result.smsConfig || null
  }

  const refreshReferralOverview = async () => {
    await Promise.allSettled([
      loadEstimatedCommission(),
      loadInvitationStats(),
      loadShareChannels(),
      loadNumberPool()
    ])
  }

  // 处理佣金领取点击。
  const handleClaimCommission = async () => {
    if (isClaimingCommission.value) return

    isClaimingCommission.value = true

    try {
      const response = await Api.agent.claimCommission({
        channelId: agentChannelId.value
      })
      const amount = toNumber(response?.result)

      if (amount <= 0) {
        showToast({
          message: t('referral.noClaimableCommission'),
          type: 'fail'
        })
        return
      }

      claimedCommission.value = formatAmount(amount)
      showClaimPopup.value = true
      await Promise.allSettled([loadEstimatedCommission(), loadInvitationStats()])
    } catch (error) {
      console.error(error)
    } finally {
      isClaimingCommission.value = false
    }
  }

  // 处理佣金规则入口点击。
  const handleCommissionRule = () => {
    navigateTo('/menu/referral/commission-rules')
  }

  // 处理佣金获取方式入口点击。
  const handleCommissionRecords = () => {
    navigateTo('/menu/referral/commission-records')
  }

  // 处理推荐记录入口点击。
  const handleReferralRecords = () => {
    navigateTo('/menu/referral/referral-records')
  }

  // 处理 PC 端 tab 点击。
  const handlePcTabClick = (tabKey: string) => {
    if (tabKey === 'referral' || tabKey === 'commission-records' || tabKey === 'referral-records') {
      activePcTab.value = tabKey
      return
    }

    showToast({
      message: t('referral.comingSoon'),
      type: 'success'
    })
  }

  // 打开二维码弹窗。
  const handleOpenQrDialog = () => {
    showQrDialog.value = true
  }

  // 打开分享弹窗。
  const handleOpenShareSheet = () => {
    showShareSheet.value = true
  }

  // 关闭领取弹窗。
  const handleCloseClaimPopup = () => {
    showClaimPopup.value = false
  }

  // 确认领取弹窗。
  const handleConfirmClaimPopup = () => {
    showClaimPopup.value = false
  }

  // 设置移动端二维码画布引用。
  const setQrCodeCanvas = (canvas: HTMLCanvasElement | null) => {
    qrCodeCanvas.value = canvas ?? undefined
  }

  // 页面挂载后初始化滚动位置和二维码。
  onMounted(() => {
    userStore.syncStoredUserData()
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    generateQRCode()
    void refreshReferralOverview()
  })

  watch(referralLink, () => {
    generateQRCode()
  })

  return {
    showQrDialog,
    showShareSheet,
    showClaimPopup,
    estimatedCommission,
    claimedCommission,
    claimCurrencySymbol,
    referralLink,
    referralPhoneNumbers,
    shareChannels,
    whatsappConfig,
    smsConfig,
    referralMetrics,
    pcTabs,
    copyReferralLink,
    handleClaimCommission,
    handleCloseClaimPopup,
    handleConfirmClaimPopup,
    handleCommissionRule,
    handleCommissionRecords,
    handleReferralRecords,
    handlePcTabClick,
    handleOpenQrDialog,
    handleOpenShareSheet,
    setQrCodeCanvas
  }
}
