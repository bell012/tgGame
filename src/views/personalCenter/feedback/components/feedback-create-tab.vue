<template>
  <div>
    <section class="rounded-[12px] bg-bg-2 p-3.5">
      <div class="flex items-center text-sm">
        <span class="font-[700] text-text-1">{{
          t('personalCenter.feedback.createTab.sectionTitle')
        }}</span>
        <span class="ml-1 text-xs text-text-3">
          ({{ t('personalCenter.feedback.createTab.requiredType') }})
        </span>
      </div>

      <div class="mt-3 rounded-[10px] bg-bg-4 p-2.5">
        <button
          v-for="item in feedbackTypeOptions"
          :key="item.value"
          type="button"
          class="mb-2 flex h-[42px] w-full items-center justify-between rounded-[8px] px-3 text-left last:mb-0"
          :class="[
            isPcMode ? 'text-sm font-bold' : 'text-[16px]',
            selectedTypeModel === item.value
              ? 'bg-theme-3 text-text-1'
              : 'bg-transparent text-text-1'
          ]"
          @click="selectedTypeModel = item.value"
        >
          <span>{{ item.label }}</span>
          <img
            :src="
              selectedTypeModel === item.value
                ? feedbackRadioCheckedIcon
                : feedbackRadioUncheckedIcon
            "
            alt=""
            class="h-6 w-6 shrink-0"
          />
        </button>
      </div>

      <textarea
        v-model.trim="feedbackContentModel"
        maxlength="500"
        :placeholder="placeholderText"
        class="mt-3 h-[112px] w-full resize-none rounded-[10px] bg-bg-4 px-3 py-2.5 text-[16px] leading-[22px] text-text-1 outline-none placeholder:text-text-3"
      ></textarea>

      <div class="mt-3">
        <div class="text-sm font-[700] text-text-1">
          {{ t('personalCenter.feedback.createTab.uploadPhotos') }}
          <span class="ml-1 text-xs font-[500] text-text-3">
            ({{ feedbackUploadCount }}/{{ feedbackUploadMaxCount }})
          </span>
        </div>

        <Uploader
          v-model="feedbackFileListModel"
          class="mt-2.5"
          :max-count="feedbackUploadMaxCount"
          :multiple="true"
          accept="image/jpeg,image/png,image/webp"
          :preview-full-image="true"
          :preview-size="88"
          :after-read="afterRead"
          :before-delete="beforeDelete"
          :preview-options="{
            closeable: true,
            className: 'feedback-upload-image-preview',
            overlayClass: 'feedback-upload-image-preview-overlay'
          }"
        >
          <template #preview-delete>
            <div
              class="absolute -right-1.5 -top-1.5 h-4 w-4 overflow-hidden rounded-full sm:h-5 sm:w-5"
            >
              <img :src="deleteIcon" :alt="t('common.delete')" class="h-full w-full" />
            </div>
          </template>
          <div
            class="feedback-upload-trigger relative flex h-[88px] w-[88px] items-center justify-center rounded-[10px] bg-bg-2"
          >
            <svg
              class="pointer-events-none absolute inset-0 h-full w-full text-text-2"
              viewBox="0 0 88 88"
              aria-hidden="true"
            >
              <rect
                x="0.5"
                y="0.5"
                width="87"
                height="87"
                rx="10"
                fill="none"
                stroke="currentColor"
                stroke-dasharray="4 4"
              />
            </svg>
            <UploadPhotoIcon class="feedback-upload-photo-icon" aria-hidden="true" />
          </div>
        </Uploader>
      </div>

      <button
        type="button"
        class="mt-6 h-[46px] w-full rounded-[10px] text-base font-[700] text-text-4"
        :class="
          canSubmitFeedback && !isSubmittingFeedback
            ? 'bg-theme-primary'
            : 'cursor-not-allowed bg-theme-2'
        "
        :disabled="!canSubmitFeedback || isSubmittingFeedback"
        @click="onSubmit"
      >
        {{ t('personalCenter.feedback.createTab.submitFeedback') }}
      </button>
    </section>

    <section class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5">
      <div class="text-[15px] font-[700] text-text-1">
        {{ t('personalCenter.feedback.createTab.rewardRulesTitle') }}
      </div>
      <div class="mt-2 text-sm leading-[22px] text-text-3">
        {{ t('personalCenter.feedback.createTab.rewardRulesDescription') }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import feedbackRadioCheckedIcon from '@/static/img/feedback/radio-checked.png'
import feedbackRadioUncheckedIcon from '@/static/img/feedback/radio-unchecked.png'
import UploadPhotoIcon from '@/static/svg/feedback/upload-photo.svg?component'
import { Uploader, type UploaderAfterRead, type UploaderFileListItem } from 'vant'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FeedbackTypeOption } from '../types'

// 创建反馈模块：只负责表单 UI 渲染，接口请求由父组件处理。
const selectedTypeModel = defineModel<string>('selectedType', { required: true })
const feedbackContentModel = defineModel<string>('feedbackContent', { required: true })
const feedbackFileListModel = defineModel<UploaderFileListItem[]>('feedbackFileList', {
  required: true
})

defineProps<{
  isPcMode?: boolean
  feedbackTypeOptions: FeedbackTypeOption[]
  placeholderText: string
  feedbackUploadCount: number
  feedbackUploadMaxCount: number
  isSubmittingFeedback: boolean
  deleteIcon: string
  afterRead: UploaderAfterRead
  beforeDelete: (_file: UploaderFileListItem, detail: { index: number }) => boolean
  onSubmit: () => void
}>()

const { t } = useI18n()

const canSubmitFeedback = computed(() => {
  return (
    Boolean(String(selectedTypeModel.value ?? '').trim()) &&
    Boolean(String(feedbackContentModel.value ?? '').trim())
  )
})
</script>

<style scoped>
.feedback-upload-photo-icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-level-3);
}

.feedback-upload-photo-icon :deep(path) {
  fill: currentColor;
}

:global(.feedback-upload-image-preview),
:global(.feedback-upload-image-preview-overlay) {
  z-index: 100100 !important;
}
</style>
