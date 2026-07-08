<template>
  <div :class="isPcMode ? 'flex w-[449px] flex-col items-end gap-3' : ''">
    <section class="rounded-[12px] bg-bg-2" :class="isPcMode ? 'h-[76px] w-[449px] p-3' : 'p-3.5'">
      <div
        class="flex items-center justify-between"
        :class="isPcMode ? 'h-[52px] w-[425px] gap-[74px]' : 'gap-2.5'"
      >
        <div class="flex items-center" :class="isPcMode ? 'mx-auto h-[52px] w-[174px] gap-3' : ''">
          <img
            :src="feedbackRewardIcon"
            :alt="t('personalCenter.feedback.myTab.rewardIconAlt')"
            :class="isPcMode ? 'h-[52px] w-[52px]' : 'h-[48px] w-[48px]'"
          />
          <div :class="isPcMode ? 'flex w-[110px] flex-col gap-[5px]' : 'ml-2.5'">
            <div
              class="font-[700] text-text-1"
              :class="isPcMode ? 'text-[14px] leading-[17px]' : 'text-sm'"
            >
              {{ t('personalCenter.feedback.myTab.rewardAmount') }}
            </div>
            <div
              class="font-[700] text-text-1"
              :class="isPcMode ? 'text-[20px] leading-[24px]' : 'text-[18px] leading-[20px]'"
            >
              {{ rewardAmount }}
            </div>
          </div>
        </div>
        <button
          type="button"
          :disabled="!canClaimReward || isClaimingReward"
          class="rounded-[12px] px-4 font-[700] text-text-4"
          :class="[
            isPcMode
              ? 'mx-auto h-[48px] w-[120px] text-[14px] leading-[17px]'
              : 'h-[36px] min-w-[114px] text-[16px]',
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
      class="rounded-[12px] bg-bg-2 p-3.5 text-center text-[14px] text-text-3"
      :class="isPcMode ? 'w-[449px]' : 'mt-3.5'"
    >
      {{ t('personalCenter.feedback.myTab.loading') }}
    </div>

    <div
      v-else-if="!feedbackList.length"
      class="rounded-[12px] bg-bg-2 p-3.5 text-center text-[14px] text-text-3"
      :class="isPcMode ? 'w-[449px]' : 'mt-3.5'"
    >
      {{ t('personalCenter.feedback.myTab.empty') }}
    </div>

    <template v-else>
      <section
        v-for="item in feedbackList"
        :key="item.recordId"
        class="relative cursor-pointer rounded-[12px] bg-bg-2"
        :class="isPcMode ? 'h-[144px] w-[449px] p-3 pb-0' : 'mt-3.5 p-3.5'"
        @click="emit('open-detail', item.recordId)"
      >
        <span
          v-if="item.showDot"
          class="absolute right-4 top-4 block h-[10px] w-[10px] rounded-full bg-theme-primary"
        ></span>

        <div
          class="text-text-1"
          :class="isPcMode ? 'h-[20px] text-[14px] leading-[20px]' : 'text-[18px] font-[400]'"
        >
          <span :class="isPcMode ? 'font-[400] text-text-2' : ''">
            {{ t('personalCenter.feedback.myTab.ticketNoPrefix') }}
          </span>
          <span :class="isPcMode ? 'font-[400]' : ''">{{ item.ticketNo }}</span>
        </div>
        <div
          class="mt-3"
          :class="
            isPcMode
              ? 'line-clamp-2 h-[40px] w-[424px] break-words text-[14px] font-[400] leading-[20px] text-text-3'
              : 'line-clamp-2 break-words text-[15px] leading-[22px] text-text-2'
          "
        >
          {{ item.content }}
        </div>

        <!-- 内容与状态的分割线 -->
        <div class="mt-3 h-px w-full bg-opacity-6"></div>

        <div class="flex items-center justify-between" :class="isPcMode ? 'h-[47px] py-3' : 'mt-3'">
          <span
            class="font-[400]"
            :class="[
              isPcMode ? 'text-[14px] leading-[20px]' : 'text-[36rpx]',
              statusClassMap[item.status]
            ]"
          >
            {{ statusTextMap[item.status] }}
          </span>
          <div
            class="flex items-center justify-center"
            :class="
              isPcMode
                ? 'h-6 w-6 rounded-[6px] bg-opacity-10'
                : 'h-[28px] w-[28px] rounded-[8px] bg-bg-3'
            "
          >
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
