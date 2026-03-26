<template>
  <!-- 代理页面 -->
  <section class="min-h-screen bg-bg-1 -mx-[14px] sm:mx-auto sm:max-w-[420px]">
    <!-- 页面容器 -->
    <div class="min-h-screen bg-bg-1" style="font-family: Inter, avertastd, sans-serif">
      <H5Header :title="$t('referral.title')" />

      <!-- 页面主体 -->
      <main class="px-[14px] pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[14px]">
        <!-- 卡片区域 -->
        <section class="flex flex-col gap-[10px]">
          <!-- 佣金卡片 -->
          <article class="overflow-hidden rounded-[10px] bg-bg-2">
            <!-- 佣金头部 -->
            <div class="flex items-center justify-between gap-[12px] px-[14px] py-[14px]">
              <!-- 佣金信息 -->
              <div class="flex min-w-0 items-center gap-[10px]">
                <!-- 佣金图标 -->
                <div
                  class="relative flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-secondary-3"
                >
                  <div
                    class="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-theme-primary text-[15px] font-[700] leading-none text-text-4"
                  >
                    $
                  </div>
                </div>

                <!-- 佣金文案 -->
                <div class="min-w-0">
                  <p class="text-[12px] font-[400] leading-[15px] text-text-1">
                    {{ $t('referral.estimatedCommission') }}
                  </p>
                  <p class="mt-[2px] text-[16px] font-[700] leading-[19px] text-text-1">
                    {{ estimatedCommission }}
                  </p>
                </div>
              </div>

              <!-- 领取按钮 -->
              <button
                type="button"
                class="inline-flex h-[35px] shrink-0 items-center justify-center rounded-[10px] bg-theme-primary px-[27px]"
                @click="handleClaimCommission"
              >
                <span class="text-[14px] font-[700] leading-[17px] text-text-4">
                  {{ $t('referral.claim') }}
                </span>
              </button>
            </div>

            <!-- 佣金底部说明 -->
            <button
              type="button"
              class="flex w-full items-center justify-between gap-[12px] border-t border-opacity-5 px-[14px] py-[10px] text-left"
              @click="handleCommissionRule"
            >
              <span class="text-[12px] font-[400] leading-[15px] text-text-1">
                {{ $t('referral.claimHint') }}
              </span>
              <span
                class="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] bg-opacity-10"
              >
                <ArrowRightIcon class="h-[8px] w-[8px]" />
              </span>
            </button>
          </article>

          <!-- 邀请统计卡片 -->
          <article class="overflow-hidden rounded-[10px] bg-bg-2">
            <!-- 统计网格 -->
            <div class="grid grid-cols-3 gap-[4px] px-[6px] py-[14px]">
              <!-- 统计项 -->
              <div
                v-for="metric in referralMetrics"
                :key="metric.key"
                class="flex min-w-0 flex-col items-center px-[8px]"
              >
                <!-- 统计值 -->
                <p class="text-center text-[16px] font-[700] leading-[19px] text-text-1">
                  {{ metric.value }}
                </p>

                <!-- 统计标题 -->
                <p class="mt-[5px] text-center text-[11px] font-[400] leading-[13px] text-text-3">
                  {{ metric.label }}
                </p>
              </div>
            </div>

            <!-- 统计底部说明 -->
            <button
              type="button"
              class="flex w-full items-center justify-between gap-[12px] border-t border-opacity-5 px-[14px] py-[10px] text-left"
              @click="handleStatisticsRule"
            >
              <span class="text-[12px] font-[400] leading-[15px] text-text-1">
                {{ $t('referral.statisticsHint') }}
              </span>
              <span
                class="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] bg-opacity-10"
              >
                <ArrowRightIcon class="h-[8px] w-[8px]" />
              </span>
            </button>
          </article>

          <!-- 邀请分享卡片 -->
          <article class="overflow-hidden rounded-[10px] bg-bg-2">
            <!-- 分享头部 -->
            <div class="flex items-center gap-[10px] px-[14px] py-[14px]">
              <!-- 二维码容器 -->
              <div
                class="flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-[8px] bg-opacity-5"
              >
                <!-- 二维码画布 -->
                <canvas
                  ref="qrCodeCanvas"
                  class="h-[84px] w-[84px] rounded-[6px] bg-common-100 p-[4px]"
                ></canvas>
              </div>

              <!-- 分享文案和按钮 -->
              <div class="flex min-w-0 flex-1 flex-col gap-[14px]">
                <!-- 分享说明 -->
                <p class="text-[12px] font-[400] leading-[15px] text-text-2">
                  {{ $t('referral.shareHint') }}
                </p>

                <!-- 分享按钮 -->
                <button
                  type="button"
                  class="inline-flex h-[35px] items-center justify-center rounded-[8px] bg-theme-primary px-[14px]"
                  @click="handleOpenQrDialog"
                >
                  <span class="text-[12px] font-[700] leading-[15px] text-text-4">
                    {{ $t('referral.viewQrCode') }}
                  </span>
                </button>
              </div>
            </div>

            <!-- 邀请链接区域 -->
            <div class="border-t border-opacity-5 px-[14px] py-[10px]">
              <!-- 邀请链接标题 -->
              <p class="text-[12px] font-[400] leading-[15px] text-text-1">
                {{ $t('referral.myReferralLink') }}
              </p>

              <!-- 邀请链接容器 -->
              <div
                class="mt-[8px] flex items-center gap-[8px] rounded-[8px] border border-opacity-10 bg-mask-20 px-[14px] py-[5px]"
              >
                <!-- 邀请链接文本 -->
                <p
                  class="min-w-0 flex-1 truncate text-[12px] font-[400] leading-[15px] text-text-1"
                >
                  {{ referralLink }}
                </p>

                <!-- 复制按钮 -->
                <button
                  type="button"
                  class="inline-flex h-[30px] shrink-0 items-center justify-center gap-[4px] rounded-[5px] bg-secondary-3 px-[10px]"
                  @click="copyReferralLink"
                >
                  <CopyIcon class="h-[14px] w-[14px]" />
                  <span class="text-[12px] font-[700] leading-[15px] text-theme-primary">
                    {{ $t('referral.copy') }}
                  </span>
                </button>
              </div>
            </div>
          </article>
        </section>

        <!-- 页面底部操作区 -->
        <section class="mt-[10px]">
          <!-- 立即邀请按钮 -->
          <button
            type="button"
            class="flex h-[40px] w-full items-center justify-center rounded-[8px] bg-theme-primary"
            @click="handleOpenShareSheet"
          >
            <span class="text-[14px] font-[700] leading-[17px] text-text-4">
              {{ $t('referral.shareToEarn') }}
            </span>
          </button>
        </section>
      </main>

      <!-- 二维码弹窗 -->
      <ReferralQrDialog v-model:visible="showQrDialog" :referral-link="referralLink" />

      <!-- 分享弹窗 -->
      <ReferralShareSheet
        v-model:visible="showShareSheet"
        :referral-link="referralLink"
        :phone-numbers="referralPhoneNumbers"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import H5Header from '@/components/common/H5Header.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import CopyIcon from '@/static/svg/copy.svg?component'
import QRCode from 'qrcode'
import { showToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ReferralQrDialog from './components/ReferralQrDialog.vue'
import ReferralShareSheet from './components/ReferralShareSheet.vue'

interface ReferralMetric {
  key: string
  value: string
  label: string
}

const { t } = useI18n()
const router = useRouter()

const qrCodeCanvas = ref<HTMLCanvasElement>()
const showQrDialog = ref(false)
const showShareSheet = ref(false)

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
    label: t('referral.totalReferrals')
  },
  {
    key: 'today',
    value: '26',
    label: t('referral.newReferralsToday')
  },
  {
    key: 'yesterday',
    value: '18',
    label: t('referral.newReferralsYesterday')
  }
])

// 生成代理邀请二维码。
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
  showToast({
    message: t('referral.claimPending'),
    type: 'success'
  })
}

// 处理佣金规则入口点击。
const handleCommissionRule = () => {
  router.push('/menu/referral/commission-methods')
}

// 处理统计说明入口点击。
const handleStatisticsRule = () => {
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

// 页面挂载后初始化滚动位置和二维码。
onMounted(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  generateQRCode()
})
</script>
