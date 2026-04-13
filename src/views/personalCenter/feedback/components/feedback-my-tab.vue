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
            <div class="text-sm text-text-1">
              {{ t('personalCenter.feedback.myTab.rewardAmount') }}
            </div>
            <div class="text-[18px] font-[700] leading-[20px] text-text-1">9999.99</div>
          </div>
        </div>
        <button
          type="button"
          class="h-[36px] min-w-[114px] rounded-[12px] bg-theme-primary px-4 text-[16px] font-[700] text-text-4"
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

        <div class="text-[18px] font-[400] text-text-1">
          {{ t('personalCenter.feedback.myTab.ticketNoPrefix') }}{{ item.ticketNo }}
        </div>
        <div class="mt-2 line-clamp-2 text-[15px] leading-[22px] text-text-2">
          {{ item.content }}
        </div>

        <div class="mt-3 flex items-center justify-between">
          <span class="text-[36rpx] font-[400]" :class="statusClassMap[item.status]">
            {{ statusTextMap[item.status] }}
          </span>
          <div class="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-bg-3">
            <ArrowRightIcon class="h-3 w-3 text-text-2" />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import type { FeedbackStatus } from '../consts'
import type { FeedbackListItem } from '../types'
import { useI18n } from 'vue-i18n'

// 我的反馈模块：只负责列表渲染与点击事件派发。
defineProps<{
  feedbackRewardIcon: string
  isLoading: boolean
  feedbackList: FeedbackListItem[]
  statusTextMap: Record<FeedbackStatus, string>
  statusClassMap: Record<FeedbackStatus, string>
}>()

const emit = defineEmits<{
  claim: []
  'open-detail': [recordId: string]
}>()

const { t } = useI18n()
</script>
