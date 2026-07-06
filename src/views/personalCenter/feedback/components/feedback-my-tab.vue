<template>
  <div>
    <section class="rounded-[12px] bg-bg-2 p-3.5">
      <div class="flex items-center justify-between gap-2.5">
        <div class="flex items-center">
          <img
            :src="feedbackRewardIcon"
            :alt="t('personalCenter.feedback.myTab.rewardIconAlt')"
            class="h-[48px] w-[48px]"
          />
          <div class="ml-2.5">
            <div class="text-[14px] font-[400] text-text-1">
              {{ t('personalCenter.feedback.myTab.rewardAmount') }}
            </div>
            <div class="text-[20px] font-[700] leading-[24px] text-text-1">{{ rewardAmount }}</div>
          </div>
        </div>
        <button
          type="button"
          :disabled="!canClaimReward || isClaimingReward"
          class="rounded-[12px] px-4 font-[700] text-text-4"
          :class="[
            isPcMode ? 'h-[48px] w-[120px] text-[20px]' : 'h-[36px] min-w-[114px] text-[16px]',
            canClaimReward && !isClaimingReward
              ? 'bg-theme-primary'
              : 'cursor-not-allowed bg-theme-2 opacity-40'
          ]"
          @click="emit('claim')"
        >
          {{ t('personalCenter.feedback.myTab.claim') }}
        </button>
      </div>
    </section>

    <div
      v-if="isLoading"
      class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5 text-center text-[14px] text-text-3"
    >
      {{ t('personalCenter.feedback.myTab.loading') }}
    </div>

    <div
      v-else-if="!feedbackList.length"
      class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5 text-center text-[14px] text-text-3"
    >
      {{ t('personalCenter.feedback.myTab.empty') }}
    </div>

    <template v-else>
      <section
        v-for="item in feedbackList"
        :key="item.recordId"
        class="relative mt-3.5 cursor-pointer rounded-[12px] bg-bg-2 p-3.5"
        @click="emit('open-detail', item.recordId)"
      >
        <span
          v-if="item.showDot"
          class="absolute right-4 top-4 block h-[10px] w-[10px] rounded-full bg-theme-primary"
        ></span>

        <div
          class="text-text-1"
          :class="isPcMode ? 'text-[14px] leading-[20px]' : 'text-[18px] font-[400]'"
        >
          <span :class="isPcMode ? 'font-[400]' : ''">
            {{ t('personalCenter.feedback.myTab.ticketNoPrefix') }}
          </span>
          <span :class="isPcMode ? 'font-[700]' : ''">{{ item.ticketNo }}</span>
        </div>
        <div
          class="mt-2"
          :class="
            isPcMode
              ? 'whitespace-pre-wrap break-words text-[14px] font-[400] leading-[20px] text-text-3'
              : 'whitespace-pre-wrap break-words   text-[15px] leading-[22px] text-text-2'
          "
        >
          {{ item.content }}
        </div>

        <!-- 内容与状态的分割线 -->
        <div class="mt-3 h-px w-full bg-opacity-10"></div>

        <div class="mt-3 flex items-center justify-between">
          <span
            class="font-[400]"
            :class="[
              isPcMode ? 'text-[14px] leading-[20px]' : 'text-[36rpx]',
              statusClassMap[item.status]
            ]"
          >
            {{ statusTextMap[item.status] }}
          </span>
          <div class="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-bg-3">
            <ArrowRightIcon class="h-4 w-4 text-text-2" />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import { useI18n } from 'vue-i18n'
import type { FeedbackStatus } from '../consts'
import type { FeedbackListItem } from '../types'

// 我的反馈模块：只负责列表渲染与点击事件派发。
defineProps<{
  isPcMode?: boolean
  feedbackRewardIcon: string
  isLoading: boolean
  feedbackList: FeedbackListItem[]
  rewardAmount: string
  canClaimReward: boolean
  isClaimingReward: boolean
  statusTextMap: Record<FeedbackStatus, string>
  statusClassMap: Record<FeedbackStatus, string>
}>()

const emit = defineEmits<{
  claim: []
  'open-detail': [recordId: string]
}>()

const { t } = useI18n()
</script>
