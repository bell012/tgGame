<template>
  <div class="fixed inset-0 overflow-y-auto bg-bg-1">
    <H5Header title="记录详情" />

    <div class="px-3.5 pb-6 pt-3">
      <section class="rounded-[12px] bg-bg-2 p-3.5">
        <div class="feedback-detail-row">
          <span>反馈编号</span>
          <span class="text-text-1">{{ feedbackDetail.ticketNo }}</span>
        </div>

        <div class="feedback-detail-row mt-2.5">
          <span>处理状态</span>
          <span class="font-[700]" :class="statusClassMap[feedbackDetail.status]">
            {{ statusTextMap[feedbackDetail.status] }}
          </span>
        </div>

        <div class="feedback-detail-row mt-2.5">
          <span>提交时间</span>
          <span class="text-text-1">{{ feedbackDetail.submitTime }}</span>
        </div>

        <div class="feedback-detail-row mt-2.5">
          <span>反馈类型</span>
          <span class="text-text-1">{{ feedbackDetail.feedbackType }}</span>
        </div>

        <div class="mt-2.5 text-[15px] text-text-2">反馈内容</div>
        <div class="mt-2 rounded-[8px] bg-bg-3 px-3 py-2.5 text-[15px] leading-[20px] text-text-2">
          {{ feedbackDetail.detailContent }}
        </div>

        <div class="mt-2.5 grid grid-cols-4 gap-2">
          <button
            v-for="(image, index) in feedbackDetail.screenshotImages"
            :key="`${feedbackDetail.recordId}-screenshot-${index}`"
            type="button"
            class="feedback-screenshot-item overflow-hidden rounded-[8px] bg-bg-3"
            @click="openScreenshotPreview(index)"
          >
            <img :src="image" :alt="`截图${index + 1}`" class="h-full w-full object-cover" />
          </button>
        </div>

        <p class="mt-3 text-[15px] leading-[20px] text-text-2">{{ feedbackDetail.resultHint }}</p>
      </section>

      <section
        v-if="feedbackDetail.status !== 'pending'"
        class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="text-[16px] font-[700] text-theme-primary">{{
            feedbackDetail.replyTeam
          }}</span>
          <span class="shrink-0 text-[12px] text-text-3">{{ feedbackDetail.replyTime }}</span>
        </div>

        <p
          v-for="(paragraph, index) in feedbackDetail.replyContent"
          :key="`${feedbackDetail.recordId}-${index}`"
          class="mt-3 text-[15px] leading-[22px] text-text-1"
        >
          {{ paragraph }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import H5Header from '@/components/common/H5Header.vue'
import {
  feedbackMockRecords,
  feedbackStatusClassMap,
  feedbackStatusTextMap
} from '@/views/personalCenter/feedback/mock'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { showImagePreview } from 'vant'

const route = useRoute()

const feedbackDetail = computed(() => {
  const recordId = String(route.params.recordId ?? '')
  return feedbackMockRecords.find(item => item.recordId === recordId) ?? feedbackMockRecords[0]
})

const statusTextMap = feedbackStatusTextMap
const statusClassMap = feedbackStatusClassMap

const openScreenshotPreview = (startPosition: number) => {
  const screenshotImages = feedbackDetail.value.screenshotImages
  if (!screenshotImages.length) {
    return
  }

  showImagePreview({
    images: screenshotImages,
    startPosition,
    closeable: true,
    showIndex: false,
    closeOnPopstate: true
  })
}
</script>

<style scoped>
.feedback-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
  color: var(--color-text-level-3);
}

.feedback-screenshot-item {
  width: 100%;
  aspect-ratio: 1 / 1;
}
</style>
