<template>
  <div>
    <!-- PC 端布局 -->
    <div class="hidden sm:block max-w-[1336px] mx-auto pt-[20px]">
      <!-- PC 内容区 -->
      <PcLayout
        :tabs="pcTabs"
        :estimated-commission="estimatedCommission"
        :referral-metrics="referralMetrics"
        :referral-link="referralLink"
        @tab-click="handlePcTabClick"
        @claim="handleClaimCommission"
        @open-qr="handleOpenQrDialog"
        @copy="copyReferralLink"
        @share="handleOpenShareSheet"
      />

      <!-- PC 公共底部 -->
      <CommonFooter class="mt-[40px]" />
    </div>

    <!-- H5 端布局 -->
    <section class="block sm:hidden fixed inset-0 overflow-y-auto bg-bg-1">
      <!-- 页面容器 -->
      <div class="min-h-screen bg-bg-1 -mx-[14px] sm:mx-auto sm:max-w-[420px]">
        <!-- 移动端导航栏 -->
        <H5Header
          :title="$t('referral.title')"
          :show-sort="true"
          :right-icon="infoIcon"
          @sort="handleCommissionRule"
        />

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
                    <!-- 佣金圆点 -->
                    <div
                      class="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-theme-primary text-[15px] font-[700] leading-none text-text-4"
                    >
                      $
                    </div>
                  </div>

                  <!-- 佣金文案 -->
                  <div class="min-w-0">
                    <!-- 佣金标题 -->
                    <p class="text-[12px] font-[400] leading-[15px] text-text-1">
                      {{ $t('referral.estimatedCommission') }}
                    </p>

                    <!-- 佣金金额 -->
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
                  <!-- 领取按钮文案 -->
                  <span class="text-[14px] font-[700] leading-[17px] text-text-4">
                    {{ $t('referral.claim') }}
                  </span>
                </button>
              </div>

              <!-- 佣金底部说明 -->
              <button
                type="button"
                class="flex w-full items-center justify-between gap-[12px] border-t border-opacity-5 px-[14px] py-[10px] text-left"
                @click="handleCommissionRecords"
              >
                <!-- 说明文案 -->
                <span class="text-[12px] font-[400] leading-[15px] text-text-1">
                  {{ $t('referral.claimHint') }}
                </span>

                <!-- 右侧箭头 -->
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
                @click="handleReferralRecords"
              >
                <!-- 统计说明文案 -->
                <span class="text-[12px] font-[400] leading-[15px] text-text-1">
                  {{ $t('referral.statisticsHint') }}
                </span>

                <!-- 右侧箭头 -->
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
                    :ref="el => setQrCodeCanvas(el as HTMLCanvasElement | null)"
                    class="h-[84px] w-[84px] rounded-[6px] bg-common-100 p-[4px]"
                  ></canvas>
                </div>

                <!-- 分享文案和按钮 -->
                <div class="flex min-w-0 flex-1 flex-col gap-[14px]">
                  <!-- 分享说明 -->
                  <p class="text-[12px] font-[400] leading-[15px] text-text-2">
                    {{ $t('referral.shareHint') }}
                  </p>

                  <!-- 查看二维码按钮 -->
                  <button
                    type="button"
                    class="inline-flex h-[35px] items-center justify-center rounded-[8px] bg-theme-primary px-[14px]"
                    @click="handleOpenQrDialog"
                  >
                    <!-- 按钮文案 -->
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
                    <!-- 复制图标 -->
                    <CopyIcon class="h-[14px] w-[14px]" />

                    <!-- 复制文案 -->
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
              <!-- 按钮文案 -->
              <span class="text-[14px] font-[700] leading-[17px] text-text-4">
                {{ $t('referral.shareToEarn') }}
              </span>
            </button>
          </section>
        </main>
      </div>
    </section>

    <!-- 二维码弹窗 -->
    <ReferralQrDialog v-model:visible="showQrDialog" :referral-link="referralLink" />

    <!-- 分享弹窗 -->
    <ReferralShareSheet
      v-model:visible="showShareSheet"
      :referral-link="referralLink"
      :phone-numbers="referralPhoneNumbers"
      :share-channels="shareChannels"
      :whatsapp-config="whatsappConfig"
      :sms-config="smsConfig"
    />

    <!-- 领取成功弹窗 -->
    <ClaimSuccessPopup
      v-model:visible="showClaimPopup"
      :amount="claimedCommission"
      :currency-symbol="claimCurrencySymbol"
      @confirm="handleConfirmClaimPopup"
    />
  </div>
</template>

<script setup lang="ts">
import ClaimSuccessPopup from '@/components/common/ClaimSuccessPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import CommonFooter from '@/components/commonFooter.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import CopyIcon from '@/static/svg/copy.svg?component'
import infoIcon from '@/static/svg/info.svg?component'
import ReferralQrDialog from './components/ReferralQrDialog.vue'
import ReferralShareSheet from './components/ReferralShareSheet.vue'
import PcLayout from './pc-layout.vue'
import { useReferralPage } from './useReferralPage'

const {
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
  handleConfirmClaimPopup,
  handleCommissionRule,
  handleCommissionRecords,
  handleReferralRecords,
  handlePcTabClick,
  handleOpenQrDialog,
  handleOpenShareSheet,
  setQrCodeCanvas
} = useReferralPage()
</script>
