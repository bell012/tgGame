<template>
  <!-- PC 页面主体 -->
  <section class="flex flex-col gap-6">
    <!-- 顶部区域 -->
    <section class="flex flex-col gap-4">
      <!-- 页面标题 -->
      <h2 class="flex h-6 items-center text-[20px] font-[700] leading-6 text-text-1 capitalize">
        Referral
      </h2>

      <!-- 顶部标签栏 -->
      <nav class="grid h-10 grid-cols-4 rounded-lg bg-bg-2">
        <!-- 标签按钮 -->
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="rounded-lg text-sm font-[700] leading-[17px] transition-colors"
          :class="tab.active ? 'bg-bg-3 text-text-1' : 'text-text-2 hover:text-text-1'"
          @click="handleTabClick(tab.key)"
        >
          {{ tab.label }}
        </button>
      </nav>
    </section>

    <!-- 内容区域 -->
    <section class="flex flex-col gap-4">
      <!-- 佣金模块 -->
      <section class="flex flex-col gap-4">
        <!-- 佣金标题行 -->
        <div class="flex items-center gap-2">
          <!-- 佣金标题 -->
          <p class="text-base font-[700] leading-[19px] text-text-1">
            {{ $t('referral.myCommission') }}
          </p>

          <!-- 佣金提示 -->
          <p class="text-xs font-[400] leading-[15px] text-text-2">
            {{ `(${$t('referral.claimHint')})` }}
          </p>
        </div>

        <!-- 佣金卡片 -->
        <article class="relative h-[180px] overflow-hidden rounded-2xl bg-bg-2">
          <!-- 右上角分享按钮 -->
          <button
            type="button"
            class="absolute right-0 top-0 h-10 w-[180px] rounded-[0px_16px] bg-theme-primary"
            @click="handleShare"
          >
            <!-- 按钮内容 -->
            <span
              class="absolute left-1/2 top-1/2 flex h-[19px] w-[128px] -translate-x-1/2 -translate-y-1/2 items-center gap-1"
            >
              <!-- 按钮文案 -->
              <span
                class="flex h-[19px] w-[108px] items-center justify-center text-center text-base font-[700] leading-[19px] text-text-4"
              >
                {{ $t('referral.shareToEarn') }}
              </span>

              <!-- 方向图标 -->
              <DirectionIcon class="h-4 w-4" aria-hidden="true" />
            </span>
          </button>

          <!-- 佣金内容容器 -->
          <div class="absolute left-10 top-6 flex flex-col gap-9">
            <!-- 佣金信息行 -->
            <div class="flex items-center gap-4">
              <!-- 佣金标题组 -->
              <div class="flex items-center gap-2">
                <!-- 佣金图标 -->
                <div
                  class="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-3 text-xs font-[700] text-theme-primary"
                >
                  $
                </div>

                <!-- 佣金标题文本 -->
                <p class="text-base font-[700] leading-[19px] text-text-1">
                  {{ `${$t('referral.estimatedCommission')} :` }}
                </p>
              </div>

              <!-- 佣金金额 -->
              <p class="text-[40px] font-[700] leading-[48px] text-theme-primary">
                {{ estimatedCommission }}
              </p>
            </div>

            <!-- 领取按钮 -->
            <button
              type="button"
              class="relative z-10 inline-flex h-10 w-40 items-center justify-center rounded-lg bg-theme-primary"
              @click="handleClaim"
            >
              <!-- 领取文案 -->
              <span class="text-sm font-[700] leading-[17px] text-text-4">
                {{ $t('referral.claim') }}
              </span>
            </button>
          </div>

          <!-- 佣金装饰图 -->
          <img
            :src="commissionHero"
            alt=""
            class="pointer-events-none absolute bottom-0 right-[100px] h-[156px] w-[309px] object-contain"
          />
        </article>
      </section>

      <!-- 数据概览模块 -->
      <section class="flex flex-col gap-4">
        <!-- 数据标题行 -->
        <div class="flex items-center gap-2">
          <!-- 数据标题 -->
          <p class="text-base font-[700] leading-[19px] text-text-1">
            {{ $t('referral.dataOverview') }}
          </p>

          <!-- 数据提示 -->
          <p class="text-xs font-[400] leading-[15px] text-text-2">
            {{ `(${$t('referral.statisticsHint')})` }}
          </p>
        </div>

        <!-- 数据卡片网格 -->
        <section class="grid grid-cols-3 gap-5">
          <!-- 数据卡片 -->
          <article
            v-for="metric in referralMetrics"
            :key="metric.key"
            class="h-[104px] rounded-2xl bg-bg-2"
          >
            <!-- 数据卡片内容 -->
            <div class="flex h-full flex-col items-center justify-center gap-2 text-center">
              <!-- 数据值 -->
              <p class="text-2xl font-[700] leading-[29px] text-theme-primary">
                {{ metric.value }}
              </p>

              <!-- 数据标题 -->
              <p class="text-base font-[400] leading-[19px] text-text-1">
                {{ metric.label }}
              </p>
            </div>
          </article>
        </section>
      </section>

      <!-- 分享卡片 -->
      <article class="rounded-[30px] bg-bg-2 p-6">
        <!-- 分享卡片主体 -->
        <div class="flex items-center justify-between gap-6">
          <!-- 二维码区域 -->
          <div
            class="flex h-[200px] w-[200px] items-center justify-center rounded-2xl bg-opacity-5"
          >
            <!-- 二维码画布 -->
            <canvas
              ref="pcQrCodeCanvas"
              class="h-[162px] w-[162px] rounded-xl bg-common-100 p-1"
            ></canvas>
          </div>

          <!-- 右侧分享内容 -->
          <div class="flex flex-1 flex-col gap-6">
            <!-- 分享说明区 -->
            <div class="flex flex-col gap-3">
              <!-- 分享说明文本 -->
              <p class="text-base font-[400] leading-[19px] text-text-1">
                {{ $t('referral.shareHint') }}
              </p>

              <!-- 查看二维码按钮 -->
              <button
                type="button"
                class="inline-flex h-10 w-40 items-center justify-center rounded-lg bg-theme-primary"
                @click="handleOpenQr"
              >
                <!-- 查看二维码文案 -->
                <span class="text-sm font-[700] leading-[17px] text-text-4">
                  {{ $t('referral.viewQrCode') }}
                </span>
              </button>
            </div>

            <!-- 邀请链接区 -->
            <div class="flex flex-col gap-3">
              <!-- 邀请链接标题 -->
              <p class="text-sm font-[700] leading-[17px] text-text-1">
                {{ $t('referral.myReferralLink') }}
              </p>

              <!-- 邀请链接容器 -->
              <div
                class="flex h-12 items-center justify-between gap-4 rounded-lg border border-opacity-10 bg-mask-20 px-4"
              >
                <!-- 邀请链接文本 -->
                <p class="min-w-0 flex-1 truncate text-sm font-[700] leading-[17px] text-text-1">
                  {{ referralLink }}
                </p>

                <!-- 复制按钮 -->
                <button
                  type="button"
                  class="inline-flex h-8 w-20 items-center justify-center rounded-lg bg-secondary-3"
                  @click="handleCopy"
                >
                  <!-- 复制文案 -->
                  <span class="text-xs font-[700] leading-[15px] text-theme-primary">
                    {{ $t('referral.copy') }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import commissionHero from '@/static/img/referral/referral-commission-hero.png'
import DirectionIcon from '@/static/svg/direction-right.svg?component'
import QRCode from 'qrcode'
import { onMounted, ref, watch } from 'vue'
import type { ReferralMetric, ReferralTab } from './useReferralPage'

interface Props {
  tabs: ReferralTab[]
  estimatedCommission: string
  referralMetrics: ReferralMetric[]
  referralLink: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'tab-click': [tabKey: string]
  claim: []
  'open-qr': []
  copy: []
  share: []
}>()

const pcQrCodeCanvas = ref<HTMLCanvasElement>()

// 生成 PC 端代理邀请二维码。
const generatePcQRCode = async () => {
  if (!pcQrCodeCanvas.value) return

  try {
    await QRCode.toCanvas(pcQrCodeCanvas.value, props.referralLink, {
      width: 162,
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

// 处理标签点击。
const handleTabClick = (tabKey: string) => {
  emit('tab-click', tabKey)
}

// 处理领取按钮点击。
const handleClaim = () => {
  emit('claim')
}

// 处理查看二维码点击。
const handleOpenQr = () => {
  emit('open-qr')
}

// 处理复制按钮点击。
const handleCopy = () => {
  emit('copy')
}

// 处理分享按钮点击。
const handleShare = () => {
  emit('share')
}

// 监听链接变化后刷新 PC 二维码。
watch(
  () => props.referralLink,
  () => {
    generatePcQRCode()
  }
)

// 页面挂载后初始化 PC 二维码。
onMounted(() => {
  generatePcQRCode()
})
</script>
