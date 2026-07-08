<template>
  <div>
    <section class="rounded-[12px] bg-bg-2" :class="isPcMode ? 'w-[448px] px-3 py-3' : 'p-3.5'">
      <div class="flex items-end" :class="isPcMode ? 'h-[17px]' : 'text-sm'">
        <span
          class="font-[700] text-text-1"
          :class="isPcMode ? 'text-[14px] leading-[17px]' : ''"
          >{{ t('personalCenter.feedback.createTab.sectionTitle') }}</span
        >
        <span class="ml-1 text-xs font-[400] leading-[15px] text-text-3">
          ({{ t('personalCenter.feedback.createTab.requiredType') }})
        </span>
      </div>

      <div
        class="rounded-[8px] bg-bg-4"
        :class="isPcMode ? 'mt-4 h-[144px] w-[424px] p-3' : 'mt-3 rounded-[10px] p-2.5'"
      >
        <button
          v-for="item in feedbackTypeOptions"
          :key="item.value"
          type="button"
          class="flex w-full items-center justify-between rounded-[8px] px-3 text-left last:mb-0"
          :class="[
            isPcMode
              ? 'mb-0 h-[40px] text-[14px] font-[700] leading-[17px]'
              : 'mb-2 h-[42px] text-[16px]',
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
            class="shrink-0"
            :class="isPcMode ? 'h-4 w-4' : 'h-6 w-6'"
          />
        </button>
      </div>

      <textarea
        v-model.trim="feedbackContentModel"
        maxlength="500"
        :placeholder="placeholderText"
        class="resize-none rounded-[8px] bg-bg-4 px-3 py-2.5 text-text-1 outline-none placeholder:text-text-3"
        :class="
          isPcMode
            ? 'mt-4 h-[104px] w-[424px] text-[14px] leading-[20px]'
            : 'mt-3 h-[112px] w-full rounded-[10px] text-[16px] leading-[22px]'
        "
      ></textarea>

      <div :class="isPcMode ? 'mt-4 w-[424px]' : 'mt-3'">
        <div
          class="font-[700] text-text-1"
          :class="isPcMode ? 'text-[14px] leading-[17px]' : 'text-sm'"
        >
          {{ t('personalCenter.feedback.createTab.uploadPhotos') }}
          <span class="ml-1 text-xs text-text-3" :class="isPcMode ? 'font-[400]' : 'font-[500]'">
            ({{ feedbackUploadCount }}/{{ feedbackUploadMaxCount }})
          </span>
        </div>

        <Uploader
          v-model="feedbackFileListModel"
          :class="isPcMode ? 'mt-4' : 'mt-2.5'"
          :max-count="feedbackUploadMaxCount"
          :multiple="true"
          accept="image/jpeg,image/png,image/webp"
          :preview-full-image="true"
          :preview-size="isPcMode ? 100 : 88"
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
            class="feedback-upload-trigger relative flex items-center justify-center bg-bg-2"
            :class="
              isPcMode ? 'h-[100px] w-[100px] rounded-[8px]' : 'h-[88px] w-[88px] rounded-[10px]'
            "
          >
            <svg
              class="pointer-events-none absolute inset-0 h-full w-full text-text-2"
              :viewBox="isPcMode ? '0 0 100 100' : '0 0 88 88'"
              aria-hidden="true"
            >
              <rect
                x="0.5"
                y="0.5"
                :width="isPcMode ? 99 : 87"
                :height="isPcMode ? 99 : 87"
                :rx="isPcMode ? 8 : 10"
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
        class="font-[700] text-text-4"
        :class="[
          isPcMode
            ? 'mt-4 h-[48px] w-[424px] rounded-[8px] text-[14px] leading-[17px]'
            : 'mt-6 h-[46px] w-full rounded-[10px] text-base',
          canSubmitFeedback && !isSubmittingFeedback
            ? 'bg-theme-primary'
            : 'cursor-not-allowed bg-theme-2'
        ]"
        :disabled="!canSubmitFeedback || isSubmittingFeedback"
        @click="onSubmit"
      >
        {{ t('personalCenter.feedback.createTab.submitFeedback') }}
      </button>
    </section>

    <section
      class="my-4 rounded-[12px] bg-bg-2"
      :class="isPcMode ? 'w-[448px] p-3' : 'mt-3.5 p-3.5'"
    >
      <div
        class="font-[700] text-text-1"
        :class="isPcMode ? 'text-[14px] leading-[17px]' : 'text-[15px]'"
      >
        {{ t('personalCenter.feedback.createTab.rewardRulesTitle') }}
      </div>
      <div
        class="mt-2 text-text-3"
        :class="isPcMode ? 'text-[14px] leading-[20px]' : 'text-sm leading-[22px]'"
      >
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
  width: 30px;
  height: 29px;
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
