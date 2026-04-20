import { getCurrentCurrency } from '@/utils/locale'
import QRCode from 'qrcode'
import { showToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
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
  const activePcTab = ref('referral')

  const qrCodeCanvas = ref<HTMLCanvasElement>()
  const showQrDialog = ref(false)
  const showShareSheet = ref(false)
  const showClaimPopup = ref(false)

  const estimatedCommission = '9,999.99'
  const referralLink = 'https://racewin.example.com/ref/AGENT888'
  const referralPhoneNumbers = [
    '67566778887',
    '67566771234',
    '67566775678',
    '67566772345',
    '67566778901',
    '67566774567',
    '67566773456',
    '67566779876',
    '67566775432',
    '67566776789',
    '67566777654',
    '67566770987',
    '67566771122',
    '67566773344',
    '67566775566',
    '67566777788',
    '67566779900',
    '67566772233',
    '67566774455',
    '67566776677',
    '67566778899'
  ]

  const referralMetrics = computed<ReferralMetric[]>(() => [
    {
      key: 'total',
      value: '100',
      label: t('referral.totalReferrals'),
      iconText: 'T'
    },
    {
      key: 'today',
      value: '26',
      label: t('referral.newReferralsToday'),
      iconText: 'N'
    },
    {
      key: 'yesterday',
      value: '18',
      label: t('referral.newReferralsYesterday'),
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
      await QRCode.toCanvas(qrCodeCanvas.value, referralLink, {
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
      await navigator.clipboard.writeText(referralLink)
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

  // 处理佣金领取点击。
  const handleClaimCommission = () => {
    showClaimPopup.value = true
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
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    generateQRCode()
  })

  return {
    showQrDialog,
    showShareSheet,
    showClaimPopup,
    estimatedCommission,
    claimCurrencySymbol,
    referralLink,
    referralPhoneNumbers,
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
